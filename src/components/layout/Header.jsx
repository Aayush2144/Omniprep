import React, { useState, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Flame, Clock, Play, Download, Upload, RotateCcw, Database, Sparkles, Key, Bot } from 'lucide-react';
import { getStoredApiKey } from '../../utils/geminiClient.js';
import { ApiKeyModal } from '../ai/ApiKeyModal.jsx';

export const Header = () => {
  const { data, dbStatus, timerState, setTimerState, exportDataJson, importDataJson, resetToZeroData } = useTracker();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const hasApiKey = Boolean(getStoredApiKey());
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = (data.activityLogs || []).find(l => l.date === todayStr) || { total: 0 };
  const dailyGoal = data.profile?.dailyHourGoal || 7.5;
  const progressPct = dailyGoal > 0 ? Math.min(100, Math.round(((todayLog.total || 0) / dailyGoal) * 100)) : 0;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importDataJson(file);
      e.target.value = '';
    }
  };

  const dbBadges = {
    connected: { label: 'SQLite Live', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    saving: { label: 'Saving...', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' },
    connecting: { label: 'Connecting...', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    offline: { label: 'Local Cache', color: 'bg-slate-700/50 text-slate-300 border-slate-600/30' }
  };

  const currentDbBadge = dbBadges[dbStatus] || dbBadges.connected;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#090d16]/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 flex items-center justify-between">
        {/* Left: DB Status & AI Key Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Database Status Indicator */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${currentDbBadge.color}`}>
            <Database className="w-3.5 h-3.5" />
            <span>{currentDbBadge.label}</span>
          </div>

          {/* Gemini AI Key Trigger */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition ${
              hasApiKey
                ? 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30 animate-pulse'
            }`}
            title="Configure Google Gemini API Key"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{hasApiKey ? 'Gemini AI Ready ⚡' : 'Set Gemini Key 🔑'}</span>
          </button>
        </div>

        {/* Right: Streak, Daily Progress, Timer trigger, & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Streak Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{data.profile?.currentStreak || 0}d Streak</span>
          </div>

          {/* Daily Goal Mini-Bar */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 border border-white/5 px-3 py-1.5 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Today:</span>
            <span className="text-white font-medium">{todayLog.total || 0}h / {dailyGoal}h</span>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Focus Timer Trigger Button */}
          <button
            onClick={() => setTimerState(prev => ({ ...prev, isOpen: true }))}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              timerState.isRunning
                ? 'bg-indigo-600 text-white animate-pulse shadow-glow-gate'
                : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
            }`}
            title="Open Focus & Pomodoro Timer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {timerState.isRunning
                ? `${Math.floor(timerState.remainingSec / 60)}:${(timerState.remainingSec % 60).toString().padStart(2, '0')}`
                : 'Focus Timer'}
            </span>
          </button>

          {/* Backup / Export / Import / Reset to Zero */}
          <div className="flex items-center space-x-1 border-l border-white/10 pl-2">
            <button
              onClick={exportDataJson}
              title="Export Database Backup JSON"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Database Backup JSON"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={resetToZeroData}
              title="Reset All Analytics & Routine to ZERO State"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Gemini API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </>
  );
};
