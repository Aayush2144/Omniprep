import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { CheckSquare, Square, Plus, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyChecklist = () => {
  const { data, toggleRoutine, addRoutine, deleteRoutine } = useTracker();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPeriod, setNewPeriod] = useState('Core Work');
  const [newCategory, setNewCategory] = useState('gate');

  const routines = data.dailyRoutines || [];
  const completedCount = routines.filter(r => r.completed).length;
  const totalCount = routines.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (id) => {
    const routine = routines.find(r => r.id === id);
    if (routine && !routine.completed && completedCount + 1 === totalCount) {
      // Trigger celebratory confetti when 100% daily goals reached!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
    toggleRoutine(id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addRoutine(newPeriod, newTitle.trim(), newCategory);
    setNewTitle('');
    setIsAdding(false);
  };

  const periods = ['Morning', 'Core Work', 'Evening'];

  const categoryTagColors = {
    routine: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
    gate: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    academic: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    job: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    english: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col h-full">
      {/* Header & Progress Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Daily Routine & Habit Checklist</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-medium text-slate-300">
            {completedCount}/{totalCount} ({percentage}%)
          </span>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition text-xs flex items-center gap-1 px-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full my-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-amber-400 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Add Task Form (Inline) */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-800/80 p-3 rounded-xl border border-white/10 mb-4 animate-slide-up">
          <input
            type="text"
            placeholder="e.g., Revise Dynamic Programming 2 Mediums..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-2"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                className="bg-slate-900 border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="Morning">Morning</option>
                <option value="Core Work">Core Work</option>
                <option value="Evening">Evening</option>
              </select>

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-slate-900 border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="routine">General Routine</option>
                <option value="gate">GATE DS / AI</option>
                <option value="academic">Academic</option>
                <option value="job">Job & DS Rev</option>
                <option value="english">English</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Routine Sections */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {periods.map((period) => {
          const items = routines.filter(r => r.period === period);
          if (items.length === 0) return null;

          return (
            <div key={period} className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{period} Protocol</span>
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      item.completed
                        ? 'bg-slate-900/40 border-white/5 opacity-60'
                        : 'bg-slate-800/50 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div
                      onClick={() => handleToggle(item.id)}
                      className="flex items-center space-x-2.5 flex-1 cursor-pointer select-none"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 hover:text-indigo-400" />
                      )}
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${categoryTagColors[item.category] || categoryTagColors.routine}`}>
                        {item.category}
                      </span>
                      <button
                        onClick={() => deleteRoutine(item.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
