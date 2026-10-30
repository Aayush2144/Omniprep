import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Play, Pause, Square, Maximize2, Sparkles, Coffee, Flame, SkipForward, PictureInPicture2 } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';
import { pipOverlay } from '../../utils/pipOverlay';

export const QuickTimerBar = () => {
  const { timerState, setTimerState } = useTracker();

  if (!timerState.isRunning && timerState.remainingSec === timerState.durationSec) {
    return null; // Don't show if not active
  }

  const isFocusMode = timerState.mode === 'focus';
  const isShortBreak = timerState.mode === 'shortBreak';
  const isLongBreak = timerState.mode === 'longBreak';

  const categoryColors = {
    gate: 'from-indigo-600 to-indigo-800 text-indigo-200 border-indigo-500/40',
    academic: 'from-emerald-600 to-emerald-800 text-emerald-200 border-emerald-500/40',
    job: 'from-amber-600 to-amber-800 text-amber-200 border-amber-500/40',
    english: 'from-rose-600 to-rose-800 text-rose-200 border-rose-500/40',
  };

  const currentTheme = isFocusMode
    ? (categoryColors[timerState.category] || categoryColors.gate)
    : isShortBreak
    ? 'from-cyan-600 to-cyan-800 text-cyan-200 border-cyan-500/40'
    : 'from-emerald-600 to-emerald-800 text-emerald-200 border-emerald-500/40';

  const currentLabel = isFocusMode
    ? `${timerState.category.toUpperCase()} Focus`
    : isShortBreak
    ? '☕ Short Break'
    : '🌴 Long Break';

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
      return {
        ...prev,
        isRunning: nextRunning,
        targetEndTime: nextRunning ? Date.now() + prev.remainingSec * 1000 : null
      };
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

  const skipStage = () => {
    soundEngine.playClickSound();
    soundEngine.stopAmbient();
    setTimerState(prev => {
      if (prev.mode === 'focus') {
        const isLong = (prev.currentCycle || 1) >= (prev.cyclesBeforeLongBreak || 4);
        const nextMode = isLong ? 'longBreak' : 'shortBreak';
        const nextDuration = (isLong ? (prev.longBreakDurationMin || 15) : (prev.breakDurationMin || 5)) * 60;
        const nextCycle = isLong ? 1 : ((prev.currentCycle || 1) + 1);
        return {
          ...prev,
          mode: nextMode,
          durationSec: nextDuration,
          remainingSec: nextDuration,
          currentCycle: nextCycle,
          isRunning: false
        };
      } else {
        const nextDuration = (prev.focusDurationMin || 25) * 60;
        return {
          ...prev,
          mode: 'focus',
          durationSec: nextDuration,
          remainingSec: nextDuration,
          isRunning: false
        };
      }
    });
  };

  const togglePip = async () => {
    try {
      if (timerState.isPipActive) {
        await pipOverlay.stop();
        setTimerState(prev => ({ ...prev, isPipActive: false }));
      } else {
        await pipOverlay.start(timerState, () => {
          setTimerState(prev => ({ ...prev, isPipActive: false }));
        });
        setTimerState(prev => ({ ...prev, isPipActive: true }));
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-slide-up">
      <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r ${currentTheme} border shadow-2xl backdrop-blur-xl`}>
        <div className="flex items-center space-x-2">
          {timerState.isRunning ? (
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-white/50" />
          )}
          <div className="font-semibold text-white font-mono text-sm tracking-wider">
            {minutes}:{seconds}
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-medium text-white/90 border-l border-white/20 pl-2">
          {isFocusMode ? <Flame className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
          <span>{currentLabel}</span>
          <span className="text-[10px] opacity-75 font-mono">
            (Round {timerState.currentCycle || 1}/{timerState.cyclesBeforeLongBreak || 4})
          </span>
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
            onClick={skipStage}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition"
            title="Skip Stage"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={stopTimer}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition"
            title="Reset"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePip}
            className={`p-1.5 rounded-lg text-white transition ${timerState.isPipActive ? 'bg-purple-600' : 'hover:bg-white/20'}`}
            title={timerState.isPipActive ? 'Close Screen Overlay' : 'Open Screen Overlay (floats above all apps)'}
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
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
