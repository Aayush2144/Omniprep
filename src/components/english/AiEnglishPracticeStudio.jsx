import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  Sparkles,
  Bot,
  User,
  Mic,
  Square,
  Volume2,
  VolumeX,
  Star,
  CheckCircle2,
  AlertCircle,
  BookA,
  MessageSquare,
  Key,
  Send,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import {
  getStoredProvider,
  setStoredProvider,
  getActiveProviderKey,
  callEnglishCoach,
  SpeechRecognizer,
  speakText,
  stopSpeech,
} from '../../utils/geminiClient.js';
import { ApiKeyModal } from '../ai/ApiKeyModal.jsx';

// ─── Provider display info ─────────────────────────────────────────────────
const PROVIDER_META = {
  gemini: { label: 'Gemini AI Coach', badge: '🔵 Google Gemini', color: 'rose' },
  openai: { label: 'ChatGPT Coach', badge: '🟢 ChatGPT (OpenAI)', color: 'emerald' },
  claude: { label: 'Claude AI Coach', badge: '🟠 Claude (Anthropic)', color: 'amber' },
};

const PROVIDER_COLOR = {
  rose:    { border: 'border-rose-500/20', bg: 'bg-rose-500/20', text: 'text-rose-400', tag: 'bg-rose-500/20 text-rose-300 border-rose-500/30', btn: 'bg-rose-600 hover:bg-rose-500', btnGlow: 'shadow-rose-600/30', pulse: 'animate-pulse bg-rose-600' },
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/20', text: 'text-emerald-400', tag: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', btn: 'bg-emerald-600 hover:bg-emerald-500', btnGlow: 'shadow-emerald-600/30', pulse: 'animate-pulse bg-emerald-600' },
  amber:   { border: 'border-amber-500/20', bg: 'bg-amber-500/20', text: 'text-amber-400', tag: 'bg-amber-500/20 text-amber-300 border-amber-500/30', btn: 'bg-amber-600 hover:bg-amber-500', btnGlow: 'shadow-amber-600/30', pulse: 'animate-pulse bg-amber-600' },
};

