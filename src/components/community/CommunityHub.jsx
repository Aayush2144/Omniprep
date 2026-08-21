import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTracker } from '../../context/TrackerContext.jsx';
import {
  Trophy,
  Users,
  Flame,
  Clock,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  Crown,
  Heart,
  Volume2,
  RefreshCw,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommunityHub = () => {
  const { currentUser } = useAuth();
  const { setTimerState } = useTracker();

  const [leaderboardTab, setLeaderboardTab] = useState('today'); // 'today' | 'allTime' | 'streaks'
  const [liveUsers, setLiveUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ today: [], allTime: [], streaks: [] });
  const [loading, setLoading] = useState(true);
  const [cheeredUsers, setCheeredUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Community Data (Live users + Leaderboards)
  const fetchCommunityData = async () => {
    try {
      const [liveRes, lbRes] = await Promise.all([
        fetch('/api/community/live-users'),
        fetch('/api/community/leaderboard')
      ]);

      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson.success) setLiveUsers(liveJson.liveUsers || []);
      }

      if (lbRes.ok) {
        const lbJson = await lbRes.json();
        if (lbJson.success) setLeaderboard(lbJson.leaderboard || { today: [], allTime: [], streaks: [] });
      }
    } catch (err) {
      console.warn('[Community] Error fetching community data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
    const interval = setInterval(fetchCommunityData, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleCheer = (uid, e) => {
    e.stopPropagation();
    setCheeredUsers(prev => new Set([...prev, uid]));
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'gate': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'academic': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'job': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'english': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const currentLeaderboardList = (leaderboard[leaderboardTab] || []).filter(u =>
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.target_role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = currentLeaderboardList.slice(0, 3);
  const remaining = currentLeaderboardList.slice(3);

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Global Community & Live Study Hall</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Study Together & Climb The Leaderboard 🏆
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Stay accountable with fellow aspirants, see who is preparing right now, and earn top ranks!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTimerState(prev => ({ ...prev, isOpen: true }));
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Start Live Focus Session</span>
            </button>

            <button
              onClick={fetchCommunityData}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: WHO IS STUDYING LIVE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Who Is Studying Live</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {liveUsers.length} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Members currently in deep focus sessions</p>
            </div>
          </div>
        </div>

        {liveUsers.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No One is Studying at this Moment</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first scholar to jump into a focus session and light up the live hall!
            </p>
            <button
              onClick={() => setTimerState(prev => ({ ...prev, isOpen: true, isRunning: true }))}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition inline-flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Start 25m Focus Sprint</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveUsers.map((user) => {
              const isCurrentUser = user.uid === currentUser?.uid;
              const hasCheered = cheeredUsers.has(user.uid);
              const minsLeft = Math.ceil((user.timer_remaining_sec || 0) / 60);

              return (
                <div
                  key={user.uid}
                  className={`glass-panel p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                    isCurrentUser ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/40' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="space-y-3">
                    {/* User Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="relative">
                          <img
                            src={user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                            alt={user.display_name}
                            className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-white/10"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{user.display_name}</span>
                            {isCurrentUser && <span className="text-[10px] text-emerald-400 font-normal">(You)</span>}
                          </h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{user.target_role || 'Scholar'}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getCategoryColor(user.current_category)}`}>
                        {user.current_category?.toUpperCase() || 'FOCUS'}
                      </span>
                    </div>

                    {/* Current Task */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                        <span>Current Topic:</span>
                        {minsLeft > 0 && (
                          <span className="font-mono text-emerald-400 text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {minsLeft}m left
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white font-medium line-clamp-2">
                        {user.current_task || 'Deep Focus Session'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Stats & Cheer Button */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>⚡ {user.today_hours || 0}h today</span>
                      {user.streak > 0 && <span>🔥 {user.streak}d</span>}
                    </div>

                    {!isCurrentUser && (
                      <button
                        onClick={(e) => handleCheer(user.uid, e)}
                        className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
                          hasCheered
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                        }`}
                        title="Send High-Five / Cheer!"
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasCheered ? 'fill-rose-400 text-rose-400' : ''}`} />
                        <span className="text-[10px]">{hasCheered ? 'Cheered!' : 'Cheer'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: MULTI-CATEGORY GLOBAL LEADERBOARD */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Global Leaderboard</h2>
              <p className="text-xs text-slate-400">Rankings updated automatically from logged sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholars..."
                className="bg-slate-900/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setLeaderboardTab('today')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                  leaderboardTab === 'today' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Today</span>
              </button>

              <button
                onClick={() => setLeaderboardTab('allTime')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                  leaderboardTab === 'allTime' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>All-Time</span>
              </button>

              <button
                onClick={() => setLeaderboardTab('streaks')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                  leaderboardTab === 'streaks' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Streaks</span>
              </button>
            </div>
          </div>
        </div>

        {/* PODIUM SHOWCASE FOR TOP 3 */}
        {top3.length >= 3 && !searchQuery && (
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-6 pb-2 items-end">
            
            {/* #2 Rank (Silver) */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center space-y-2 bg-gradient-to-t from-slate-900/90 to-slate-800/40 relative">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 text-xs font-black flex items-center justify-center -mt-7 shadow border border-slate-500">
                2
              </div>
              <img
                src={top3[1]?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1]?.uid}`}
                alt={top3[1]?.display_name}
                className="w-12 h-12 rounded-full border-2 border-slate-400 object-cover bg-slate-800"
              />
              <div className="w-full">
                <h4 className="text-xs font-bold text-white truncate">{top3[1]?.display_name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{top3[1]?.target_role}</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200">
                {top3[1]?.score} {leaderboardTab === 'streaks' ? 'Days 🔥' : 'Hours ⏱️'}
              </div>
            </div>

            {/* #1 Rank (Gold Crown) */}
            <div className="glass-panel p-5 rounded-3xl border border-amber-500/40 flex flex-col items-center text-center space-y-2.5 bg-gradient-to-t from-amber-950/40 via-slate-900/90 to-amber-900/20 shadow-xl shadow-amber-950/30 relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 text-sm font-black flex items-center justify-center -mt-9 shadow-lg border-2 border-amber-300">
                <Crown className="w-4 h-4 fill-slate-950" />
              </div>
              <div className="relative">
                <img
                  src={top3[0]?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0]?.uid}`}
                  alt={top3[0]?.display_name}
                  className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover bg-slate-800 shadow-md"
                />
                <span className="absolute -top-1 -right-1 text-sm">👑</span>
              </div>
              <div className="w-full">
                <h4 className="text-sm font-extrabold text-amber-200 truncate">{top3[0]?.display_name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{top3[0]?.target_role}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-mono font-extrabold text-amber-300 shadow">
                {top3[0]?.score} {leaderboardTab === 'streaks' ? 'Days 🔥' : 'Hours ⏱️'}
              </div>
            </div>

            {/* #3 Rank (Bronze) */}
            <div className="glass-panel p-4 rounded-2xl border border-amber-900/50 flex flex-col items-center text-center space-y-2 bg-gradient-to-t from-slate-900/90 to-amber-950/20 relative">
              <div className="w-7 h-7 rounded-full bg-amber-800 text-amber-200 text-xs font-black flex items-center justify-center -mt-7 shadow border border-amber-700">
                3
              </div>
              <img
                src={top3[2]?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2]?.uid}`}
                alt={top3[2]?.display_name}
                className="w-12 h-12 rounded-full border-2 border-amber-700 object-cover bg-slate-800"
              />
              <div className="w-full">
                <h4 className="text-xs font-bold text-white truncate">{top3[2]?.display_name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{top3[2]?.target_role}</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                {top3[2]?.score} {leaderboardTab === 'streaks' ? 'Days 🔥' : 'Hours ⏱️'}
              </div>
            </div>

          </div>
        )}

        {/* FULL LEADERBOARD TABLE */}
        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center w-12">Rank</th>
                  <th className="px-4 py-3">Scholar</th>
                  <th className="px-4 py-3">Target Goal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">
                    {leaderboardTab === 'streaks' ? 'Active Streak' : leaderboardTab === 'today' ? "Today's Study" : 'Total Study'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentLeaderboardList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      No scholars found matching your search.
                    </td>
                  </tr>
                ) : (
                  currentLeaderboardList.map((user, idx) => {
                    const isUser = user.uid === currentUser?.uid;
                    const rank = idx + 1;

                    return (
                      <tr
                        key={user.uid}
                        className={`transition ${
                          isUser ? 'bg-indigo-950/30 font-semibold text-white' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-4 py-3.5 text-center font-bold font-mono">
                          {rank === 1 && <span className="text-amber-400">🥇 1</span>}
                          {rank === 2 && <span className="text-slate-300">🥈 2</span>}
                          {rank === 3 && <span className="text-amber-600">🥉 3</span>}
                          {rank > 3 && <span className="text-slate-400">#{rank}</span>}
                        </td>

                        {/* Scholar Name & Avatar */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                              alt={user.display_name}
                              className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white">{user.display_name}</span>
                                {isUser && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Target Goal */}
                        <td className="px-4 py-3.5 text-slate-400">
                          {user.target_role || 'Data Scientist'}
                        </td>

                        {/* Live Status */}
                        <td className="px-4 py-3.5">
                          {user.is_studying ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live Studying
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Idle</span>
                          )}
                        </td>

                        {/* Metric Score */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-white text-sm">
                          {leaderboardTab === 'streaks' ? (
                            <span className="text-orange-400 flex items-center justify-end gap-1">
                              {user.score} <Flame className="w-3.5 h-3.5 fill-orange-400" />
                            </span>
                          ) : (
                            <span className="text-amber-300">
                              {user.score} hrs
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
