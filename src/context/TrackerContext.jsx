import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_DATA } from '../data/initialData.js';
import { soundEngine } from '../utils/audioSynth.js';

const TrackerContext = createContext(null);
const LOCAL_STORAGE_KEY = 'omniprep_tracker_state_v3';

export const TrackerProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_DATA;
  });

  const [dbStatus, setDbStatus] = useState('connecting'); // 'connecting' | 'connected' | 'saving' | 'offline'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analyticsCategory, setAnalyticsCategory] = useState('overall'); // 'overall' | 'gate' | 'academic' | 'job' | 'english'
  
  // Global Focus Timer State
  const [timerState, setTimerState] = useState({
    isOpen: false,
    isRunning: false,
    category: 'gate',
    durationSec: 25 * 60,
    remainingSec: 25 * 60,
    mode: 'pomodoro',
    ambientSound: 'off',
    sessionNotes: ''
  });

  const syncTimeoutRef = useRef(null);

  // 1. Initial Load: Fetch from SQLite Backend Database
  useEffect(() => {
    const fetchFromDb = async () => {
      try {
        setDbStatus('connecting');
        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            setData(json.data);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
            setDbStatus('connected');
            return;
          }
        }
      } catch (err) {
        console.warn('[Database] API server offline, using local storage cache:', err);
      }
      setDbStatus('offline');
    };

    fetchFromDb();
  }, []);

  // 2. Real-time Persistence: Save to LocalStorage + Sync to SQLite Backend Database
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}

    // Debounce sync to backend database (500ms)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setDbStatus('saving');
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
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
  }, [data]);

  // Global Timer Interval Tick
  useEffect(() => {
    let interval = null;
    if (timerState.isRunning && timerState.remainingSec > 0) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.remainingSec <= 1) {
            soundEngine.playCompletionChime();
            soundEngine.stopAmbient();
            logFocusSession(prev.category, prev.durationSec / 3600);
            return {
              ...prev,
              isRunning: false,
              remainingSec: 0,
              ambientSound: 'off'
            };
          }
          return { ...prev, remainingSec: prev.remainingSec - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.remainingSec]);

  // Handler: Log completed focus session into today's activity log
  const logFocusSession = (category, hours) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const roundedHours = parseFloat(hours.toFixed(2));

    setData(prev => {
      const logs = [...(prev.activityLogs || [])];
      const todayIndex = logs.findIndex(l => l.date === todayStr);

      if (todayIndex >= 0) {
        const current = logs[todayIndex];
        const newCatHours = parseFloat(((current[category] || 0) + roundedHours).toFixed(2));
        const newTotal = parseFloat(((current.total || 0) + roundedHours).toFixed(2));
        logs[todayIndex] = {
          ...current,
          [category]: newCatHours,
          total: newTotal
        };
      } else {
        logs.push({
          date: todayStr,
          gate: category === 'gate' ? roundedHours : 0,
          academic: category === 'academic' ? roundedHours : 0,
          job: category === 'job' ? roundedHours : 0,
          english: category === 'english' ? roundedHours : 0,
          total: roundedHours,
          tasksCompleted: 1,
          streakActive: true
        });
      }

      let updatedEnglish = prev.english;
      if (category === 'english') {
        const addedMins = Math.round(hours * 60);
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

  // Reset to Clean Zero State (both in memory and database)
  const resetToZeroData = async () => {
    if (window.confirm('Reset all analytics and routine logs to ZERO fresh state?')) {
      setData(INITIAL_DATA);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      try {
        await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(INITIAL_DATA)
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
    a.download = `omniprep_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && imported.profile) {
          setData(imported);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(imported));
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imported)
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
