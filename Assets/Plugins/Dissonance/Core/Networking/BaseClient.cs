using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Dissonance.Config;
using Dissonance.Datastructures;
using Dissonance.Extensions;

namespace Dissonance.Networking
{
    public abstract class BaseClient<TServer, TClient, TPeer>
        where TPeer : IEquatable<TPeer>
        where TServer : BaseServer<TServer, TClient, TPeer>
        where TClient : BaseClient<TServer, TClient, TPeer>
    {
        #region helper types
        private enum EventType
        {
            PlayerJoined,
            PlayerLeft,
            PlayerStartedSpeaking,
            PlayerStoppedSpeaking,
            VoiceData,
            TextMessage
        }

        private enum ConnectionState
        {
            None,
            Negotiating,
            Connected,
            Disconnected
        }

        private struct NetworkEvent
        {
            public EventType Type;
            public string PlayerName;
            public VoicePacket VoicePacket;
            public TextMessage TextMessage;
        }

        private struct DelayedPacket
        {
            public ArraySegment<byte> Data;
            public DateTime SimulatedReceiptTime;
        }
        #endregion

        #region fields and properties
        protected readonly Log Log;
        
        private static readonly TimeSpan Timeout = TimeSpan.FromSeconds(0.6);
        private static readonly TimeSpan HandshakeRequestInterval = TimeSpan.FromSeconds(2);

        private readonly DissonanceComms _comms;
        private readonly string _playerName;
        private readonly Rooms _rooms;

        private readonly List<OpenChannel> _openChannels;
        private readonly PlayerChannels _playerChannels;
        private readonly RoomChannels _roomChannels;

        private readonly List<NetworkEvent> _queuedEvents;
        
        public event Action<string> PlayerJoined;
        public event Action<string> PlayerLeft;
        public event Action<VoicePacket> VoicePacketReceived;
        public event Action<TextMessage> TextMessageReceived;
        public event Action<string> PlayerStartedSpeaking;
        public event Action<string> PlayerStoppedSpeaking;

        private int _disconnectedEvents;

        //warning 0067 - Disconnected is never used. This is incorrect we assign it to another field and then use that field i.e. var d = Disconnected; d()
        #pragma warning disable 0067
        public event Action Disconnected;
        #pragma warning restore 0067

        private readonly RoutingTable _playerIds;
        private readonly List<ReceivingChannelStats> _receiving;

        private readonly object _stateLock = new object();

        private readonly ConcurrentPool<byte[]> _byteBufferPool;
        private readonly TransferBuffer<ArraySegment<byte>> _queuedUnreliableTransmissions;
        private readonly TransferBuffer<ArraySegment<byte>> _queuedReliableTransmissions;
        
        private bool _isNetworkInitialized;

        private int _connectionStateValue = (int)ConnectionState.None;
        private ConnectionState _connectionState
        {
            get { return (ConnectionState)_connectionStateValue; }
        }

        private DateTime _lastHandshakeRequest;
        private bool _stateDirty;
        private ushort _sequenceNumber;

        private ushort? _ownId;
        public ushort? LocalId
        {
            get { return _ownId; }
        }

        internal bool IsConnected
        {
            get { return _isNetworkInitialized && _connectionState == ConnectionState.Connected; }
        }

        private readonly List<DelayedPacket> _diagnosticDelayedPackets = new List<DelayedPacket>();
        private readonly Random _rnd = new Random();
        #endregion

        #region constructor
        protected BaseClient(BaseCommsNetwork<TServer, TClient, TPeer> network)
            : this(network.Comms, network.PlayerName, network.Rooms, network.PlayerChannels, network.RoomChannels)
        {
        }

        private BaseClient(DissonanceComms comms, string playerName, Rooms rooms, PlayerChannels playerChannels, RoomChannels roomChannels)
        {
            if (comms == null)
                throw new ArgumentNullException("comms");
            if (playerName == null)
                throw new ArgumentNullException("playerName");
            if (rooms == null)
                throw new ArgumentNullException("rooms");
            if (playerChannels == null)
                throw new ArgumentNullException("playerChannels");
            if (roomChannels == null)
                throw new ArgumentNullException("roomChannels");

            Log = Logs.Create(LogCategory.Network, GetType().Name);

            _comms = comms;

            _playerName = playerName;
            _rooms = rooms;

            _openChannels = new List<OpenChannel>();
            _playerChannels = playerChannels;
            _roomChannels = roomChannels;

            _byteBufferPool = new ConcurrentPool<byte[]>(10, () => new byte[1024]);
            _queuedUnreliableTransmissions = new TransferBuffer<ArraySegment<byte>>(16);
            _queuedReliableTransmissions = new TransferBuffer<ArraySegment<byte>>(16);
            _playerIds = new RoutingTable();
            _openChannels = new List<OpenChannel>();
            _receiving = new List<ReceivingChannelStats>();
            _queuedEvents = new List<NetworkEvent>();

            //Set up events so that when a room/player channel is opened we run the appropriate code in the integration
            _rooms.JoinedRoom += RoomMembershipChanged;
            _rooms.LeftRoom += RoomMembershipChanged;
            _playerChannels.OpenedChannel += OpenPlayerChannel;
            _playerChannels.ClosedChannel += ClosePlayerChannel;
            _roomChannels.OpenedChannel += OpenRoomChannel;
            _roomChannels.ClosedChannel += CloseRoomChannel;

            //There may already be some channels which were created before we created those events, run through them all now so we're up to date
            foreach (var playerChannel in playerChannels)
                OpenPlayerChannel(playerChannel.Value.TargetId, GetChannelProperties<PlayerChannel, string>(playerChannel.Value));
            foreach (var roomChannel in roomChannels)
                OpenRoomChannel(roomChannel.Value.TargetId, GetChannelProperties<RoomChannel, string>(roomChannel.Value));
        }

        private ChannelProperties GetChannelProperties<T, TId>(T channel) where T : IChannel<TId>
        {
            return channel.Properties;
        }
        #endregion

        #region connect/disconnect
        /// <summary>
        /// Override this to perform any work necessary to join a voice session
        /// </summary>
        public abstract void Connect();

        /// <summary>
        /// Call this once work has been done as we are now in a voice session
        /// </summary>
        protected void Connected()
        {
            _stateDirty = true;
            _isNetworkInitialized = true;
        }

        /// <summary>
        /// Override this to perform any work necessary to leave a voice session
        /// </summary>
        public virtual void Disconnect()
        {
            _rooms.JoinedRoom -= RoomMembershipChanged;
            _rooms.LeftRoom -= RoomMembershipChanged;
            _playerChannels.OpenedChannel -= OpenPlayerChannel;
            _playerChannels.ClosedChannel -= ClosePlayerChannel;
            _roomChannels.OpenedChannel -= OpenRoomChannel;
            _roomChannels.ClosedChannel -= CloseRoomChannel;

            _isNetworkInitialized = false;
            _connectionStateValue = (int)ConnectionState.Disconnected;

            RemoveAllPlayers();

            Log.Info("Disconnected");

            OnDisconnected();
        }

        private void RemoveAllPlayers()
        {
            //Stop all current voice channels we're receiving
            foreach (var stats in _receiving)
            {
                var name = _playerIds.GetName(stats.PlayerId);
                if (name != null)
                    OnPlayerStoppedSpeaking(name);
            }
            _receiving.Clear();

            //Remove all players from the session
            var players = _playerIds.Items.ToArray();
            foreach (var player in players)
                OnPlayerLeft(player);
            _playerIds.Clear();
        }

        private void RoomMembershipChanged(string id)
        {
            _stateDirty = true;
        }
        #endregion

        #region update
        public virtual void Update()
        {
            ProcessDiagnosticDelayedMessages();

            //send a new connection handshake periodically while we're not connected
            // - these accesses of _connectionState are not protected by the _connectionStateLock. This is safe since C# guarantees no tearing on 32 bit reads (and this enum is 32 bit)
            var shouldResendHandshake = _connectionState == ConnectionState.Negotiating && DateTime.Now - _lastHandshakeRequest > HandshakeRequestInterval;
            if (_isNetworkInitialized && (_connectionState == ConnectionState.None || shouldResendHandshake))
                BeginConnectionNegotiation();

            if (_stateDirty && IsConnected)
                SendState();

            ReadMessages();
            SendUnreliableDataPackets();
            SendReliableDataPackets();
            CheckTimeouts();

            //Invoke all buffered events (now that we're on the main thread)
            DispatchEvents();

            var dc = Disconnected;
            var count = Interlocked.Exchange(ref _disconnectedEvents, 0);
            if (dc != null)
            {
                for (var i = 0; i < count; i++)
                    dc();
            }
        }
        
        private void DispatchEvents()
        {
            lock (_queuedEvents)
            {
                for (int i = 0; i < _queuedEvents.Count; i++)
                {
                    var e = _queuedEvents[i];

                    switch (e.Type)
                    {
                        case EventType.PlayerJoined:
                            InvokeEvent(ref e.PlayerName, PlayerJoined);
                            break;
                        case EventType.PlayerLeft:
                            InvokeEvent(ref e.PlayerName, PlayerLeft);
                            break;
                        case EventType.PlayerStartedSpeaking:
                            InvokeEvent(ref e.PlayerName, PlayerStartedSpeaking);
                            break;
                        case EventType.PlayerStoppedSpeaking:
                            InvokeEvent(ref e.PlayerName, PlayerStoppedSpeaking);
                            break;
                        case EventType.VoiceData:
                            InvokeEvent(ref e.VoicePacket, VoicePacketReceived);
                            _byteBufferPool.Put(e.VoicePacket.EncodedAudioFrame.Array);
                            break;
                        case EventType.TextMessage:
                            InvokeEvent(ref e.TextMessage, TextMessageReceived);
                            break;
                        default:
                            throw new ArgumentOutOfRangeException();
                    }
                }

                _queuedEvents.Clear();
            }
        }

        private void InvokeEvent<T>(ref T arg, Action<T> handler)
        {
            try
            {
                if (handler != null)
                    handler(arg);
            }
            catch (Exception e)
            {
                Log.Error("Exception invoking event handler: {0}", e);
            }
        }

        private void SendUnreliableDataPackets()
        {
            ArraySegment<byte> buffer;
            while (_queuedUnreliableTransmissions.Read(out buffer))
            {
                SendUnreliable(buffer);

                _byteBufferPool.Put(buffer.Array);
            }
        }

        private void SendReliableDataPackets()
        {
            ArraySegment<byte> buffer;
            while (_queuedReliableTransmissions.Read(out buffer))
            {
                SendReliable(buffer);

                _byteBufferPool.Put(buffer.Array);
            }
        }

        private void CheckTimeouts()
        {
            var now = DateTime.Now.Ticks;
            for (var i = _receiving.Count - 1; i >= 0; i--)
            {
                var stats = _receiving[i];
                if (stats.Open && now - stats.LastReceiptTicks > Timeout.Ticks)
                {
                    stats.Open = false;
                    _receiving[i] = stats;

                    OnPlayerStoppedSpeaking(_playerIds.GetName(stats.PlayerId));
                }
            }
        }
        #endregion

        /// <summary>
        /// Send a packet of voice data from this client
        /// </summary>
        /// <param name="encodedAudio"></param>
        public void SendVoiceData(ArraySegment<byte> encodedAudio)
        {
            lock (_openChannels)
            {
                if (!_ownId.HasValue)
                {
                    Log.Warn("Not received ID from Dissonance server; skipping voice packet transmission");
                    return;
                }

                //Write the voice data into a network packet
                var packet = new PacketWriter(new ArraySegment<byte>(_byteBufferPool.Get()))
                    .WriteVoiceData(_ownId.Value, ref _sequenceNumber, _openChannels, encodedAudio)
                    .Written;

                //Buffer up this packet to send ASAP
                _queuedUnreliableTransmissions.Write(packet);

                //Clear up any channels which have been marked as "closing" (now that we know their status has been written into a packet)
                for (var i = _openChannels.Count - 1; i >= 0; i--)
                {
                    if (_openChannels[i].IsClosing)
                        _openChannels.RemoveAt(i);
                }
            }
        }

        public void SendTextData(string data, ChannelType type, string recipient)
        {
            var targetId = type == ChannelType.Player ? _playerIds.GetId(recipient) : recipient.ToRoomId();

            lock (_openChannels)
            {
                if (!_ownId.HasValue)
                {
                    Log.Warn("Not received ID from Dissonance server; skipping text packet transmission");
                    return;
                }

                if (!targetId.HasValue)
                {
                    Log.Warn("Unrecognised player name: '{0}'; skipping text packet transmission", recipient);
                    return;
                }

                //Write the voice data into a network packet
                var packet = new PacketWriter(new ArraySegment<byte>(_byteBufferPool.Get())).WriteTextPacket(_ownId.Value, type, targetId.Value, data).Written;

                //Buffer up this packet to send ASAP
                _queuedReliableTransmissions.Write(packet);
            }
        }

        /// <summary>
        /// Begin negotiating a connection with the server by sending a handshake.
        /// </summary>
        /// <remarks>It is safe to call this several times, even once negotiation has finished</remarks>
        private void BeginConnectionNegotiation()
        {
            //Sanity check. We can't do *anything* with a disconnected client, definitely not restart negotiation!
            if (_connectionState == ConnectionState.Disconnected)
                throw Log.PossibleBug("Attempted to begin connection negotiation with a client which is disconnected", "39533F23-2DAC-4340-9A7D-960904464E23");

            _lastHandshakeRequest = DateTime.Now;

            //Send the handshake request to the server (when the server replies with a response, we know we're connected)
            _queuedReliableTransmissions.Write(
                new PacketWriter(new ArraySegment<byte>(_byteBufferPool.Get()))
                .WriteHandshakeRequest()
                .Written
            );

            //Set the state to negotiating only if the state was previously none
            Interlocked.CompareExchange(ref _connectionStateValue, (int)ConnectionState.Negotiating, (int)ConnectionState.None);
        }

        private bool ChannelAddressesUs(ChannelBitField channel, ushort recipient)
        {
            if (channel.Type == ChannelType.Player)
                return recipient == _ownId;

            return _rooms.Contains(FindRoomName(recipient));
        }

        private string FindRoomName(ushort roomId)
        {
            var name = _rooms.Name(roomId);
            if (name != null)
                return name;

            Log.Warn("Unknown room ID: {0}", roomId);
            return null;
        }

        private int FindStatsIndex(ushort senderId)
        {
            if (_receiving.Count <= senderId)
            {
                for (var i = _receiving.Count; i < senderId + 1; i++)
                    _receiving.Add(new ReceivingChannelStats());
            }

            return senderId;
        }

        #region abstract

        /// <summary>
        /// Read messages (call NetworkReceivedPacket with all messages)
        /// </summary>
        protected abstract void ReadMessages();

        /// <summary>
        /// Send a control packet (reliable, in-order) to the server
        /// </summary>
        /// <param name="packet">Packet to send</param>
        protected abstract void SendReliable(ArraySegment<byte> packet);

        /// <summary>
        /// Send an unreliable packet (unreliable, unordered) to the server
        /// </summary>
        /// <param name="packet">Packet to send</param>
        protected abstract void SendUnreliable(ArraySegment<byte> packet);

        #endregion

        #region packet processing
        public void NetworkReceivedPacket(ArraySegment<byte> data)
        {
            if (data.Array == null)
                throw new ArgumentNullException("data");

            if (DebugSettings.Instance.EnableNetworkSimulation)
            {
                var reader = new PacketReader(data);
                reader.ReadUInt16(); // skip magic number
                var header = (MessageTypes) reader.ReadByte();

                if (header == MessageTypes.VoiceData)
                {
                    var skipRoll = _rnd.NextDouble();
                    if (skipRoll < DebugSettings.Instance.PacketLoss)
                        return;
                }

                var delay = _rnd.Next(DebugSettings.Instance.MinimumLatency, DebugSettings.Instance.MaximumLatency);
                var simulatedArrivalTime = DateTime.Now + TimeSpan.FromMilliseconds(delay);

                var dataCopy = new byte[data.Count];
                Array.Copy(data.Array, data.Offset, dataCopy, 0, data.Count);

                lock (_diagnosticDelayedPackets)
                {
                    _diagnosticDelayedPackets.Add(new DelayedPacket
                    {
                        SimulatedReceiptTime = simulatedArrivalTime,
                        Data = new ArraySegment<byte>(dataCopy)
                    });
                }
            }
            else
                ProcessReceivedPacket(data);
        }

        private void ProcessDiagnosticDelayedMessages()
        {
            lock (_diagnosticDelayedPackets)
            {
                for (int i = _diagnosticDelayedPackets.Count - 1; i >= 0; i--)
                {
                    var packet = _diagnosticDelayedPackets[i];
                    if (packet.SimulatedReceiptTime <= DateTime.Now)
                    {
                        _diagnosticDelayedPackets.RemoveAt(i);
                        ProcessReceivedPacket(packet.Data);
                    }
                }
            }
        }

        private void ProcessReceivedPacket(ArraySegment<byte> data)
        {
            var reader = new PacketReader(data);

            var magic = reader.ReadUInt16();
            if (magic != PacketWriter.Magic)
            {
                Log.Warn("Received packet with incorrect magic number. Expected {0}, got {1}", PacketWriter.Magic, magic);
                return;
            }

            var header = (MessageTypes)reader.ReadByte();
            switch (header)
            {
                case MessageTypes.ClientState:
                    ReceiveClientState(ref reader);
                    break;

                case MessageTypes.PlayerRoutingUpdate:
                    ReceivePlayerRoutingUpdate(ref reader);
                    break;

                case MessageTypes.VoiceData:
                    ReceiveVoiceData(ref reader);
                    break;

                case MessageTypes.TextData:
                    ReceiveTextData(ref reader);
                    break;

                case MessageTypes.HandshakeResponse:
                    ReceiveHandshakeResponse(ref reader);
                    break;

                case MessageTypes.HandshakeRequest:
                    ReceiveHandshakeRequest(ref reader);
                    break;

                default:
                    Log.Error("Ignoring a packet with an unknown header: '{0}'", header);
                    break;
            }
        }

        private void ReceiveHandshakeRequest(ref PacketReader reader)
        {
            Log.Error("Received a handshake request (this should only ever be received by the server)");
        }

        private void ReceiveHandshakeResponse(ref PacketReader reader)
        {
            var session = reader.ReadHandshakeResponse();

            //We could receive an unbounded number of handshake responses. We only want to run this event on the *first* one (when we transition from Negotiating to Connected
			//Additionally it's possible the connection is not in the negotiating state (could already be disconnected). So check that it's the right value before exchanging.
            if (Interlocked.CompareExchange(ref _connectionStateValue, (int)ConnectionState.Connected, (int)ConnectionState.Negotiating) == (int)ConnectionState.Negotiating)
                Log.Info("Received handshake response from server, joined session '{0}'", session);
        }

        private void ReceiveTextData(ref PacketReader reader)
        {
            var packet = reader.ReadTextPacket(true);
            var recipientName = packet.RecipientType == ChannelType.Player ? _playerIds.GetName(packet.Recipient) : FindRoomName(packet.Recipient);

            if (recipientName != null)
            {
                var message = new TextMessage(_playerIds.GetName(packet.Sender), packet.RecipientType, recipientName, packet.Text);
                OnTextPacketReceived(message);
            }
            else
            {
                Log.Error("Received a text message for an unknown {0} id={1}, Message: {2}", packet.RecipientType == ChannelType.Player ? "Player" : "Room", packet.Recipient, packet.Text);
            }
        }

        private void ReceiveClientState(ref PacketReader reader)
        {
            Log.Error("Received a client state update (this should only ever be received by the server)");
        }

        private void ReceivePlayerRoutingUpdate(ref PacketReader reader)
        {
            Log.Debug("Received player routing table");

            var oldPlayers = _playerIds.Items.ToList();
            _playerIds.Deserialize(ref reader);

            _ownId = _playerIds.GetId(_playerName);
            if (!_ownId.HasValue)
            {
                Log.Warn("Received play routing update, cannot find self ID");
                return;
            }

            var currentPlayers = _playerIds.Items.ToList();

            foreach (var player in oldPlayers)
                if (!currentPlayers.Contains(player))
                    OnPlayerLeft(player);

            foreach (var player in currentPlayers)
            {
                if (!oldPlayers.Contains(player))
                {
                    var id = _playerIds.GetId(player);
                    if (id.HasValue)
                    {
                        //Clear out the stats for this new player (we may have recycled an ID, so we need to get rid of the data from the previous user with this ID)
                        _receiving[FindStatsIndex(id.Value)] = new ReceivingChannelStats();

                        OnPlayerJoined(player);
                    }
                }
            }
        }

        private void ReceiveVoiceData(ref PacketReader reader)
        {
            //Read header from voice packet
            byte options;
            ushort senderId, sequenceNumber, numChannels;
            reader.ReadVoicePacketHeader(out options, out senderId, out sequenceNumber, out numChannels);

            var playerName = _playerIds.GetName(senderId);

            //Read channel states
            var positional = true;
            var allClosing = true;
            var priority = ChannelPriority.None;
            for (var i = 0; i < numChannels; i++)
            {
                byte channelBitfield;
                ushort channelRecipient;
                reader.ReadVoicePacketChannel(out channelBitfield, out channelRecipient);

                var channel = new ChannelBitField(channelBitfield);
                if (ChannelAddressesUs(channel, channelRecipient))
                {
                    if (!channel.IsPositional)
                        positional = false;

                    if (!channel.IsClosing)
                        allClosing = false;

                    if (channel.Priority > priority)
                        priority = channel.Priority;
                }
            }

            //Read encoded voice data and copy it into another buffer (the packet will be recycled immediately, so we can't keep this frame around)
            var frameSegment = reader.ReadByteSegment();
            var frame = frameSegment.CopyTo(_byteBufferPool.Get());

            //Read the magic number again
            var magic = reader.ReadUInt16();
            if (magic != PacketWriter.Magic)
            {
                Log.Warn("Corrupt audio packet, incorrect magic number sentinel. Expected {0}, got {1}", PacketWriter.Magic, magic);
                return;
            }

            //Update the statistics for the channel this data is coming in over
            var statsIndex = FindStatsIndex(senderId);
            var stats = _receiving[statsIndex];

            //If this channel is not currently open, open it (and reset sequence numbers etc)
            if (!_receiving[statsIndex].Open)
            {
                // check for old sequence numbers and discard
                if (stats.BaseSequenceNumber.WrappedDelta(sequenceNumber) < 0)
                    return;

                stats = new ReceivingChannelStats {
                    PlayerId = senderId,
                    BaseSequenceNumber = sequenceNumber,
                    LocalSequenceNumber = 0,
                    LastReceiptTicks = DateTime.Now.Ticks,
                    Open = true
                };

                OnPlayerStartedSpeaking(playerName);
            }

            var sequenceDelta = stats.BaseSequenceNumber.WrappedDelta(sequenceNumber);
            if (stats.LocalSequenceNumber + sequenceDelta < 0)
            {
                // we must have received our first packet out of order
                // this "old" packet will give us a negative local sequence number, which will wrap when cast into the uint
                // discard the packet
                return;
            }

            stats.LastReceiptTicks = DateTime.Now.Ticks;
            stats.LocalSequenceNumber = (uint) (stats.LocalSequenceNumber + sequenceDelta);
            stats.BaseSequenceNumber = sequenceNumber;

            OnVoicePacketReceived(new VoicePacket(playerName, priority, positional, frame, stats.LocalSequenceNumber));

            if (allClosing)
            {
                stats.Open = false;
                OnPlayerStoppedSpeaking(playerName);
            }

            _receiving[statsIndex] = stats;
        }

        #endregion

        #region events invokers
        
        private void OnPlayerJoined(string playerName)
        {
            lock (_queuedEvents)
                _queuedEvents.Add(new NetworkEvent { Type = EventType.PlayerJoined, PlayerName = playerName });
        }

        private void OnPlayerLeft(string playerName)
        {
            lock (_queuedEvents)
                _queuedEvents.Add(new NetworkEvent { Type = EventType.PlayerLeft, PlayerName = playerName });
        }

        private void OnVoicePacketReceived(VoicePacket obj)
        {
            lock (_queuedEvents)
                _queuedEvents.Add(new NetworkEvent { Type = EventType.VoiceData, VoicePacket = obj });
        }

        private void OnTextPacketReceived(TextMessage obj)
        {
            lock (_queuedEvents)
                _queuedEvents.Add(new NetworkEvent { Type = EventType.TextMessage, TextMessage = obj });
        }

        private void OnPlayerStartedSpeaking(string playerName)
        {
            lock (_queuedEvents)
                _queuedEvents.Add(new NetworkEvent { Type = EventType.PlayerStartedSpeaking, PlayerName = playerName });

            Log.Debug("Remote player '{0}' began speaking.", playerName);
        }

        private void OnPlayerStoppedSpeaking(string playerName)
        {
            lock (_queuedEvents)
                _queuedEvents.Add(new NetworkEvent { Type = EventType.PlayerStoppedSpeaking, PlayerName = playerName });

            Log.Debug("Remote player '{0}' stopped speaking.", playerName);
        }

        private void OnDisconnected()
        {
            Interlocked.Increment(ref _disconnectedEvents);
        }

        #endregion

        #region State Updates

        private void SendState()
        {
            lock (_stateLock)
            {
                Log.Debug("Sending state ('{0}', {1} rooms)", _playerName, _rooms.Count);

                // not ready to send state
                if (_playerName == null)
                    return;

                // send player name and room list
                var sendBuffer = _byteBufferPool.Get();
                try
                {
                    var packet = new PacketWriter(new ArraySegment<byte>(sendBuffer)).WriteClientState(_playerName, _rooms).Written;
                    SendReliable(packet);
                }
                finally
                {
                    _byteBufferPool.Put(sendBuffer);
                }

                _stateDirty = false;
            }
        }

        #endregion

        #region Room and Channel Management
        private void OpenPlayerChannel(string player, ChannelProperties config)
        {
            var id = _playerIds.GetId(player);
            if (id == null)
            {
                Log.Warn("Unrecognized player ID '{0}'", player);
                return;
            }

            var channel = new OpenChannel(_comms, ChannelType.Player, config, false, id.Value);

            lock (_openChannels)
                _openChannels.Add(channel);
        }

        private void ClosePlayerChannel(string player, ChannelProperties config)
        {
            var id = _playerIds.GetId(player);
            if (id == null)
            {
                Log.Warn("Unrecognized player name '{0}'", player);
                return;
            }

            lock (_openChannels)
            {
                for (var i = _openChannels.Count - 1; i >= 0; i--)
                {
                    var channel = _openChannels[i];
                    if (!channel.IsClosing && channel.Type == ChannelType.Player && channel.Recipient == id.Value && ReferenceEquals(channel.Config, config))
                    {
                        _openChannels[i] = channel.AsClosing();
                        break;
                    }
                }
            }
        }

        private void OpenRoomChannel(string roomName, ChannelProperties config)
        {
            var id = roomName.ToRoomId();
            var channel = new OpenChannel(_comms, ChannelType.Room, config, false, id);

            lock (_openChannels)
                _openChannels.Add(channel);
        }

        private void CloseRoomChannel(string roomName, ChannelProperties config)
        {
            var roomId = roomName.ToRoomId();

            lock (_openChannels)
            {
                for (var i = _openChannels.Count - 1; i >= 0; i--)
                {
                    var channel = _openChannels[i];
                    if (!channel.IsClosing && channel.Type == ChannelType.Room && channel.Recipient == roomId && ReferenceEquals(channel.Config, config))
                    {
                        _openChannels[i] = channel.AsClosing();
                        break;
                    }
                }
            }
        }
        #endregion
    }

