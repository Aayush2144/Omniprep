import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Play, Pause, Square, Maximize2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';

export const QuickTimerBar = () => {
  const { timerState, setTimerState } = useTracker();

  if (!timerState.isRunning && timerState.remainingSec === timerState.durationSec) {
    return null; // Don't show if not active
  }

  const categoryColors = {
    gate: 'from-indigo-600 to-indigo-800 text-indigo-200 border-indigo-500/40',
    academic: 'from-emerald-600 to-emerald-800 text-emerald-200 border-emerald-500/40',
    job: 'from-amber-600 to-amber-800 text-amber-200 border-amber-500/40',
    english: 'from-rose-600 to-rose-800 text-rose-200 border-rose-500/40',
  };

  const categoryLabels = {
    gate: 'GATE DS / AI Focus',
    academic: 'Academic Study',
    job: 'Job Prep / DS Rev',
    english: 'English Speaking Practice',
  };

  const minutes = Math.floor(timerState.remainingSec / 60);
  const seconds = (timerState.remainingSec % 60).toString().padStart(2, '0');

  const togglePlay = () => {
    soundEngine.playClickSound();
    setTimerState(prev => {
      const nextRunning = !prev.isRunning;
      if (!nextRunning) {
        soundEngine.stopAmbient();
      } else if (prev.ambientSound !== 'off') {
        soundEngine.startAmbient(prev.ambientSound);
      }
      return { ...prev, isRunning: nextRunning };
    });
  };

  const stopTimer = () => {
    soundEngine.stopAmbient();
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      remainingSec: prev.durationSec,
      ambientSound: 'off'
    }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-slide-up">
      <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r ${categoryColors[timerState.category] || categoryColors.gate} border shadow-2xl backdrop-blur-xl`}>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <div className="text-xs font-semibold text-white font-mono text-sm tracking-wider">
            {minutes}:{seconds}
          </div>
        </div>

        <div className="hidden sm:block text-xs font-medium text-white/90 border-l border-white/20 pl-2">
          {categoryLabels[timerState.category]}
        </div>

        <div className="flex items-center space-x-1 border-l border-white/20 pl-2">
          <button
            onClick={togglePlay}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition"
            title={timerState.isRunning ? 'Pause' : 'Resume'}
          >
            {timerState.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
          
          <button
            onClick={stopTimer}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition"
            title="Cancel & Reset"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setTimerState(prev => ({ ...prev, isOpen: true }))}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition"
            title="Expand Full Timer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
