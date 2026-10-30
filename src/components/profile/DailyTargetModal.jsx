import React, { useState } from 'react';
import { Target, X, Check, Flame, Clock, Sparkles, HelpCircle, Trophy, Zap } from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';
import { formatDuration } from '../../utils/analyticsCalculators';

const PRESETS = [
  { hours: 3.0, label: '3.0h', desc: 'Light / Rest Day', icon: '☕' },
  { hours: 5.0, label: '5.0h', desc: 'College / Exam Day', icon: '🎒' },
  { hours: 7.5, label: '7.5h', desc: 'Standard OmniPrep (Recommended)', icon: '🎯' },
  { hours: 9.0, label: '9.0h', desc: 'Intense Deep Sprint', icon: '🚀' },
  { hours: 11.0, label: '11.0h', desc: 'Beast Mode', icon: '⚡' },
];

export default function DailyTargetModal({ isOpen, onClose }) {
  const { data, updateProfile } = useTracker();
  const currentGoal = data.profile?.dailyHourGoal || 7.5;
  const [selectedGoal, setSelectedGoal] = useState(currentGoal);
  const [isSaved, setIsSaved] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const val = Math.max(0.5, Math.min(18, parseFloat(Number(selectedGoal).toFixed(1))));
    updateProfile({ dailyHourGoal: val });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0e1320] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customize Daily Focus Target</h3>
              <p className="text-xs text-slate-400">Tailor your study goal to match your schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active Target Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Target Selected</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                {formatDuration(selectedGoal)} <span className="text-xs text-slate-400 font-sans">({selectedGoal} hrs/day)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2.5 block">Quick Goal Presets</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const isSelected = Math.abs(selectedGoal - p.hours) < 0.05;
                return (
                  <button
                    key={p.hours}
                    type="button"
                    onClick={() => setSelectedGoal(p.hours)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <div className="text-xs font-bold font-mono">{p.label}</div>
                        <div className="text-[10px] text-slate-400">{p.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Fine-Tune Hours</span>
              <span className="font-mono text-indigo-400 font-bold">{selectedGoal} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              step="0.5"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1h (Min)</span>
              <span>7.5h (Standard)</span>
              <span>14h (Extreme)</span>
            </div>
          </div>

          {/* Explanatory Cards: How it Works */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Frequently Asked Questions
            </div>

            {/* Q1: What if I study more? */}
            <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-xs space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                What if I study more than my target?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Nothing stops you! Extra hours are 100% credited to your total focus hours, streak, and XP. The progress bar passes 100% (e.g. 115%) and your daily scorecard celebrates the overachievement.
              </p>
            </div>

            {/* Q2: What if I study less? */}
            <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-xs space-y-1">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                What if I have to study less today?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Simply adjust your target here (e.g. down to 3h or 4h for college/travel days). Your active streak stays intact as long as you log at least 1 focus session today!
              </p>
            </div>

            {/* Q3: How does Streak work? */}
            <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-xs space-y-1">
              <div className="font-semibold text-orange-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                How does the Streak counter work?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Your streak counts consecutive days of study. As long as you log study time today or yesterday, your streak continues and climbs higher. Missing an entire calendar day without studying resets the streak.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition shadow-lg ${
              isSaved
                ? 'bg-emerald-600 shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Target Saved!
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Update Target ({formatDuration(selectedGoal)})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