    internal struct ChannelBitField
    {
        private const byte TypeMask = 0x01;         //00000001
        private const byte PositionalMask = 0x02;   //00000010
        private const byte ClosureMask = 0x04;      //00000100
        private const byte PriorityMask = 0x18;     //00011000

        private readonly byte _bitfield;
        public byte Bitfield
        {
            get { return _bitfield; }
        }

        public ChannelType Type
        {
            get
            {
                if ((_bitfield & TypeMask) == TypeMask)
                    return ChannelType.Room;
                return ChannelType.Player;
            }
        }

        public bool IsClosing
        {
            get { return (_bitfield & ClosureMask) == ClosureMask; }
        }

        public bool IsPositional
        {
            get { return (_bitfield & PositionalMask) == PositionalMask; }
        }

        public ChannelPriority Priority
        {
            get
            {
                var val = (_bitfield & PriorityMask) >> 3;
                switch (val)
                {
                    default: return ChannelPriority.Default;
                    case 1: return ChannelPriority.Low;
                    case 2: return ChannelPriority.Medium;
                    case 3: return ChannelPriority.High;
                }
            }
        }

        public ChannelBitField(byte bitfield)
        {
            _bitfield = bitfield;
        }

        public ChannelBitField(ChannelType type, ChannelPriority priority, bool positional, bool closing) : this()
        {
            _bitfield = 0;

            if (type == ChannelType.Room)
                _bitfield |= TypeMask;
            if (positional)
                _bitfield |= PositionalMask;
            if (closing)
                _bitfield |= ClosureMask;

            switch (priority)
            {
                case ChannelPriority.Low:
                    _bitfield |= 1 << 3;
                    break;
                case ChannelPriority.Medium:
                    _bitfield |= 2 << 3;
                    break;
                case ChannelPriority.High:
                    _bitfield |= 3 << 3;
                    break;

                // ReSharper disable RedundantCaseLabel, RedundantEmptyDefaultSwitchBranch (justification: I like to be explicit about these things)
                case ChannelPriority.None:
                case ChannelPriority.Default:
                default:
                    break;
                // ReSharper restore RedundantCaseLabel, RedundantEmptyDefaultSwitchBranch
            }
        }
    }

