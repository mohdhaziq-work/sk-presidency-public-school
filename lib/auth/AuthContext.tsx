'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, isConfigured } from '@/lib/firebase/config';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

interface StudentProfile {
  id: string;
  email?: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  house?: string;
  fatherName?: string;
  motherName?: string;
  phone?: string;
  bloodGroup?: string;
  gender?: string;
  dob?: string;
  srNo?: string;
  photoURL?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, studentProfile: null, loading: true, error: null,
  signIn: async () => {}, signOut: async () => {}, refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentProfile = useCallback(async (uid: string) => {
    if (!isConfigured || !uid) return null;
    try {
      const db = getFirestore();
      const snap = await getDoc(doc(db, 'students', uid));
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          name: data.full_name || data.name || 'Student',
          class: data.class || data.cls || '',
          section: data.section || data.sec || 'A',
          rollNo: data.roll_no || data.roll || '',
          house: data.house || 'Earth',
          fatherName: data.father_name || data.father || '',
          motherName: data.mother_name || data.mother || '',
          phone: data.parent_phone || data.phone || '',
          bloodGroup: data.blood_group || '',
          gender: data.gender || '',
          dob: data.date_of_birth || data.dob || '',
          srNo: data.sr_no || data.student_id || '',
          isActive: data.is_active !== false,
        } as StudentProfile;
      }
    } catch (e) { console.error('Load profile error:', e); }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profile = await loadStudentProfile(user.uid);
      if (profile) setStudentProfile(profile);
    }
  }, [user, loadStudentProfile]);

  const signIn = useCallback(async () => {
    if (!auth) { setError('Auth not configured'); return; }
    setError(null);
    try {
      const result = await signInAnonymously(auth);
      setUser(result.user);
    } catch (e: any) {
      setError(e.message || 'Sign in failed');
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await auth.signOut();
    setUser(null);
    setStudentProfile(null);
  }, []);

  useEffect(() => {
    if (!isConfigured || !auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await loadStudentProfile(firebaseUser.uid);
        setStudentProfile(profile);
      } else {
        setStudentProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [loadStudentProfile]);

  return (
    <AuthContext.Provider value={{ user, studentProfile, loading, error, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
