import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isMock } from '../firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Storage keys
const STORAGE_CACHE_KEY = 'auth_user_cache';
const REMEMBER_KEY = 'remember_me';
const MOCK_CURRENT_USER_KEY = 'mock_current_user';
const MOCK_USERS_KEY = 'mock_users';

/**
 * Reads the synchronous initial user session from storage.
 * Prioritizes localStorage if 'remember_me' is true, else sessionStorage.
 */
function getStoredUser() {
  try {
    const isRemembered = localStorage.getItem(REMEMBER_KEY) === 'true';
    
    // Check local storage first if rememberMe is set
    if (isRemembered) {
      const localCached = localStorage.getItem(STORAGE_CACHE_KEY) || localStorage.getItem(MOCK_CURRENT_USER_KEY);
      if (localCached) return JSON.parse(localCached);
    }

    // Check session storage (for non-remembered active tab sessions)
    const sessionCached = sessionStorage.getItem(STORAGE_CACHE_KEY) || sessionStorage.getItem(MOCK_CURRENT_USER_KEY);
    if (sessionCached) return JSON.parse(sessionCached);

    // Fallback: check localStorage even if remember flag wasn't explicitly written
    const fallbackLocal = localStorage.getItem(STORAGE_CACHE_KEY) || localStorage.getItem(MOCK_CURRENT_USER_KEY);
    if (fallbackLocal) return JSON.parse(fallbackLocal);

    return null;
  } catch (e) {
    console.warn("Failed to load cached user session:", e);
    return null;
  }
}

/**
 * Saves the user profile into the appropriate storage depending on rememberMe choice.
 */
function persistUserToStorage(userObj, rememberMe = true) {
  if (!userObj) {
    localStorage.removeItem(STORAGE_CACHE_KEY);
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
    sessionStorage.removeItem(STORAGE_CACHE_KEY);
    sessionStorage.removeItem(MOCK_CURRENT_USER_KEY);
    return;
  }

  const serialized = JSON.stringify(userObj);

  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, 'true');
    localStorage.setItem(STORAGE_CACHE_KEY, serialized);
    localStorage.setItem(MOCK_CURRENT_USER_KEY, serialized);
    sessionStorage.removeItem(STORAGE_CACHE_KEY);
    sessionStorage.removeItem(MOCK_CURRENT_USER_KEY);
    sessionStorage.removeItem(REMEMBER_KEY);
  } else {
    sessionStorage.setItem(REMEMBER_KEY, 'false');
    sessionStorage.setItem(STORAGE_CACHE_KEY, serialized);
    sessionStorage.setItem(MOCK_CURRENT_USER_KEY, serialized);
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(STORAGE_CACHE_KEY);
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
  }
}

