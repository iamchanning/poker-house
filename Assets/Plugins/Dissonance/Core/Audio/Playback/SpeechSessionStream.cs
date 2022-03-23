using System;
using System.Collections.Generic;
using Dissonance.Networking;

namespace Dissonance.Audio.Playback
{
    /// <summary>
    ///     Converts the sequence of stream start/stop and packet delivery events from the network into a sequence of
    ///     <see cref="SpeechSession" />.
    /// </summary>
    internal class SpeechSessionStream
    {
        private readonly IPriorityManager _priorityManager;
        private static readonly Log Log = Logs.Create(LogCategory.Playback, typeof (SpeechSessionStream).Name);

        // shared pool of decoder pipelines
        private static readonly Dictionary<FrameFormat, Stack<DecoderPipeline>> FreePipelines = new Dictionary<FrameFormat, Stack<DecoderPipeline>>();
        
        private readonly Queue<SpeechSession> _sessions;
        private readonly Queue<SpeechSession> _awaitingActivation;

        private DecoderPipeline _active;
        private string _playerName;
        private uint _currentId;

        /// <summary>
        ///     Gets a queue of <see cref="SpeechSession" /> which are awaiting playback.
        /// </summary>
        public Queue<SpeechSession> Sessions
        {
            get { return _sessions; }
        }

        public string PlayerName
        {
            get { return _playerName; }
            set { _playerName = value; }
        }

        public SpeechSessionStream(IPriorityManager priorityManager)
        {
            _priorityManager = priorityManager;
            _sessions = new Queue<SpeechSession>();
            _awaitingActivation = new Queue<SpeechSession>();
        }

        /// <summary>
        ///     Starts a new speech session.
        /// </summary>
        /// <param name="format">The frame format.</param>
        /// <param name="buffer">The buffering delay to allow before publishing the session for playback.</param>
        public void StartSession(FrameFormat format, TimeSpan buffer)
        {
            Log.Info("Creating new speech session with buffer time of {0}ms", buffer.TotalMilliseconds);

            var pipeline = CreateDecoderPipeline(format);
            var session = SpeechSession.Create(new SessionContext(_playerName, unchecked(_currentId++)), format.WaveFormat, buffer, pipeline);

            _active = pipeline;
            _awaitingActivation.Enqueue(session);
        }

        /// <summary>
        ///     Queues an encoded audio frame for playback in the current session.
        /// </summary>
        /// <param name="packet"></param>
        public void ReceiveFrame(VoicePacket packet)
        {
            _active.Push(packet);
        }

        /// <summary>
        ///     Stops the current session.
        /// </summary>
        public void StopSession()
        {
            if (_active != null)
                _active.Stop();
        }

        /// <summary>
        ///     Publishes new sessions which are due playback.
        /// </summary>
        public void Update()
        {
            while (_awaitingActivation.Count > 0 && _awaitingActivation.Peek().ActivationTime < DateTime.Now)
            {
                var session = _awaitingActivation.Dequeue();
                _sessions.Enqueue(session);

                Log.Info("Publishing audio session ({0} items in buffer)", session.BufferCount);
            }
        }

        private DecoderPipeline CreateDecoderPipeline(FrameFormat format)
        {
            Stack<DecoderPipeline> pool;
            if (!FreePipelines.TryGetValue(format, out pool))
            {
                pool = new Stack<DecoderPipeline>();
                FreePipelines[format] = pool;
            }

            if (pool.Count > 0)
                return pool.Pop();

            var decoder = DecoderFactory.Create(format);
            return new DecoderPipeline(_priorityManager, decoder, format.FrameSize, p =>
            {
                p.Reset();
                pool.Push(p);
            });
        }
    }
}