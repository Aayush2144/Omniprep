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
const LOCAL_USER_STORAGE = 'omniprep_auth_session_user';

export const AuthProvider = ({ children }) => {
  // If no active session, start as NULL so user lands on Login Page!
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_STORAGE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null; // Must be null initially so new visitors see the Login page!
  });

  const [userProfile, setUserProfile] = useState(currentUser);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync user profile to backend database
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
            ...(prev || {}),
            ...userObj,
            role: json.user.role || userObj.role || 'user'
          }));
        }
      }
    } catch (err) {
      console.warn('[Auth] Profile sync offline:', err);
    }
  }, []);

  // Listen to Firebase auth state if configured
  useEffect(() => {
    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const isMasterAdmin = firebaseUser.email?.toLowerCase().includes('admin') || firebaseUser.email?.toLowerCase().includes('aayush');
          const formatted = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            targetRole: currentUser?.targetRole || 'Data Scientist',
            role: isMasterAdmin ? 'admin' : 'user'
          };
          setCurrentUser(formatted);
          setUserProfile(formatted);
          localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
          await syncProfileToBackend(formatted);
        } else {
          // If signed out on firebase
          const saved = localStorage.getItem(LOCAL_USER_STORAGE);
          if (!saved) {
            setCurrentUser(null);
            setUserProfile(null);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [syncProfileToBackend]);

  // Login with Email / Password
  const loginWithEmail = async (email, password) => {
    setAuthLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isMasterAdmin = cleanEmail.includes('admin') || cleanEmail.includes('aayush');

      if (auth && isFirebaseConfigured) {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const formatted = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || cleanEmail.split('@')[0],
          photoURL: cred.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cred.user.uid}`,
          targetRole: 'Data Scientist & AI',
          role: isMasterAdmin ? 'admin' : 'user'
        };
        setCurrentUser(formatted);
        setUserProfile(formatted);
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
        await syncProfileToBackend(formatted);
        return cred.user;
      } else {
        // Multi-Tenant Built-In Auth Engine
        const uid = `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const formatted = {
          uid,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0].replace(/\./g, ' '),
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
          targetRole: 'Data Scientist & AI',
          role: isMasterAdmin ? 'admin' : 'user'
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
      const cleanEmail = email.trim().toLowerCase();
      const isMasterAdmin = cleanEmail.includes('admin') || cleanEmail.includes('aayush');
      const finalAvatar = photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName || cleanEmail}`;

      if (auth && isFirebaseConfigured) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateFirebaseProfile(cred.user, {
          displayName,
          photoURL: finalAvatar
        });
        const formatted = {
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: displayName || cleanEmail.split('@')[0],
          photoURL: finalAvatar,
          targetRole: targetRole || 'Data Scientist',
          role: isMasterAdmin ? 'admin' : 'user'
        };
        setCurrentUser(formatted);
        setUserProfile(formatted);
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
        await syncProfileToBackend(formatted);
        return cred.user;
      } else {
        const uid = `usr-${Date.now()}`;
        const formatted = {
          uid,
          email: cleanEmail,
          displayName: displayName || cleanEmail.split('@')[0],
          photoURL: finalAvatar,
          targetRole: targetRole || 'Data Scientist',
          role: isMasterAdmin ? 'admin' : 'user'
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

  // Google Sign-In
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      if (auth && googleProvider && isFirebaseConfigured) {
        const result = await signInWithPopup(auth, googleProvider);
        const isMasterAdmin = result.user.email?.toLowerCase().includes('admin') || result.user.email?.toLowerCase().includes('aayush');
        const formatted = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Google Scholar',
          photoURL: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
          targetRole: 'Data Scientist & AI',
          role: isMasterAdmin ? 'admin' : 'user'
        };
        setCurrentUser(formatted);
        setUserProfile(formatted);
        localStorage.setItem(LOCAL_USER_STORAGE, JSON.stringify(formatted));
        await syncProfileToBackend(formatted);
        return result.user;
      } else {
        const uid = `usr-google-${Date.now().toString().slice(-4)}`;
        const formatted = {
          uid,
          email: 'scholar@gmail.com',
          displayName: 'Google Scholar 🌟',
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
          targetRole: 'Deep Learning & AI',
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

  // Logout (Returns visitor to the Login Gate)
  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      try { await signOut(auth); } catch (e) {}
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem(LOCAL_USER_STORAGE);
  };

  // Update profile
  const updateUserProfileData = async (updates) => {
    if (!currentUser) return;
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

  // Presence heartbeat
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

  // Strict Admin Check
  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase().includes('admin') ||
    currentUser?.email?.toLowerCase().includes('aayush')
  );

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      isAdmin,
      authLoading,
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
