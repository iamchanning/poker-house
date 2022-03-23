using System;
using Dissonance.Config;
using UnityEngine;

namespace Dissonance.Audio.Playback
{
    /// <summary>
    /// Plays back an ISampleProvider to an AudioSource
    /// <remarks>Uses OnAudioFilterRead, so the source it is playing back on will be whichever the filter attaches itself to.</remarks>
    /// </summary>
    public class SamplePlaybackComponent
        : MonoBehaviour
    {
        #region fields

        private static readonly Log Log = Logs.Create(LogCategory.Playback, "Player Playback");

        private SpeechSession? _session;

        /// <summary>
        /// Temporary buffer to hold data read from source
        /// </summary>
        private float[] _temp;

        private AudioFileWriter _diagnosticOutput;

        public bool HasActiveSession
        {
            get { return _session.HasValue; }
        }

        public SpeechSession? Session
        {
            get { return _session; }
        }

        private float _arv;
        /// <summary>
        /// Average rectified value of the audio signal currently playing (a measure of amplitude)
        /// </summary>
        public float ARV { get { return _arv; } }
        #endregion

        public void Play(SpeechSession session)
        {
            Log.Debug("Began playback of speech session");

            _session = session;

            session.Prepare();

            if (DebugSettings.Instance.EnablePlaybackDiagnostics && DebugSettings.Instance.RecordFinalAudio)
            {
                var filename = string.Format("Dissonance_Diagnostics/Output_{0}_{1}_{2}", session.Context.PlayerName, session.Context.Id, DateTime.UtcNow.ToFileTime());
                _diagnosticOutput = new AudioFileWriter(filename, session.WaveFormat);
            }
        }

        public void Start()
        {
            //Create a temporary buffer to hold audio. We don't know how big the buffer needs to be,
            //but this buffer is *one second long* which is way larger than we could ever need!
            _temp = new float[AudioSettings.outputSampleRate];
        }

        public void OnAudioFilterRead(float[] data, int channels)
        {
            if (_session == null)
            {
                Array.Clear(data, 0, data.Length);
                _arv = 0;
                return;
            }

            var complete = Filter(_session.Value, data, channels, _temp, _diagnosticOutput, out _arv);
            if (complete)
            {
                Log.Debug("Speech session complete");
                _session = null;

                if (_diagnosticOutput != null)
                {
                    _diagnosticOutput.Dispose();
                    _diagnosticOutput = null;
                }
            }
        }

        internal static bool Filter(SpeechSession session, float[] data, int channels, float[] temp, AudioFileWriter diagnosticOutput, out float arv)
        {
            //Read out data from source (exactly as much as we need for one channel)
            var samplesRequired = data.Length / channels;
            var complete = session.Read(new ArraySegment<float>(temp, 0, samplesRequired));

            if (diagnosticOutput != null)
                diagnosticOutput.WriteSamples(new ArraySegment<float>(temp, 0, samplesRequired));

            float accumulator = 0;

            //Step through samples, stretching them (i.e. play mono input in all output channels)
            var sampleIndex = 0;
            for (var i = 0; i < data.Length; i += channels)
            {
                //Get a single sample from the source data
                var sample = temp[sampleIndex++];

                //Accumulate the sum of squares of the audio signal
                accumulator += Mathf.Abs(sample);

                //Copy data into all channels
                for (var c = 0; c < channels; c++)
                {
                    data[i + c] = sample;
                }
            }

            arv = accumulator / data.Length;
            return complete;
        }
    }
}
