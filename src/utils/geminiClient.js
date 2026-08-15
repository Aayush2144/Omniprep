// Client-side helper for Google Gemini AI with Direct REST + Backend Proxy

const API_KEY_STORAGE = 'omniprep_gemini_api_key';
const MODEL_STORAGE = 'omniprep_gemini_model';

export const getStoredApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE) || '';
};

export const setStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
};

export const getStoredModel = () => {
  return localStorage.getItem(MODEL_STORAGE) || 'gemini-2.0-flash';
};

export const setStoredModel = (model) => {
  if (model) {
    localStorage.setItem(MODEL_STORAGE, model);
  }
};

// ==========================================
// DIRECT BROWSER REST CALL (Fast & Direct)
// ==========================================

async function callDirectBrowserGemini(apiKey, model, systemInstruction, promptText, expectJson = true) {
  const cleanModel = model && model !== 'auto' ? model.replace(/^models\//, '') : 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ]
  };

  if (systemInstruction) {
    payload.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (expectJson) {
    payload.generationConfig = {
      temperature: 0.7,
      response_mime_type: 'application/json'
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let msg = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      msg = parsed.error?.message || errorBody;
    } catch (e) {}
    throw new Error(`[Gemini Error] ${msg}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ==========================================
// GEMINI API CALLERS (Direct + Proxy Fallback)
// ==========================================

export const callGeminiInterview = async (track, currentQuestion, userResponse, history = []) => {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();

  if (!apiKey) {
    throw new Error('Please configure your Gemini API Key first.');
  }

  const systemInstruction = `You are a Senior Technical Interviewer and Hiring Manager for top tech companies (Google, Amazon, DeepMind).
Track: "${track || 'Data Science & Machine Learning'}".
Evaluate the candidate's answer with high technical rigor.
Respond in strict JSON with this exact schema:
{
  "feedback": "Deep critique of the candidate's exact answer, identifying what was correct and specifically what was missing or incorrect",
  "scores": {
    "technicalAccuracy": 8, // 1-10 rating
    "depthAndClarity": 7,    // 1-10 rating
    "confidence": 8          // 1-10 rating
  },
  "suggestedImprovement": "A polished, top-tier candidate phrasing for this exact question with math/code intuition",
  "nextQuestion": "The next progressive technical interview question in this track"
}`;

  const promptText = `Track: ${track}
Previous Question: ${currentQuestion}
Candidate's Spoken Answer: "${userResponse}"
Context History: ${JSON.stringify(history || [])}

Evaluate the candidate's exact words "${userResponse}". Return valid JSON.`;

  // 1. Try Direct Browser Fetch (Fastest & direct connection)
  try {
    const rawText = await callDirectBrowserGemini(apiKey, model, systemInstruction, promptText, true);
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (browserErr) {
    console.warn('[Direct Browser Gemini] Fallback to Backend Proxy:', browserErr.message);
  }

  // 2. Fallback to Backend Server Endpoint
  const response = await fetch('/api/ai/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ track, currentQuestion, userResponse, history, apiKey, model })
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Gemini interview request failed');
  }
  return json.data;
};

export const callGeminiEnglishCoach = async (mode, topic, spokenTranscript, history = []) => {
  const apiKey = getStoredApiKey();
  const model = getStoredModel();

  if (!apiKey) {
    throw new Error('Please configure your Gemini API Key first.');
  }

  const systemInstruction = `You are an elite native English Speaking Coach and Conversational Partner.
Mode: "${mode || 'Conversational Dialogue'}".
Topic: "${topic || 'General Discussion'}".
You MUST evaluate the user's EXACT spoken words and reply naturally to what they actually said. DO NOT repeat generic greetings.

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

  // 1. Try Direct Browser Fetch (Fastest & direct connection)
  try {
    const rawText = await callDirectBrowserGemini(apiKey, model, systemInstruction, promptText, true);
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (browserErr) {
    console.warn('[Direct Browser Gemini] Fallback to Backend Proxy:', browserErr.message);
  }

  // 2. Fallback to Backend Server Endpoint
  const response = await fetch('/api/ai/english-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, topic, spokenTranscript, history, apiKey, model })
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Gemini English coach request failed');
  }
  return json.data;
};

// ==========================================
// WEB SPEECH API (Voice Input & Output)
// ==========================================

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

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        if (onError) onError(err);
      };
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (e) {}
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
  const naturalVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')) && v.lang.startsWith('en'));
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
