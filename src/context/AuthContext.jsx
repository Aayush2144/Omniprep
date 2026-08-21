import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged
} from '../config/firebase.js';

const AuthContext = createContext(null);
const LOCAL_USER_STORAGE = 'omniprep_auth_user_v2';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_STORAGE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default Guest / Scholar
    return {
      uid: 'scholar-local-1',
      email: 'scholar@omniprep.io',
      displayName: 'Aayush Kumar 🚀',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aayush',
      targetRole: 'Data Scientist & AI Engineer',
      role: 'admin'
    };
  });

  const [userProfile, setUserProfile] = useState(currentUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const heartbeatIntervalRef = useRef(null);

  // Sync profile to backend whenever user changes
  const syncProfileToBackend = useCallback(async (userObj) => {
    if (!userObj || !userObj.uid) return;
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUserProfile(prev => ({
            ...prev,
            ...userObj,
            role: json.user.role || userObj.role || 'user'
          }));
        }
      }
    } catch (err) {
      console.warn('[Auth] Backend profile sync offline, cached locally:', err);
    }
  }, []);

  // Listen to Firebase Auth state if configured
  useEffect(() => {
    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const formatted = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Prep Scholar',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            targetRole: currentUser?.targetRole || 'Data Scientist',
            role: firebaseUser.email?.includes('admin') ? 'admin' : 'user'
          };
          setCurrentUser(formatted);
          setUserProfile(formatted);
          localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
          await syncProfileToBackend(formatted);
        }
      });
      return () => unsubscribe();
    } else {
      // Sync initial local user
      syncProfileToBackend(currentUser);
    }
  }, [syncProfileToBackend]);

  // Login with Email / Password
  const loginWithEmail = async (email, password) => {
    setAuthLoading(true);
    try {
      if (auth && isFirebaseConfigured) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
      } else {
        // Instant Multi-User Local Switcher
        const uid = `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const formatted = {
          uid,
          email,
          displayName: email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
          targetRole: 'Data Scientist & AI',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'user'
        };
        setCurrentUser(formatted);
        setUserProfile(formatted);
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
        await syncProfileToBackend(formatted);
        return formatted;
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Signup with Email / Password
  const signupWithEmail = async (email, password, displayName, targetRole, photoURL) => {
    setAuthLoading(true);
    try {
      const finalAvatar = photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName || email}`;
      if (auth && isFirebaseConfigured) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateFirebaseProfile(cred.user, {
          displayName,
          photoURL: finalAvatar
        });
        const formatted = {
          uid: cred.user.uid,
          email,
          displayName,
          photoURL: finalAvatar,
          targetRole: targetRole || 'Data Scientist',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'user'
        };
        setCurrentUser(formatted);
        setUserProfile(formatted);
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
        await syncProfileToBackend(formatted);
        return cred.user;
      } else {
        const uid = `user-${Date.now()}`;
        const formatted = {
          uid,
          email,
          displayName: displayName || email.split('@')[0],
          photoURL: finalAvatar,
          targetRole: targetRole || 'Data Scientist',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'user'
        };
        setCurrentUser(formatted);
        setUserProfile(formatted);
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
        await syncProfileToBackend(formatted);
        return formatted;
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      if (auth && googleProvider && isFirebaseConfigured) {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } else {
        const uid = `google-demo-${Date.now().toString().slice(-4)}`;
        const formatted = {
          uid,
          email: 'google.scholar@gmail.com',
          displayName: 'Google AI Scholar 🌟',
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
          targetRole: 'Deep Learning Researcher',
          role: 'user'
        };
        setCurrentUser(formatted);
        setUserProfile(formatted);
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
        await syncProfileToBackend(formatted);
        return formatted;
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
    const guestUser = {
      uid: `scholar-guest-${Date.now().toString().slice(-4)}`,
      email: 'guest@omniprep.io',
      displayName: 'Guest Scholar',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest',
      targetRole: 'Data Scientist',
      role: 'user'
    };
    setCurrentUser(guestUser);
    setUserProfile(guestUser);
    localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(guestUser));
    await syncProfileToBackend(guestUser);
  };

  // Update profile data
  const updateUserProfileData = async (updates) => {
    const updated = {
      ...currentUser,
      ...userProfile,
      ...updates
    };
    setCurrentUser(updated);
    setUserProfile(updated);
    localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(updated));
    await syncProfileToBackend(updated);
  };

  // Real-time presence heartbeat ("Who is Studying Live")
  const sendPresenceHeartbeat = useCallback(async (presenceData) => {
    if (!currentUser?.uid) return;
    try {
      await fetch('/api/user/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          presence: presenceData
        })
      });
    } catch (e) {}
  }, [currentUser?.uid]);

  const isAdmin = userProfile?.role === 'admin' || currentUser?.role === 'admin' || currentUser?.email?.toLowerCase().includes('admin');

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      isAdmin,
      isFirebaseConfigured,
      authLoading,
      isAuthModalOpen,
      setIsAuthModalOpen,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      logout,
      updateUserProfileData,
      sendPresenceHeartbeat
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
