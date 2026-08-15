import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BrainCircuit,
  Cpu,
  Key,
  ChevronRight,
  Send
} from 'lucide-react';
import {
  getStoredApiKey,
  callGeminiInterview,
  SpeechRecognizer,
  speakText,
  stopSpeech
} from '../../utils/geminiClient.js';
import { ApiKeyModal } from '../ai/ApiKeyModal.jsx';

export const AiInterviewStudio = () => {
  const [selectedTrack, setSelectedTrack] = useState('Data Science & Machine Learning');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // History of Q&A + Evaluations
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');

  const recognizerRef = useRef(null);

  const tracks = [
    {
      id: 'ds_ml',
      name: 'Data Science & Machine Learning',
      desc: 'Linear/Logistic, Tree Ensembles (XGBoost), Regularization, Feature Engineering, Metrics',
      icon: BrainCircuit,
      color: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
      initialQ: 'Can you explain the mathematical difference between L1 (Lasso) and L2 (Ridge) regularization, and why L1 creates sparse feature weights?'
    },
    {
      id: 'dl_genai',
      name: 'Deep Learning & GenAI / LLMs',
      desc: 'Transformers, Scaled Dot-Product Attention, Embeddings, RAG, Backprop, Optimizers',
      icon: Cpu,
      color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
      initialQ: 'Walk me through the mathematical formulation of Multi-Head Self-Attention. Why do we scale by the square root of the key dimension d_k?'
    },
    {
      id: 'sql_de',
      name: 'SQL, Data Engineering & Analytics',
      desc: 'Window Functions (RANK, DENSE_RANK), Indexing, Execution Plans, CTEs, Joins',
      icon: Bot,
      color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
      initialQ: 'Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL with a concrete scenario where duplicate values exist.'
    },
    {
      id: 'gate_oral',
      name: 'GATE DA / DS Concept Viva',
      desc: 'Linear Algebra, Eigenvalues/SVD, Multivariable Calculus, Bayes Theorem, Distributions',
      icon: Award,
      color: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
      initialQ: 'How do you geometrically interpret Eigenvalues and Eigenvectors of a matrix? How are they utilized in Singular Value Decomposition (SVD)?'
    },
    {
      id: 'behavioral',
      name: 'HR & Behavioral (STAR Method)',
      desc: 'Handling technical conflicts, delivering under tight deadlines, leadership & origin story',
      icon: User,
      color: 'border-rose-500/40 text-rose-300 bg-rose-500/10',
      initialQ: 'Tell me about a time you worked on a machine learning model that failed in production or had severe data leakage. How did you diagnose and resolve it?'
    }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer(
      (transcript, isFinal) => {
        setUserResponse(transcript);
      },
      () => {
        setIsSpeaking(false);
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsSpeaking(false);
      }
    );

    return () => {
      stopSpeech();
      if (recognizerRef.current) recognizerRef.current.stop();
    };
  }, []);

  const handleStartInterview = (track) => {
    const hasKey = getStoredApiKey();
    if (!hasKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setSelectedTrack(track.name);
    setCurrentQuestion(track.initialQ);
    setUserResponse('');
    setInterviewHistory([]);
    setLastEvaluation(null);
    setIsInterviewActive(true);

    if (isTtsEnabled) {
      speakText(track.initialQ);
    }
  };

  const toggleMic = () => {
    if (isSpeaking) {
      recognizerRef.current?.stop();
      setIsSpeaking(false);
    } else {
      stopSpeech();
      recognizerRef.current?.start();
      setIsSpeaking(true);
    }
  };

  const handleEvaluateAndNext = async () => {
    if (!userResponse.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    if (isSpeaking) {
      recognizerRef.current?.stop();
      setIsSpeaking(false);
    }

    setErrorBanner('');
    setIsLoading(true);
    try {
      const evaluation = await callGeminiInterview(
        selectedTrack,
        currentQuestion,
        userResponse.trim(),
        interviewHistory
      );

      setLastEvaluation(evaluation);

      // Record in interview history
      setInterviewHistory(prev => [
        ...prev,
        {
          question: currentQuestion,
          answer: userResponse.trim(),
          evaluation
        }
      ]);

      // Set next question
      const nextQ = evaluation.nextQuestion || 'Can you elaborate further on how you would test this in a production deployment?';
      setCurrentQuestion(nextQ);
      setUserResponse('');

      if (isTtsEnabled) {
        speakText(nextQ);
      }
    } catch (err) {
      console.warn('AI Evaluation error:', err);
      setErrorBanner(err.message || 'Gemini API evaluation error. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = () => {
    stopSpeech();
    if (recognizerRef.current) recognizerRef.current.stop();
    setIsInterviewActive(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Gemini AI Technical Interview Simulator</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                Powered by Gemini 1.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live verbal mock interviews with real-time scoring, technical depth critique & speech output
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{getStoredApiKey() ? 'API Key Set' : 'Configure Gemini API'}</span>
          </button>
        </div>
      </div>

      {/* TRACK SELECTION VIEW (When no active interview) */}
      {!isInterviewActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Your Technical Interview Track:
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between hover:border-indigo-500/30 transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${track.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Live Simulation</span>
                    </div>

                    <h5 className="font-bold text-sm text-white">{track.name}</h5>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {track.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartInterview(track)}
                    className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-indigo-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Mock Interview</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVE LIVE INTERVIEW INTERFACE */}
      {isInterviewActive && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Active Header & Controls */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-white/10">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs font-bold text-white">{selectedTrack} Interview</span>
                <span className="text-[11px] text-slate-400 ml-2">Question #{interviewHistory.length + 1}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (isTtsEnabled) stopSpeech();
                  setIsTtsEnabled(!isTtsEnabled);
                }}
                className={`p-2 rounded-xl border text-xs transition ${
                  isTtsEnabled
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 border-white/5'
                }`}
                title={isTtsEnabled ? 'Voice Output Enabled (AI Speaks)' : 'Voice Output Muted'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={handleEndInterview}
                className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
              >
                End Session
              </button>
            </div>
          </div>

          {/* AI Interviewer Question Box */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>AI Interviewer Question:</span>
              </div>
              <button
                onClick={() => speakText(currentQuestion)}
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
                title="Replay Voice"
              >
                <Volume2 className="w-3.5 h-3.5" /> Replay Audio
              </button>
            </div>

            <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              "{currentQuestion}"
            </div>
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

          {/* Candidate Response Workspace */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Your Spoken / Typed Response:</span>
              </div>
              {isSpeaking && (
                <span className="text-xs text-rose-400 font-mono font-semibold animate-pulse flex items-center gap-1">
                  🔴 Listening to microphone...
                </span>
              )}
            </div>

            <textarea
              rows="4"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Click 'Speak Answer' to speak using microphone, or type your technical answer here in detail..."
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={toggleMic}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition ${
                  isSpeaking
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Microphone</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-rose-400" />
                    <span>Speak Answer (Mic)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleEvaluateAndNext}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Gemini Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Next Question</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Last Answer Critique & Rubric Card */}
          {lastEvaluation && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-slate-900/80 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">AI Interviewer Evaluation & Rubric</h4>
                </div>
                
                {/* Scores */}
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Accuracy: {lastEvaluation.scores?.technicalAccuracy || 8}/10
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Clarity: {lastEvaluation.scores?.depthAndClarity || 8}/10
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Confidence: {lastEvaluation.scores?.confidence || 8}/10
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Feedback:</strong>
                {lastEvaluation.feedback}
              </div>

              {lastEvaluation.suggestedImprovement && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-300 space-y-1">
                  <strong className="text-emerald-400 block font-semibold">Top-Tier Candidate Model Phrasing:</strong>
                  <p className="italic font-mono text-[11px]">{lastEvaluation.suggestedImprovement}</p>
                </div>
              )}
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
