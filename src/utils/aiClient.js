// ============================================================
// Unified AI Client: Gemini | ChatGPT (OpenAI) | Claude (Anthropic)
// ============================================================

const STORAGE = {
  provider: 'omniprep_ai_provider',      // 'gemini' | 'openai' | 'claude'
  geminiKey: 'omniprep_gemini_api_key',
  geminiModel: 'omniprep_gemini_model',
  openaiKey: 'omniprep_openai_api_key',
  openaiModel: 'omniprep_openai_model',
  claudeKey: 'omniprep_claude_api_key',
  claudeModel: 'omniprep_claude_model',
};

// ── Provider persistence ──────────────────────────────────────
export const getStoredProvider = () => localStorage.getItem(STORAGE.provider) || 'gemini';
export const setStoredProvider = (p) => localStorage.setItem(STORAGE.provider, p);

// ── Gemini ────────────────────────────────────────────────────
export const getStoredApiKey = () => localStorage.getItem(STORAGE.geminiKey) || '';
export const setStoredApiKey = (k) =>
  k ? localStorage.setItem(STORAGE.geminiKey, k.trim()) : localStorage.removeItem(STORAGE.geminiKey);
export const getStoredModel = () => localStorage.getItem(STORAGE.geminiModel) || 'gemini-2.0-flash';
export const setStoredModel = (m) => m && localStorage.setItem(STORAGE.geminiModel, m);

// ── OpenAI ───────────────────────────────────────────────────
export const getOpenAIKey = () => localStorage.getItem(STORAGE.openaiKey) || '';
export const setOpenAIKey = (k) =>
  k ? localStorage.setItem(STORAGE.openaiKey, k.trim()) : localStorage.removeItem(STORAGE.openaiKey);
export const getOpenAIModel = () => localStorage.getItem(STORAGE.openaiModel) || 'gpt-4o-mini';
export const setOpenAIModel = (m) => m && localStorage.setItem(STORAGE.openaiModel, m);

// ── Claude ───────────────────────────────────────────────────
export const getClaudeKey = () => localStorage.getItem(STORAGE.claudeKey) || '';
export const setClaudeKey = (k) =>
  k ? localStorage.setItem(STORAGE.claudeKey, k.trim()) : localStorage.removeItem(STORAGE.claudeKey);
export const getClaudeModel = () => localStorage.getItem(STORAGE.claudeModel) || 'claude-3-5-haiku-20241022';
export const setClaudeModel = (m) => m && localStorage.setItem(STORAGE.claudeModel, m);

// ── Active provider helpers ──────────────────────────────────
export const getActiveProviderKey = () => {
  const p = getStoredProvider();
  if (p === 'openai') return getOpenAIKey();
  if (p === 'claude') return getClaudeKey();
  return getStoredApiKey();
};

// ============================================================
// Low-Level API Callers
// ============================================================

// --- Gemini Direct REST -----------------------------------------
async function callGeminiDirect(apiKey, model, systemInstruction, promptText, expectJson = true) {
  const cleanModel = model && model !== 'auto' ? model.replace(/^models\//, '') : 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
  };
  if (systemInstruction) payload.system_instruction = { parts: [{ text: systemInstruction }] };
  if (expectJson) payload.generationConfig = { temperature: 0.7, response_mime_type: 'application/json' };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    let msg = body;
    try { msg = JSON.parse(body).error?.message || body; } catch (_) {}
    throw new Error(`[Gemini] ${msg}`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// --- OpenAI Direct REST ----------------------------------------
async function callOpenAIDirect(apiKey, model, systemInstruction, promptText) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: promptText });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: model || 'gpt-4o-mini', messages, temperature: 0.7 }),
  });

  if (!res.ok) {
    const body = await res.text();
    let msg = body;
    try { msg = JSON.parse(body).error?.message || body; } catch (_) {}
    throw new Error(`[OpenAI] ${msg}`);
  }
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');
  return text;
}

