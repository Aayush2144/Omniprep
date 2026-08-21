import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext.jsx';
import {
  Sparkles,
  X,
  Zap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { callGeminiRest, getStoredApiKey } from '../../utils/geminiClient.js';
import confetti from 'canvas-confetti';

export const AiFlashcardGeneratorModal = ({ isOpen, onClose }) => {
  const { addDsFlashcard } = useTracker();
  const [topic, setTopic] = useState('Linear Algebra & PCA Math');
  const [category, setCategory] = useState('Machine Learning');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState(0);

  if (!isOpen) return null;

  const quickTopics = [
    { name: 'Linear Algebra: Eigenvalues & SVD', cat: 'Math & Stats' },
    { name: 'Gradient Descent & Optimizers (Adam, RMSProp)', cat: 'Deep Learning' },
    { name: 'Transformer Self-Attention Mechanism', cat: 'Deep Learning' },
    { name: 'SQL Window Functions & Indexing', cat: 'SQL & DBMS' },
    { name: 'Decision Trees vs XGBoost & Bias-Variance', cat: 'Machine Learning' },
    { name: 'Probability: Bayes Theorem & Distributions', cat: 'Math & Stats' }
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessCount(0);

    const systemInstruction = `You are a Principal AI Professor and Technical Interview Examiner.
Generate high-yield, interview-caliber flashcards on the requested topic.
Respond strictly in JSON format with this exact schema:
{
  "flashcards": [
    {
      "question": "Clear, concise technical question or core formula definition",
      "answer": "Polished, mathematically sound explanation with key intuition and trade-offs",
      "category": "${category}",
      "difficulty": "Medium"
    }
  ]
}`;

    const promptText = `Generate ${count} high-yield technical flashcards for: "${topic}". Category: "${category}". Return valid JSON only.`;

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
        if (!json.success) throw new Error(json.error || 'Failed to generate flashcards.');
        responseText = json.text;
      }

      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
        parsed.flashcards.forEach(card => {
          addDsFlashcard({
            question: card.question,
            answer: card.answer,
            category: card.category || category,
            difficulty: card.difficulty || 'Medium',
            lastReviewed: new Date().toISOString().split('T')[0]
          });
        });

        setSuccessCount(parsed.flashcards.length);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error('Invalid flashcards response structure.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c1222] border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">AI Flashcard & Formula Generator 🎴</h3>
              <p className="text-xs text-slate-400">Instantly generate high-yield cards with Gemini AI</p>
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

        {successCount > 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully added {successCount} flashcards to your deck!</span>
          </div>
        )}

        {/* Quick Topic Chips */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-semibold">Popular GATE & AI Topics:</label>
          <div className="flex flex-wrap gap-1.5">
            {quickTopics.map((qt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setTopic(qt.name); setCategory(qt.cat); }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-950 border border-white/10 hover:border-indigo-500/40 rounded-xl text-[11px] text-slate-300 hover:text-indigo-200 transition"
              >
                {qt.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Target Topic or Concept</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Backpropagation Math, Support Vector Machines"
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Machine Learning">Machine Learning</option>
                <option value="Deep Learning">Deep Learning</option>
                <option value="Math & Stats">Math & Stats</option>
                <option value="SQL & DBMS">SQL & DBMS</option>
                <option value="DSA & Algorithms">DSA & Algorithms</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Number of Cards</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>3 Cards (Quick)</option>
                <option value={5}>5 Cards (Recommended)</option>
                <option value={8}>8 Cards (Deep Dive)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generating Cards...' : 'Generate Flashcards 🪄'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
