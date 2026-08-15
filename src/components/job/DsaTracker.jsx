import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Code, Plus, CheckCircle2, Clock, Filter, ExternalLink } from 'lucide-react';

export const DsaTracker = () => {
  const { data, addDsaProblem } = useTracker();
  const [isAdding, setIsAdding] = useState(false);
  const [filterDiff, setFilterDiff] = useState('All');

  // Form State
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [topic, setTopic] = useState('Dynamic Programming');
  const [timeMin, setTimeMin] = useState(25);
  const [platform, setPlatform] = useState('LeetCode');
  const [notes, setNotes] = useState('');

  const dsaList = data.job?.dsaList || [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addDsaProblem({
      title: title.trim(),
      difficulty,
      topic,
      timeMin: Number(timeMin),
      platform,
      notes: notes.trim() || 'Solved successfully.'
    });
    setTitle('');
    setNotes('');
    setIsAdding(false);
  };

  const filteredList = filterDiff === 'All'
    ? dsaList
    : dsaList.filter(d => d.difficulty === filterDiff);

  const diffColors = {
    Easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Hard: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                filterDiff === d
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Solved Problem</span>
        </button>
      </div>

      {/* Add Problem Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel p-4 rounded-2xl border border-amber-500/30 space-y-3 animate-slide-up">
          <h4 className="text-xs font-semibold text-white">Record Solved DSA Problem</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Problem Title (e.g. Trapping Rain Water)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="sm:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Topic (e.g. Two Pointers, Monotonic Stack)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Time Taken (mins)"
              value={timeMin}
              onChange={(e) => setTimeMin(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Platform (LeetCode/Codeforces)"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
          <textarea
            rows="2"
            placeholder="Key algorithmic approach, time & space complexity notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold">Save Problem</button>
          </div>
        </form>
      )}

      {/* Problems List */}
      <div className="space-y-2.5">
        {filteredList.map((item) => (
          <div key={item.id} className="glass-panel p-3.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <h4 className="font-semibold text-xs text-white">{item.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                  {item.topic}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${diffColors[item.difficulty]}`}>
                  {item.difficulty}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{item.solvedDate}</span>
              </div>
            </div>

            {item.notes && (
              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-white/5 font-mono">
                💡 <span className="text-slate-300">{item.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