// --- Claude Direct REST ----------------------------------------
// NOTE: Claude's API requires CORS proxy because Anthropic doesn't allow browser-direct calls.
// We route through the backend /api/ai/claude-proxy endpoint.
async function callClaudeDirect(apiKey, model, systemInstruction, promptText) {
  // First try backend proxy (supports server-side CORS)
  const res = await fetch('/api/ai/claude-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, model, systemInstruction, promptText }),
  });

  if (!res.ok) {
    const body = await res.text();
    let msg = body;
    try { msg = JSON.parse(body).error || body; } catch (_) {}
    throw new Error(`[Claude] ${msg}`);
  }

  const json = await res.json();
  if (!json.success) throw new Error(`[Claude] ${json.error}`);
  return json.text;
}

// ============================================================
// Unified AI Call  (picks provider automatically)
// ============================================================

export async function callAI({ systemInstruction, promptText, expectJson = true }) {
  const provider = getStoredProvider();

  let rawText;

  if (provider === 'openai') {
    const apiKey = getOpenAIKey();
    if (!apiKey) throw new Error('Please configure your OpenAI API Key first.');
    const model = getOpenAIModel();
    rawText = await callOpenAIDirect(apiKey, model, systemInstruction, promptText);

  } else if (provider === 'claude') {
    const apiKey = getClaudeKey();
    if (!apiKey) throw new Error('Please configure your Claude API Key first.');
    const model = getClaudeModel();
    rawText = await callClaudeDirect(apiKey, model, systemInstruction, promptText);

  } else {
    // Gemini (default)
    const apiKey = getStoredApiKey();
    if (!apiKey) throw new Error('Please configure your Gemini API Key first.');
    const model = getStoredModel();

    // Try direct browser fetch first, fall back to backend proxy
    try {
      rawText = await callGeminiDirect(apiKey, model, systemInstruction, promptText, expectJson);
    } catch (browserErr) {
      console.warn('[Gemini Direct] Falling back to backend proxy:', browserErr.message);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, model, prompt: promptText, systemInstruction }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gemini backend proxy failed');
      rawText = json.text;
    }
  }

  if (!expectJson) return rawText;

  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    return rawText; // caller can handle plain text fallback
  }
}

// ============================================================
// English Coach  (multi-provider)
// ============================================================

export async function callEnglishCoach(mode, topic, spokenTranscript, history = []) {
  const systemInstruction = `You are an elite native English Speaking Coach and Conversational Partner.
Mode: "${mode || 'Conversational Dialogue'}".
Topic: "${topic || 'General Discussion'}".
You MUST evaluate the user's EXACT spoken words and reply naturally to what they actually said.

Respond in strict JSON with this exact schema:
{
  "conversationalReply": "A natural, warm spoken English response that directly addresses what the user just said",
  "grammarCorrections": [
    { "original": "flawed phrase from user", "corrected": "natural phrase", "explanation": "why this correction helps" }
  ],
  "vocabularyUpgrades": [
    { "simpleWord": "simple word user used", "upgrade": "sophisticated alternative", "example": "example sentence" }
  ],
  "fluencyRating": 4.5,
  "feedbackTip": "One specific actionable tip regarding pronunciation, grammar, or word choice"
}`;

  const promptText = `Topic: ${topic}
User's Spoken Utterance: "${spokenTranscript}"
Previous Conversation History: ${JSON.stringify(history || [])}

Evaluate what the user actually said ("${spokenTranscript}"). Respond naturally to their statement, point out grammar errors if present, suggest richer vocabulary, and keep the dialogue flowing! Return valid JSON.`;

  const result = await callAI({ systemInstruction, promptText, expectJson: true });

  // Normalise: if callAI returned a string (parse failed), wrap it
  if (typeof result === 'string') {
    return {
      conversationalReply: result,
      grammarCorrections: [],
      vocabularyUpgrades: [],
      fluencyRating: 4.2,
      feedbackTip: 'Keep practising — you are doing great!',
    };
  }
  return result;
}

