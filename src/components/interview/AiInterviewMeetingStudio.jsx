import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Bot,
  User,
  Award,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Clock,
  RotateCcw,
  Key,
  Volume2,
  VolumeX,
  Send,
  BrainCircuit,
  Cpu,
  Layers,
  ChevronRight,
  ShieldAlert,
  Flame,
  FileText,
  Share2
} from 'lucide-react';
import {
  getStoredProvider,
  getActiveProviderKey,
  askInterviewQuestion,
  generateFinalInterviewReport,
  SpeechRecognizer,
  speakText,
  stopSpeech
} from '../../utils/geminiClient.js';
import { ApiKeyModal } from '../ai/ApiKeyModal.jsx';

const TRACKS = [
  {
    id: 'ds_ml',
    name: 'Data Science & Machine Learning',
    role: 'Senior Data Scientist / ML Engineer',
    desc: 'Supervised/Unsupervised ML, Feature Engineering, Metrics, Bias-Variance, Loss functions',
    icon: BrainCircuit,
    color: 'from-amber-500 to-orange-600',
    questionsCount: 4
  },
  {
    id: 'dl_genai',
    name: 'Deep Learning & GenAI / LLMs',
    role: 'AI / GenAI Research Engineer',
    desc: 'Transformers, Scaled Dot-Product, RAG, KV Cache, LoRA, Attention, Backpropagation',
    icon: Cpu,
    color: 'from-indigo-500 to-purple-600',
    questionsCount: 4
  },
  {
    id: 'system_design',
    name: 'ML System Design & Architecture',
    role: 'Staff ML Infrastructure Engineer',
    desc: 'Real-time inference, Feature Stores, Data drift, Latency vs Throughput, Scaling',
    icon: Layers,
    color: 'from-emerald-500 to-teal-600',
    questionsCount: 4
  },
  {
    id: 'sql_analytics',
    name: 'SQL & Production Analytics',
    role: 'Lead Analytics & Data Engineer',
    desc: 'Window Functions, Indexing, Execution Plans, CTEs, Partitioning, Query Optimization',
    icon: Bot,
    color: 'from-sky-500 to-blue-600',
    questionsCount: 4
  }
];

