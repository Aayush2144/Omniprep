import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  TrendingUp,
  Target,
  Copy,
  Check
} from 'lucide-react';
import { callGeminiRest, getStoredApiKey } from '../../utils/geminiClient.js';

export const AiResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const sampleResume = `Aayush Kumar
Data Science & Machine Learning Enthusiast
Email: aayush@example.com | GitHub: github.com/aayush | LinkedIn: linkedin.com/in/aayush

SKILLS:
- Languages: Python, SQL, C++, R
- Libraries: Pandas, NumPy, Scikit-Learn, TensorFlow, Matplotlib
- Concepts: Linear Algebra, Calculus, Probability, Regression, Classification, Clustering, Data Preprocessing

PROJECTS:
- Customer Churn Prediction: Built a random forest classifier to predict customer churn with 88% accuracy.
- Stock Price Forecasting: Used LSTM neural networks in TensorFlow to predict closing stock prices.
- Sentiment Analysis: Scraped Twitter data and built a TF-IDF Naive Bayes model for sentiment tagging.

EDUCATION:
- B.Tech in Computer Science & Engineering (GPA: 8.85 / 10)`;

  const sampleJob = `Company: TechNova AI Labs
Role: Junior Data Scientist / Machine Learning Engineer

Requirements:
- Bachelor's in CS, Data Science, or related STEM field
- Strong foundation in Python, SQL, and Machine Learning algorithms (Random Forest, XGBoost, Neural Networks)
- Hands-on experience with Deep Learning frameworks (PyTorch or TensorFlow)
- Familiarity with MLOps tools (Docker, Git, MLflow, FastAPI)
- Excellent communication and data storytelling abilities`;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) {
      setErrorMsg('Please provide both your Resume text and the target Job Description.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');

    const systemInstruction = `You are a Principal AI Recruiter and Elite ATS (Applicant Tracking System) Technical Hiring Auditor.
Evaluate the candidate's resume against the exact target Job Description with high technical rigor.
Respond strictly in JSON format with this exact schema:
{
  "atsScore": 84,
  "matchSummary": "Concise 2-sentence executive summary of the candidate's match quality",
  "matchedKeywords": ["Python", "SQL", "Machine Learning", "TensorFlow"],
  "missingKeywords": ["PyTorch", "Docker", "MLflow", "FastAPI"],
  "bulletImprovements": [
    {
      "original": "Built a random forest classifier to predict customer churn with 88% accuracy.",
      "optimized": "Engineered an end-to-end Random Forest customer churn pipeline on 50k+ records, improving retention predictive accuracy to 88% and identifying top 5 churn risk factors."
    },
    {
      "original": "Used LSTM neural networks in TensorFlow to predict closing stock prices.",
      "optimized": "Designed and deployed a 2-layer Bidirectional LSTM neural network in TensorFlow, reducing time-series forecast RMSE by 18%."
    }
  ],
  "interviewerTips": [
    "Highlight your quantitative metrics during the initial technical screening.",
    "Be ready to explain how you prevent overfitting in tree models vs neural networks."
  ]
}`;

    const promptText = `CANDIDATE RESUME:
${resumeText}

TARGET JOB DESCRIPTION:
${jobDescription}

Perform deep ATS parsing, calculate ATS match score (0-100), identify keyword matches and missing gaps, provide 2-3 high-impact STAR bullet point rewrites, and interview advice. Return valid JSON only.`;

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
        if (!json.success) throw new Error(json.error || 'AI Analysis failed.');
        responseText = json.text;
      }

      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setAnalysisResult(parsed);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to analyze resume. Please check your Gemini API key in Settings.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-indigo-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Gemini AI Career Studio</span>
          </div>
          <h2 className="text-2xl font-bold text-white">AI Resume & ATS Job Matcher 📄</h2>
          <p className="text-xs text-slate-300">
            Audit your resume against any job description, diagnose missing keywords, and polish bullet points with STAR metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setResumeText(sampleResume);
            setJobDescription(sampleJob);
          }}
          className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition shrink-0"
        >
          Load Sample Data
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Resume Input */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Paste Your Resume Text</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">{resumeText.length} chars</span>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={9}
            placeholder="Paste your full resume text (Skills, Projects, Education)..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            required
          />
        </div>

        {/* Job Description Input */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Paste Target Job Description</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">{jobDescription.length} chars</span>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={9}
            placeholder="Paste the job posting requirements & responsibilities..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
            required
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={analyzing}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing with Gemini AI...' : 'Analyze Resume & Job Match 🚀'}</span>
          </button>
        </div>
      </form>

      {/* ANALYSIS RESULTS */}
      {analysisResult && (
        <div className="space-y-5 animate-fade-in pt-2">
          
          {/* Top Score Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-purple-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400 font-medium">ATS Match Score</div>
              <div className="flex items-baseline space-x-3">
                <span className={`text-4xl sm:text-5xl font-black font-mono ${
                  analysisResult.atsScore >= 80 ? 'text-emerald-400' : analysisResult.atsScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {analysisResult.atsScore}%
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  {analysisResult.atsScore >= 80 ? '🌟 Strong Match for Shortlisting' : analysisResult.atsScore >= 60 ? '⚡ Good Baseline, Needs Keyword Optimization' : '⚠️ Low Keyword Overlap'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">{analysisResult.matchSummary}</p>
            </div>

            {/* Visual Gauge Pill */}
            <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-white/10 text-center shrink-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Interview Probability</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                {analysisResult.atsScore >= 80 ? 'High (85%+)' : analysisResult.atsScore >= 60 ? 'Moderate (55%)' : 'Low (<30%)'}
              </div>
            </div>
          </div>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Matched Keywords */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Matched Skills & Keywords ({analysisResult.matchedKeywords?.length || 0})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.matchedKeywords || []).map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-950/10 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Critical Missing Keywords ({analysisResult.missingKeywords?.length || 0})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.missingKeywords || []).map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    + Add "{kw}"
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Optimized Bullet Points */}
          {analysisResult.bulletImprovements?.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>AI Optimized STAR Bullet Points (1-Click Copy)</span>
              </div>

              <div className="space-y-3">
                {analysisResult.bulletImprovements.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
                    <div className="text-[11px] text-slate-500 line-through">
                      {item.original}
                    </div>
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="text-xs text-emerald-300 font-medium leading-relaxed">
                        ⚡ {item.optimized}
                      </div>
                      <button
                        onClick={() => handleCopyBullet(item.optimized, idx)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-lg transition shrink-0"
                        title="Copy Bullet Point"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interviewer Advice */}
          {analysisResult.interviewerTips?.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Interview Preparation Guidance</span>
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {analysisResult.interviewerTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
