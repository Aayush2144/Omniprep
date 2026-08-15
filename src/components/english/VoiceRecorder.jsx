import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Trash2, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';

export const VoiceRecorder = ({ onSaveSession, currentTopic }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    soundEngine.playClickSound();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported in your current browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Stop audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access error:', err);
      setHasPermission(false);
      alert('Could not access microphone. Please check browser permissions.');
    }
  };

  const stopRecording = () => {
    soundEngine.playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-rose-400" />
          <h4 className="text-sm font-semibold text-white">Browser Voice Memo & Pronunciation Recorder</h4>
        </div>
        {currentTopic && (
          <span className="text-[11px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 max-w-xs truncate">
            Speaking on: {currentTopic}
          </span>
        )}
      </div>

      {/* Recording Display & Waveform animation */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3">
        {/* Animated Sound Wave or Timer */}
        <div className="flex items-center justify-center space-x-1.5 h-12">
          {isRecording ? (
            <>
              {[0.4, 0.8, 1.2, 0.6, 1.0, 0.7, 1.3, 0.5, 0.9].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-rose-500 rounded-full animate-pulse"
                  style={{
                    height: `${h * 24}px`,
                    animationDuration: `${0.4 + (i % 3) * 0.2}s`
                  }}
                />
              ))}
            </>
          ) : (
            <div className="text-3xl font-mono font-bold text-slate-300">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {isRecording && (
          <div className="text-xs text-rose-400 font-mono font-semibold animate-pulse">
            🔴 Recording... {formatTime(recordingTime)}
          </div>
        )}

        {/* Audio Player if recorded */}
        {audioUrl && (
          <div className="w-full max-w-md space-y-2 animate-fade-in">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              controls
              className="w-full h-10 rounded-lg"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center space-x-3 pt-2">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-900/30"
            >
              <Mic className="w-4 h-4" />
              <span>Start Speaking & Record</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs border border-rose-500/40 transition"
            >
              <Square className="w-4 h-4 fill-rose-400" />
              <span>Stop & Review Recording</span>
            </button>
          )}

          {audioUrl && (
            <>
              <button
                onClick={resetRecording}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                title="Discard & Re-record"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <a
                href={audioUrl}
                download={`english_practice_${new Date().toISOString().split('T')[0]}.webm`}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
                title="Download Audio File"
              >
                <Download className="w-4 h-4" />
                <span>Save Audio Memo</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
