import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import DailyTargetModal from '../profile/DailyTargetModal';
import {
  Flame,
  Clock,
  Award,
  Zap,
  TrendingUp,
  Cpu,
  GraduationCap,
  Briefcase,
  Mic,
  ArrowRight,
  Play,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Target,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { HeatmapCalendar } from './HeatmapCalendar';
import { DailyChecklist } from './DailyChecklist';
import { calculateOverallAnalytics, formatDuration } from '../../utils/analyticsCalculators';
import { calculateGamification } from '../../utils/gamification.js';

export const OverviewDashboard = () => {
  const { data, setActiveTab, setTimerState } = useTracker();
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const analytics = calculateOverallAnalytics(data);

  const currentStreak = analytics.streakInfo?.currentStreak ?? data.profile?.currentStreak ?? 0;
  const longestStreak = analytics.streakInfo?.longestStreak ?? data.profile?.longestStreak ?? 42;
  const isStudiedToday = analytics.streakInfo?.isStudiedToday ?? false;
  const game = calculateGamification(data);

  const pillars = [
    {
      id: 'gate',
      title: 'GATE DS & AI',
      icon: Cpu,
      hoursToday: analytics.todayLog?.gate || 0,
      statLabel: 'Syllabus Mastered',
      statValue: `${data.gate?.syllabus ? Math.round((data.gate.syllabus.reduce((a, s) => a + s.completedTopics, 0) / data.gate.syllabus.reduce((a, s) => a + s.totalTopics, 0)) * 100) : 0}%`,
      subStat: `${data.gate?.dailyQuestionSolvedToday || 0}/${data.gate?.dailyQuestionTarget || 35} Questions`,
      color: 'from-indigo-600/20 to-purple-600/10 border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60',
      tagColor: 'bg-indigo-500/20 text-indigo-300'
    },
    {
      id: 'academic',
      title: 'Academic Prep',
      icon: GraduationCap,
      hoursToday: analytics.todayLog?.academic || 0,
      statLabel: 'Est. Semester GPA',
      statValue: `${data.academic?.currentEstimatedGpa || 8.85} / 10`,
      subStat: `${(data.academic?.assignments || []).filter(a => a.status === 'Completed').length}/${(data.academic?.assignments || []).length} Assignments`,
      color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60',
      tagColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'job',
      title: 'Job & DS Revision',
      icon: Briefcase,
      hoursToday: analytics.todayLog?.job || 0,
      statLabel: 'DS Revision Topics',
      statValue: `${(data.job?.dsRevision?.topics || []).filter(t => t.status === 'Interview Ready').length} / ${(data.job?.dsRevision?.topics || []).length}`,
      subStat: `${data.job?.dsaSolvedCount || 184} LeetCode Solved`,
      color: 'from-amber-600/20 to-yellow-600/10 border-amber-500/30 text-amber-400 hover:border-amber-500/60',
      tagColor: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'english',
      title: 'English Fluency',
      icon: Mic,
      hoursToday: analytics.todayLog?.english || 0,
      statLabel: 'Speaking Practiced',
      statValue: `${data.english?.minutesPracticedToday || 0}m Today`,
      subStat: `Rating: ⭐ ${data.english?.currentFluencyRating || 4.2}/5`,
      color: 'from-rose-600/20 to-pink-600/10 border-rose-500/30 text-rose-400 hover:border-rose-500/60',
      tagColor: 'bg-rose-500/20 text-rose-300'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner / Welcome & Key Target */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 lg:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Track Preparation Master Command</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {data.profile?.name || 'Aayush'}! 🚀
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Track and accelerate your <strong>GATE DS/AI</strong> mastery, <strong>Academic Coursework</strong>, <strong>Job Prep & DS Revision</strong>, and <strong>English Fluency</strong> in one unified system.
            </p>
          </div>

          {/* Quick Focus Session Launcher */}
          <button
            onClick={() => setTimerState(prev => ({ ...prev, isOpen: true }))}
            className="flex items-center space-x-2.5 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 shrink-0 hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Focus Studio</span>
          </button>
        </div>
      </div>

      {/* GAMIFICATION & LEVEL PROGRESSION BANNER */}
      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-purple-950/30 via-slate-900/80 to-indigo-950/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-amber-400 text-sm">
                Lvl {game.level}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-base">{game.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30">
                  {game.totalXp} Total XP ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {game.xpInCurrentLevel} / {game.xpNeededForNext} XP to reach Level {game.level + 1}
              </p>
            </div>
          </div>

          {/* Badges Preview */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {game.allBadges.map((badge) => (
              <div
                key={badge.id}
                title={`${badge.name}: ${badge.desc} (${badge.unlocked ? 'Unlocked! 🏆' : 'Locked 🔒'})`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                  badge.unlocked
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-sm'
                    : 'bg-slate-900/60 text-slate-500 border-white/5 opacity-50 grayscale'
                }`}
              >
                <span>{badge.icon}</span>
                <span className="text-[11px] hidden md:inline">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${game.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Primary Master KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Focus */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium">Today's Focus</span>
              <button
                onClick={() => setIsTargetModalOpen(true)}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition cursor-pointer"
                title="Customize Daily Target"
              >
                Adjust ✏️
              </button>
            </div>
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition"
              title="Click to customize daily goal"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {formatDuration(analytics.todayHours)}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">
                / {formatDuration(data.profile?.dailyHourGoal || 7.5)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {Math.round(((analytics.todayHours || 0) / (data.profile?.dailyHourGoal || 7.5)) * 100)}% of daily target reached
            </div>
          </div>
        </div>

        {/* 7-Day Average */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">7-Day Daily Avg</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {formatDuration(analytics.avgDailyHours7d)}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">/ day</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> High consistency tempo
            </div>
          </div>
        </div>

        {/* Active Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Master Streak</span>
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition"
              title="Click for streak & target rules"
            >
              <Flame className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono flex items-center gap-1.5">
              <span>{currentStreak}</span>
              <span className="text-xs font-normal text-slate-400">Days</span>
              {isStudiedToday ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              ) : currentStreak > 0 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                  Study today
                </span>
              ) : null}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Personal Best: {longestStreak} days
            </div>
          </div>
        </div>

        {/* All-Time Study Hours */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Tracked Hours</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">
              {formatDuration(analytics.totalHoursAllTime)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Logged across 4 domains
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Domain Hub Jump Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${p.color} border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-white">{p.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition" />
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">{p.statLabel}</div>
                  <div className="text-xl font-bold text-white font-mono">{p.statValue}</div>
                  <div className="text-[11px] text-slate-300">{p.subStat}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Today: <strong className="text-white">{formatDuration(p.hoursToday)}</strong></span>
                <span className="text-[11px] font-semibold text-white group-hover:underline flex items-center gap-1">
                  Open Hub <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mid Section: GitHub Heatmap Matrix */}
      <HeatmapCalendar />

      {/* Bottom Grid: Daily Checklist vs Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Daily Checklist */}
        <div className="lg:col-span-6 h-[460px]">
          <DailyChecklist />
        </div>

        {/* Right 6 Cols: Daily 14-Day Study Trend Area Chart & Pillar Distribution */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Trend Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">14-Day Multi-Track Effort Trends</h3>
                <p className="text-xs text-slate-400">Hours spent per day across preparation pillars</p>
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="acadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="gate" name="GATE DS" stroke="#6366f1" fillOpacity={1} fill="url(#gateGrad)" stackId="1" />
                  <Area type="monotone" dataKey="academic" name="Academics" stroke="#10b981" fillOpacity={1} fill="url(#acadGrad)" stackId="1" />
                  <Area type="monotone" dataKey="job" name="Job & DS Rev" stroke="#f59e0b" fillOpacity={1} fill="url(#jobGrad)" stackId="1" />
                  <Area type="monotone" dataKey="english" name="English" stroke="#f43f5e" fillOpacity={1} fill="url(#engGrad)" stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> GATE DS</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Academics</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Job Prep</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> English</span>
            </div>
          </div>

          {/* Quick Balance Summary */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Pillar Balance Ratio (30 Days)</h4>
                <p className="text-[11px] text-slate-400">
                  {analytics.categoryDistribution.map(c => `${c.name}: ${c.percentage}%`).join(' • ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Full Analytics →
            </button>
          </div>

        </div>

      </div>

      {/* Daily Focus Target & Streak Explanation Modal */}
      <DailyTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
      />

    </div>
  );
};
