export const ENGLISH_SPEAKING_PROMPTS = [
  // Technical & Data Science Explanations
  {
    id: 'tech-1',
    category: 'Technical / DS',
    title: 'Explain Bias vs Variance Tradeoff',
    prompt: 'Explain the bias-variance tradeoff in Machine Learning as if you were explaining it to a non-technical product manager. Give real-world analogies and describe how underfitting and overfitting occur.',
    durationMin: 3
  },
  {
    id: 'tech-2',
    category: 'Technical / DS',
    title: 'Walk Through an End-to-End ML Pipeline',
    prompt: 'Describe the complete lifecycle of a Machine Learning project from problem formulation, data cleaning, feature engineering, model selection, to deployment and monitoring.',
    durationMin: 4
  },
  {
    id: 'tech-3',
    category: 'Technical / DS',
    title: 'Explain Gradient Descent Visually',
    prompt: 'Describe how Gradient Descent works using a visual metaphor (like a hiker in the fog descending a mountain). Explain learning rates, local minima, and momentum.',
    durationMin: 3
  },
  {
    id: 'tech-4',
    category: 'Technical / DS',
    title: 'SQL vs NoSQL: When to Use Which?',
    prompt: 'Explain the key trade-offs between relational databases (PostgreSQL/MySQL) and non-relational databases (MongoDB/Cassandra). Provide two distinct real-world application scenarios for each.',
    durationMin: 3
  },
  {
    id: 'tech-5',
    category: 'Technical / DS',
    title: 'How Transformer Self-Attention Works',
    prompt: 'Explain the intuition behind the self-attention mechanism in modern Large Language Models (LLMs) and why it outperformed traditional RNNs and LSTMs for sequence modeling.',
    durationMin: 4
  },
  {
    id: 'tech-6',
    category: 'Technical / DS',
    title: 'A/B Testing & Statistical Significance',
    prompt: 'Explain how you would design an A/B test for a new e-commerce recommendation algorithm. Discuss null hypothesis, p-values, sample size determination, and pitfalls like peeking.',
    durationMin: 4
  },

  // Behavioral & HR Interview
  {
    id: 'behav-1',
    category: 'Behavioral / HR',
    title: 'Tell Me About a Challenging Bug or Problem',
    prompt: 'Use the STAR method (Situation, Task, Action, Result) to narrate a time you faced a difficult technical bug, tight deadline, or blocker and how you systematically solved it.',
    durationMin: 3
  },
  {
    id: 'behav-2',
    category: 'Behavioral / HR',
    title: 'Resolving a Conflict in a Team Project',
    prompt: 'Describe a situation where you had a strong technical disagreement with a peer or teammate. How did you communicate, evaluate alternatives, and reach a consensus?',
    durationMin: 3
  },
  {
    id: 'behav-3',
    category: 'Behavioral / HR',
    title: 'Why Do You Want to Work in Data Science / Tech?',
    prompt: 'Articulate your personal origin story, what sparks your passion in Data Science/Engineering, and where you see yourself creating high-impact value in the next 3 years.',
    durationMin: 3
  },
  {
    id: 'behav-4',
    category: 'Behavioral / HR',
    title: 'Greatest Weakness and How You Are Overcoming It',
    prompt: 'State an authentic area of improvement or past weakness and explain the concrete systems or habits you have put in place to address it.',
    durationMin: 3
  },
  {
    id: 'behav-5',
    category: 'Behavioral / HR',
    title: 'How You Prioritize Competing Deadlines',
    prompt: 'Explain your strategy when juggling GATE preparation, academic semester submissions, and job interviews simultaneously without burning out.',
    durationMin: 3
  },

  // Daily Life, Communication & Philosophy
  {
    id: 'gen-1',
    category: 'General / Fluency',
    title: 'The Role of Artificial Intelligence in 2030',
    prompt: 'Speak spontaneously for 3 minutes on how generative AI and automation will transform daily human productivity, education, and creative work by 2030.',
    durationMin: 3
  },
  {
    id: 'gen-2',
    category: 'General / Fluency',
    title: 'The Compound Effect of Daily Consistency',
    prompt: 'Deliver a motivational mini-talk on why 1% daily improvement compound interest yields exponential results in competitive exams and career mastery.',
    durationMin: 3
  },
  {
    id: 'gen-3',
    category: 'General / Fluency',
    title: 'My Morning & Evening Peak Productivity Routine',
    prompt: 'Describe your ideal 24-hour day in vivid detail: your morning ritual, deep work focus blocks, nutrition, exercise, and winding-down routine.',
    durationMin: 3
  },
  {
    id: 'gen-4',
    category: 'General / Fluency',
    title: 'A Book, Podcast, or Lecture that Changed My Mind',
    prompt: 'Describe a powerful concept, book, or podcast episode that fundamentally changed how you think or operate in life.',
    durationMin: 3
  }
];

export const INITIAL_VOCABULARY = [
  {
    id: 'v-1',
    word: 'Ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    partOfSpeech: 'adjective',
    meaning: 'Lasting for a very short time; fleeting or transitory.',
    example: 'In-memory cache data is ephemeral, whereas persistent storage guarantees durability.',
    synonyms: ['transient', 'fleeting', 'momentary'],
    status: 'Mastered',
    dateAdded: '2026-08-10'
  },
  {
    id: 'v-2',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    meaning: 'Dealing with things sensibly and realistically based on practical rather than theoretical considerations.',
    example: 'He took a pragmatic approach to system design, choosing a simple monolith over complex microservices.',
    synonyms: ['practical', 'sensible', 'utilitarian'],
    status: 'Practicing',
    dateAdded: '2026-08-11'
  },
  {
    id: 'v-3',
    word: 'Articulate',
    phonetic: '/ɑːˈtɪk.jə.lət/',
    partOfSpeech: 'adjective / verb',
    meaning: 'Having or showing the ability to speak fluently, coherently, and persuasively.',
    example: 'An effective data scientist must articulate complex machine learning metrics to stakeholders.',
    synonyms: ['eloquent', 'fluent', 'lucid'],
    status: 'Mastered',
    dateAdded: '2026-08-12'
  },
  {
    id: 'v-4',
    word: 'Idempotent',
    phonetic: '/ˌaɪ.dəmˈpoʊ.tənt/',
    partOfSpeech: 'adjective',
    meaning: 'Denoting an operation which can be applied multiple times without changing the result beyond the initial application.',
    example: 'REST API PUT and DELETE endpoints should always be idempotent.',
    synonyms: ['repeatable', 'consistent', 'invariant'],
    status: 'Learning',
    dateAdded: '2026-08-13'
  },
  {
    id: 'v-5',
    word: 'Salient',
    phonetic: '/ˈseɪ.li.ənt/',
    partOfSpeech: 'adjective',
    meaning: 'Most noticeable, prominent, or important.',
    example: 'During the research presentation, she highlighted the salient features of the neural network architecture.',
    synonyms: ['prominent', 'pivotal', 'crucial'],
    status: 'Learning',
    dateAdded: '2026-08-14'
  }
];
