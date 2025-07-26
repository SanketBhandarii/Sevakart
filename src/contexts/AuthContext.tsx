import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider, db } from "../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AppUser {
  uid: string;
  email?: string | null;
  role?: 'vendor' | 'supplier';
  name?: string;
  phone?: string;
  location?: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  register: (params: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: "vendor" | "supplier";
    location: string;
  }) => Promise<User | null>;
  googleSignIn: () => Promise<User | null>;
  login: (email: string, password: string,role:string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user details (including role) from Firestore
  const fetchUserData = async (user: User): Promise<AppUser> => {
    const userRef = doc(db, "User", user.uid); // ✅ use 'User' collection
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        ...(userSnap.data() as Partial<AppUser>),
      };
    }

    // Return minimal info if document is missing
    return { uid: user.uid, email: user.email };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const enrichedUser = await fetchUserData(user);
        setCurrentUser(enrichedUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ✅ Register user and store metadata
  const register = async ({
    email,
    password,
    name,
    phone,
    role,
    location,
  }: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: "vendor" | "supplier";
    location: string;
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "User", userCredential.user.uid), {
        email,
        name,
        phone,
        role,
        location,
        createdAt: new Date(),
      });
      return userCredential.user;
    } catch (err) {
      console.error("Registration error:", err);
      return null;
    }
  };

  // ✅ Google Sign-In (also stores new users to Firestore)
  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "User", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Default role vendor if not provided
        await setDoc(userRef, {
          user_id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || "",
          phone: 0,
          role: "vendor",
          location: "",
          createdAt: new Date(),
        });
      }

      const enrichedUser = await fetchUserData(result.user);
      setCurrentUser(enrichedUser);

      return result.user;
    } catch (error) {
      console.error("Google Sign-In error:", error);
      return null;
    }
  };

  // ✅ Email/Password Login
  const login = async (email: string, password: string,role:string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = await fetchUserData(userCredential.user);
      if (role && user.role !== role) {
        throw new Error("Unauthorized role access");
      }
      setCurrentUser(user);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      setCurrentUser(null);
      return null;
    }
  };

  const logout = async () => await signOut(auth);

  return (
    <AuthContext.Provider
      value={{ currentUser, register, googleSignIn, login, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
