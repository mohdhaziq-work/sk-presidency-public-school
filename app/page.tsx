'use client';
import { useAuth } from '@/lib/auth/AuthContext';
import { auth } from '@/lib/firebase/config';
import NotesMonitor from '@/components/NotesMonitor';

export default function Home() {
  const { user, studentProfile, loading, error, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4"
        style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl p-8 shadow-xl shadow-black/5 animate-[scaleIn_.5s_cubic-bezier(0.34,1.56,0.64,1)]">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">SK Presidency Public School</h1>
            <p className="text-xs text-gray-400 mt-1">CBSE: 2133231 | Sultanpur, UP</p>
          </div>
          <h2 className="text-lg font-bold text-center mb-1">Student Portal</h2>
          <p className="text-xs text-gray-400 text-center mb-6">Sign in to access your dashboard</p>
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 font-medium">{error}</div>
          )}
          <button onClick={signIn}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-[0.98]">
            Sign In to Dashboard
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-4">
            <a href="https://skpp-school.onrender.com" className="hover:text-blue-600">Back to School Website</a>
          </p>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <h2 className="font-bold text-lg mb-2">Profile Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">Your student profile is not in the system yet. Please contact management to add your profile.</p>
          <a href="https://skpp-school.onrender.com" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Back to Website</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <div className="flex items-center gap-2 font-bold text-sm tracking-tight">SKPPS<span className="text-[10px] text-gray-400 font-medium ml-1">— {studentProfile.name} | {studentProfile.class}-{studentProfile.section}</span></div>
        <button onClick={() => { user && auth?.signOut(); }}
          className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">Logout</button>
      </header>
      {/* Main */}
      <NotesMonitor />
      {/* Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 h-16 flex md:hidden z-40 pb-safe">
        {['browse','upload','my'].map(t => (
          <button key={t} className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-gray-400 active:text-blue-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {t==='browse'?<><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>:
               t==='upload'?<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/></>:
               <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
            </svg>
            {t==='browse'?'Browse':t==='upload'?'Upload':'My'}
          </button>
        ))}
      </nav>
    </div>
  );
}

