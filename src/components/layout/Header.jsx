import React, { useState, useRef, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  Clock,
  Play,
  Download,
  Upload,
  RotateCcw,
  Database,
  Sparkles,
  User,
  LogOut,
  LogIn,
  Shield,
  Users,
  ChevronDown,
  Megaphone
} from 'lucide-react';
import { getStoredApiKey } from '../../utils/geminiClient.js';
import { ApiKeyModal } from '../ai/ApiKeyModal.jsx';

export const Header = () => {
  const { data, dbStatus, timerState, setTimerState, exportDataJson, importDataJson, resetToZeroData, setActiveTab } = useTracker();
  const { currentUser, userProfile, isAdmin, setIsAuthModalOpen, logout } = useAuth();
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [liveStudierCount, setLiveStudierCount] = useState(0);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const fileInputRef = useRef(null);

  const hasApiKey = Boolean(getStoredApiKey());
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = (data.activityLogs || []).find(l => l.date === todayStr) || { total: 0 };
  const dailyGoal = data.profile?.dailyHourGoal || 7.5;
  const progressPct = dailyGoal > 0 ? Math.min(100, Math.round(((todayLog.total || 0) / dailyGoal) * 100)) : 0;

  // Poll live studiers count and active announcements
  useEffect(() => {
    const fetchPresenceAndAnnouncements = async () => {
      try {
        const [presRes, annRes] = await Promise.all([
          fetch('/api/community/live-users'),
          fetch('/api/community/announcements')
        ]);
        if (presRes.ok) {
          const pJson = await presRes.json();
          if (pJson.success) setLiveStudierCount(pJson.liveUsers?.length || 0);
        }
        if (annRes.ok) {
          const aJson = await annRes.json();
          if (aJson.success && aJson.announcements?.length > 0) {
            setActiveAnnouncement(aJson.announcements[0]);
          } else {
            setActiveAnnouncement(null);
          }
        }
      } catch (e) {}
    };

    fetchPresenceAndAnnouncements();
    const interval = setInterval(fetchPresenceAndAnnouncements, 20000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Global Broadcast Announcement Banner */}
      {activeAnnouncement && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-slate-900 px-4 py-1.5 text-xs text-white flex items-center justify-between border-b border-indigo-500/30">
          <div className="flex items-center space-x-2 truncate mx-auto">
            <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">Broadcast:</span>
            <span className="truncate">{activeAnnouncement.message}</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 h-16 bg-[#090d16]/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 flex items-center justify-between">
        
        {/* Left: DB Status, Gemini Key & Live Studiers indicator */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Database Status Indicator */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${currentDbBadge.color}`}>
            <Database className="w-3.5 h-3.5" />
            <span>{currentDbBadge.label}</span>
          </div>

          {/* Live Studiers Pulse Pill */}
          <button
            onClick={() => setActiveTab('community')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition shadow-sm"
            title="Open Live Study Hall & Community"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{liveStudierCount} Studying Live</span>
          </button>

          {/* Gemini AI Key Trigger */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition ${
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

        {/* Right: Streak, Daily Progress, Timer trigger, & User Profile Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Streak Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{data.profile?.currentStreak || 0}d Streak</span>
          </div>

          {/* Daily Goal Mini-Bar */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/50 border border-white/5 px-3 py-1.5 rounded-lg text-xs">
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm ${
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
                : 'Focus'}
            </span>
          </button>

          {/* Backup / Export / Import / Reset */}
          <div className="hidden sm:flex items-center space-x-1 border-l border-white/10 pl-2">
            <button
              onClick={exportDataJson}
              title="Export Database Backup JSON"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Database Backup JSON"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            >
              <Upload className="w-3.5 h-3.5" />
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
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* USER PROFILE & AUTH DROPDOWN */}
          <div className="relative border-l border-white/10 pl-2">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-800/70 transition border border-transparent hover:border-white/10"
            >
              <img
                src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid || 'Scholar'}`}
                alt={currentUser?.displayName || 'User'}
                className="w-7 h-7 rounded-full bg-slate-800 object-cover border border-indigo-500/40"
              />
              <span className="hidden md:inline text-xs font-semibold text-white max-w-[100px] truncate">
                {currentUser?.displayName || 'Scholar'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#0c1222] border border-indigo-500/30 rounded-2xl p-3 shadow-2xl space-y-3 animate-fade-in z-50"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                {/* User Info */}
                <div className="flex items-center space-x-3 p-2 bg-slate-900/80 rounded-xl border border-white/5">
                  <img
                    src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid || 'Scholar'}`}
                    alt="User"
                    className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-white/10"
                  />
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <span>{currentUser?.displayName || 'Prep Scholar'}</span>
                      {isAdmin && <Shield className="w-3 h-3 text-purple-400 shrink-0" />}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email || 'scholar@omniprep.io'}</p>
                    <p className="text-[10px] text-indigo-400 truncate">{currentUser?.targetRole || 'Data Scientist'}</p>
                  </div>
                </div>

                {/* Menu Action Links */}
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setActiveTab('community')}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition text-left"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Live Study Hall & Ranks</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-950/40 transition text-left font-semibold"
                    >
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>Admin Console 👑</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition text-left"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Switch Account / Sign In</span>
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>

              </div>
            )}
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
