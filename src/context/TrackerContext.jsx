import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_DATA } from '../data/initialData.js';
import { soundEngine } from '../utils/audioSynth.js';
import { useAuth } from './AuthContext.jsx';
import { pipOverlay } from '../utils/pipOverlay.js';

const TrackerContext = createContext(null);

export const TrackerProvider = ({ children }) => {
  const { currentUser, sendPresenceHeartbeat } = useAuth();
  const userId = currentUser?.uid || 'default-user';
  const userStorageKey = `omniprep_state_${userId}`;

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_DATA;
  });

  const [dbStatus, setDbStatus] = useState('connecting'); // 'connecting' | 'connected' | 'saving' | 'offline'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'gate' | 'academic' | 'job' | 'english' | 'analytics' | 'community' | 'admin'
  const [analyticsCategory, setAnalyticsCategory] = useState('overall');
  
  // Global Focus & Pomodoro Timer State
  const [timerState, setTimerState] = useState(() => {
    // Attempt to recover running timer if browser crashed/closed
    const defaultTimer = {
      isOpen: false,
      isRunning: false,
      category: 'gate',
      mode: 'focus', // 'focus' | 'shortBreak' | 'longBreak'
      focusDurationMin: 25,
      breakDurationMin: 5,
      longBreakDurationMin: 15,
      cyclesBeforeLongBreak: 4,
      currentCycle: 1,
      durationSec: 25 * 60,
      remainingSec: 25 * 60,
      targetEndTime: null, // Wall-clock timestamp for background tab preservation
      autoStartBreaks: false,
      autoStartFocus: false,
      ambientSound: 'off',
      sessionNotes: '',
      isPipActive: false,
    };

    try {
      const savedTimer = localStorage.getItem('omniprep_active_timer_state');
      if (savedTimer) {
        const parsed = JSON.parse(savedTimer);
        if (parsed.isRunning && parsed.targetEndTime) {
          const now = Date.now();
          const leftSec = Math.max(0, Math.round((parsed.targetEndTime - now) / 1000));
          return {
            ...parsed,
            remainingSec: leftSec,
            isRunning: leftSec > 0,
          };
        }
        return { ...parsed, isRunning: false };
      }
    } catch (_) {}
    return defaultTimer;
  });

  const syncTimeoutRef = useRef(null);

  // 1. Initial Load when User changes: Fetch isolated state from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setDbStatus('connecting');
        const res = await fetch(`/api/user/data?userId=${userId}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            setData(json.data);
            localStorage.setItem(userStorageKey, JSON.stringify(json.data));
            setDbStatus('connected');
            return;
          }
        }
      } catch (err) {
        console.warn('[Database] User state fetch fallback to cache:', err);
      }
      setDbStatus('offline');
    };

    fetchUserData();
  }, [userId, userStorageKey]);

  // 2. Real-time Multi-Tenant Sync: Save to LocalStorage + Sync to SQLite Backend Database
  useEffect(() => {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(data));
    } catch (e) {}

    // Debounce sync to backend database (400ms)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setDbStatus('saving');
        const res = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            state: data
          })
        });
        if (res.ok) {
          setDbStatus('connected');
        } else {
          setDbStatus('offline');
        }
      } catch (err) {
        setDbStatus('offline');
      }
    }, 400);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [data, userId, userStorageKey]);

  // 3. Heartbeat for "Who is Studying Live" Presence
  useEffect(() => {
    sendPresenceHeartbeat({
      isStudying: timerState.isRunning,
      category: timerState.category,
      task: timerState.sessionNotes || `${timerState.category.toUpperCase()} Focus Session`,
      remainingSec: timerState.remainingSec
    });

    // Send ongoing heartbeat every 45 seconds if studying
    let interval = null;
    if (timerState.isRunning) {
      interval = setInterval(() => {
        sendPresenceHeartbeat({
          isStudying: true,
          category: timerState.category,
          task: timerState.sessionNotes || `${timerState.category.toUpperCase()} Focus Session`,
          remainingSec: timerState.remainingSec
        });
      }, 45000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.category, timerState.sessionNotes, timerState.remainingSec, sendPresenceHeartbeat]);

  // Persist timer state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('omniprep_active_timer_state', JSON.stringify(timerState));
    } catch (_) {}
    // Update PiP Canvas frame if active
    if (timerState.isPipActive) {
      pipOverlay.update(timerState);
    }
  }, [timerState]);

  // Document Visibility Change Handler: Immediately catch-up timer when returning to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerState.isRunning && timerState.targetEndTime) {
        const now = Date.now();
        const leftSec = Math.max(0, Math.round((timerState.targetEndTime - now) / 1000));
        setTimerState(prev => {
          if (leftSec <= 0) {
            // Timer expired while user was in another tab
            soundEngine.playCompletionChime();
            soundEngine.stopAmbient();
            if (prev.mode === 'focus') {
              logFocusSession(prev.category, prev.durationSec / 3600);
              const isLongBreak = (prev.currentCycle || 1) >= (prev.cyclesBeforeLongBreak || 4);
              const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
              const nextDurationSec = (isLongBreak ? (prev.longBreakDurationMin || 15) : (prev.breakDurationMin || 5)) * 60;
              const nextCycle = isLongBreak ? 1 : ((prev.currentCycle || 1) + 1);
              return {
                ...prev,
                mode: nextMode,
                durationSec: nextDurationSec,
                remainingSec: nextDurationSec,
                targetEndTime: prev.autoStartBreaks ? Date.now() + nextDurationSec * 1000 : null,
                currentCycle: nextCycle,
                isRunning: Boolean(prev.autoStartBreaks),
                ambientSound: 'off'
              };
            } else {
              const nextDurationSec = (prev.focusDurationMin || 25) * 60;
              return {
                ...prev,
                mode: 'focus',
                durationSec: nextDurationSec,
                remainingSec: nextDurationSec,
                targetEndTime: prev.autoStartFocus ? Date.now() + nextDurationSec * 1000 : null,
                isRunning: Boolean(prev.autoStartFocus),
                ambientSound: 'off'
              };
            }
          }
          return { ...prev, remainingSec: leftSec };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [timerState.isRunning, timerState.targetEndTime]);

  // Global Timer Interval Tick (Synchronized to Date.now() wall-clock)
  useEffect(() => {
    let interval = null;
    if (timerState.isRunning) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (!prev.isRunning) return prev;

          // Compute exact remaining seconds based on wall-clock targetEndTime
          let currentRemaining = prev.remainingSec;
          if (prev.targetEndTime) {
            const now = Date.now();
            currentRemaining = Math.max(0, Math.round((prev.targetEndTime - now) / 1000));
          } else {
            currentRemaining = Math.max(0, prev.remainingSec - 1);
          }

          if (currentRemaining <= 0) {
            soundEngine.playCompletionChime();
            soundEngine.stopAmbient();

            if (prev.mode === 'focus') {
              logFocusSession(prev.category, prev.durationSec / 3600);

              const isLongBreak = (prev.currentCycle || 1) >= (prev.cyclesBeforeLongBreak || 4);
              const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
              const nextDurationSec = (isLongBreak ? (prev.longBreakDurationMin || 15) : (prev.breakDurationMin || 5)) * 60;
              const nextCycle = isLongBreak ? 1 : ((prev.currentCycle || 1) + 1);

              return {
                ...prev,
                mode: nextMode,
                durationSec: nextDurationSec,
                remainingSec: nextDurationSec,
                targetEndTime: prev.autoStartBreaks ? Date.now() + nextDurationSec * 1000 : null,
                currentCycle: nextCycle,
                isRunning: Boolean(prev.autoStartBreaks),
                ambientSound: 'off'
              };
            } else {
              const nextDurationSec = (prev.focusDurationMin || 25) * 60;
              return {
                ...prev,
                mode: 'focus',
                durationSec: nextDurationSec,
                remainingSec: nextDurationSec,
                targetEndTime: prev.autoStartFocus ? Date.now() + nextDurationSec * 1000 : null,
                isRunning: Boolean(prev.autoStartFocus),
                ambientSound: 'off'
              };
            }
          }
          return { ...prev, remainingSec: currentRemaining };
        });
      }, 500); // 500ms for extra precision
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning]);

  // Handler: Log completed focus session into today's activity log
  const logFocusSession = (category, hours) => {
    // Treat any non-empty category or fallback to 'gate'
    const cleanCat = ['gate', 'academic', 'job', 'english'].includes(category) ? category : 'gate';
    // Allow even 15-20 seconds to log as fractional hours so user's work is never lost
    const parsedHours = Math.max(0.01, parseFloat(hours.toFixed(4)));
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    setData(prev => {
      const logs = [...(prev.activityLogs || [])];
      const todayIndex = logs.findIndex(l => l.date === todayStr);

      if (todayIndex >= 0) {
        const current = logs[todayIndex];
        const newCatHours = parseFloat(((current[cleanCat] || 0) + parsedHours).toFixed(3));
        const newTotal = parseFloat(((current.total || 0) + parsedHours).toFixed(3));
        logs[todayIndex] = {
          ...current,
          [cleanCat]: newCatHours,
          total: newTotal
        };
      } else {
        logs.push({
          date: todayStr,
          gate: cleanCat === 'gate' ? parsedHours : 0,
          academic: cleanCat === 'academic' ? parsedHours : 0,
          job: cleanCat === 'job' ? parsedHours : 0,
          english: cleanCat === 'english' ? parsedHours : 0,
          total: parsedHours,
          tasksCompleted: 1,
          streakActive: true
        });
      }

      let updatedEnglish = prev.english;
      if (cleanCat === 'english') {
        const addedMins = Math.max(1, Math.round(parsedHours * 60));
        updatedEnglish = {
          ...prev.english,
          minutesPracticedToday: (prev.english?.minutesPracticedToday || 0) + addedMins
        };
      }

      return {
        ...prev,
        activityLogs: logs,
        english: updatedEnglish
      };
    });
  };

  const updateProfile = (updates) => {
    setData(prev => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  };

  const toggleRoutine = (id) => {
    soundEngine.playClickSound();
    setData(prev => {
      const updated = (prev.dailyRoutines || []).map(r => r.id === id ? { ...r, completed: !r.completed } : r);
      return { ...prev, dailyRoutines: updated };
    });
  };

  const addRoutine = (period, title, category) => {
    const newRoutine = {
      id: `r-${Date.now()}`,
      period,
      title,
      completed: false,
      category: category || 'routine'
    };
    setData(prev => ({
      ...prev,
      dailyRoutines: [...(prev.dailyRoutines || []), newRoutine]
    }));
  };

  const deleteRoutine = (id) => {
    setData(prev => ({
      ...prev,
      dailyRoutines: (prev.dailyRoutines || []).filter(r => r.id !== id)
    }));
  };

  const toggleGateTopic = (subjectId, topicId, nextStatus) => {
    soundEngine.playClickSound();
    setData(prev => {
      const updatedSyllabus = (prev.gate?.syllabus || []).map(sub => {
        if (sub.id !== subjectId) return sub;
        const updatedTopics = sub.topics.map(t => {
          if (t.id !== topicId) return t;
          return {
            ...t,
            status: nextStatus || (t.status === 'Completed' ? 'In Progress' : t.status === 'In Progress' ? 'Not Started' : 'Completed'),
            revisionCount: (nextStatus === 'Completed' || t.status !== 'Completed') ? (t.revisionCount + 1) : t.revisionCount
          };
        });
        const completedCount = updatedTopics.filter(t => t.status === 'Completed').length;
        return {
          ...sub,
          topics: updatedTopics,
          completedTopics: completedCount
        };
      });
      return {
        ...prev,
        gate: { ...prev.gate, syllabus: updatedSyllabus }
      };
    });
  };

  const updateGateTopicNotes = (subjectId, topicId, notes) => {
    setData(prev => {
      const updatedSyllabus = (prev.gate?.syllabus || []).map(sub => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          topics: sub.topics.map(t => t.id === topicId ? { ...t, notes } : t)
        };
      });
      return { ...prev, gate: { ...prev.gate, syllabus: updatedSyllabus } };
    });
  };

  const addGateMockTest = (mock) => {
    setData(prev => ({
      ...prev,
      gate: {
        ...prev.gate,
        mockTests: [
          {
            id: `m-${Date.now()}`,
            ...mock,
            accuracy: parseFloat(((mock.score / mock.total) * 100).toFixed(1))
          },
          ...(prev.gate?.mockTests || [])
        ]
      }
    }));
  };

  const incrementGateQuestions = (count = 1) => {
    setData(prev => ({
      ...prev,
      gate: {
        ...prev.gate,
        dailyQuestionSolvedToday: (prev.gate?.dailyQuestionSolvedToday || 0) + count
      }
    }));
  };

  const addCourse = (course) => {
    setData(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        courses: [...(prev.academic?.courses || []), { id: `c-${Date.now()}`, ...course }]
      }
    }));
  };

  const updateCourseAttendance = (courseId, attendance) => {
    setData(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        courses: (prev.academic?.courses || []).map(c => c.id === courseId ? { ...c, attendance: Number(attendance) } : c)
      }
    }));
  };

  const updateAcademicGpa = (currentGpa, goalGpa) => {
    setData(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        currentEstimatedGpa: parseFloat(Number(currentGpa).toFixed(2)),
        targetGpa: parseFloat(Number(goalGpa).toFixed(2))
      }
    }));
  };

  const addAssignment = (assignment) => {
    setData(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        assignments: [
          { id: `a-${Date.now()}`, ...assignment, status: 'Pending', grade: null },
          ...(prev.academic?.assignments || [])
        ]
      }
    }));
  };

  const toggleAssignmentStatus = (id) => {
    soundEngine.playClickSound();
    setData(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        assignments: (prev.academic?.assignments || []).map(a => a.id === id ? {
          ...a,
          status: a.status === 'Completed' ? 'Pending' : 'Completed'
        } : a)
      }
    }));
  };

  const addDsaProblem = (problem) => {
    setData(prev => ({
      ...prev,
      job: {
        ...prev.job,
        dsaSolvedCount: (prev.job?.dsaSolvedCount || 0) + 1,
        dsaList: [
          { id: `dsa-${Date.now()}`, ...problem, solvedDate: new Date().toISOString().split('T')[0] },
          ...(prev.job?.dsaList || [])
        ]
      }
    }));
  };

  const updateDsRevisionTopic = (topicId, updates) => {
    setData(prev => {
      const currentTopics = prev.job?.dsRevision?.topics || [];
      const updatedTopics = currentTopics.map(t => t.id === topicId ? { ...t, ...updates } : t);
      const readyCount = updatedTopics.filter(t => t.status === 'Interview Ready').length;

      return {
        ...prev,
        job: {
          ...prev.job,
          dsRevision: {
            ...prev.job?.dsRevision,
            topics: updatedTopics,
            revisedCount: readyCount
          }
        }
      };
    });
  };

  const addDsRevisionTopic = (topic) => {
    setData(prev => {
      const currentTopics = prev.job?.dsRevision?.topics || [];
      const newTopic = {
        id: `ds-rev-${Date.now()}`,
        ...topic,
        lastRevised: new Date().toISOString().split('T')[0],
        confidence: topic.confidence || 4,
        status: topic.status || 'Interview Ready'
      };
      const allTopics = [newTopic, ...currentTopics];
      return {
        ...prev,
        job: {
          ...prev.job,
          dsRevision: {
            ...prev.job?.dsRevision,
            topics: allTopics,
            totalTopics: allTopics.length,
            revisedCount: allTopics.filter(t => t.status === 'Interview Ready').length
          }
        }
      };
    });
  };

  const addDsFlashcard = (card) => {
    setData(prev => ({
      ...prev,
      job: {
        ...prev.job,
        dsRevision: {
          ...prev.job?.dsRevision,
          flashcards: [
            { id: `fc-${Date.now()}`, ...card },
            ...(prev.job?.dsRevision?.flashcards || [])
          ]
        }
      }
    }));
  };

  const addJobApplication = (app) => {
    setData(prev => ({
      ...prev,
      job: {
        ...prev.job,
        applications: [
          { id: `job-${Date.now()}`, ...app, appliedDate: new Date().toISOString().split('T')[0] },
          ...(prev.job?.applications || [])
        ]
      }
    }));
  };

  const updateJobAppStatus = (appId, status) => {
    setData(prev => ({
      ...prev,
      job: {
        ...prev.job,
        applications: (prev.job?.applications || []).map(a => a.id === appId ? { ...a, status } : a)
      }
    }));
  };

  const deleteJobApplication = (appId) => {
    setData(prev => ({
      ...prev,
      job: {
        ...prev.job,
        applications: (prev.job?.applications || []).filter(a => a.id !== appId)
      }
    }));
  };

  const deleteRejectedApplications = () => {
    setData(prev => ({
      ...prev,
      job: {
        ...prev.job,
        applications: (prev.job?.applications || []).filter(a => a.status !== 'Rejected')
      }
    }));
  };

  const addEnglishSession = (session) => {
    setData(prev => ({
      ...prev,
      english: {
        ...prev.english,
        minutesPracticedToday: (prev.english?.minutesPracticedToday || 0) + Number(session.minutes),
        sessions: [
          { id: `es-${Date.now()}`, ...session, date: new Date().toISOString().split('T')[0] },
          ...(prev.english?.sessions || [])
        ]
      }
    }));
  };

  const addVocabularyWord = (wordObj) => {
    setData(prev => ({
      ...prev,
      english: {
        ...prev.english,
        vocabulary: [
          { id: `v-${Date.now()}`, ...wordObj, dateAdded: new Date().toISOString().split('T')[0] },
          ...(prev.english?.vocabulary || [])
        ]
      }
    }));
  };

  const updateVocabStatus = (vocabId, status) => {
    setData(prev => ({
      ...prev,
      english: {
        ...prev.english,
        vocabulary: (prev.english?.vocabulary || []).map(v => v.id === vocabId ? { ...v, status } : v)
      }
    }));
  };

  const resetToZeroData = async () => {
    if (window.confirm('Reset all analytics and routine logs to ZERO fresh state for your account?')) {
      setData(INITIAL_DATA);
      localStorage.setItem(userStorageKey, JSON.stringify(INITIAL_DATA));
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, state: INITIAL_DATA })
        });
      } catch (e) {}
    }
  };

  const exportDataJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omniprep_backup_${currentUser?.displayName?.replace(/\s+/g, '_') || 'user'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && (imported.profile || imported.gate)) {
          setData(imported);
          localStorage.setItem(userStorageKey, JSON.stringify(imported));
          await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, state: imported })
          });
          alert('Database restored successfully from backup!');
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <TrackerContext.Provider value={{
      data,
      dbStatus,
      activeTab,
      setActiveTab,
      analyticsCategory,
      setAnalyticsCategory,
      timerState,
      setTimerState,
      logFocusSession,
      updateProfile,
      toggleRoutine,
      addRoutine,
      deleteRoutine,
      toggleGateTopic,
      updateGateTopicNotes,
      addGateMockTest,
      incrementGateQuestions,
      addCourse,
      updateCourseAttendance,
      updateAcademicGpa,
      addAssignment,
      toggleAssignmentStatus,
      addDsaProblem,
      updateDsRevisionTopic,
      addDsRevisionTopic,
      addDsFlashcard,
      addJobApplication,
      updateJobAppStatus,
      deleteJobApplication,
      deleteRejectedApplications,
      addEnglishSession,
      addVocabularyWord,
      updateVocabStatus,
      resetToZeroData,
      exportDataJson,
      importDataJson
    }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
