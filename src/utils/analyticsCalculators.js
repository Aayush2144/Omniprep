// Utility functions to compute analytics across all preparation pillars

export const calculateOverallAnalytics = (data) => {
  const logs = data.activityLogs || [];
  const last7Days = logs.slice(-7);
  const last30Days = logs.slice(-30);

  // Total Hours
  const totalHoursAllTime = logs.reduce((acc, l) => acc + (l.total || 0), 0);
  const last7DaysHours = last7Days.reduce((acc, l) => acc + (l.total || 0), 0);
  const avgDailyHours7d = last7Days.length > 0 ? (last7DaysHours / last7Days.length).toFixed(1) : 0;

  // Category Total Hours (Last 30 Days)
  const gateTotal = last30Days.reduce((acc, l) => acc + (l.gate || 0), 0);
  const academicTotal = last30Days.reduce((acc, l) => acc + (l.academic || 0), 0);
  const jobTotal = last30Days.reduce((acc, l) => acc + (l.job || 0), 0);
  const englishTotal = last30Days.reduce((acc, l) => acc + (l.english || 0), 0);
  const sum30 = (gateTotal + academicTotal + jobTotal + englishTotal) || 1;

  const categoryDistribution = [
    { name: 'GATE DS & AI', hours: parseFloat(gateTotal.toFixed(1)), percentage: Math.round((gateTotal / sum30) * 100), color: '#6366f1' },
    { name: 'Academic Coursework', hours: parseFloat(academicTotal.toFixed(1)), percentage: Math.round((academicTotal / sum30) * 100), color: '#10b981' },
    { name: 'Job & DS Revision', hours: parseFloat(jobTotal.toFixed(1)), percentage: Math.round((jobTotal / sum30) * 100), color: '#f59e0b' },
    { name: 'English Speaking', hours: parseFloat(englishTotal.toFixed(1)), percentage: Math.round((englishTotal / sum30) * 100), color: '#f43f5e' }
  ];

  // Daily Trend Chart Data (Last 14 days)
  const dailyTrends = logs.slice(-14).map(l => ({
    date: l.date.slice(5), // 'MM-DD'
    fullDate: l.date,
    gate: l.gate,
    academic: l.academic,
    job: l.job,
    english: l.english,
    total: l.total
  }));

  // Pillar Balance Radar Data (Scale 0 - 100)
  // Calculate relative balance against ideal target proportions (e.g., GATE 35%, Acad 25%, Job 25%, English 15%)
  const gateScore = Math.min(100, Math.round((gateTotal / (30 * 2.5)) * 100));
  const academicScore = Math.min(100, Math.round((academicTotal / (30 * 2.0)) * 100));
  const jobScore = Math.min(100, Math.round((jobTotal / (30 * 2.0)) * 100));
  const englishScore = Math.min(100, Math.round((englishTotal / (30 * 0.75)) * 100));

  const radarBalance = [
    { subject: 'GATE DS/AI', score: gateScore, fullMark: 100 },
    { subject: 'Academics', score: academicScore, fullMark: 100 },
    { subject: 'Job & DS Rev', score: jobScore, fullMark: 100 },
    { subject: 'English Fluency', score: englishScore, fullMark: 100 },
    { subject: 'Habit Discipline', score: Math.round((data.profile.currentStreak / 30) * 100), fullMark: 100 }
  ];

  // Today's hours (Local Calendar Date)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayLog = logs.find(l => l.date === todayStr) || { gate: 0, academic: 0, job: 0, english: 0, total: 0 };

  return {
    totalHoursAllTime: totalHoursAllTime.toFixed(1),
    avgDailyHours7d,
    todayHours: todayLog.total || 0,
    categoryDistribution,
    dailyTrends,
    radarBalance,
    todayLog
  };
};

export const calculateGateAnalytics = (gateData, logs) => {
  const syllabus = gateData.syllabus || [];
  let totalTopics = 0;
  let completedTopics = 0;
  let inProgressTopics = 0;

  const subjectBreakdown = syllabus.map(sub => {
    const comp = sub.topics.filter(t => t.status === 'Completed').length;
    const prog = sub.topics.filter(t => t.status === 'In Progress').length;
    const total = sub.topics.length;
    totalTopics += total;
    completedTopics += comp;
    inProgressTopics += prog;

    const progressPct = total > 0 ? Math.round((comp / total) * 100) : 0;
    return {
      name: sub.subject,
      completed: comp,
      total,
      progressPct,
      revisions: sub.topics.reduce((acc, t) => acc + (t.revisionCount || 0), 0)
    };
  });

  const overallSyllabusProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Mock Test progression
  const mockScores = (gateData.mockTests || []).map(m => ({
    title: m.title.length > 18 ? m.title.slice(0, 18) + '...' : m.title,
    date: m.date.slice(5),
    score: m.score,
    total: m.total,
    percentage: Math.round((m.score / m.total) * 100),
    accuracy: m.accuracy,
    percentile: m.percentile
  }));

  // GATE Hours in last 14 days
  const gateStudyHistory = (logs || []).slice(-14).map(l => ({
    date: l.date.slice(5),
    hours: l.gate || 0
  }));

  return {
    totalTopics,
    completedTopics,
    inProgressTopics,
    overallSyllabusProgress,
    subjectBreakdown,
    mockScores,
    gateStudyHistory
  };
};

