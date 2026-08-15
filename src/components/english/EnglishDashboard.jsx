import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  Mic,
  BookA,
  BarChart2,
  Sparkles,
  Volume2,
  Award,
  Clock,
  TrendingUp,
  Bot
} from 'lucide-react';
import { SpeakingPractice } from './SpeakingPractice.jsx';
import { VocabularyVault } from './VocabularyVault.jsx';
import { AiEnglishPracticeStudio } from './AiEnglishPracticeStudio.jsx';
import { calculateEnglishAnalytics } from '../../utils/analyticsCalculators.js';

export const EnglishDashboard = () => {
  const { data, setActiveTab, setAnalyticsCategory } = useTracker();
  const [subTab, setSubTab] = useState('aiSpeaking'); // 'aiSpeaking' | 'speaking' | 'vocab'
  const analytics = calculateEnglishAnalytics(data.english, data.activityLogs);

  const goToEnglishAnalytics = () => {
    setAnalyticsCategory('english');
    setActiveTab('analytics');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/20 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">English Speaking & Fluency Hub</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                Daily Goal: {data.english?.dailyTargetMinutes || 20} mins
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gemini AI Conversation Partner, Speech Memos, Prompts & Vocabulary Vault
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToEnglishAnalytics}
            className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>English Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Spoken Minutes */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Minutes Spoken Today</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {data.english?.minutesPracticedToday || 0} <span className="text-xs font-normal text-slate-400">/ {data.english?.dailyTargetMinutes || 20}m</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${Math.min(100, ((data.english?.minutesPracticedToday || 0) / (data.english?.dailyTargetMinutes || 20)) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            {Math.round(((data.english?.minutesPracticedToday || 0) / (data.english?.dailyTargetMinutes || 20)) * 100)}% of daily goal
          </div>
        </div>

        {/* Fluency Rating */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Fluency Rating</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1 flex items-center gap-1.5">
            <span>⭐ {analytics.avgFluency || 0.0}</span>
            <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Real-time Gemini AI Rating
          </div>
        </div>

        {/* Total Speaking Sessions */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Total Recorded Sessions</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {(data.english?.sessions || []).length} Sessions
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {analytics.totalMinutesSpoken} total minutes recorded
          </div>
        </div>

        {/* Gemini AI Partner Status */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5">
          <div className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Gemini Speech AI
          </div>
          <div className="text-sm font-bold text-white mt-1">
            Voice & Grammar Doctor
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Audio playback + idiom upgrades
          </div>
        </div>
      </div>

      {/* Sub-Tabs: AI Speaking Partner vs Traditional Prompts vs Vocabulary Vault */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setSubTab('aiSpeaking')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
            subTab === 'aiSpeaking'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>🤖 AI English Speaking Partner (Gemini)</span>
        </button>

        <button
          onClick={() => setSubTab('speaking')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
            subTab === 'speaking'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Speaking Prompts & Audio Recorder</span>
        </button>

        <button
          onClick={() => setSubTab('vocab')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
            subTab === 'vocab'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookA className="w-4 h-4" />
          <span>Vocabulary & Idiom Vault</span>
        </button>
      </div>

      {/* Render Sub Tab */}
      <div>
        {subTab === 'aiSpeaking' && <AiEnglishPracticeStudio />}
        {subTab === 'speaking' && <SpeakingPractice />}
        {subTab === 'vocab' && <VocabularyVault />}
      </div>

    </div>
  );
};