export function AuthProvider({ children }) {
  // Synchronously initialize currentUser so page navigation / refresh never flashes null or triggers false logout
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => !getStoredUser());

  // Helper: Mock Database setup
  const getMockUsers = () => JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '{}');
  const setMockUsers = (users) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

  const isRememberEnabled = () => {
    return localStorage.getItem(REMEMBER_KEY) === 'true';
  };

  useEffect(() => {
    if (isMock) {
      const savedUser = getStoredUser();
      if (savedUser) {
        setCurrentUser(savedUser);
      }
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          let fullUser;
          if (userDoc.exists()) {
            fullUser = { 
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || userDoc.data().displayName,
              photoURL: user.photoURL || userDoc.data().photoURL,
              ...userDoc.data() 
            };
          } else {
            fullUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || null,
              role: null,
              onboardingCompleted: false
            };
          }

          setCurrentUser(fullUser);
          persistUserToStorage(fullUser, isRememberEnabled());
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          // Retain cached user if Firestore read fails
          const cached = getStoredUser();
          if (cached && cached.uid === user.uid) {
            setCurrentUser(cached);
          } else {
            const fallbackUser = { uid: user.uid, email: user.email, displayName: user.displayName };
            setCurrentUser(fallbackUser);
            persistUserToStorage(fallbackUser, isRememberEnabled());
          }
        }
      } else {
        // If not in local persistence and session ended, clear state
        if (!isRememberEnabled() && !sessionStorage.getItem(STORAGE_CACHE_KEY)) {
          setCurrentUser(null);
          persistUserToStorage(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────

  // Signup
  const signup = async (email, password, displayName, rememberMe = true) => {
    setLoading(true);
    try {
      if (isMock) {
        const users = getMockUsers();
        if (users[email]) throw new Error("Email already exists.");

        const uid = 'mock_' + Math.random().toString(36).substr(2, 9);
        const newUser = {
          uid,
          email,
          displayName,
          role: null,
          photoURL: null,
          onboardingCompleted: false,
          createdAt: new Date().toISOString()
        };

        users[email] = { ...newUser, password };
        setMockUsers(users);

        persistUserToStorage(newUser, rememberMe);
        setCurrentUser(newUser);
        return newUser;
      }

      if (auth) {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const profile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || '',
        role: null,
        photoURL: user.photoURL || null,
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profile);
      const fullUser = { ...user, ...profile };
      persistUserToStorage(fullUser, rememberMe);
      setCurrentUser(fullUser);
      return fullUser;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      if (isMock) {
        const users = getMockUsers();
        const user = users[email];
        if (!user || user.password !== password) {
          throw new Error("Invalid email or password.");
        }
        const { password: _, ...profile } = user;
        persistUserToStorage(profile, rememberMe);
        setCurrentUser(profile);
        return profile;
      }

      if (auth) {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let fullUser;
      if (userDoc.exists()) {
        fullUser = { 
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || userDoc.data().displayName,
          photoURL: user.photoURL || userDoc.data().photoURL,
          ...userDoc.data() 
        };
      } else {
        fullUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || null,
          role: null,
          onboardingCompleted: false
        };
      }

      persistUserToStorage(fullUser, rememberMe);
      setCurrentUser(fullUser);
      return fullUser;
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async (rememberMe = true) => {
    setLoading(true);
    try {
      if (isMock) {
        const email = 'google_demo@example.com';
        const users = getMockUsers();
        let profile = users[email];

        if (!profile) {
          const uid = 'mock_google_' + Math.random().toString(36).substr(2, 9);
          profile = {
            uid,
            email,
            displayName: 'Google Demo User',
            role: null,
            photoURL: null,
            onboardingCompleted: false,
            createdAt: new Date().toISOString()
          };
          users[email] = profile;
          setMockUsers(users);
        }

        persistUserToStorage(profile, rememberMe);
        setCurrentUser(profile);
        return profile;
      }

      if (auth) {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let profile = {};

      if (!userDoc.exists()) {
        profile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          role: null,
          photoURL: user.photoURL || null,
          onboardingCompleted: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), profile);
      } else {
        profile = userDoc.data();
      }

      const fullUser = { ...user, ...profile };
      persistUserToStorage(fullUser, rememberMe);
      setCurrentUser(fullUser);
      return fullUser;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      // Clear all persistent and session caches
      localStorage.removeItem(STORAGE_CACHE_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(MOCK_CURRENT_USER_KEY);
      sessionStorage.removeItem(STORAGE_CACHE_KEY);
      sessionStorage.removeItem(REMEMBER_KEY);
      sessionStorage.removeItem(MOCK_CURRENT_USER_KEY);
      
      setCurrentUser(null);

      if (!isMock && auth) {
        await signOut(auth);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    if (isMock) {
      const users = getMockUsers();
      if (!users[email]) throw new Error("Email address not found.");
      return;
    }
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  // Update Role
  const updateRole = async (role) => {
    if (!currentUser) throw new Error("No active user session.");
    setLoading(true);
    try {
      const updated = { ...currentUser, role };

      if (isMock) {
        const users = getMockUsers();
        const email = currentUser.email;
        if (users[email]) {
          users[email].role = role;
          setMockUsers(users);
        }
      } else if (db && currentUser.uid) {
        await setDoc(doc(db, 'users', currentUser.uid), { role }, { merge: true });
      }

      persistUserToStorage(updated, isRememberEnabled());
      setCurrentUser(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  // Complete Onboarding
  const completeOnboarding = async (role, profileData, demoMode) => {
    if (!currentUser) throw new Error("No active user session.");

    // 🔒 Role Lock: Prevent role changes after onboarding is complete
    if (currentUser.onboardingCompleted && currentUser.role) {
      throw new Error(`Role is permanently set to '${currentUser.role}'. You must create a new account to use a different role.`);
    }

    setLoading(true);
    try {
      const updatedFields = {
        role,
        onboardingCompleted: true,
        profile: profileData,
        demoMode
      };

      const updated = { ...currentUser, ...updatedFields };

      if (isMock) {
        const users = getMockUsers();
        const email = currentUser.email;
        if (users[email]) {
          users[email] = { ...users[email], ...updatedFields };
          setMockUsers(users);
        }
      } else if (db && currentUser.uid) {
        await setDoc(doc(db, 'users', currentUser.uid), updatedFields, { merge: true });
      }

      persistUserToStorage(updated, isRememberEnabled());
      setCurrentUser(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateRole,
    completeOnboarding,
    isMock
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