export const AiInterviewMeetingStudio = () => {
  const { data, addJobInterviewLog } = useTracker();

  // Meeting states: 'setup' | 'meeting' | 'evaluating' | 'report'
  const [meetingState, setMeetingState] = useState('setup');
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
  const [difficulty, setDifficulty] = useState('Hard (Senior / FAANG)');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // AV controls
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  // Live Interview State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [currentInterviewerText, setCurrentInterviewerText] = useState('');
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [candidateSpeechText, setCandidateSpeechText] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Timer
  const [meetingTimerSec, setMeetingTimerSec] = useState(0);

  // Transcripts & Full Evaluation Report
  const [qaHistory, setQaHistory] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');

  // Refs
  const userVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognizerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Active Provider Info
  const activeProvider = getStoredProvider();
  const providerLabel = activeProvider === 'openai' ? 'ChatGPT (OpenAI)' : activeProvider === 'claude' ? 'Claude (Anthropic)' : 'Google Gemini';

  // 1. Web Speech Recognizer
  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer(
      (transcript) => setCandidateSpeechText(transcript),
      () => setIsMicOn(false),
      (err) => {
        console.warn('Speech recognizer error:', err);
        setIsMicOn(false);
      }
    );

    return () => {
      stopSpeech();
      recognizerRef.current?.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // 2. Camera feed management
  useEffect(() => {
    if (meetingState === 'meeting' && isCamOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable:', err);
          setIsCamOn(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    }
  }, [meetingState, isCamOn]);

  // 3. Meeting Timer
  useEffect(() => {
    if (meetingState === 'meeting') {
      timerIntervalRef.current = setInterval(() => {
        setMeetingTimerSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [meetingState]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle mic
  const toggleMic = () => {
    if (isMicOn) {
      recognizerRef.current?.stop();
      setIsMicOn(false);
    } else {
      stopSpeech();
      recognizerRef.current?.start();
      setIsMicOn(true);
    }
  };

  // 4. Start Live Interview
  const handleStartInterview = async () => {
    const hasKey = getActiveProviderKey();
    if (!hasKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setMeetingState('meeting');
    setCurrentQIndex(0);
    setTotalQuestions(selectedTrack.questionsCount || 4);
    setQaHistory([]);
    setCandidateSpeechText('');
    setMeetingTimerSec(0);
    setErrorBanner('');
    setIsAiLoading(true);

    try {
      const qData = await askInterviewQuestion({
        track: selectedTrack.name,
        role: selectedTrack.role,
        difficulty,
        questionIndex: 0,
        totalQuestions: selectedTrack.questionsCount || 4,
        history: [],
        lastAnswer: null
      });

      setCurrentQuestionData(qData);
      const speech = `${qData.interviewerReaction || 'Welcome to your interview round.'} Let us begin with your first question. ${qData.question}`;
      setCurrentInterviewerText(speech);

      if (isTtsEnabled) {
        setIsAiSpeaking(true);
        speakText(speech, () => setIsAiSpeaking(false));
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setErrorBanner(err.message || 'Failed to connect to AI Provider. Please check your API key.');
      setMeetingState('setup');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 5. Submit candidate answer and proceed to Next Question or Final Evaluation
  const handleSubmitAnswer = async () => {
    if (!candidateSpeechText.trim()) return;

    if (isMicOn) {
      recognizerRef.current?.stop();
      setIsMicOn(false);
    }

    const recordedAnswer = candidateSpeechText.trim();
    setCandidateSpeechText('');

    const newQaEntry = {
      questionIndex: currentQIndex + 1,
      category: currentQuestionData?.category || selectedTrack.name,
      question: currentQuestionData?.question || 'Question',
      candidateAnswer: recordedAnswer,
      expectedPoints: currentQuestionData?.expectedKeyPoints || []
    };

    const updatedHistory = [...qaHistory, newQaEntry];
    setQaHistory(updatedHistory);

    // If reached end of questions -> Generate comprehensive report
    if (currentQIndex + 1 >= totalQuestions) {
      await handleFinishInterview(updatedHistory);
      return;
    }

    // Otherwise ask the next progressive question
    setIsAiLoading(true);
    const nextIdx = currentQIndex + 1;
    setCurrentQIndex(nextIdx);

    try {
      const qData = await askInterviewQuestion({
        track: selectedTrack.name,
        role: selectedTrack.role,
        difficulty,
        questionIndex: nextIdx,
        totalQuestions,
        history: updatedHistory,
        lastAnswer: recordedAnswer
      });

      setCurrentQuestionData(qData);
      const speech = `${qData.interviewerReaction} Next question: ${qData.question}`;
      setCurrentInterviewerText(speech);

      if (isTtsEnabled) {
        setIsAiSpeaking(true);
        speakText(speech, () => setIsAiSpeaking(false));
      }
    } catch (err) {
      console.error('Next question error:', err);
      setErrorBanner(err.message || 'Failed to fetch next question from AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 6. Finish Meeting and generate complete report
  const handleFinishInterview = async (historyToEval) => {
    setMeetingState('evaluating');
    stopSpeech();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      const report = await generateFinalInterviewReport({
        track: selectedTrack.name,
        role: selectedTrack.role,
        difficulty,
        totalDurationSec: meetingTimerSec,
        qaHistory: historyToEval
      });

      setFinalReport(report);
      setMeetingState('report');

      if (addJobInterviewLog) {
        addJobInterviewLog({
          track: selectedTrack.name,
          role: selectedTrack.role,
          rating: report.candidateRating,
          hiringDecision: report.hiringDecision,
          durationMins: Math.round(meetingTimerSec / 60),
          weakPoints: report.weakPoints || [],
          weakTopics: report.weakTopicsToStudy || []
        });
      }
    } catch (err) {
      console.error('Final report generation error:', err);
      setErrorBanner(err.message || 'Failed to generate final report. Check API quota.');
      setMeetingState('meeting');
    }
  };

  // Early hang-up button
  const handleEndCallEarly = () => {
    if (window.confirm('Are you sure you want to conclude the interview and view your evaluation report now?')) {
      handleFinishInterview(qaHistory);
    }
  };

  // Reset back to setup
  const handleResetToSetup = () => {
    stopSpeech();
    setMeetingState('setup');
    setFinalReport(null);
    setQaHistory([]);
    setCandidateSpeechText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Top Header / Status Banner ── */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">Live AI Video Meeting & Technical Interview</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                1-on-1 Online Meeting
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Powered by {providerLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates a live technical video interview. Speaks questions live, listens to your answers, and delivers a post-interview diagnostic scorecard.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition shrink-0"
        >
          <Key className="w-3.5 h-3.5 text-indigo-400" />
          <span>Switch Provider (ChatGPT / Claude / Gemini)</span>
        </button>
      </div>

      {/* ── Error Banner ── */}
      {errorBanner && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => { setErrorBanner(''); setIsApiKeyModalOpen(true); }}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shrink-0"
          >
            Check API Key
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SETUP LOBBY SCREEN */}
      {/* ======================================================== */}
      {meetingState === 'setup' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Step 1: Select Your Interview Track & Role</h4>
              <p className="text-xs text-slate-400">Choose the exact engineering domain you want the AI Interviewer to test you on.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRACKS.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTrack.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrack(t)}
                    className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3.5 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{t.name}</div>
                      <div className="text-[11px] text-indigo-400 font-medium mt-0.5">{t.role}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Difficulty Level */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Round Rigor & Seniority Level:</label>
                <div className="flex gap-2">
                  {['Standard (Mid-Level)', 'Hard (Senior / FAANG)', 'Extreme (Staff & Viva)'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                        difficulty === lvl
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Meeting Button */}
              <button
                onClick={handleStartInterview}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition transform active:scale-95 shrink-0"
              >
                <Video className="w-4 h-4" />
                <span>Join Live Interview Meeting</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LIVE MEETING INTERFACE (Zoom/Meet Style) */}
      {/* ======================================================== */}
      {meetingState === 'meeting' && (
        <div className="space-y-4">
          
          {/* Top Meeting Status Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-2xl text-xs">
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE CALL
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-white font-semibold">{selectedTrack.role}</span>
              <span className="text-slate-500">|</span>
              <span className="text-indigo-400 font-mono">
                Question {currentQIndex + 1} of {totalQuestions}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTimer(meetingTimerSec)}</span>
              </div>
              <button
                onClick={handleEndCallEarly}
                className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold border border-rose-500/30 transition"
              >
                Conclude Call & View Report
              </button>
            </div>
          </div>

          {/* 2-Tile Video Meeting Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Tile 1: AI Interviewer */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-[#070b14] border border-indigo-500/30 aspect-video flex flex-col justify-between p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Principal Interviewer</div>
                    <div className="text-[10px] text-indigo-400">Engineering Board Lead ({providerLabel})</div>
                  </div>
                </div>

                {isAiSpeaking && (
                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono animate-pulse">
                    <Volume2 className="w-3 h-3" />
                    <span>Speaking...</span>
                  </div>
                )}
              </div>

              {/* Central Audio Waves Visualizer */}
              <div className="flex items-center justify-center my-auto">
                <div className="relative flex items-center justify-center">
                  <div className={`w-28 h-28 rounded-full border-2 border-indigo-500/40 flex items-center justify-center ${isAiSpeaking ? 'animate-ping' : ''}`} />
                  <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Live Closed Captions of Question */}
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 text-xs text-slate-200 backdrop-blur-md">
                <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">
                  Interviewer Spoken Prompt:
                </div>
                <div className="line-clamp-3 font-medium">
                  {isAiLoading ? 'Preparing technical question...' : currentInterviewerText || 'Listening to candidate...'}
                </div>
              </div>
            </div>

            {/* Tile 2: Candidate (User with webcam feed or avatar) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-white/10 aspect-video flex flex-col justify-between p-5 shadow-2xl">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{data.profile?.name || 'Candidate (You)'}</div>
                    <div className="text-[10px] text-slate-400">{selectedTrack.role} Candidate</div>
                  </div>
                </div>

                {isMicOn && (
                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Listening to you...</span>
                  </div>
                )}
              </div>

              {/* Webcam Video Feed or Placeholder */}
              {isCamOn ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-90"
                />
              ) : (
                <div className="flex items-center justify-center my-auto">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Candidate Live Speech Captioning */}
              <div className="z-10 bg-slate-950/85 border border-white/10 rounded-2xl p-3 text-xs text-white backdrop-blur-md">
                <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">
                  Your Spoken Answer (Live Transcript):
                </div>
                <div className="line-clamp-3 italic text-slate-200">
                  {candidateSpeechText || (isMicOn ? 'Listening... start speaking your answer.' : 'Click "Unmute & Speak (Mic)" below to answer.')}
                </div>
              </div>
            </div>

          </div>

          {/* Meeting Control Dock (Zoom/Google Meet style) */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* AV controls */}
            <div className="flex items-center space-x-2">
              {/* Mic Toggle */}
              <button
                onClick={toggleMic}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isMicOn
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
                <span>{isMicOn ? 'Mute Mic' : 'Unmute & Speak (Mic)'}</span>
              </button>

              {/* Camera Toggle */}
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold transition ${
                  isCamOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
                title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              {/* Voice TTS Toggle */}
              <button
                onClick={() => {
                  if (isTtsEnabled) stopSpeech();
                  setIsTtsEnabled(!isTtsEnabled);
                }}
                className={`p-2.5 rounded-2xl border text-xs font-semibold transition ${
                  isTtsEnabled
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 border-white/10'
                }`}
                title="Toggle AI Voice Audio"
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Answer Input Area / Direct Editor */}
            <div className="flex-1 w-full max-w-xl">
              <input
                type="text"
                value={candidateSpeechText}
                onChange={(e) => setCandidateSpeechText(e.target.value)}
                placeholder="Type or speak answer with microphone..."
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit Answer & End Call */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleSubmitAnswer}
                disabled={isAiLoading || !candidateSpeechText.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-40"
              >
                {isAiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>{currentQIndex + 1 >= totalQuestions ? 'Finish & Generate Report' : 'Submit & Next Question'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                onClick={handleEndCallEarly}
                className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition"
                title="Leave Meeting"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EVALUATION IN PROGRESS SPINNER */}
      {/* ======================================================== */}
      {meetingState === 'evaluating' && (
        <div className="glass-panel p-12 rounded-3xl border border-indigo-500/30 text-center space-y-4 max-w-lg mx-auto animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white">Compiling Senior Engineering Board Report...</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The AI Interviewer is reviewing your transcripts, evaluating your technical accuracy, diagnosing weak points, and cataloguing high-priority weak topics to study.
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FINAL POST-INTERVIEW DIAGNOSTIC REPORT CARD */}
      {/* ======================================================== */}
      {meetingState === 'report' && finalReport && (
        <div className="space-y-6 animate-slide-up">
          
          {/* Top Scorecard Header */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  {selectedTrack.name}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  finalReport.hiringDecision === 'Strong Hire' || finalReport.hiringDecision === 'Hire'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  Decision: {finalReport.hiringDecision || 'Hire'}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mt-2">Executive Candidate Evaluation Report</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {finalReport.executiveSummary}
              </p>
            </div>

            {/* Overall Rating Pill */}
            <div className="text-center p-4 rounded-2xl bg-slate-950/80 border border-white/10 shrink-0">
              <div className="text-xs text-slate-400 font-medium">Overall Candidate Score</div>
              <div className="text-4xl font-extrabold text-amber-400 font-mono mt-1">
                ⭐ {finalReport.candidateRating || 7.5}
                <span className="text-sm font-normal text-slate-400">/10</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Duration: {Math.round(meetingTimerSec / 60)} mins
              </div>
            </div>
          </div>

          {/* Breakdown Score Bars */}
          {finalReport.categoryScores && finalReport.categoryScores.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {finalReport.categoryScores.map((c, i) => (
                <div key={i} className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="text-xs text-slate-400 font-medium leading-tight">{c.name}</div>
                  <div className="text-xl font-bold text-white font-mono">{c.score} / {c.outOf || 10}</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${((c.score || 7) / (c.outOf || 10)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Critical Section: Weak Points & Topics to Study */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Weak Points Card */}
            <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-rose-950/10 space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Identified Weak Points & Knowledge Gaps</h4>
                  <p className="text-[11px] text-slate-400">Exact technical points where your explanation lacked depth or accuracy</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {finalReport.weakPoints?.map((wp, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 text-xs text-rose-200 flex items-start space-x-2">
                    <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{wp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Topics to Study Card */}
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-950/10 space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Weak Topics to Study & Revise</h4>
                  <p className="text-[11px] text-slate-400">Curated syllabus topics you must review before your actual interview</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {finalReport.weakTopicsToStudy?.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-300 font-bold">{item.topic}</strong>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        item.urgency === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.urgency || 'High'} Urgency
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.whyItFailed}</p>
                    <div className="text-[11px] text-emerald-400 mt-1">
                      💡 <strong>Recommended Action:</strong> {item.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Strong Points & Action Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Strong Points */}
            <div className="glass-panel p-5 rounded-3xl border border-emerald-500/20 space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Candidate Strong Points</h4>
              </div>
              <div className="space-y-2">
                {finalReport.strongPoints?.map((sp, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 text-xs text-emerald-300 flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{sp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps Action Plan */}
            <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recommended Next Step Plan</h4>
              </div>
              <div className="space-y-2">
                {finalReport.nextStepActionPlan?.map((ap, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/20 text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{ap}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Full Q&A Transcript Review */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white">Full Interview Transcript & Question Breakdown</h4>
            <div className="space-y-3">
              {qaHistory.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-indigo-400 font-semibold">
                    <span>Question {item.questionIndex}: {item.category}</span>
                  </div>
                  <div className="text-white font-medium">{item.question}</div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-300">
                    <strong className="text-slate-400 block text-[11px] mb-0.5">Your Spoken Answer:</strong>
                    "{item.candidateAnswer}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleResetToSetup}
              className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-2xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Another Mock Interview Round</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Print / Save Scorecard Report</span>
            </button>
          </div>

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
