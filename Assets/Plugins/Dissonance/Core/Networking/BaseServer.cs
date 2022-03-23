using System;
using System.Collections.Generic;

namespace Dissonance.Networking
{
    /// <summary>
    /// Information about a client in a network session
    /// </summary>
    public class ClientInfo
    {
        private readonly string _playerName;
        private readonly ushort _playerId;
        private readonly List<ushort> _rooms;

        /// <summary>
        /// Name of this client (as specified by the DissonanceComms component for the client)
        /// </summary>
        public string PlayerName
        {
            get { return _playerName; }
        }

        /// <summary>
        /// Unique ID of this client
        /// </summary>
        public ushort PlayerId
        {
            get { return _playerId; }
        }

        /// <summary>
        /// List of rooms this client is listening to
        /// </summary>
        public List<ushort> Rooms
        {
            get { return _rooms; }
        }

        public ClientInfo(string playerName, ushort playerId)
        {
            _playerName = playerName;
            _playerId = playerId;
            _rooms = new List<ushort>();
        }
    }

    public abstract class BaseServer<TServer, TClient, TPeer>
        where TPeer : IEquatable<TPeer>
        where TServer : BaseServer<TServer, TClient, TPeer>
        where TClient : BaseClient<TServer, TClient, TPeer>
    {
        protected readonly Log Log;

        private readonly RoutingTable _playerIds;
        private readonly Dictionary<TPeer, ClientInfo> _clientsByConnection;
        private readonly Dictionary<ushort, List<TPeer>> _connectionsByRoom;
        private readonly Dictionary<ushort, TPeer> _connectionsByPlayerId;

        private readonly byte[] _routingTableBuffer;
        private readonly List<TPeer> _recipientsBuffer;
        private readonly ArraySegment<byte> _handshakeResponse;

        protected BaseServer()
        {
            Log = Logs.Create(LogCategory.Network, GetType().Name);

            _playerIds = new RoutingTable();
            _clientsByConnection = new Dictionary<TPeer, ClientInfo>();
            _connectionsByRoom = new Dictionary<ushort, List<TPeer>>();
            _connectionsByPlayerId = new Dictionary<ushort, TPeer>();

            _routingTableBuffer = new byte[1024];
            _recipientsBuffer = new List<TPeer>();
            _handshakeResponse = new PacketWriter(new byte[21]).WriteHandshakeResponse(Guid.NewGuid()).Written;
        }

        /// <summary>
        /// Perform any initial work required to connect
        /// </summary>
        public virtual void Connect()
        {
            Log.Info("Connected");
        }

        /// <summary>
        /// Perform any teardown work required to disconnect
        /// </summary>
        public virtual void Disconnect()
        {
            Log.Info("Disconnected");
        }

        /// <summary>
        /// This must be called by the extending network integration implementation when a client disconnects from the session
        /// </summary>
        /// <param name="connection"></param>
        protected void ClientDisconnected(TPeer connection)
        {
            RemoveClient(connection);
        }

        public virtual void Update()
        {
            ReadMessages();
        }

        #region abstracts
        /// <summary>
        /// Read messages (call NetworkReceivedPacket with all messages)
        /// </summary>
        protected abstract void ReadMessages();

        /// <summary>
        /// Send a control packet (reliable, in-order) to the given destination
        /// </summary>
        /// <param name="connection">Destination</param>
        /// <param name="packet">Packet to send</param>
        protected abstract void SendReliable(TPeer connection, ArraySegment<byte> packet);

        /// <summary>
        /// Send an unreliable packet (unreliable, unordered) to the given destination
        /// </summary>
        /// <param name="connection">Destination</param>
        /// <param name="packet">Packet to send</param>
        protected abstract void SendUnreliable(TPeer connection, ArraySegment<byte> packet);
        #endregion

        #region packet processing
        /// <summary>
        /// Receive a packet from the network for dissonance
        /// </summary>
        /// <param name="source">An integer identifying where this packet came from (same ID will be used for sending)</param>
        /// <param name="data">Packet received</param>
        public void NetworkReceivedPacket(TPeer source, ArraySegment<byte> data)
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
                    ReceiveClientState(source, ref reader);
                    break;

                case MessageTypes.PlayerRoutingUpdate:
                    ReceivePlayerRoutingUpdate(source, ref reader);
                    break;

                case MessageTypes.VoiceData:
                    ReceiveVoiceData(source, ref reader);
                    break;

                case MessageTypes.TextData:
                    ReceiveTextData(source, ref reader);
                    break;

                case MessageTypes.HandshakeRequest:
                    ReceiveHandshakeRequest(source);
                    break;

                case MessageTypes.HandshakeResponse:
                    ReceiveHandshakeResponse(source, ref reader);
                    break;

                default:
                    Log.Error("Ignoring a packet with an unknown header: '{0}'", header);
                    break;
            }
        }

        private void ReceiveHandshakeResponse(TPeer source, ref PacketReader reader)
        {
            Log.Error("Received a handshake response (this should only ever be received by the client)");
        }

        private void ReceiveHandshakeRequest(TPeer source)
        {
            SendReliable(source, _handshakeResponse);
        }

        private void ReceiveTextData(TPeer source, ref PacketReader reader)
        {
            var txt = reader.ReadTextPacket(false);

            var recipients = _recipientsBuffer;
            recipients.Clear();

            switch (txt.RecipientType)
            {
                case ChannelType.Room: {

                    //We need to send this on to all players in the given room
                    _connectionsByRoom.TryGetValue(txt.Recipient, out recipients);

                    //Send the original packet out to everyone (*including* yourself if you are listening to the room)
                    if (recipients != null)
                        for (var i = 0; i < recipients.Count; i++)
                            SendReliable(recipients[i], reader.All);
                    break;
                }

                case ChannelType.Player: {

                    //We just need to send this to the single player who is being whispered to
                    TPeer target;
                    if (_connectionsByPlayerId.TryGetValue(txt.Recipient, out target))
                        SendReliable(target, reader.All);

                    break;
                }

                default:
                    Log.Error("Unknown text message recipient type '{0}'", txt.RecipientType);
                    break;
            }
        }

        private void ReceiveVoiceData(TPeer source, ref PacketReader reader)
        {
            //Read the fixed size header
            byte options;
            ushort senderId, sequenceNumber, numChannels;
            reader.ReadVoicePacketHeader(out options, out senderId, out sequenceNumber, out numChannels);
            
            //Read out the list of recipients for this voice packet
            _recipientsBuffer.Clear();
            for (var i = 0; i < numChannels; i++)
            {
                var channelBitfield = reader.ReadByte();
                var channelRecipient = reader.ReadUInt16();

                var channel = new ChannelBitField(channelBitfield);

                if (channel.Type == ChannelType.Room)
                {
                    List<TPeer> connectionsInRoom;
                    if (_connectionsByRoom.TryGetValue(channelRecipient, out connectionsInRoom))
                    {
                        foreach (var connection in connectionsInRoom)
                        {
                            if (!_recipientsBuffer.Contains(connection))
                                _recipientsBuffer.Add(connection);
                        }
                    }
                }
                else
                {
                    TPeer connection;
                    if (!_connectionsByPlayerId.TryGetValue(channelRecipient, out connection))
                    {
                        Log.Warn("Cannot find network connection for ID '{0}'", channelRecipient);
                    }
                    else
                    {
                        if (!_recipientsBuffer.Contains(connection))
                            _recipientsBuffer.Add(connection);
                    }
                }
            }
            
            //Send this exact same packet to the relevant destinations (never back to source)
            for (var i = 0; i < _recipientsBuffer.Count; i++)
            {
                if (!_recipientsBuffer[i].Equals(source))
                    SendUnreliable(_recipientsBuffer[i], reader.All);
            }
        }

        private void ReceivePlayerRoutingUpdate(TPeer source, ref PacketReader reader)
        {
            Log.Error("Received a routing update (this should only ever be received by the client)");
        }

        private void ReceiveClientState(TPeer source, ref PacketReader reader)
        {
            var newClient = !_clientsByConnection.ContainsKey(source);
            ReadClientState(source, ref reader);
            RemoveDuplicateClients(source);

            if (newClient)
                SendPlayerRoutingTable();
        }
        #endregion

        private void ReadClientState(TPeer source, ref PacketReader reader)
        {
            // If this connection is new create a client info object for it now
            ClientInfo client;
            if (!_clientsByConnection.TryGetValue(source, out client))
            {
                var playerName = reader.ReadString();

                var id = _playerIds.Register(playerName);

                client = new ClientInfo(playerName, id);

                _clientsByConnection.Add(source, client);
                _connectionsByPlayerId[id] = source;

                AddClient(source, client);
            }
            else
            {
                //This connection is not new, which means we can avoid reading the string (which would cost an allocation)
                reader.SkipString();
            }

            //Remove this client from all rooms
            for (var i = 0; i < client.Rooms.Count; i++)
                _connectionsByRoom[client.Rooms[i]].Remove(source);
            client.Rooms.Clear();

            //Add this client to the appropriate rooms
            var roomCount = reader.ReadUInt16();
            for (ushort i = 0; i < roomCount; i++)
            {
                var id = reader.ReadUInt16();
                client.Rooms.Add(id);

                List<TPeer> connectionsInRoom;
                if (!_connectionsByRoom.TryGetValue(id, out connectionsInRoom))
                {
                    connectionsInRoom = new List<TPeer>();
                    _connectionsByRoom.Add(id, connectionsInRoom);
                }

                connectionsInRoom.Add(source);
            }

            Log.Debug("Updated client state ('{0}', {1} rooms)", client.PlayerName, client.Rooms.Count);
        }

        protected virtual void AddClient(TPeer peer, ClientInfo client)
        {
        }

        private void RemoveDuplicateClients(TPeer sender)
        {
            var playerName = _clientsByConnection[sender].PlayerName;

            using (var connEnum = _clientsByConnection.Keys.GetEnumerator())
            {
                while (connEnum.MoveNext())
                {
                    var connection = connEnum.Current;

                    // ReSharper disable once PossibleNullReferenceException (Justification: dictionary key cannot be null, no neither can this)
                    if (!connection.Equals(sender))
                    {
                        if (_clientsByConnection[connection].PlayerName == playerName)
                        {
                            RemoveClient(connection);

                            //We've changed the collection so start again with a new enumerator
                            RemoveDuplicateClients(sender);
                            break;
                        }
                    }
                }
            }
        }

        private void RemoveClient(TPeer connection)
        {
            ClientInfo client;
            if (_clientsByConnection.TryGetValue(connection, out client))
            {
                for (var i = 0; i < client.Rooms.Count; i++)
                    _connectionsByRoom[client.Rooms[i]].Remove(connection);

                _clientsByConnection.Remove(connection);
                _connectionsByPlayerId.Remove(client.PlayerId);
                _playerIds.Unregister(client.PlayerName);

                Log.Info("Client disconnected ({0}: {1})", connection, client.PlayerName);

                SendPlayerRoutingTable();
            }
        }

        private void SendPlayerRoutingTable()
        {
            lock (_routingTableBuffer)
            {
                var writer = new PacketWriter(_routingTableBuffer);

                writer.WriteMagic();
                writer.Write((byte)MessageTypes.PlayerRoutingUpdate);

                _playerIds.Serialize(ref writer);

                //Broadcast routing update to all players
                using (var connEnum = _clientsByConnection.Keys.GetEnumerator())
                {
                    while (connEnum.MoveNext())
                    {
                        var connection = connEnum.Current;
                        SendReliable(connection, writer.Written);
                    }
                }
            }
        }
    }
}
