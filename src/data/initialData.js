import { INITIAL_VOCABULARY } from './prompts.js';

export const INITIAL_DATA = {
  profile: {
    name: 'Aayush Kumar',
    targetRole: 'Data Scientist & AI Researcher',
    dailyHourGoal: 7.5,
    currentStreak: 0,
    longestStreak: 0,
    gateExamDate: '2027-02-06',
    semExamDate: '2026-11-20',
    interviewSprintDate: '2026-10-15',
  },

  dailyRoutines: [
    // Morning Routine
    { id: 'r-1', period: 'Morning', title: 'Wake up at 6:00 AM & Hydrate (500ml)', completed: false, category: 'routine' },
    { id: 'r-2', period: 'Morning', title: '15 Mins English Pronunciation / Shadowing', completed: false, category: 'english' },
    { id: 'r-3', period: 'Morning', title: 'Review Daily Top 3 Preparation Priorities', completed: false, category: 'routine' },
    // Deep Work Core Blocks
    { id: 'r-4', period: 'Core Work', title: 'GATE DS Slot: 2 hrs Probability / ML Theory', completed: false, category: 'gate' },
    { id: 'r-5', period: 'Core Work', title: 'College Coursework & Assignment Submission Slot', completed: false, category: 'academic' },
    { id: 'r-6', period: 'Core Work', title: 'Job Prep: Solve 2 LeetCode Mediums (Trees/Graphs)', completed: false, category: 'job' },
    { id: 'r-7', period: 'Core Work', title: 'Job Prep: Revise 1 Data Science Topic (Transformers/SQL)', completed: false, category: 'job' },
    // Evening Routine
    { id: 'r-8', period: 'Evening', title: 'Record 3-Minute Spoken English Prompt', completed: false, category: 'english' },
    { id: 'r-9', period: 'Evening', title: 'Mistake Journal Review & Log Revision Flashcards', completed: false, category: 'routine' },
    { id: 'r-10', period: 'Evening', title: 'Plan Next Day Schedule & Wind down by 10:30 PM', completed: false, category: 'routine' },
  ],

  // 0 Activity History (Starts completely fresh)
  activityLogs: [],

  // GATE DATA SCIENCE & AI MODULE (ALL AT ZERO)
  gate: {
    targetScore: 85,
    targetAirRank: 100,
    dailyQuestionTarget: 35,
    dailyQuestionSolvedToday: 0,
    syllabus: [
      {
        id: 'gate-la',
        subject: 'Linear Algebra',
        icon: 'Grid',
        weightage: '12%',
        totalTopics: 6,
        completedTopics: 0,
        topics: [
          { id: 'la-1', name: 'Vector Spaces, Subspaces & Basis', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'la-2', name: 'Matrices, Determinants & System of Linear Equations', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'la-3', name: 'Eigenvalues & Eigenvectors', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'la-4', name: 'LU Decomposition & Orthogonal Matrices', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'la-5', name: 'Singular Value Decomposition (SVD)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'la-6', name: 'Principal Component Analysis (PCA) Math', status: 'Not Started', revisionCount: 0, notes: '' }
        ]
      },
      {
        id: 'gate-calc',
        subject: 'Calculus & Optimization',
        icon: 'TrendingUp',
        weightage: '10%',
        totalTopics: 5,
        completedTopics: 0,
        topics: [
          { id: 'calc-1', name: 'Functions of Single & Several Variables', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'calc-2', name: 'Partial Derivatives & Gradient Vector', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'calc-3', name: 'Maxima, Minima & Saddle Points', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'calc-4', name: 'Taylor Series & Vector Calculus', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'calc-5', name: 'Convex Optimization & Lagrange Multipliers', status: 'Not Started', revisionCount: 0, notes: '' }
        ]
      },
      {
        id: 'gate-prob',
        subject: 'Probability & Statistics',
        icon: 'Percent',
        weightage: '15%',
        totalTopics: 7,
        completedTopics: 0,
        topics: [
          { id: 'prob-1', name: 'Axioms of Probability & Conditional Probability', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prob-2', name: 'Discrete Random Variables (Binomial, Poisson, Geometric)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prob-3', name: 'Continuous Distributions (Uniform, Normal, Exponential)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prob-4', name: 'Joint Distributions & Covariance', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prob-5', name: 'Central Limit Theorem & Chebyshev Inequality', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prob-6', name: 'Hypothesis Testing (t-test, z-test, Chi-square)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prob-7', name: 'Maximum Likelihood Estimation (MLE)', status: 'Not Started', revisionCount: 0, notes: '' }
        ]
      },
      {
        id: 'gate-prog',
        subject: 'Programming, Data Structures & Algorithms',
        icon: 'Code',
        weightage: '18%',
        totalTopics: 6,
        completedTopics: 0,
        topics: [
          { id: 'prog-1', name: 'Python Basics & NumPy/Pandas Data Structures', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prog-2', name: 'Stacks, Queues & Linked Lists', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prog-3', name: 'Trees, Binary Search Trees & Heaps', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prog-4', name: 'Hashing & Hash Tables', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prog-5', name: 'Asymptotic Analysis & Divide & Conquer', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'prog-6', name: 'Dynamic Programming & Graph Algorithms', status: 'Not Started', revisionCount: 0, notes: '' }
        ]
      },
      {
        id: 'gate-dbms',
        subject: 'Database Management & SQL',
        icon: 'Database',
        weightage: '12%',
        totalTopics: 5,
        completedTopics: 0,
        topics: [
          { id: 'db-1', name: 'ER-Model & Relational Model', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'db-2', name: 'Relational Algebra & Tuple Calculus', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'db-3', name: 'SQL (Complex Queries, Joins, Group By, Subqueries)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'db-4', name: 'Normalization (1NF, 2NF, 3NF, BCNF)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'db-5', name: 'Indexing (B-Trees, B+ Trees) & Transactions', status: 'Not Started', revisionCount: 0, notes: '' }
        ]
      },
      {
        id: 'gate-ml',
        subject: 'Machine Learning',
        icon: 'Cpu',
        weightage: '20%',
        totalTopics: 7,
        completedTopics: 0,
        topics: [
          { id: 'ml-1', name: 'Supervised Learning: Linear & Logistic Regression', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ml-2', name: 'k-Nearest Neighbors (k-NN) & Naive Bayes', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ml-3', name: 'Decision Trees & Random Forests', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ml-4', name: 'Support Vector Machines (SVM)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ml-5', name: 'K-Means & Hierarchical Clustering', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ml-6', name: 'Multi-layer Perceptron (MLP) & Backpropagation', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ml-7', name: 'Model Evaluation & Cross-Validation Metrics', status: 'Not Started', revisionCount: 0, notes: '' }
        ]
      },
      {
        id: 'gate-ai',
        subject: 'Artificial Intelligence',
        icon: 'Sparkles',
        weightage: '13%',
        totalTopics: 4,
        completedTopics: 0,
        topics: [
          { id: 'ai-1', name: 'Uninformed Search (BFS, DFS, Uniform Cost)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ai-2', name: 'Informed / Heuristic Search (A*, Greedy Best-First)', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ai-3', name: 'Adversarial Search & Alpha-Beta Pruning', status: 'Not Started', revisionCount: 0, notes: '' },
          { id: 'ai-4', name: 'Propositional & First-Order Logic', status: 'Not Started', revisionCount: 0, notes: '' }
        ]
      }
    ],
    mockTests: []
  },

  // ACADEMIC PREPARATION MODULE (CLEAN ZERO STATE)
  academic: {
    semester: 'Semester 7',
    targetGpa: 9.2,
    currentEstimatedGpa: 0.0,
    courses: [
      { id: 'c-1', code: 'CS701', name: 'Operating Systems & Virtualization', credits: 4, faculty: 'Dr. Sharma', attendance: 0, targetGrade: 'A+', color: 'emerald' },
      { id: 'c-2', code: 'CS702', name: 'Computer Networks & Security', credits: 4, faculty: 'Prof. Verma', attendance: 0, targetGrade: 'A', color: 'teal' },
      { id: 'c-3', code: 'CS703', name: 'Distributed Systems & Cloud', credits: 3, faculty: 'Dr. Rao', attendance: 0, targetGrade: 'A+', color: 'cyan' },
      { id: 'c-4', code: 'CS704', name: 'Software Engineering & Agile', credits: 3, faculty: 'Prof. Nair', attendance: 0, targetGrade: 'O', color: 'green' }
    ],
    assignments: []
  },

  // JOB PREPARATION MODULE (CLEAN ZERO STATE)
  job: {
    targetOfferCount: 3,
    dsaSolvedCount: 0,
    dsaTargetCount: 300,
    dsaList: [],

    // DATA SCIENCE REVISION SUB-MODULE
    dsRevision: {
      totalTopics: 8,
      revisedCount: 0,
      topics: [
        {
          id: 'ds-rev-1',
          name: 'Supervised ML: Tree-Based Ensembles (XGBoost vs LightGBM vs CatBoost)',
          category: 'Machine Learning',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'Histogram-based binning in LightGBM, symmetric trees in CatBoost for categorical features, second-order Taylor expansion in XGBoost.',
          status: 'Not Started'
        },
        {
          id: 'ds-rev-2',
          name: 'Deep Learning: Transformer Architecture & Attention Mechanism',
          category: 'Deep Learning / GenAI',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'Scaled Dot-Product Attention: Softmax(QK^T / sqrt(d_k))V. Multi-head attention allows attending to information at different representation subspaces.',
          status: 'Not Started'
        },
        {
          id: 'ds-rev-3',
          name: 'SQL Query Optimization, Window Functions & CTEs',
          category: 'Data Engineering & SQL',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'ROW_NUMBER() vs RANK() vs DENSE_RANK(), LEAD/LAG, PARTITION BY, indexing strategies (B-Tree vs Hash), EXPLAIN query execution plan.',
          status: 'Not Started'
        },
        {
          id: 'ds-rev-4',
          name: 'A/B Testing & Statistical Experimentation in Product',
          category: 'Statistics & Product Sense',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'Sample size calculation using power analysis, minimum detectable effect (MDE), controlling for variance (CUPED), handling network effects and cannibalization.',
          status: 'Not Started'
        },
        {
          id: 'ds-rev-5',
          name: 'Feature Engineering & Imbalanced Classification Techniques',
          category: 'Machine Learning',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'SMOTE vs Tomek Links, Focal Loss, Cost-sensitive learning, Target encoding with cross-validation regularisation to prevent data leakage.',
          status: 'Not Started'
        },
        {
          id: 'ds-rev-6',
          name: 'Model Deployment, MLOps, Data Drift & Concept Drift',
          category: 'MLOps & Systems',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'KS-test / PSI for Population Stability Index, FastAPI + Docker containerization, ONNX runtime for low-latency inference, shadow deployments.',
          status: 'Not Started'
        },
        {
          id: 'ds-rev-7',
          name: 'Vector Databases, RAG Pipelines & Embeddings',
          category: 'Deep Learning / GenAI',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'Cosine similarity vs Dot product, HNSW indexing, chunking strategies, re-ranking with cross-encoders, hallucination mitigation.',
          status: 'Not Started'
        },
        {
          id: 'ds-rev-8',
          name: 'Dimensionality Reduction (t-SNE vs UMAP vs PCA)',
          category: 'Machine Learning',
          confidence: 0,
          lastRevised: null,
          nextRevisionDue: null,
          keyInterviewPoints: 'PCA preserves global linear variance; t-SNE preserves local neighborhood probabilities (Kullback-Leibler divergence); UMAP preserves both local & topological global structure.',
          status: 'Not Started'
        }
      ],
      flashcards: [
        {
          id: 'fc-1',
          question: 'What is the exact mathematical difference between L1 (Lasso) and L2 (Ridge) Regularization and why does L1 cause sparsity?',
          answer: 'L1 adds λ∑|w_i| to the loss, leading to diamond-shaped diamond constraint corners on the coordinate axes where the loss contours touch, driving coefficients strictly to zero. L2 adds λ∑w_i^2 (spherical constraint), shrinking weights towards zero without making them exactly zero.',
          topic: 'Machine Learning'
        },
        {
          id: 'fc-2',
          question: 'When should you choose Precision over Recall, and when should you choose Recall over Precision?',
          answer: 'Choose high Precision when False Positives are very costly (e.g. Email spam filter, YouTube recommendations). Choose high Recall when False Negatives are unacceptable (e.g. Cancer detection, Fraud detection, Terrorist threat detection).',
          topic: 'ML Metrics'
        },
        {
          id: 'fc-3',
          question: 'Explain the difference between DENSE_RANK() and RANK() in SQL.',
          answer: 'RANK() assigns duplicate ranks to ties and skips subsequent numbers (e.g. 1, 2, 2, 4). DENSE_RANK() assigns duplicate ranks to ties but does NOT skip numbers (e.g. 1, 2, 2, 3).',
          topic: 'SQL'
        },
        {
          id: 'fc-4',
          question: 'What is Data Drift vs Concept Drift?',
          answer: 'Data Drift (Covariate Shift) is when the input feature distribution P(X) changes over time while the mapping P(Y|X) remains constant. Concept Drift is when the underlying statistical relationship between input features and target variable P(Y|X) changes over time.',
          topic: 'MLOps'
        }
      ]
    },

    applications: []
  },

  // ENGLISH SPEAKING PREPARATION MODULE (CLEAN ZERO STATE)
  english: {
    dailyTargetMinutes: 20,
    minutesPracticedToday: 0,
    currentFluencyRating: 0.0,
    vocabulary: INITIAL_VOCABULARY.map(v => ({ ...v, status: 'Learning' })),
    sessions: []
  }
};