// ============================================================
// Interview Live Meeting Helpers (Next Question + Final Report)
// ============================================================

export async function askInterviewQuestion({ track, role, difficulty, questionIndex, totalQuestions, history, lastAnswer }) {
  const systemInstruction = `You are an elite, highly experienced Senior Engineering Director and Technical Interviewer at top tech companies (Google, Meta, OpenAI).
You are conducting a LIVE TECHNICAL INTERVIEW in an online meeting format.
Track: "${track}". Role: "${role}". Difficulty: "${difficulty}".
Question ${questionIndex + 1} of ${totalQuestions}.

Respond in strict JSON with this exact schema:
{
  "interviewerReaction": "A natural, professional conversational transition reacting briefly to the candidate's last answer (or warm opening welcoming them to the round if questionIndex is 0)",
  "question": "The next technical interview question, tailored to candidate's track and level. Must be concise, challenging, and realistic",
  "expectedKeyPoints": ["Key concept 1 candidate should mention", "Key concept 2"],
  "category": "e.g. System Design, Algorithms, ML Math, Production Troubleshooting, Architecture"
}`;

  const promptText = `Track: ${track}
Role: ${role}
Difficulty: ${difficulty}
Question Number: ${questionIndex + 1} out of ${totalQuestions}
Previous Q&A History: ${JSON.stringify(history || [])}
Candidate's Just-Completed Answer: "${lastAnswer || '(First question of the interview)'}"

Provide the next interview question and transition. Return valid JSON.`;

  const result = await callAI({ systemInstruction, promptText, expectJson: true });
  if (typeof result === 'string') {
    return {
      interviewerReaction: 'Thank you for explaining that. Let us move to the next question.',
      question: result,
      expectedKeyPoints: ['Clarity', 'Depth'],
      category: track,
    };
  }
  return result;
}

export async function generateFinalInterviewReport({ track, role, difficulty, totalDurationSec, qaHistory }) {
  const systemInstruction = `You are a Principal Engineering Interview Board Chair at a FAANG company.
You just completed a rigorous live online technical interview with a candidate.
Track: "${track}". Role: "${role}". Difficulty: "${difficulty}".

Evaluate the candidate's overall performance across all questions and answers. Be candid, constructive, rigorous, and specific.
Identify their exact weak points, knowledge gaps, and weak topics that need urgent study.

Respond in strict JSON with this exact schema:
{
  "candidateRating": 7.8, // Overall score 1.0 to 10.0
  "hiringDecision": "Strong Hire" | "Hire" | "Leaning Hire" | "Leaning No Hire" | "No Hire",
  "executiveSummary": "A 3-4 sentence comprehensive summary of how the candidate performed across the whole meeting",
  "categoryScores": [
    { "name": "Technical Depth & Correctness", "score": 8, "outOf": 10 },
    { "name": "System Architecture & Trade-offs", "score": 7, "outOf": 10 },
    { "name": "Communication & Articulation", "score": 8, "outOf": 10 },
    { "name": "Problem Solving Under Pressure", "score": 7, "outOf": 10 }
  ],
  "weakPoints": [
    "Specific weak point with context on what was missing or incorrect",
    "Another clear gap demonstrated in their answers"
  ],
  "weakTopicsToStudy": [
    {
      "topic": "Topic Name (e.g., Eigenvalue Decomposition / Transformer KV Cache)",
      "urgency": "High" | "Medium",
      "whyItFailed": "Why the candidate struggled here during the session",
      "recommendedAction": "Concrete study recommendation (papers, books, practice problems)"
    }
  ],
  "strongPoints": [
    "Identified strength demonstrated during the interview"
  ],
  "nextStepActionPlan": [
    "Day 1-2 immediate action item",
    "Day 3-7 revision target"
  ]
}`;

  const promptText = `Track: ${track}
Role: ${role}
Difficulty: ${difficulty}
Total Interview Duration: ${Math.round((totalDurationSec || 0) / 60)} minutes
Complete Q&A Transcript:
${JSON.stringify(qaHistory, null, 2)}

Produce a thorough, authoritative final candidate report with weak points, weak topics to study, scores, and hiring decision. Return valid JSON.`;

  const result = await callAI({ systemInstruction, promptText, expectJson: true });
  if (typeof result === 'string') {
    return {
      candidateRating: 7.0,
      hiringDecision: 'Hire',
      executiveSummary: result,
      categoryScores: [
        { name: 'Technical Depth', score: 7, outOf: 10 },
        { name: 'Communication', score: 7, outOf: 10 }
      ],
      weakPoints: ['Review mathematical rigor and edge cases.'],
      weakTopicsToStudy: [
        { topic: track, urgency: 'Medium', whyItFailed: 'Could be articulated with more depth', recommendedAction: 'Practice mock viva questions' }
      ],
      strongPoints: ['Clear structured approach'],
      nextStepActionPlan: ['Revise core formulas', 'Practice explaining live']
    };
  }
  return result;
}

