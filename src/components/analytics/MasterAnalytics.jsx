import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  Cpu,
  GraduationCap,
  Briefcase,
  Mic,
  Calendar,
  Download,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  calculateOverallAnalytics,
  calculateGateAnalytics,
  calculateAcademicAnalytics,
  calculateJobAnalytics,
  calculateEnglishAnalytics
} from '../../utils/analyticsCalculators';

export const MasterAnalytics = () => {
  const { data, analyticsCategory, setAnalyticsCategory } = useTracker();
  
  const overall = calculateOverallAnalytics(data);
  const gate = calculateGateAnalytics(data.gate, data.activityLogs);
  const academic = calculateAcademicAnalytics(data.academic, data.activityLogs);
  const job = calculateJobAnalytics(data.job, data.activityLogs);
  const english = calculateEnglishAnalytics(data.english, data.activityLogs);

  const categories = [
    { id: 'overall', label: 'Consolidated Overall', icon: Layers, color: 'text-indigo-400', active: 'bg-indigo-600' },
    { id: 'gate', label: 'GATE DS / AI', icon: Cpu, color: 'text-indigo-400', active: 'bg-indigo-600' },
    { id: 'academic', label: 'Academic Coursework', icon: GraduationCap, color: 'text-emerald-400', active: 'bg-emerald-600' },
    { id: 'job', label: 'Job & DS Revision', icon: Briefcase, color: 'text-amber-400', active: 'bg-amber-600' },
    { id: 'english', label: 'English Fluency', icon: Mic, color: 'text-rose-400', active: 'bg-rose-600' },
  ];

  const exportCsvReport = () => {
    const logs = data.activityLogs || [];
    let csv = 'Date,GATE DS Hours,Academic Hours,Job Prep Hours,English Hours,Total Hours\n';
    logs.forEach(l => {
      csv += `${l.date},${l.gate || 0},${l.academic || 0},${l.job || 0},${l.english || 0},${l.total || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omniprep_analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-white/10 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Deep Performance & Tracking Analytics</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-dimensional analytics for overall routine and separate domain deep dives
            </p>
          </div>
        </div>

        <button
          onClick={exportCsvReport}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Main Category Switcher Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((c) => {
          const Icon = c.icon;
          const isSelected = analyticsCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setAnalyticsCategory(c.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-semibold transition shrink-0 ${
                isSelected
                  ? `${c.active} text-white shadow-lg`
                  : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: OVERALL CONSOLIDATED ANALYTICS */}
      {analyticsCategory === 'overall' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-medium">All-Time Study Hours</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{overall.totalHoursAllTime}h</div>
              <div className="text-[11px] text-slate-400 mt-1">Across 60 recorded days</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-medium">7-Day Daily Average</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{overall.avgDailyHours7d}h / day</div>
              <div className="text-[11px] text-emerald-400 mt-1">Target: {data.profile?.dailyHourGoal}h</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-medium">Current Master Streak</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{data.profile?.currentStreak} Days</div>
              <div className="text-[11px] text-slate-400 mt-1">Max: {data.profile?.longestStreak} days</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <div className="text-xs text-slate-400 font-medium">Active Preparation Tracks</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">4 Pillars</div>
              <div className="text-[11px] text-slate-400 mt-1">GATE, Academics, Job, English</div>
            </div>
          </div>

          {/* Charts Row: Radar vs Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 6 Cols: Pillar Balance Radar Chart */}
            <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-1">Preparation Balance Radar</h3>
              <p className="text-xs text-slate-400 mb-4">Relative balance and consistency across all 4 domains</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={overall.radarBalance}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                    <Radar name="Balance Index" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6 Cols: Time Allocation Donut */}
            <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-1">30-Day Effort Allocation Breakdown</h3>
              <p className="text-xs text-slate-400 mb-4">Proportion of study hours dedicated to each pillar</p>
              
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overall.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="hours"
                    >
                      {overall.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }}
                      formatter={(val) => [`${val} Hours`, 'Time Dedicated']}
                    />
                    <Legend
                      formatter={(val, entry) => (
                        <span className="text-xs text-slate-300 font-medium">
                          {entry.payload.name} ({entry.payload.percentage}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 14-Day Daily Multi-Pillar Trend Area Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-1">14-Day Multi-Track Effort Trends</h3>
            <p className="text-xs text-slate-400 mb-4">Daily stacked hours across all four preparation pillars</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overall.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="gate" name="GATE DS/AI" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} stackId="1" />
                  <Area type="monotone" dataKey="academic" name="Academic" stroke="#10b981" fill="#10b981" fillOpacity={0.6} stackId="1" />
                  <Area type="monotone" dataKey="job" name="Job & DS Rev" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} stackId="1" />
                  <Area type="monotone" dataKey="english" name="English" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GATE DS / AI DEDICATED ANALYTICS */}
      {analyticsCategory === 'gate' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
              <div className="text-xs text-slate-400 font-medium">Syllabus Mastered</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{gate.overallSyllabusProgress}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{gate.completedTopics} of {gate.totalTopics} subtopics</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
              <div className="text-xs text-slate-400 font-medium">Mock Tests Attempted</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{(data.gate?.mockTests || []).length} Tests</div>
              <div className="text-[11px] text-emerald-400 mt-1">Latest Percentile: {(data.gate?.mockTests || [])[0]?.percentile || 95}%</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
              <div className="text-xs text-slate-400 font-medium">Daily Solved Practice</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{data.gate?.dailyQuestionSolvedToday} Qs</div>
              <div className="text-[11px] text-indigo-300 mt-1">Goal: {data.gate?.dailyQuestionTarget} Qs/day</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20">
              <div className="text-xs text-slate-400 font-medium">Target AIR Rank</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">Top {data.gate?.targetAirRank || 100}</div>
              <div className="text-[11px] text-slate-400 mt-1">Score Aim: {data.gate?.targetScore}/100</div>
            </div>
          </div>

          {/* Subject Mastery Progress Bar Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-1">Subject-wise Syllabus Mastery %</h3>
            <p className="text-xs text-slate-400 mb-4">Completion percentage across all 7 official GATE DA modules</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gate.subjectBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                  <Bar dataKey="progressPct" name="Mastery %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mock Score Trajectory */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-1">Mock Test Score & Accuracy Evolution</h3>
            <p className="text-xs text-slate-400 mb-4">Trajectory across full length and sectional mock exams</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gate.mockScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="percentage" name="Score %" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                  <Line type="monotone" dataKey="percentile" name="Percentile %" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ACADEMIC COURSEWORK DEDICATED ANALYTICS */}
      {analyticsCategory === 'academic' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
              <div className="text-xs text-slate-400 font-medium">Estimated GPA</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{data.academic?.currentEstimatedGpa} / 10</div>
              <div className="text-[11px] text-slate-400 mt-1">Target: {data.academic?.targetGpa}</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
              <div className="text-xs text-slate-400 font-medium">Average Attendance</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{academic.avgAttendance}%</div>
              <div className="text-[11px] text-emerald-400 mt-1">Threshold: 75% Min</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
              <div className="text-xs text-slate-400 font-medium">Assignments Done</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{academic.completedAssignments}/{academic.totalAssignments}</div>
              <div className="text-[11px] text-slate-400 mt-1">{academic.assignmentTurnaround}% on time</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
              <div className="text-xs text-slate-400 font-medium">Registered Courses</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{(data.academic?.courses || []).length} Subjects</div>
              <div className="text-[11px] text-slate-400 mt-1">CS Engineering Core</div>
            </div>
          </div>

          {/* Attendance Safety Bar Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-1">Course Attendance vs 75% Safety Line</h3>
            <p className="text-xs text-slate-400 mb-4">Ensure all subjects remain safely above the mandatory 75% attendance threshold</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={academic.attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                  <Bar dataKey="attendance" name="Attendance %" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: JOB PREP & DATA SCIENCE REVISION DEDICATED ANALYTICS */}
      {analyticsCategory === 'job' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
              <div className="text-xs text-slate-400 font-medium">DS Revision Coverage</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{job.revisionProgress}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{job.readyTopics} of {job.dsTopicsCount} Interview Ready</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
              <div className="text-xs text-slate-400 font-medium">DSA Problems Solved</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{job.totalDsaSolved} / {job.dsaTarget}</div>
              <div className="text-[11px] text-amber-400 mt-1">{Math.round((job.totalDsaSolved / job.dsaTarget) * 100)}% of goal</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
              <div className="text-xs text-slate-400 font-medium">Active Applications</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{(data.job?.applications || []).length} Tracked</div>
              <div className="text-[11px] text-emerald-400 mt-1">{(data.job?.applications || []).filter(a => a.status === 'Offer').length} Offers</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
              <div className="text-xs text-slate-400 font-medium">DS Flashcards in Vault</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{(data.job?.dsRevision?.flashcards || []).length} Cards</div>
              <div className="text-[11px] text-slate-400 mt-1">Interactive review mode</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 6 Cols: DSA Difficulty Distribution */}
            <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-1">DSA Solved Difficulty Breakdown</h3>
              <p className="text-xs text-slate-400 mb-4">Distribution between Easy, Medium and Hard LeetCode problems</p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={job.dsaDifficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {job.dsaDifficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                    <Legend formatter={(val, entry) => <span className="text-xs text-slate-300">{entry.payload.name} ({entry.payload.count})</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6 Cols: DS Revision Confidence Ratings */}
            <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-1">Data Science Concept Confidence Buckets</h3>
              <p className="text-xs text-slate-400 mb-4">Topic count based on interview readiness self-evaluation</p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={job.dsConfidenceBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="rating" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Topics Count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Job Application Funnel */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-1">Application Pipeline Conversion Funnel</h3>
            <p className="text-xs text-slate-400 mb-4">Recruitment progress from Wishlist to Final Offer</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={job.applicationFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                  <Bar dataKey="count" name="Companies" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: ENGLISH SPEAKING DEDICATED ANALYTICS */}
      {analyticsCategory === 'english' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/20">
              <div className="text-xs text-slate-400 font-medium">Total Spoken Minutes</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{english.totalMinutesSpoken} mins</div>
              <div className="text-[11px] text-slate-400 mt-1">Recorded in audio logs</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/20">
              <div className="text-xs text-slate-400 font-medium">Average Fluency Score</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">⭐ {english.avgFluency} / 5.0</div>
              <div className="text-[11px] text-emerald-400 mt-1">Consistent delivery pace</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/20">
              <div className="text-xs text-slate-400 font-medium">Vocabulary Bank</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{english.totalVocab} Words</div>
              <div className="text-[11px] text-slate-400 mt-1">{(data.english?.vocabulary || []).filter(v => v.status === 'Mastered').length} Mastered</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/20">
              <div className="text-xs text-slate-400 font-medium">Speaking Sessions</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{(data.english?.sessions || []).length} Recorded</div>
              <div className="text-[11px] text-rose-300 mt-1">Technical & HR prompts</div>
            </div>
          </div>

          {/* Fluency Score Progression */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-1">Speaking Fluency & Pacing Evolution</h3>
            <p className="text-xs text-slate-400 mb-4">Self-evaluation score progression over consecutive speaking sessions</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={english.fluencyProgression} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[1, 5]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="fluency" name="Fluency Rating (1-5)" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vocabulary Mastery Breakdown */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-1">Vocabulary Retention Status</h3>
            <p className="text-xs text-slate-400 mb-4">Count of words across Learning, Practicing, and Mastered stages</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={english.vocabBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                  <Bar dataKey="count" name="Words Count" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
