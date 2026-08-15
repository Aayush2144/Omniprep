import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  Cpu,
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  Plus,
  Edit3,
  Award,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { calculateGateAnalytics } from '../../utils/analyticsCalculators';

export const GateDashboard = () => {
  const { data, toggleGateTopic, updateGateTopicNotes, addGateMockTest, incrementGateQuestions, setActiveTab, setAnalyticsCategory } = useTracker();
  const analytics = calculateGateAnalytics(data.gate, data.activityLogs);

  const [expandedSubject, setExpandedSubject] = useState(data.gate.syllabus[0]?.id || null);
  const [editingNotesTopic, setEditingNotesTopic] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [isAddingMock, setIsAddingMock] = useState(false);

  // New Mock Test Form State
  const [mockTitle, setMockTitle] = useState('');
  const [mockScore, setMockScore] = useState('');
  const [mockTotal, setMockTotal] = useState(100);
  const [mockPercentile, setMockPercentile] = useState('');
  const [mockMistakes, setMockMistakes] = useState('');

  const handleOpenNotes = (subjectId, topic) => {
    setEditingNotesTopic({ subjectId, topicId: topic.id, topicName: topic.name });
    setNotesText(topic.notes || '');
  };

  const handleSaveNotes = () => {
    if (editingNotesTopic) {
      updateGateTopicNotes(editingNotesTopic.subjectId, editingNotesTopic.topicId, notesText);
      setEditingNotesTopic(null);
    }
  };

  const handleAddMock = (e) => {
    e.preventDefault();
    if (!mockTitle.trim() || !mockScore) return;
    addGateMockTest({
      title: mockTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      score: parseFloat(mockScore),
      total: parseFloat(mockTotal) || 100,
      percentile: parseFloat(mockPercentile) || 95.0,
      mistakes: mockMistakes.trim() || 'Reviewed errors.'
    });
    setMockTitle('');
    setMockScore('');
    setMockPercentile('');
    setMockMistakes('');
    setIsAddingMock(false);
  };

  const goToGateAnalytics = () => {
    setAnalyticsCategory('gate');
    setActiveTab('analytics');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">GATE Data Science & AI (DA/DS) Hub</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Target Score: {data.gate?.targetScore || 85}/100
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive Syllabus Mastery, Mock Performance & PYQ Error Logs
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToGateAnalytics}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>GATE Deep Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Syllabus Progress */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Syllabus Completion</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {analytics.overallSyllabusProgress}%
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${analytics.overallSyllabusProgress}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            {analytics.completedTopics} of {analytics.totalTopics} sub-topics mastered
          </div>
        </div>

        {/* Daily Question Practice Counter */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Daily Question Target</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">Today</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {data.gate?.dailyQuestionSolvedToday || 0} <span className="text-xs font-normal text-slate-400">/ {data.gate?.dailyQuestionTarget || 35}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <button
              onClick={() => incrementGateQuestions(1)}
              className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> +1 Solved
            </button>
            <button
              onClick={() => incrementGateQuestions(5)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
            >
              +5
            </button>
          </div>
        </div>

        {/* Mocks Attempted */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Full & Sectional Mocks</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {(data.gate?.mockTests || []).length} Tests
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Latest: {(data.gate?.mockTests || [])[0]?.score || 0}/{(data.gate?.mockTests || [])[0]?.total || 100}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Avg Accuracy: ~84.5%
          </div>
        </div>

        {/* High Weightage Subjects */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">High Weightage Focus</div>
          <div className="text-sm font-bold text-indigo-300 mt-1">
            ML (20%) + Programming (18%) + Prob/Stats (15%)
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Accounts for 53%+ of total GATE DA exam marks!
          </div>
        </div>
      </div>

      {/* Main Content Grid: Syllabus Tree (Left) vs Mock Tests (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Detailed Subject-wise Syllabus Accordion */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Official GATE DA/DS Syllabus Mastery</h3>
            </div>
            <span className="text-xs text-slate-400">Click topics to cycle status</span>
          </div>

          <div className="space-y-3">
            {(data.gate?.syllabus || []).map((subject) => {
              const isExpanded = expandedSubject === subject.id;
              const completedCount = subject.topics.filter(t => t.status === 'Completed').length;
              const totalCount = subject.topics.length;
              const pct = Math.round((completedCount / totalCount) * 100);

              return (
                <div key={subject.id} className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition">
                  {/* Subject Header / Trigger */}
                  <div
                    onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition select-none"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-xs">
                        {subject.weightage}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{subject.subject}</h4>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                          <span>{completedCount}/{totalCount} Mastered</span>
                          <span>•</span>
                          <span className="text-indigo-400 font-medium">{pct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-2">
                      <div className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Topic Sub-List */}
                  {isExpanded && (
                    <div className="p-4 pt-1 bg-slate-900/40 border-t border-white/5 space-y-2 animate-fade-in">
                      {subject.topics.map((topic) => {
                        const statusColors = {
                          'Completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                          'In Progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                          'Not Started': 'bg-slate-800 text-slate-400 border-slate-700'
                        };

                        return (
                          <div
                            key={topic.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition gap-2"
                          >
                            <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                              <button
                                onClick={() => toggleGateTopic(subject.id, topic.id)}
                                className="mt-0.5 shrink-0"
                                title="Click to cycle status"
                              >
                                {topic.status === 'Completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : topic.status === 'In Progress' ? (
                                  <Clock className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-600 hover:border-indigo-400" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-200">{topic.name}</div>
                                {topic.notes && (
                                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                                    "{topic.notes}"
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                              {/* Revision Count Pill */}
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5 font-mono">
                                Rev: {topic.revisionCount || 0}x
                              </span>

                              {/* Status Badge */}
                              <button
                                onClick={() => toggleGateTopic(subject.id, topic.id)}
                                className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition ${statusColors[topic.status]}`}
                              >
                                {topic.status}
                              </button>

                              {/* Edit Notes */}
                              <button
                                onClick={() => handleOpenNotes(subject.id, topic)}
                                className="p-1 text-slate-500 hover:text-indigo-300 transition rounded-lg hover:bg-slate-700"
                                title="Add/Edit Concept Notes & Formulas"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Mock Tests & PYQ Performance Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Mock Tests & PYQ Scores</h3>
            </div>
            <button
              onClick={() => setIsAddingMock(!isAddingMock)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Mock</span>
            </button>
          </div>

          {/* Add Mock Test Form */}
          {isAddingMock && (
            <form onSubmit={handleAddMock} className="glass-panel p-4 rounded-2xl border border-indigo-500/30 space-y-3 animate-slide-up">
              <h4 className="text-xs font-semibold text-white">Record New Mock Test / Sectional</h4>
              <input
                type="text"
                placeholder="Test Title (e.g. GATE DA Full Mock 03)"
                value={mockTitle}
                onChange={(e) => setMockTitle(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Score Obtained</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="65.5"
                    value={mockScore}
                    onChange={(e) => setMockScore(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={mockTotal}
                    onChange={(e) => setMockTotal(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Percentile %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="96.5"
                    value={mockPercentile}
                    onChange={(e) => setMockPercentile(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Mistake Analysis & Key Learnings</label>
                <textarea
                  rows="2"
                  placeholder="e.g., Silly mistake in Bayes posterior calculation; need more practice on SQL group by with having."
                  value={mockMistakes}
                  onChange={(e) => setMockMistakes(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingMock(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Test
                </button>
              </div>
            </form>
          )}

          {/* Mock Test Score Progression Chart */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">Score & Accuracy Trend</h4>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.mockScores} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="percentage" name="Score %" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mock Tests List */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {(data.gate?.mockTests || []).map((mock) => (
              <div key={mock.id} className="glass-panel p-3.5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{mock.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{mock.date}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-mono text-indigo-400 font-bold">{mock.score} / {mock.total}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-medium">{mock.accuracy}% Accuracy</span>
                  {mock.percentile && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="text-amber-400 font-medium">{mock.percentile}%ile</span>
                    </>
                  )}
                </div>
                {mock.mistakes && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-white/5">
                    <strong className="text-rose-400 font-medium">Mistake Log:</strong> {mock.mistakes}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Notes / Formula Edit Modal */}
      {editingNotesTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Concept Notes & Revision Formulas</h3>
                <p className="text-xs text-indigo-400 font-medium">{editingNotesTopic.topicName}</p>
              </div>
              <button onClick={() => setEditingNotesTopic(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <textarea
              rows="6"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Record key derivations, cheat sheet formulas, common GATE traps for this topic..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingNotesTopic(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
