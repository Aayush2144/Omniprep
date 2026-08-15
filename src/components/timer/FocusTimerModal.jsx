import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  X,
  Play,
  Pause,
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
  Mic
} from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';

export const FocusTimerModal = () => {
  const { timerState, setTimerState, logFocusSession } = useTracker();
  const [customMinutes, setCustomMinutes] = useState(30);

  if (!timerState.isOpen) return null;

  const categories = [
    { id: 'gate', name: 'GATE DS / AI', icon: Cpu, color: 'border-indigo-500 bg-indigo-500/10 text-indigo-300' },
    { id: 'academic', name: 'Academic Course', icon: GraduationCap, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' },
    { id: 'job', name: 'Job & DS Revision', icon: Briefcase, color: 'border-amber-500 bg-amber-500/10 text-amber-300' },
    { id: 'english', name: 'English Speaking', icon: Mic, color: 'border-rose-500 bg-rose-500/10 text-rose-300' },
  ];

  const presets = [
    { label: '25m Focus', sec: 25 * 60, mode: 'pomodoro' },
    { label: '50m Deep Work', sec: 50 * 60, mode: 'pomodoro' },
    { label: '5m Short Break', sec: 5 * 60, mode: 'shortBreak' },
    { label: '15m Long Break', sec: 15 * 60, mode: 'longBreak' },
  ];

  const minutes = Math.floor(timerState.remainingSec / 60);
  const seconds = (timerState.remainingSec % 60).toString().padStart(2, '0');
  const progress = ((timerState.durationSec - timerState.remainingSec) / timerState.durationSec) * 100;

  const setPreset = (sec, mode) => {
    soundEngine.playClickSound();
    setTimerState(prev => ({
      ...prev,
      durationSec: sec,
      remainingSec: sec,
      mode,
      isRunning: false
    }));
  };

  const handleCustomTime = (mins) => {
    const clamped = Math.max(1, Math.min(180, mins));
    setCustomMinutes(clamped);
    setTimerState(prev => ({
      ...prev,
      durationSec: clamped * 60,
      remainingSec: clamped * 60,
      mode: 'custom',
      isRunning: false
    }));
  };

  const toggleRunning = () => {
    soundEngine.playClickSound();
    setTimerState(prev => {
      const next = !prev.isRunning;
      if (next && prev.ambientSound !== 'off') {
        soundEngine.startAmbient(prev.ambientSound);
      } else if (!next) {
        soundEngine.stopAmbient();
      }
      return { ...prev, isRunning: next };
    });
  };

  const resetTimer = () => {
    soundEngine.stopAmbient();
    setTimerState(prev => ({
      ...prev,
      remainingSec: prev.durationSec,
      isRunning: false,
      ambientSound: 'off'
    }));
  };

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

  const completeAndLogNow = () => {
    const elapsedSec = timerState.durationSec - timerState.remainingSec;
    const hours = Math.max(0.1, elapsedSec / 3600);
    logFocusSession(timerState.category, hours);
    soundEngine.playCompletionChime();
    soundEngine.stopAmbient();
    setTimerState(prev => ({
      ...prev,
      isOpen: false,
      isRunning: false,
      remainingSec: prev.durationSec,
      ambientSound: 'off'
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Focus & Pomodoro Studio</h2>
              <p className="text-xs text-slate-400">Stream focused preparation time straight to analytics</p>
            </div>
          </div>
          <button
            onClick={() => setTimerState(prev => ({ ...prev, isOpen: false }))}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Target Selector */}
        <div className="my-5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Link Focus Session To:
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
                      ? `${cat.color} ring-2 ring-indigo-500/30 font-semibold shadow-lg`
                      : 'border-white/5 bg-slate-800/40 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-[11px] text-center">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset Duration Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p.sec, p.mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                timerState.durationSec === p.sec
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                  : 'border-white/5 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center space-x-1 border border-white/5 bg-slate-800/50 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-slate-400">Custom:</span>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => handleCustomTime(Number(e.target.value))}
              className="w-12 bg-transparent text-xs text-white font-mono text-center focus:outline-none border-b border-indigo-500"
            />
            <span className="text-[11px] text-slate-400">min</span>
          </div>
        </div>

        {/* Circular Display & Numbers */}
        <div className="flex flex-col items-center justify-center my-4">
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
                stroke={timerState.category === 'gate' ? '#6366f1' : timerState.category === 'academic' ? '#10b981' : timerState.category === 'job' ? '#f59e0b' : '#f43f5e'}
                strokeWidth="6"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progress) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider">
                {minutes}:{seconds}
              </span>
              <span className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                {timerState.isRunning ? 'Deep Focus Mode' : 'Ready to Start'}
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Noise Selector */}
        <div className="bg-slate-900/60 border border-white/5 p-3 rounded-2xl flex items-center justify-between my-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-300 font-medium">Ambient Lo-Fi Generator:</span>
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
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs transition ${
                    active
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{amb.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={resetTimer}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleRunning}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg ${
                timerState.isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40 shadow-glow-gate'
              }`}
            >
              {timerState.isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={completeAndLogNow}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold transition"
              title="Record this session into today's analytics right away"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log & Done</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
