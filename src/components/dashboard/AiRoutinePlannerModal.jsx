import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext.jsx';
import {
  Sparkles,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import { callGeminiRest, getStoredApiKey } from '../../utils/geminiClient.js';
import confetti from 'canvas-confetti';

export const AiRoutinePlannerModal = ({ isOpen, onClose }) => {
  const { addRoutine } = useTracker();
  const [collegeHours, setCollegeHours] = useState('9:00 AM - 4:00 PM');
  const [targetFocus, setTargetFocus] = useState('GATE Linear Algebra & 2 LeetCode Mediums');
  const [studyHoursGoal, setStudyHoursGoal] = useState('6.5');
  const [loading, setLoading] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const systemInstruction = `You are an elite Academic Performance & Routine Optimization Coach.
Generate a structured, actionable daily timetable that balances college/work with deep focus preparation sprints.
Respond strictly in JSON format with this exact schema:
{
  "summary": "Concise 1-sentence motivation for today's battle plan",
  "routines": [
    { "period": "Morning (6:30 - 8:30 AM)", "title": "GATE DS: Linear Algebra Eigenvalues PYQs", "category": "gate" },
    { "period": "Morning (8:30 - 9:00 AM)", "title": "English Pronunciation & News Dictation", "category": "english" },
    { "period": "Afternoon (4:30 - 6:00 PM)", "title": "LeetCode: 2 Tree & DP Medium Problems", "category": "job" },
    { "period": "Evening (6:30 - 8:30 PM)", "title": "Academic Lab / Assignment Completion", "category": "academic" },
    { "period": "Night (9:30 - 11:00 PM)", "title": "GATE Mock Revision & Formula Flashcards", "category": "gate" }
  ]
}`;

    const promptText = `College/Work Hours: ${collegeHours}
Daily Target Focus Goals: ${targetFocus}
Study Hours Goal: ${studyHoursGoal} Hours

Create an optimal, high-efficiency daily routine for a high-performing student. Return valid JSON only.`;

    try {
      const storedKey = getStoredApiKey();
      let responseText = '';

      if (storedKey) {
        responseText = await callGeminiRest(storedKey, systemInstruction, promptText, 'gemini-flash-latest', true);
      } else {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText, systemInstruction })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to generate schedule.');
        responseText = json.text;
      }

      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setGeneratedRoutine(parsed);
    } catch (err) {
      setErrorMsg(err.message || 'Error generating routine.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToRoutines = () => {
    if (generatedRoutine && generatedRoutine.routines) {
      generatedRoutine.routines.forEach(item => {
        addRoutine(item.period, item.title, item.category);
      });
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0c1222] border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">AI Daily Timetable & Schedule Planner 📅</h3>
              <p className="text-xs text-slate-400">Generate a personalized daily study protocol with Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">College / Work Hours</label>
              <input
                type="text"
                value={collegeHours}
                onChange={(e) => setCollegeHours(e.target.value)}
                placeholder="e.g. 9:00 AM - 4:00 PM"
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Target Study Hours Today</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                value={studyHoursGoal}
                onChange={(e) => setStudyHoursGoal(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Today's Key Focus Goals</label>
            <input
              type="text"
              value={targetFocus}
              onChange={(e) => setTargetFocus(e.target.value)}
              placeholder="e.g. GATE Linear Algebra, 2 LeetCode Mediums, College Assignment"
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Designing Timetable...' : 'Generate AI Battle Plan 🚀'}</span>
            </button>
          </div>
        </form>

        {/* Generated Timetable Preview */}
        {generatedRoutine && (
          <div className="space-y-3.5 pt-3 border-t border-white/10 animate-fade-in">
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
              ⚡ <strong>Plan Summary:</strong> {generatedRoutine.summary}
            </div>

            <div className="space-y-2">
              {generatedRoutine.routines.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono text-[10px] text-indigo-400 font-semibold">{item.period}</div>
                    <div className="font-medium text-white">{item.title}</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-slate-400">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApplyToRoutines}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply All to Today's Routine Checklist</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