export const AiEnglishPracticeStudio = () => {
  const { addEnglishSession } = useTracker();

  const [provider, setProvider] = useState(getStoredProvider());
  const meta = PROVIDER_META[provider] || PROVIDER_META.gemini;
  const c = PROVIDER_COLOR[meta.color];

  const [selectedMode, setSelectedMode] = useState('Conversational Dialogue');
  const [topic, setTopic] = useState('My Career Goals in Artificial Intelligence');
  const [spokenText, setSpokenText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const [dialogueHistory, setDialogueHistory] = useState([
    {
      role: 'ai',
      text: 'Hello! I am your AI English Speaking Coach. What would you like to discuss today? Feel free to speak or type your thoughts!',
    },
  ]);

  const [lastFeedback, setLastFeedback] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');

  const recognizerRef = useRef(null);
  const chatEndRef = useRef(null);

  // Refresh provider whenever modal closes
  const handleModalClose = () => {
    setIsApiKeyModalOpen(false);
    setProvider(getStoredProvider());
  };

  const modes = [
    { id: 'conversation', label: 'Conversational Dialogue', desc: 'Free-flow discussion with conversational replies', icon: MessageSquare },
    { id: 'grammar_doctor', label: 'Grammar & Pronunciation Doctor', desc: 'Rigorous grammar checks & vocabulary upgrades', icon: BookA },
    { id: 'tech_pitch', label: 'Technical DS Pitch Coach', desc: 'Explain machine learning algorithms fluently', icon: Sparkles },
  ];

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer(
      (transcript) => setSpokenText(transcript),
      () => setIsListening(false),
      (err) => { console.warn('Speech recognizer error:', err); setIsListening(false); }
    );
    return () => {
      stopSpeech();
      recognizerRef.current?.stop();
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      recognizerRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSendUtterance = async () => {
    if (!spokenText.trim()) return;

    // Check active provider has a key
    if (!getActiveProviderKey()) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
    }

    const currentText = spokenText.trim();
    setSpokenText('');
    setDialogueHistory((prev) => [...prev, { role: 'user', text: currentText }]);
    setErrorBanner('');
    setIsLoading(true);

    try {
      const result = await callEnglishCoach(selectedMode, topic, currentText, dialogueHistory);
      setLastFeedback(result);

      const reply = result.conversationalReply || 'Great point! Let us continue.';
      setDialogueHistory((prev) => [...prev, { role: 'ai', text: reply }]);

      if (isTtsEnabled) speakText(reply);

      addEnglishSession({
        topicTitle: `AI Practice: ${topic.slice(0, 25)}`,
        minutes: 2,
        fluencyScore: result.fluencyRating || 4.2,
        notes: result.feedbackTip || `Practiced with ${meta.label}.`,
      });
    } catch (err) {
      console.warn('AI English Coach error:', err);
      setErrorBanner(err.message || 'AI API error. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendUtterance();
  };

  const hasKey = !!getActiveProviderKey();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Top Banner ── */}
      <div className={`glass-panel p-5 sm:p-6 rounded-3xl border ${c.border} bg-gradient-to-r from-slate-950/80 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-3 rounded-2xl ${c.bg} ${c.text} border ${c.border}`}>
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">{meta.label}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${c.tag}`}>
                {meta.badge}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${c.tag}`}>
                Live Speech & Feedback
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Practice spoken English with audio voice synthesis, real-time grammar corrections & vocabulary upgrades
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition shrink-0"
        >
          <Key className={`w-3.5 h-3.5 ${c.text}`} />
          <span>{hasKey ? `${meta.badge} Connected` : 'Configure AI Provider'}</span>
        </button>
      </div>

      {/* ── Provider Quick-Switch ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-semibold">AI Coach:</span>
        {Object.entries(PROVIDER_META).map(([id, info]) => {
          const pc = PROVIDER_COLOR[info.color];
          return (
            <button
              key={id}
              onClick={() => { setStoredProvider && setIsApiKeyModalOpen(true); }}
              title="Click 'Configure AI Provider' to switch"
              className={`text-[11px] px-3 py-1 rounded-full border font-semibold transition ${
                provider === id
                  ? `${pc.tag} border-current`
                  : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {info.badge}
            </button>
          );
        })}
        <span className="text-[10px] text-slate-500 italic">Click "Configure AI Provider" to switch</span>
      </div>

      {/* ── Mode Selector ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.label;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.label)}
              className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 ${
                isSelected
                  ? `${c.bg} border-current ${c.text} shadow-lg text-white`
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? `${c.bg} ${c.text}` : 'bg-slate-800 text-slate-400'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{m.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Topic Input ── */}
      <div className="flex items-center space-x-2 bg-slate-900/80 border border-white/10 p-2.5 rounded-2xl">
        <span className={`text-xs ${c.text} font-semibold px-2`}>Topic:</span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter conversation topic (e.g. My Favorite Books, How Neural Networks Work)..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* ── Error Banner ── */}
      {errorBanner && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Connection Alert</strong>
              <span>{errorBanner}</span>
            </div>
          </div>
          <button
            onClick={() => { setErrorBanner(''); setIsApiKeyModalOpen(true); }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shrink-0 transition"
          >
            Configure API Key
          </button>
        </div>
      )}

      {/* ── Live Chat Window ── */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs text-slate-400">
          <span>Live Speaking Exchange</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isTtsEnabled) stopSpeech();
                setIsTtsEnabled(!isTtsEnabled);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs transition ${
                isTtsEnabled ? `${c.bg} ${c.text}` : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isTtsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>AI Voice {isTtsEnabled ? 'ON' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Message bubbles */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {dialogueHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : `${c.bg} ${c.text} border ${c.border}`
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-indigo-600/30 text-white border border-indigo-500/30'
                  : 'bg-slate-900 border border-white/10 text-slate-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2.5">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.text} border ${c.border}`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 text-xs flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${c.text} ${c.bg} animate-bounce`} style={{ animationDelay: '0ms' }} />
                <span className={`w-2 h-2 rounded-full ${c.text} ${c.bg} animate-bounce`} style={{ animationDelay: '150ms' }} />
                <span className={`w-2 h-2 rounded-full ${c.text} ${c.bg} animate-bounce`} style={{ animationDelay: '300ms' }} />
                <span className="ml-1">{meta.label} is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="pt-2 space-y-3">
          <textarea
            rows="3"
            value={spokenText}
            onChange={(e) => setSpokenText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Click 'Start Speaking (Mic)' to speak or type here… (Ctrl+Enter to send)`}
            className={`w-full bg-slate-950 border border-white/10 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:${c.border} leading-relaxed`}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={toggleListening}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isListening
                  ? `text-white shadow-lg ${c.pulse}`
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
              }`}
            >
              {isListening ? (
                <><Square className="w-4 h-4 fill-current" /><span>Stop Microphone</span></>
              ) : (
                <><Mic className={`w-4 h-4 ${c.text}`} /><span>Start Speaking (Mic)</span></>
              )}
            </button>

            <button
              onClick={handleSendUtterance}
              disabled={isLoading || !spokenText.trim()}
              className={`flex items-center space-x-2 px-5 py-2 ${c.btn} text-white rounded-xl text-xs font-semibold shadow-lg ${c.btnGlow} transition disabled:opacity-40`}
            >
              {isLoading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /><span>Analyzing...</span></>
              ) : (
                <><span>Send to Coach</span><Send className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Feedback Card ── */}
      {lastFeedback && (
        <div className={`glass-panel p-5 rounded-3xl border ${c.border} bg-slate-900/80 space-y-4 animate-slide-up`}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <Sparkles className={`w-4 h-4 ${c.text}`} />
              <h4 className="font-bold text-sm text-white">AI Speech Diagnosis & Fluency Rating</h4>
            </div>
            <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs font-mono">
              <span>⭐ {lastFeedback.fluencyRating || 4.2} / 5.0</span>
            </div>
          </div>

          {/* Grammar Corrections */}
          {lastFeedback.grammarCorrections?.length > 0 && (
            <div className="space-y-1.5">
              <strong className="text-xs text-rose-300 font-semibold block">Grammar Refinements:</strong>
              {lastFeedback.grammarCorrections.map((g, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 space-y-0.5">
                  <div className="line-through text-slate-500">"{g.original}"</div>
                  <div className="text-emerald-400 font-medium">✓ "{g.corrected}"</div>
                  <div className="text-[11px] text-slate-400">{g.explanation}</div>
                </div>
              ))}
            </div>
          )}

          {/* Vocabulary Upgrades */}
          {lastFeedback.vocabularyUpgrades?.length > 0 && (
            <div className="space-y-1.5">
              <strong className="text-xs text-amber-300 font-semibold block">Vocabulary Enhancements:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lastFeedback.vocabularyUpgrades.map((v, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-xs">
                    <span className="text-slate-500">Instead of "{v.simpleWord}": </span>
                    <strong className="text-amber-400">{v.upgrade}</strong>
                    <div className="text-[10px] text-slate-400 mt-1 italic">"{v.example}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coach Tip */}
          {lastFeedback.feedbackTip && (
            <div className={`p-3 rounded-xl ${c.bg} border ${c.border} text-xs ${c.text}`}>
              💡 <strong>Coach Tip:</strong>{' '}
              <span className="text-slate-300">{lastFeedback.feedbackTip}</span>
            </div>
          )}
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={handleModalClose} />
    </div>
  );
};
