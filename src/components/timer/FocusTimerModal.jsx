import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Radio,
  BookOpen,
  Cpu,
  GraduationCap,
  Briefcase,
  Mic,
  Coffee,
  Sun,
  Flame,
  SkipForward,
  Settings2,
  Sliders,
  Check,
  Zap,
  PictureInPicture2,
  ExternalLink
} from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';
import { pipOverlay } from '../../utils/pipOverlay';

export const FocusTimerModal = () => {
  const { timerState, setTimerState, logFocusSession } = useTracker();
  const [showSettings, setShowSettings] = useState(false);
  const [pipError, setPipError] = useState('');

  // Toggle Picture-in-Picture Floating Overlay
  const togglePipOverlay = async () => {
    setPipError('');
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
    } catch (err) {
      console.warn('PiP Overlay Error:', err);
      setPipError(err.message || 'Picture-in-Picture could not be started in this browser.');
    }
  };

  if (!timerState.isOpen) return null;

  const categories = [
    { id: 'gate', name: 'GATE DS / AI', icon: Cpu, color: 'border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-indigo-500/40' },
    { id: 'academic', name: 'Academic Course', icon: GraduationCap, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-emerald-500/40' },
    { id: 'job', name: 'Job & DS Revision', icon: Briefcase, color: 'border-amber-500 bg-amber-500/10 text-amber-300 ring-amber-500/40' },
    { id: 'english', name: 'English Speaking', icon: Mic, color: 'border-rose-500 bg-rose-500/10 text-rose-300 ring-rose-500/40' },
  ];

  const focusPresets = [
    { label: '25m (Classic)', min: 25 },
    { label: '45m (Standard)', min: 45 },
    { label: '50m (Deep Work)', min: 50 },
    { label: '60m (Power)', min: 60 },
    { label: '90m (Ultradian)', min: 90 },
  ];

  const breakPresets = [
    { label: '5m (Quick)', min: 5 },
    { label: '10m (Relax)', min: 10 },
    { label: '15m (Recharge)', min: 15 },
  ];

  const longBreakPresets = [
    { label: '15m (Standard)', min: 15 },
    { label: '20m (Restful)', min: 20 },
    { label: '30m (Full Meal)', min: 30 },
  ];

  const minutes = Math.floor(timerState.remainingSec / 60);
  const seconds = (timerState.remainingSec % 60).toString().padStart(2, '0');
  const progress = timerState.durationSec > 0
    ? ((timerState.durationSec - timerState.remainingSec) / timerState.durationSec) * 100
    : 0;

  // Switch between Focus, Short Break, and Long Break
  const switchMode = (mode) => {
    soundEngine.playClickSound();
    let durationMin = timerState.focusDurationMin || 25;
    if (mode === 'shortBreak') durationMin = timerState.breakDurationMin || 5;
    if (mode === 'longBreak') durationMin = timerState.longBreakDurationMin || 15;

    const sec = durationMin * 60;
    setTimerState(prev => ({
      ...prev,
      mode,
      durationSec: sec,
      remainingSec: sec,
      targetEndTime: null,
      isRunning: false
    }));
  };

  // Update Focus Time
  const setFocusDuration = (mins) => {
    soundEngine.playClickSound();
    const clamped = Math.max(1, Math.min(180, mins));
    setTimerState(prev => {
      const isCurrent = prev.mode === 'focus';
      const sec = clamped * 60;
      return {
        ...prev,
        focusDurationMin: clamped,
        durationSec: isCurrent ? sec : prev.durationSec,
        remainingSec: isCurrent ? sec : prev.remainingSec,
        targetEndTime: isCurrent && prev.isRunning ? Date.now() + sec * 1000 : null,
        isRunning: isCurrent ? false : prev.isRunning
      };
    });
  };

  // Update Short Break Time
  const setBreakDuration = (mins) => {
    soundEngine.playClickSound();
    const clamped = Math.max(1, Math.min(60, mins));
    setTimerState(prev => {
      const isCurrent = prev.mode === 'shortBreak';
      const sec = clamped * 60;
      return {
        ...prev,
        breakDurationMin: clamped,
        durationSec: isCurrent ? sec : prev.durationSec,
        remainingSec: isCurrent ? sec : prev.remainingSec,
        targetEndTime: isCurrent && prev.isRunning ? Date.now() + sec * 1000 : null,
        isRunning: isCurrent ? false : prev.isRunning
      };
    });
  };

  // Update Long Break Time
  const setLongBreakDuration = (mins) => {
    soundEngine.playClickSound();
    const clamped = Math.max(5, Math.min(90, mins));
    setTimerState(prev => {
      const isCurrent = prev.mode === 'longBreak';
      const sec = clamped * 60;
      return {
        ...prev,
        longBreakDurationMin: clamped,
        durationSec: isCurrent ? sec : prev.durationSec,
        remainingSec: isCurrent ? sec : prev.remainingSec,
        targetEndTime: isCurrent && prev.isRunning ? Date.now() + sec * 1000 : null,
        isRunning: isCurrent ? false : prev.isRunning
      };
    });
  };

  // Toggle Start / Pause
  const toggleRunning = () => {
    soundEngine.playClickSound();
    setTimerState(prev => {
      const next = !prev.isRunning;
      if (next && prev.ambientSound !== 'off') {
        soundEngine.startAmbient(prev.ambientSound);
      } else if (!next) {
        soundEngine.stopAmbient();
      }
      return {
        ...prev,
        isRunning: next,
        targetEndTime: next ? Date.now() + prev.remainingSec * 1000 : null
      };
    });
  };

  // Reset Timer to start of current mode
  const resetTimer = () => {
    soundEngine.stopAmbient();
    setTimerState(prev => ({
      ...prev,
      remainingSec: prev.durationSec,
      targetEndTime: null,
      isRunning: false,
      ambientSound: 'off'
    }));
  };

  // Skip to Next Stage (Focus -> Break or Break -> Focus)
  const skipToNextStage = () => {
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

  // Ambient sound change
  const handleAmbientChange = (type) => {
    soundEngine.playClickSound();
    setTimerState(prev => {
      if (prev.isRunning && type !== 'off') {
        soundEngine.startAmbient(type);
      } else {
        soundEngine.stopAmbient();
      }
      return { ...prev, ambientSound: type };
    });
  };

  // Stop and Cancel session without saving
  const stopAndDiscard = () => {
    soundEngine.stopAmbient();
    setTimerState(prev => ({
      ...prev,
      remainingSec: prev.durationSec,
      targetEndTime: null,
      isRunning: false,
      ambientSound: 'off'
    }));
  };

  // Done & Save Focus Time into Dashboard immediately
  const handleDoneAndSave = () => {
    const elapsedSec = Math.max(0, timerState.durationSec - timerState.remainingSec);
    const hours = elapsedSec / 3600;
    
    // Log to dashboard activity log
    logFocusSession(timerState.category, hours);
    soundEngine.playCompletionChime();
    soundEngine.stopAmbient();

    // Reset timer and close modal
    setTimerState(prev => ({
      ...prev,
      isOpen: false,
      isRunning: false,
      remainingSec: prev.durationSec,
      targetEndTime: null,
      ambientSound: 'off'
    }));
  };

  // Theme colors for modes
  const isFocusMode = timerState.mode === 'focus';
  const isShortBreak = timerState.mode === 'shortBreak';
  const isLongBreak = timerState.mode === 'longBreak';

  const modeThemeColor = isFocusMode
    ? (timerState.category === 'gate' ? '#6366f1' : timerState.category === 'academic' ? '#10b981' : timerState.category === 'job' ? '#f59e0b' : '#f43f5e')
    : isShortBreak ? '#06b6d4' : '#10b981';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0b1120] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/60 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-2xl border transition-all ${
              isFocusMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}>
              {isFocusMode ? <Flame className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Pomodoro & Focus Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-white/10 text-slate-300">
                  {isFocusMode ? '🎯 Deep Work' : isShortBreak ? '☕ Short Break' : '🌴 Long Break'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Customizable Focus & Rest Intervals with Auto-Progression</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* PiP Screen Overlay Button */}
            <button
              onClick={togglePipOverlay}
              title={timerState.isPipActive ? 'Close Screen Overlay' : 'Open Floating Screen Overlay (stays on top of all apps & tabs)'}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                timerState.isPipActive
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                  : 'text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30'
              }`}
            >
              <PictureInPicture2 className="w-4 h-4" />
              <span className="hidden sm:inline">{timerState.isPipActive ? 'Overlay ON' : 'Screen Overlay'}</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Configure Focus & Break Times"
              className={`p-2 rounded-xl border transition ${
                showSettings ? 'bg-indigo-600 text-white border-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800 border-white/5'
              }`}
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTimerState(prev => ({ ...prev, isOpen: false }))}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition border border-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODE SELECTOR (Focus / Short Break / Long Break) */}
        <div className="grid grid-cols-3 gap-2 my-4 p-1 rounded-2xl bg-slate-950 border border-white/10">
          <button
            onClick={() => switchMode('focus')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isFocusMode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Focus ({timerState.focusDurationMin || 25}m)</span>
          </button>

          <button
            onClick={() => switchMode('shortBreak')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isShortBreak
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Short Break ({timerState.breakDurationMin || 5}m)</span>
          </button>

          <button
            onClick={() => switchMode('longBreak')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isLongBreak
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Long Break ({timerState.longBreakDurationMin || 15}m)</span>
          </button>
        </div>

        {/* POMODORO CYCLE TRACKER */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-xs mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Pomodoro Cycle:</span>
            <div className="flex items-center space-x-1.5">
              {Array.from({ length: timerState.cyclesBeforeLongBreak || 4 }).map((_, i) => {
                const cycleNum = i + 1;
                const isCurrent = cycleNum === (timerState.currentCycle || 1);
                const isCompleted = cycleNum < (timerState.currentCycle || 1);
                return (
                  <span
                    key={i}
                    title={`Cycle ${cycleNum}`}
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-mono text-[11px] font-bold transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border border-white/5'
                    }`}
                  >
                    {isCompleted ? '✓' : cycleNum}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Round {(timerState.currentCycle || 1)} of {(timerState.cyclesBeforeLongBreak || 4)}
          </div>
        </div>

        {/* SETTINGS DRAWER (Customize Focus & Break Times) */}
        {showSettings && (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-4 mb-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Customize Focus & Break Timers</span>
              </h4>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Done
              </button>
            </div>

            {/* 1. Focus Time Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Focus Time Duration</span>
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={timerState.focusDurationMin || 25}
                    onChange={(e) => setFocusDuration(Number(e.target.value))}
                    className="w-14 bg-slate-900 border border-white/20 rounded-lg px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">min</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {focusPresets.map(p => (
                  <button
                    key={p.min}
                    type="button"
                    onClick={() => setFocusDuration(p.min)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      timerState.focusDurationMin === p.min
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                        : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Short Break Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Short Break Duration</span>
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={timerState.breakDurationMin || 5}
                    onChange={(e) => setBreakDuration(Number(e.target.value))}
                    className="w-14 bg-slate-900 border border-white/20 rounded-lg px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">min</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {breakPresets.map(p => (
                  <button
                    key={p.min}
                    type="button"
                    onClick={() => setBreakDuration(p.min)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      timerState.breakDurationMin === p.min
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Long Break Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Long Break Duration</span>
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="5"
                    max="90"
                    value={timerState.longBreakDurationMin || 15}
                    onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                    className="w-14 bg-slate-900 border border-white/20 rounded-lg px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">min</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {longBreakPresets.map(p => (
                  <button
                    key={p.min}
                    type="button"
                    onClick={() => setLongBreakDuration(p.min)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      timerState.longBreakDurationMin === p.min
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                        : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Auto-Start Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(timerState.autoStartBreaks)}
                  onChange={(e) => setTimerState(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                  className="rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <span>Auto-start Breaks ⚡</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(timerState.autoStartFocus)}
                  onChange={(e) => setTimerState(prev => ({ ...prev, autoStartFocus: e.target.checked }))}
                  className="rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <span>Auto-start Focus ⚡</span>
              </label>
            </div>
          </div>
        )}

        {/* Category Target Selector (When in Focus Mode) */}
        {isFocusMode && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Log Study Hours To:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = timerState.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setTimerState(prev => ({ ...prev, category: cat.id }))}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? `${cat.color} ring-2 shadow-lg font-semibold`
                        : 'border-white/5 bg-slate-900/60 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[11px] text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CIRCULAR DISPLAY & NUMBERS */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={modeThemeColor}
                strokeWidth="6"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progress) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-wider">
                {minutes}:{seconds}
              </span>
              <span className="text-xs text-slate-300 mt-1 uppercase font-bold tracking-wider flex items-center gap-1">
                {timerState.isRunning ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isFocusMode ? 'Deep Focus' : 'Resting Break'}</span>
                  </>
                ) : (
                  <span>Ready</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY CONTROLS (Stop, Play/Pause, Done & Save, Skip) */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-4">
          {/* Stop / Discard Button */}
          <button
            onClick={stopAndDiscard}
            title="Stop & Reset Timer (Discard session)"
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white transition text-xs font-semibold"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop</span>
          </button>

          {/* Reset Icon Button */}
          <button
            onClick={resetTimer}
            title="Reset to Start of Session"
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={toggleRunning}
            className={`px-7 py-3.5 rounded-2xl text-white font-bold text-sm transition-all shadow-xl flex items-center gap-2 ${
              timerState.isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : isFocusMode
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
            }`}
          >
            {timerState.isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start {isFocusMode ? 'Focus' : 'Break'}</span>
              </>
            )}
          </button>

          {/* Done & Save Button (Always accessible to save session time into dashboard) */}
          <button
            onClick={handleDoneAndSave}
            title="Done: Finish session now & save study time to Dashboard"
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white shadow-lg shadow-emerald-600/30 transition text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Done & Save</span>
          </button>

          {/* Skip Stage Button */}
          <button
            onClick={skipToNextStage}
            title={isFocusMode ? 'Skip to Break ☕' : 'Skip to Focus 🎯'}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Noise Selector */}
        <div className="bg-slate-950/70 border border-white/5 p-3 rounded-2xl flex items-center justify-between my-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-300 font-medium">Ambient Noise:</span>
          </div>
          <div className="flex items-center space-x-1">
            {[
              { id: 'off', label: 'Off', icon: VolumeX },
              { id: 'rain', label: 'Rain', icon: CloudRain },
              { id: 'binaural', label: 'Binaural', icon: Radio },
            ].map((amb) => {
              const Icon = amb.icon;
              const active = timerState.ambientSound === amb.id;
              return (
                <button
                  key={amb.id}
                  onClick={() => handleAmbientChange(amb.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                      : 'border-white/5 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{amb.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Done / Log Helper Footer */}
        {isFocusMode && timerState.remainingSec < timerState.durationSec && (
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Active Focus Time: <strong className="text-white font-mono">{Math.round((timerState.durationSec - timerState.remainingSec) / 60)} mins</strong>
            </span>
            <button
              onClick={handleDoneAndSave}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Log to Dashboard Now</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
