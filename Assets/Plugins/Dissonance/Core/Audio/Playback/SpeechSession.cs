using System;
using NAudio.Wave;

namespace Dissonance.Audio.Playback
{
    /// <summary>
    ///     Represents a decoder pipeline for a single playback session.
    /// </summary>
    public struct SpeechSession
    {
        public readonly WaveFormat WaveFormat;
        public readonly float Delay;
        public readonly DateTime ActivationTime;

        private readonly IDecoderPipeline _pipeline;
        private readonly SessionContext _context;

        public int BufferCount { get { return _pipeline.BufferCount; } }
        public SessionContext Context { get { return _context; } }

        public ChannelPriority Priority { get { return _pipeline.Priority; } }

        public bool Positional { get { return _pipeline.Positional; } }

        private SpeechSession(SessionContext context, WaveFormat waveFormat, float delay, DateTime activationTime, IDecoderPipeline pipeline)
        {
            _context = context;
            _pipeline = pipeline;

            WaveFormat = waveFormat;
            Delay = delay;
            ActivationTime = activationTime;
        }

        internal static SpeechSession Create(SessionContext context, WaveFormat format, TimeSpan delay, IDecoderPipeline pipeline)
        {
            return new SpeechSession(context, format, (float) delay.TotalSeconds, DateTime.Now + delay, pipeline);
        }

        public void Prepare()
        {
            _pipeline.Prepare(_context);
        }

        /// <summary>
        ///     Pulls the specfied number of samples from the pipeline, decoding packets as necessary.
        /// </summary>
        /// <param name="samples"></param>
        /// <returns><c>true</c> if there are more samples available; else <c>false</c>.</returns>
        public bool Read(ArraySegment<float> samples)
        {
            return _pipeline.Read(samples);
        }
    }
}