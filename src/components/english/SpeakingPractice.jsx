import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { ENGLISH_SPEAKING_PROMPTS } from '../../data/prompts';
import { Mic, Sparkles, Shuffle, Star, Plus, CheckCircle2, Clock } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { soundEngine } from '../../utils/audioSynth';

export const SpeakingPractice = () => {
  const { data, addEnglishSession } = useTracker();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePrompt, setActivePrompt] = useState(ENGLISH_SPEAKING_PROMPTS[0]);

  // Log Form State
  const [isLogging, setIsLogging] = useState(false);
  const [logMinutes, setLogMinutes] = useState(5);
  const [fluencyScore, setFluencyScore] = useState(4.5);
  const [notes, setNotes] = useState('');

  const categories = ['All', 'Technical / DS', 'Behavioral / HR', 'General / Fluency'];

  const filteredPrompts = selectedCategory === 'All'
    ? ENGLISH_SPEAKING_PROMPTS
    : ENGLISH_SPEAKING_PROMPTS.filter(p => p.category === selectedCategory);

  const handleShuffle = () => {
    soundEngine.playClickSound();
    const randomIndex = Math.floor(Math.random() * ENGLISH_SPEAKING_PROMPTS.length);
    setActivePrompt(ENGLISH_SPEAKING_PROMPTS[randomIndex]);
  };

  const handleSaveSession = (e) => {
    e.preventDefault();
    addEnglishSession({
      topicTitle: activePrompt?.title || 'Spontaneous Speaking',
      minutes: Number(logMinutes),
      fluencyScore: Number(fluencyScore),
      notes: notes.trim() || 'Good pacing and clarity.'
    });
    setNotes('');
    setIsLogging(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Active Practice Prompt Spotlight */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
              {activePrompt?.category || 'Speaking Topic'}
            </span>
            <span className="text-xs text-slate-400">Target Duration: ~{activePrompt?.durationMin || 3} mins</span>
          </div>

          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-medium border border-white/5 transition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Topic</span>
          </button>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">{activePrompt?.title}</h3>
          <p className="text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-white/5 leading-relaxed">
            "{activePrompt?.prompt}"
          </p>
        </div>

        {/* Embedded Voice Recorder */}
        <VoiceRecorder currentTopic={activePrompt?.title} />

        {/* Quick Log Session Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsLogging(!isLogging)}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Completed Speaking Practice</span>
          </button>
        </div>
      </div>

      {/* Log Session Form Modal / Accordion */}
      {isLogging && (
        <form onSubmit={handleSaveSession} className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-3 animate-slide-up">
          <h4 className="text-xs font-semibold text-white">Record Speaking Session Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Minutes Spoken</label>
              <input
                type="number"
                min="1"
                max="120"
                value={logMinutes}
                onChange={(e) => setLogMinutes(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Fluency Self-Rating</label>
              <select
                value={fluencyScore}
                onChange={(e) => setFluencyScore(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="5.0">⭐⭐⭐⭐⭐ 5.0 (Exceptional / Fluent)</option>
                <option value="4.5">⭐⭐⭐⭐½ 4.5 (Very Good / Minor Pauses)</option>
                <option value="4.0">⭐⭐⭐⭐ 4.0 (Good Flow / Clear Delivery)</option>
                <option value="3.5">⭐⭐⭐½ 3.5 (Moderate / Some Hesitation)</option>
                <option value="3.0">⭐⭐⭐ 3.0 (Needs Improvement)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Session Reflections & Pronunciation Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. Explaining backpropagation was clear, reduced um/uh filler words, good vocabulary choice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button type="button" onClick={() => setIsLogging(false)} className="px-3 py-1 text-xs text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold">Save Practice</button>
          </div>
        </form>
      )}

      {/* Prompts Catalog Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300">Curated Speaking Prompts Library</h4>
          <div className="flex items-center space-x-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs transition ${
                  selectedCategory === cat
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPrompts.map((p) => {
            const isCurrent = activePrompt?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActivePrompt(p)}
                className={`glass-panel p-4 rounded-xl border cursor-pointer transition ${
                  isCurrent ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-semibold">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">~{p.durationMin}m</span>
                </div>
                <h5 className="font-semibold text-xs text-white">{p.title}</h5>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.prompt}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Practice History */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
        <h4 className="text-xs font-semibold text-white">Recent Speaking Practice Log</h4>
        <div className="space-y-2">
          {(data.english?.sessions || []).map((session) => (
            <div key={session.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-white">{session.topicTitle}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                    {session.minutes} mins
                  </span>
                </div>
                {session.notes && (
                  <div className="text-[11px] text-slate-400 mt-1 italic">"{session.notes}"</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-amber-400">⭐ {session.fluencyScore}/5</div>
                <div className="text-[10px] text-slate-500 font-mono">{session.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