export const calculateAcademicAnalytics = (academicData, logs) => {
  const courses = academicData.courses || [];
  const assignments = academicData.assignments || [];

  const avgAttendance = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + c.attendance, 0) / courses.length)
    : 0;

  const completedAssignments = assignments.filter(a => a.status === 'Completed').length;
  const assignmentTurnaround = assignments.length > 0
    ? Math.round((completedAssignments / assignments.length) * 100)
    : 0;

  const attendanceData = courses.map(c => ({
    name: c.code,
    fullName: c.name,
    attendance: c.attendance,
    safeThreshold: 75
  }));

  const academicHistory = (logs || []).slice(-14).map(l => ({
    date: l.date.slice(5),
    hours: l.academic || 0
  }));

  return {
    avgAttendance,
    completedAssignments,
    totalAssignments: assignments.length,
    assignmentTurnaround,
    attendanceData,
    academicHistory
  };
};

export const calculateJobAnalytics = (jobData, logs) => {
  const dsaList = jobData.dsaList || [];
  const dsRevision = jobData.dsRevision || { topics: [], flashcards: [] };
  const apps = jobData.applications || [];

  // DSA Difficulty breakdown
  const easyCount = dsaList.filter(d => d.difficulty === 'Easy').length;
  const mediumCount = dsaList.filter(d => d.difficulty === 'Medium').length;
  const hardCount = dsaList.filter(d => d.difficulty === 'Hard').length;

  const dsaDifficultyData = [
    { name: 'Easy', count: easyCount, color: '#10b981' },
    { name: 'Medium', count: mediumCount, color: '#f59e0b' },
    { name: 'Hard', count: hardCount, color: '#ef4444' }
  ];

  // DS Revision Analytics
  const dsTopics = dsRevision.topics || [];
  const readyTopics = dsTopics.filter(t => t.status === 'Interview Ready').length;
  const revisionProgress = dsTopics.length > 0 ? Math.round((readyTopics / dsTopics.length) * 100) : 0;

  const dsConfidenceBuckets = [
    { rating: '⭐ 5 Mastered', count: dsTopics.filter(t => t.confidence === 5).length },
    { rating: '⭐ 4 Confident', count: dsTopics.filter(t => t.confidence === 4).length },
    { rating: '⭐ 3 Moderate', count: dsTopics.filter(t => t.confidence === 3).length },
    { rating: '⭐ 1-2 Needs Work', count: dsTopics.filter(t => t.confidence <= 2).length }
  ];

  // Application Pipeline
  const statusCounts = {
    Wishlist: apps.filter(a => a.status === 'Wishlist').length,
    Applied: apps.filter(a => a.status === 'Applied').length,
    OA: apps.filter(a => a.status === 'Online Assessment').length,
    Interview: apps.filter(a => a.status === 'Interview').length,
    Offer: apps.filter(a => a.status === 'Offer').length,
    Rejected: apps.filter(a => a.status === 'Rejected').length,
  };

  const applicationFunnel = [
    { stage: 'Wishlist', count: statusCounts.Wishlist, fill: '#64748b' },
    { stage: 'Applied', count: statusCounts.Applied, fill: '#3b82f6' },
    { stage: 'Online Test', count: statusCounts.OA, fill: '#8b5cf6' },
    { stage: 'Interview', count: statusCounts.Interview, fill: '#f59e0b' },
    { stage: 'Offer', count: statusCounts.Offer, fill: '#10b981' },
    { stage: 'Rejected', count: statusCounts.Rejected, fill: '#ef4444' },
  ];

  const jobHistory = (logs || []).slice(-14).map(l => ({
    date: l.date.slice(5),
    hours: l.job || 0
  }));

  return {
    totalDsaSolved: jobData.dsaSolvedCount || dsaList.length,
    dsaTarget: jobData.dsaTargetCount || 300,
    dsaDifficultyData,
    dsTopicsCount: dsTopics.length,
    readyTopics,
    revisionProgress,
    dsConfidenceBuckets,
    applicationFunnel,
    jobHistory
  };
};

export const calculateEnglishAnalytics = (englishData, logs) => {
  const sessions = englishData.sessions || [];
  const vocab = englishData.vocabulary || [];

  const totalMinutesSpoken = sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
  const avgFluency = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + (s.fluencyScore || 0), 0) / sessions.length).toFixed(1)
    : englishData.currentFluencyRating || 4.0;

  const fluencyProgression = sessions.slice().reverse().map(s => ({
    date: s.date.slice(5),
    fluency: s.fluencyScore,
    minutes: s.minutes,
    topic: s.topicTitle.length > 15 ? s.topicTitle.slice(0, 15) + '...' : s.topicTitle
  }));

  const vocabBreakdown = [
    { status: 'Mastered', count: vocab.filter(v => v.status === 'Mastered').length, color: '#10b981' },
    { status: 'Practicing', count: vocab.filter(v => v.status === 'Practicing').length, color: '#f59e0b' },
    { status: 'Learning', count: vocab.filter(v => v.status === 'Learning').length, color: '#6366f1' }
  ];

  const englishHistory = (logs || []).slice(-14).map(l => ({
    date: l.date.slice(5),
    hours: l.english || 0
  }));

  return {
    totalMinutesSpoken,
    avgFluency,
    totalVocab: vocab.length,
    fluencyProgression,
    vocabBreakdown,
    englishHistory
  };
};