    internal struct OpenChannel
    {
        private readonly DissonanceComms _comms;
        private readonly ChannelProperties _config;

        private readonly ChannelType _type;
        private readonly ushort _recipient;
        private readonly bool _isClosing;

        public ChannelProperties Config
        {
            get { return _config; }
        }

        public byte Bitfield
        {
            get
            {
                return new ChannelBitField(
                    _type,
                    Priority,
                    IsPositional,
                    _isClosing
                ).Bitfield;
            }
        }

        public ushort Recipient
        {
            get { return _recipient; }
        }

        
        public ChannelType Type
        {
            get { return _type; }
        }

        public bool IsClosing
        {
            get { return _isClosing; }
        }

        public bool IsPositional
        {
            get { return _config.Positional; }
        }

        public ChannelPriority Priority
        {
            get
            {
                if (_config.Priority == ChannelPriority.None)
                    return _comms.PlayerPriority;
                return _config.Priority;
            }
        }

        public OpenChannel(DissonanceComms comms, ChannelType type, ChannelProperties config, bool closing, ushort recipient)
        {
            _comms = comms;

            _type = type;
            _config = config;
            _isClosing = closing;
            _recipient = recipient;
        }

        public OpenChannel AsClosing()
        {
            return new OpenChannel(_comms, _type, _config, true, _recipient);
        }
    }
}
