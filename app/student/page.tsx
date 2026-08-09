'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { type StudentProfile } from '@/lib/firebase/firestore';
import Link from 'next/link';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

export default function StudentPortal() {
  const [user, setUser] = useState<User|null>(null);
  const [profile, setProfile] = useState<StudentProfile|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'students', u.uid));
        if (snap.exists()) setProfile({ id: snap.id, ...snap.data() } as StudentProfile);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!user) return <LoginScreen error={error} onSignIn={async () => { setError(''); try { await signInAnonymously(auth); } catch (e: any) { setError(e.message); } }} />;

  if (!profile) return <NoProfileScreen onRetry={() => auth.signOut()} />;

  return <StudentDashboard profile={profile} uid={user.uid} />;
}

function LoginScreen({ error, onSignIn }: { error: string; onSignIn: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 bg-dots">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl p-8 shadow-xl animate-scale-in">
        <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-blue-600 mb-4 inline-block">&larr; Back to Home</Link>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-3"><span className="text-2xl font-black text-blue-600">SK</span></div>
          <h1 className="text-xl font-extrabold">SK Presidency Public School</h1><p className="text-xs text-gray-400 mt-1">CBSE: 2133231</p>
        </div>
        <h2 className="text-lg font-bold text-center mb-1">Student Portal</h2><p className="text-xs text-gray-400 text-center mb-6">Sign in to your dashboard</p>
        {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">{error}</div>}
        <button onClick={onSignIn} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">Sign In to Dashboard</button>
      </div>
    </div>
  );
}

function NoProfileScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mx-auto mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
        <h2 className="font-bold text-lg mb-2">Profile Not Found</h2><p className="text-sm text-gray-500 mb-6">Contact management.</p>
        <button onClick={onRetry} className="text-sm font-semibold text-blue-600">Try Again</button>
      </div>
    </div>
  );
}
