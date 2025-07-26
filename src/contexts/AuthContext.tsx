import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  register: ({ email, password }: { email: string; password: string }) => Promise<User | null>;
  googleSignIn: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>; 
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Email/Password registration
  const register = async ({ email, password }: { email: string; password: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      console.error('Registration error:', err);
      return null;
    }
  };

  // Google Sign-In
  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

  // Logout
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, googleSignIn, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
