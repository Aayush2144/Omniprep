// Gamification Engine: XP Calculation, Leveling & Collectible Badges

export const calculateGamification = (data) => {
  if (!data) return { xp: 0, level: 1, title: 'Novice Scholar', nextLevelXp: 500, progressPct: 0, badges: [] };

  const logs = data.activityLogs || [];
  const totalHours = logs.reduce((sum, l) => sum + (l.total || 0), 0);
  const streak = data.profile?.currentStreak || 0;
  
  // GATE Topics completed
  const gateTopicsCompleted = (data.gate?.syllabus || []).reduce((sum, sub) => {
    return sum + (sub.topics || []).filter(t => t.status === 'Completed').length;
  }, 0);

  // DSA Solved
  const dsaCount = data.job?.dsaSolvedCount || (data.job?.dsaList || []).length || 0;

  // English Sessions
  const englishSessionsCount = (data.english?.sessions || []).length || 0;

  // Mock Tests
  const mockCount = (data.gate?.mockTests || []).length || 0;

  // XP Breakdown
  const studyXp = Math.round(totalHours * 100);
  const streakXp = streak * 150;
  const gateXp = gateTopicsCompleted * 50;
  const dsaXp = dsaCount * 75;
  const englishXp = englishSessionsCount * 60;
  const mockXp = mockCount * 120;

  const totalXp = studyXp + streakXp + gateXp + dsaXp + englishXp + mockXp;

  // Level Curve: Level = floor(sqrt(XP) / 4) + 1
  const level = Math.max(1, Math.floor(Math.sqrt(totalXp) / 4) + 1);
  const currentLevelMinXp = Math.pow((level - 1) * 4, 2);
  const nextLevelXp = Math.pow(level * 4, 2);
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelMinXp);
  const xpNeededForNext = Math.max(100, nextLevelXp - currentLevelMinXp);
  const progressPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  // Titles
  let title = 'Apprentice Scholar 🥉';
  if (level >= 20) title = 'OmniPrep Legend 🌟';
  else if (level >= 13) title = 'Grandmaster Scholar 👑';
  else if (level >= 8) title = 'Deep Learning Warrior ⚔️';
  else if (level >= 4) title = 'Dedicated Aspirant 🥈';

  // Badges Definitions & Unlock States
  const allBadges = [
    {
      id: 'first_step',
      name: 'First Step',
      icon: '🌱',
      desc: 'Logged your first study hour',
      unlocked: totalHours >= 1,
      tier: 'bronze'
    },
    {
      id: 'streak_7',
      name: 'Fire Starter',
      icon: '🔥',
      desc: 'Maintained a 7-day study streak',
      unlocked: streak >= 7,
      tier: 'gold'
    },
    {
      id: 'dsa_centurion',
      name: 'DSA Centurion',
      icon: '⚔️',
      desc: 'Solved 10+ Algorithm & Data Structure problems',
      unlocked: dsaCount >= 10,
      tier: 'purple'
    },
    {
      id: 'gate_master',
      name: 'GATE Conqueror',
      icon: '🎓',
      desc: 'Completed 15+ Core GATE syllabus topics',
      unlocked: gateTopicsCompleted >= 15,
      tier: 'blue'
    },
    {
      id: 'fluent_speaker',
      name: 'Fluent Orator',
      icon: '🎙️',
      desc: 'Completed 3+ AI English conversational practices',
      unlocked: englishSessionsCount >= 3,
      tier: 'rose'
    },
    {
      id: 'century_club',
      name: 'Century Club',
      icon: '💯',
      desc: 'Logged 100+ Total Focus Hours',
      unlocked: totalHours >= 100,
      tier: 'diamond'
    },
    {
      id: 'mock_champion',
      name: 'Test Veteran',
      icon: '🎯',
      desc: 'Attempted 3+ Full-Length Mock Exams',
      unlocked: mockCount >= 3,
      tier: 'amber'
    }
  ];

  const unlockedBadges = allBadges.filter(b => b.unlocked);

  return {
    totalXp,
    level,
    title,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPct,
    allBadges,
    unlockedBadges,
    stats: {
      totalHours,
      streak,
      gateTopicsCompleted,
      dsaCount,
      englishSessionsCount,
      mockCount
    }
  };
};
