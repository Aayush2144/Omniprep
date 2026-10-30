// ─────────────────────────────────────────────────────────────────────────────
// geminiClient.js  →  Now a thin re-export shim for the unified aiClient.
// All logic lives in aiClient.js so every feature can use Gemini / ChatGPT / Claude.
// ─────────────────────────────────────────────────────────────────────────────
export {
  // Key / model persistence (Gemini)
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,

  // OpenAI
  getOpenAIKey,
  setOpenAIKey,
  getOpenAIModel,
  setOpenAIModel,

  // Claude
  getClaudeKey,
  setClaudeKey,
  getClaudeModel,
  setClaudeModel,

  // Provider selector
  getStoredProvider,
  setStoredProvider,
  getActiveProviderKey,

  // High-level AI callers
  callAI,
  callEnglishCoach,
  askInterviewQuestion,
  generateFinalInterviewReport,
  callGeminiRest,
  callGeminiEnglishCoach,
  callGeminiInterview,

  // Speech helpers
  SpeechRecognizer,
  speakText,
  stopSpeech,
} from './aiClient.js';
