import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Star,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Filter
} from 'lucide-react';
import { AiFlashcardGeneratorModal } from '../ai/AiFlashcardGeneratorModal.jsx';

export const DataScienceRevision = () => {
  const { data, updateDsRevisionTopic, addDsRevisionTopic, addDsFlashcard } = useTracker();
  const dsRevision = data.job?.dsRevision || { topics: [], flashcards: [] };
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  // Flashcard Viewer State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // New Topic Form State
  const [topicName, setTopicName] = useState('');
  const [topicCategory, setTopicCategory] = useState('Machine Learning');
  const [topicConfidence, setTopicConfidence] = useState(4);
  const [keyPoints, setKeyPoints] = useState('');

  // New Flashcard Form State
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');
  const [cardTopic, setCardTopic] = useState('Machine Learning');

  const categories = ['All', 'Machine Learning', 'Deep Learning / GenAI', 'Data Engineering & SQL', 'Statistics & Product Sense', 'MLOps & Systems'];

  const filteredTopics = selectedCategory === 'All'
    ? dsRevision.topics
    : dsRevision.topics.filter(t => t.category === selectedCategory);

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    addDsRevisionTopic({
      name: topicName.trim(),
      category: topicCategory,
      confidence: Number(topicConfidence),
      keyInterviewPoints: keyPoints.trim() || 'Core concepts reviewed.',
      status: 'Interview Ready'
    });
    setTopicName('');
    setKeyPoints('');
    setIsAddingTopic(false);
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardQuestion.trim() || !cardAnswer.trim()) return;
    addDsFlashcard({
      question: cardQuestion.trim(),
      answer: cardAnswer.trim(),
      topic: cardTopic
    });
    setCardQuestion('');
    setCardAnswer('');
    setIsAddingCard(false);
  };

  const activeCard = dsRevision.flashcards?.[activeCardIndex];

  const nextFlashcard = () => {
    setIsAnswerRevealed(false);
    setActiveCardIndex((prev) => (prev + 1) % (dsRevision.flashcards?.length || 1));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Data Science Revision & Spaced Repetition
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                {dsRevision.topics.filter(t => t.status === 'Interview Ready').length} / {dsRevision.topics.length} Interview Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Revise Machine Learning, Deep Learning, SQL Optimization, A/B Testing & MLOps interview questions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddingTopic(!isAddingTopic)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add DS Topic</span>
          </button>
        </div>
      </div>

      {/* Interactive DS Interview Flashcards Section */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Interactive DS Interview Flashcards</h4>
            <span className="text-[11px] text-slate-400">
              ({activeCardIndex + 1} of {dsRevision.flashcards?.length || 0})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Generate with AI 🪄</span>
            </button>
            <button
              onClick={() => setIsAddingCard(!isAddingCard)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 pl-2 border-l border-white/10"
            >
              <Plus className="w-3 h-3" /> Custom Card
            </button>
          </div>
        </div>

        {isAddingCard && (
          <form onSubmit={handleAddCard} className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-2.5 animate-slide-up">
            <input
              type="text"
              placeholder="Question (e.g. Why does L1 regularization cause sparsity?)"
              value={cardQuestion}
              onChange={(e) => setCardQuestion(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              required
            />
            <textarea
              rows="2"
              placeholder="Detailed interview answer & formula intuition..."
              value={cardAnswer}
              onChange={(e) => setCardAnswer(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              required
            />
            <div className="flex items-center justify-between">
              <select
                value={cardTopic}
                onChange={(e) => setCardTopic(e.target.value)}
                className="bg-slate-950 border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1"
              >
                <option value="Machine Learning">Machine Learning</option>
                <option value="Deep Learning">Deep Learning</option>
                <option value="SQL">SQL & Data Eng</option>
                <option value="Statistics">Statistics & A/B Testing</option>
                <option value="MLOps">MLOps & Systems</option>
              </select>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setIsAddingCard(false)} className="text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold">Save Card</button>
              </div>
            </div>
          </form>
        )}

        {/* Active Card Viewer */}
        {activeCard ? (
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                {activeCard.topic}
              </span>
              <span className="text-slate-400">Flashcard #{activeCardIndex + 1}</span>
            </div>

            <div className="text-sm sm:text-base font-semibold text-white">
              Q: {activeCard.question}
            </div>

            {/* Answer Display */}
            {isAnswerRevealed ? (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed animate-fade-in">
                <strong className="text-emerald-400 block mb-1">Answer & Technical Takeaway:</strong>
                {activeCard.answer}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5 text-center text-xs text-slate-400 italic">
                Answer is hidden. Think about your solution, then click below to verify.
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                {isAnswerRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
              </button>

              <button
                onClick={nextFlashcard}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-4">No flashcards available. Add one above!</div>
        )}
      </div>

      {/* Add Topic Modal Form */}
      {isAddingTopic && (
        <form onSubmit={handleAddTopic} className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-3 animate-slide-up">
          <h4 className="text-xs font-semibold text-white">Record Data Science Revision Topic</h4>
          <input
            type="text"
            placeholder="Topic Name (e.g. Transformers & Scaled Dot-Product Attention)"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Category</label>
              <select
                value={topicCategory}
                onChange={(e) => setTopicCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Machine Learning">Machine Learning</option>
                <option value="Deep Learning / GenAI">Deep Learning / GenAI</option>
                <option value="Data Engineering & SQL">Data Engineering & SQL</option>
                <option value="Statistics & Product Sense">Statistics & Product Sense</option>
                <option value="MLOps & Systems">MLOps & Systems</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Confidence Rating</label>
              <select
                value={topicConfidence}
                onChange={(e) => setTopicConfidence(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 (Mastered)</option>
                <option value="4">⭐⭐⭐⭐ 4 (Confident)</option>
                <option value="3">⭐⭐⭐ 3 (Moderate)</option>
                <option value="2">⭐⭐ 2 (Needs Revision)</option>
                <option value="1">⭐ 1 (Weak)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Key Interview Takeaways / Derivations</label>
            <textarea
              rows="2"
              placeholder="e.g., Softmax(QK^T / sqrt(d_k))V; attention weights, why scale by sqrt(d_k) to prevent small gradients in softmax..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button type="button" onClick={() => setIsAddingTopic(false)} className="px-3 py-1 text-xs text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold">Save Topic</button>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topics List with Spaced Repetition & Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const isReady = topic.status === 'Interview Ready';
          return (
            <div key={topic.id} className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold">
                      {topic.category}
                    </span>
                    <h4 className="font-semibold text-xs sm:text-sm text-white mt-1.5">{topic.name}</h4>
                  </div>

                  <button
                    onClick={() => updateDsRevisionTopic(topic.id, {
                      status: isReady ? 'Needs Revision' : 'Interview Ready',
                      lastRevised: new Date().toISOString().split('T')[0]
                    })}
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition shrink-0 ${
                      isReady
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {topic.status}
                  </button>
                </div>

                {/* Key Points */}
                {topic.keyInterviewPoints && (
                  <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 mt-2 leading-relaxed">
                    <strong className="text-amber-400 font-medium">Interview Takeaways: </strong>
                    {topic.keyInterviewPoints}
                  </div>
                )}
              </div>

              {/* Footer: Confidence Stars + Repetition Schedule */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px]">Rating:</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => updateDsRevisionTopic(topic.id, { confidence: star })}
                        className="cursor-pointer text-xs hover:scale-125 transition"
                      >
                        {star <= topic.confidence ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px]">
                  <span>Revised: {topic.lastRevised}</span>
                  {topic.nextRevisionDue && (
                    <span className="text-amber-400 font-medium">• Due: {topic.nextRevisionDue}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Flashcard Generator Modal */}
      <AiFlashcardGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

    </div>
  );
};
