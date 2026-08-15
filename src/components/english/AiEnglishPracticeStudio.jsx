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
  Play,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookA,
  MessageSquare,
  Key,
  Send,
  Plus
} from 'lucide-react';
import {
  getStoredApiKey,
  callGeminiEnglishCoach,
  SpeechRecognizer,
  speakText,
  stopSpeech
} from '../../utils/geminiClient.js';
import { ApiKeyModal } from '../ai/ApiKeyModal.jsx';

export const AiEnglishPracticeStudio = () => {
  const { addEnglishSession } = useTracker();
  const [selectedMode, setSelectedMode] = useState('Conversational Dialogue');
  const [topic, setTopic] = useState('My Career Goals in Artificial Intelligence');
  const [spokenText, setSpokenText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Chat/Dialogue history
  const [dialogueHistory, setDialogueHistory] = useState([
    {
      role: 'ai',
      text: 'Hello! I am your AI English Speaking Coach. What would you like to discuss today? Feel free to speak or type your thoughts!'
    }
  ]);

  // Last feedback report
  const [lastFeedback, setLastFeedback] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');

  const recognizerRef = useRef(null);

  const modes = [
    {
      id: 'conversation',
      label: 'Conversational Dialogue',
      desc: 'Free-flow discussion with conversational replies',
      icon: MessageSquare
    },
    {
      id: 'grammar_doctor',
      label: 'Grammar & Pronunciation Doctor',
      desc: 'Rigorous grammar checks & vocabulary upgrades',
      icon: BookA
    },
    {
      id: 'tech_pitch',
      label: 'Technical DS Pitch Coach',
      desc: 'Explain machine learning algorithms fluently',
      icon: Sparkles
    }
  ];

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer(
      (transcript, isFinal) => {
        setSpokenText(transcript);
      },
      () => {
        setIsListening(false);
      },
      (err) => {
        console.warn('Speech recognizer error:', err);
        setIsListening(false);
      }
    );

    return () => {
      stopSpeech();
      if (recognizerRef.current) recognizerRef.current.stop();
    };
  }, []);

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

    const hasKey = getStoredApiKey();
    if (!hasKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
    }

    const currentText = spokenText.trim();
    setSpokenText('');

    // Add user message to dialogue
    setDialogueHistory(prev => [...prev, { role: 'user', text: currentText }]);
    setErrorBanner('');

    setIsLoading(true);
    try {
      const result = await callGeminiEnglishCoach(
        selectedMode,
        topic,
        currentText,
        dialogueHistory
      );

      setLastFeedback(result);

      // Add AI reply to dialogue
      const reply = result.conversationalReply || 'Great point! Let us continue.';
      setDialogueHistory(prev => [...prev, { role: 'ai', text: reply }]);

      if (isTtsEnabled) {
        speakText(reply);
      }

      // Automatically log ~2 mins of practice per conversational exchange
      addEnglishSession({
        topicTitle: `AI Practice: ${topic.slice(0, 25)}`,
        minutes: 2,
        fluencyScore: result.fluencyRating || 4.2,
        notes: result.feedbackTip || 'Practiced with Gemini AI coach.'
      });

    } catch (err) {
      console.warn('AI English Coach error:', err);
      setErrorBanner(err.message || 'Gemini API evaluation error. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Gemini AI English Speaking Partner</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
                Live Speech & Feedback
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Practice spoken English with audio voice synthesis, real-time grammar corrections & vocabulary upgrades
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition"
          >
            <Key className="w-3.5 h-3.5 text-rose-400" />
            <span>{getStoredApiKey() ? 'API Key Set' : 'Configure Gemini API'}</span>
          </button>
        </div>
      </div>

      {/* Mode Selector & Custom Topic */}
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
                  ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
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

      {/* Topic Prompt Input */}
      <div className="flex items-center space-x-2 bg-slate-900/80 border border-white/10 p-2.5 rounded-2xl">
        <span className="text-xs text-rose-400 font-semibold px-2">Topic:</span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter conversation topic (e.g. My Favorite Books, How Neural Networks Work)..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Inline Error / API Key Banner */}
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
            onClick={() => {
              setErrorBanner('');
              setIsApiKeyModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shrink-0 transition"
          >
            Configure Key & Model
          </button>
        </div>
      )}

      {/* Live Dialogue Flow View */}
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
                isTtsEnabled ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isTtsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>AI Voice {isTtsEnabled ? 'ON' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Message Bubble Feed */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {dialogueHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/30 text-white border border-indigo-500/30'
                    : 'bg-slate-900 border border-white/10 text-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Speech / Text Input Area */}
        <div className="pt-2 space-y-3">
          <textarea
            rows="3"
            value={spokenText}
            onChange={(e) => setSpokenText(e.target.value)}
            placeholder="Click 'Start Speaking (Mic)' to speak or type your response..."
            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={toggleListening}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isListening
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
              }`}
            >
              {isListening ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Microphone</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span>Start Speaking (Mic)</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendUtterance}
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Gemini Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Send to Coach</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Fluency, Grammar & Vocabulary Diagnosis Card */}
      {lastFeedback && (
        <div className="glass-panel p-5 rounded-3xl border border-rose-500/30 bg-slate-900/80 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-sm text-white">AI Speech Diagnosis & Fluency Rating</h4>
            </div>
            <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs font-mono">
              <span>⭐ {lastFeedback.fluencyRating || 4.2} / 5.0</span>
            </div>
          </div>

          {/* Grammar Corrections */}
          {lastFeedback.grammarCorrections && lastFeedback.grammarCorrections.length > 0 && (
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
          {lastFeedback.vocabularyUpgrades && lastFeedback.vocabularyUpgrades.length > 0 && (
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

          {/* Actionable Coach Tip */}
          {lastFeedback.feedbackTip && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              💡 <strong>Coach Tip:</strong> {lastFeedback.feedbackTip}
            </div>
          )}
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

    </div>
  );
};