// ============================================================
// Legacy Gemini helpers  (still used by other modules)
// ============================================================

export const callGeminiRest = async (apiKey, systemInstruction, promptText, model = 'gemini-2.0-flash', expectJson = true) => {
  return callGeminiDirect(apiKey, model, systemInstruction, promptText, expectJson);
};

export const callGeminiEnglishCoach = async (mode, topic, spokenTranscript, history = []) => {
  // delegates to unified callEnglishCoach when provider is gemini
  return callEnglishCoach(mode, topic, spokenTranscript, history);
};

export const callGeminiInterview = async (track, currentQuestion, userResponse, history = []) => {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();
  if (!apiKey) throw new Error('Please configure your Gemini API Key first.');

  const systemInstruction = `You are a Senior Technical Interviewer and Hiring Manager for top tech companies.
Track: "${track || 'Data Science & Machine Learning'}".
Evaluate the candidate's answer with high technical rigor.
Respond in strict JSON with this exact schema:
{
  "feedback": "Deep critique of the candidate's exact answer",
  "scores": { "technicalAccuracy": 8, "depthAndClarity": 7, "confidence": 8 },
  "suggestedImprovement": "A polished, top-tier candidate phrasing for this exact question",
  "nextQuestion": "The next progressive technical interview question in this track"
}`;

  const promptText = `Track: ${track}
Previous Question: ${currentQuestion}
Candidate's Spoken Answer: "${userResponse}"
Context History: ${JSON.stringify(history || [])}

Evaluate the candidate's exact words "${userResponse}". Return valid JSON.`;

  try {
    const rawText = await callGeminiDirect(apiKey, model, systemInstruction, promptText, true);
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (browserErr) {
    console.warn('[Direct Browser Gemini] Fallback to Backend Proxy:', browserErr.message);
  }

  const response = await fetch('/api/ai/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ track, currentQuestion, userResponse, history, apiKey, model }),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.error || 'Gemini interview request failed');
  return json.data;
};

// ============================================================
// Web Speech API  (unchanged)
// ============================================================

export class SpeechRecognizer {
  constructor(onResult, onEnd, onError) {
    this.recognition = null;
    this.isListening = false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (onResult) onResult(transcript, event.results[event.results.length - 1].isFinal);
      };
      this.recognition.onend = () => { this.isListening = false; if (onEnd) onEnd(); };
      this.recognition.onerror = (err) => { this.isListening = false; if (onError) onError(err); };
    }
  }
  start() {
    if (this.recognition && !this.isListening) {
      try { this.recognition.start(); this.isListening = true; } catch (e) { console.warn('Recognition start error:', e); }
    }
  }
  stop() {
    if (this.recognition && this.isListening) {
      try { this.recognition.stop(); this.isListening = false; } catch (e) {}
    }
  }
}

export const speakText = (text, onEnd) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')) && v.lang.startsWith('en')
  );
  if (naturalVoice) utterance.voice = naturalVoice;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
};
