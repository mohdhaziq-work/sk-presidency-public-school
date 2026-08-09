'use client';
import { useAuth } from '@/lib/auth/AuthContext';
import { auth } from '@/lib/firebase/config';
import NotesMonitor from '@/components/NotesMonitor';
import { useState } from 'react';

export default function Home() {
  const { user, studentProfile, loading, error, signIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // ── LOADING ──────────────────────────────────────────────
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

  // ── LOGGED IN → DASHBOARD ─────────────────────────────────
  if (user && studentProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
          <div className="flex items-center gap-2 font-bold text-sm tracking-tight">SKPPS<span className="text-[10px] text-gray-400 font-medium ml-1">— {studentProfile.name} | {studentProfile.class}-{studentProfile.section}</span></div>
          <button onClick={() => { auth?.signOut(); }} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">Logout</button>
        </header>
        <NotesMonitor />
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 h-16 flex md:hidden z-40">
          {['browse','upload','my'].map(t => (
            <button key={t} className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-gray-400">
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

  // ── NOT FOUND PROFILE ──────────────────────────────────────
  if (user && !studentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <h2 className="font-bold text-lg mb-2">Profile Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">Your student profile is not in the system yet. Please contact management to add your profile.</p>
          <button onClick={() => auth?.signOut()} className="text-sm font-semibold text-blue-600">Try Again</button>
        </div>
      </div>
    );
  }

  // ── LOGIN SCREEN ──────────────────────────────────────────
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4"
        style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl p-8 shadow-xl shadow-black/5" style={{animation:'scaleIn .5s cubic-bezier(0.34,1.56,0.64,1)'}}>
          <button onClick={() => setShowLogin(false)} className="text-xs font-semibold text-gray-400 hover:text-blue-600 mb-4">&larr; Back to Home</button>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-3">
              <img src="/images/logo-transparent.png" alt="SKPPS" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">SK Presidency Public School</h1>
            <p className="text-xs text-gray-400 mt-1">CBSE: 2133231 | Sultanpur, UP</p>
          </div>
          <h2 className="text-lg font-bold text-center mb-1">Student Portal</h2>
          <p className="text-xs text-gray-400 text-center mb-6">Sign in to access your dashboard</p>
          {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 font-medium">{error}</div>}
          <button onClick={signIn} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-[0.98]">
            Sign In to Dashboard
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-4">
            <a href="https://skpp-school.onrender.com" className="hover:text-blue-600">Back to School Website</a>
          </p>
        </div>
        <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}`}</style>
      </div>
    );
  }

  // ── MAIN SCHOOL HOMEPAGE ──────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOPBAR */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
          <img src="/images/logo-transparent.png" alt="" className="w-7 h-7 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
          SK Presidency Public School
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLogin(true)} className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Student Login</button>
          <a href="https://skpp-school.onrender.com/staff-login.html" className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition hidden sm:inline">Staff</a>
        </div>
      </header>

      {/* NEWS TICKER */}
      <div className="bg-blue-600 text-white overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-2 max-w-6xl mx-auto">
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full flex-shrink-0">LATEST</span>
          <div className="overflow-hidden">
            <div className="flex gap-12 text-xs whitespace-nowrap animate-ticker">
              <a href="/Prospectus.pdf" className="text-white/90 hover:text-white">Registration Open 2026-2027 — Apply Now</a>
              <span className="opacity-30">|</span>
              <a href="/AdmissionForm.pdf" className="text-white/90 hover:text-white">Download Admission Form</a>
              <span className="opacity-30">|</span>
              <span>CBSE: 2133231 | Contact: 86017 35757</span>
              <span className="opacity-30">|</span>
              <span>Approved for XII Standard Classes</span>
              <span className="opacity-30">|</span>
              <a href="/Prospectus.pdf" className="text-white/90 hover:text-white">Registration Open 2026-2027</a>
              <span className="opacity-30">|</span>
              <a href="/AdmissionForm.pdf" className="text-white/90 hover:text-white">Download Admission Form</a>
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'radial-gradient(#CBD5E1 1px,transparent 1px)',backgroundSize:'28px 28px',opacity:.3}}/>
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] mb-4">
                Shaping<br/><span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Future Leaders</span>
              </h1>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">Play Group to Class XII — CBSE Affiliated. Founded 2013 in Sultanpur, Uttar Pradesh. World-class academics blended with character building and holistic development.</p>
              <div className="flex gap-3 flex-wrap">
                <a href="https://skpp-school.onrender.com/aboutschool.html" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg transition">About Our School</a>
                <a href="https://skpp-school.onrender.com/admission-withdrawl.html" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:border-gray-300 transition">Admissions 2026-27</a>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
                <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <img src="/images/logo-transparent.png" alt="SKPPS" className="w-20 h-20 object-contain" onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span style=font-size:3rem;font-weight:900;color:#1E40AF>SKPPS</span>'; }}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 text-center">
          {[{n:'800+',l:'Students'},{n:'40+',l:'Teachers'},{n:'15+',l:'Years'},{n:'100%',l:'Results'}].map((s,i) => (
            <div key={i} className="py-8 px-4">
              <div className="text-3xl md:text-4xl font-black tracking-tight">{s.n}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Why Choose Us</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-3 mb-2">Education Beyond the Classroom</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">We nurture every child with academic excellence, sportsmanship, and moral values.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {icon:'M22 10l-10-7L2 10M4 11v8M20 11v8M8 11v8h8v-8M12 18v-3',title:'About Our School',desc:'Founded by Dr. Shrikant Upadhyaya Educational & Charitable Trust. Complete learning from Play Group to Standard XII.',bg:'bg-blue-50',fg:'#2563EB'},
            {icon:'M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',title:'Academic Curriculum',desc:'Rigorous CBSE-aligned academics. Smart classrooms with modern audio-visual aids.',bg:'bg-emerald-50',fg:'#059669'},
            {icon:'M12 12a5 5 0 100-10 5 5 0 000 10zM12 12a15.3 15.3 0 014 10M12 12a15.3 15.3 0 00-4 10M2 12h20',title:'Sports & Activities',desc:'Comprehensive sports program with dedicated grounds, yoga, and physical education.',bg:'bg-amber-50',fg:'#D97706'},
          ].map((f,i) => (
            <a key={i} href="https://skpp-school.onrender.com/aboutschool.html" className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4 relative z-10`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={f.fg} strokeWidth="2"><path d={f.icon}/></svg>
              </div>
              <h3 className="font-bold relative z-10">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed relative z-10">{f.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Quick Access</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-3">Everything You Need</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              {icon:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',title:'Notice Board',sub:'Latest announcements',color:'#2563EB'},
              {icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',title:'Event Calendar',sub:'Academic schedule',color:'#059669'},
              {icon:'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2',title:'Admissions',sub:'Session 2026-2027',color:'#DC2626'},
              {icon:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',title:'Fees Structure',sub:'Transparent details',color:'#D97706'},
            ].map((q,i) => (
              <a key={i} href="https://skpp-school.onrender.com/noticeboard.html" className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:q.color+'15',color:q.color}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={q.icon}/></svg>
                </div>
                <div><div className="font-semibold text-sm">{q.title}</div><div className="text-xs text-gray-400">{q.sub}</div></div>
                <span className="ml-auto text-gray-300">&rarr;</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-20 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-3xl font-extrabold text-white mb-2">Join the SK Presidency Family</h2>
          <p className="text-blue-200 mb-8 max-w-md mx-auto">Admissions open for Play Group to Class XII. Give your child the foundation they deserve.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="https://skpp-school.onrender.com/admission-withdrawl.html" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-xl transition">Apply for Admission</a>
            <a href="https://skpp-school.onrender.com/contact.html" className="inline-flex items-center gap-2 border border-blue-400/40 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition">Contact Us</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <h3 className="text-white font-bold text-lg mb-3">SK Presidency Public School</h3>
              <p className="text-sm leading-relaxed text-gray-500">Dr. Shrikant Upadhyaya Educational & Charitable Trust<br/>CBSE: 2133231<br/>Vill. Odara, Faizabad Sultanpur Bypass, Sultanpur, UP — 228001<br/>86017 35757 | 86017 38180</p>
            </div>
            <div><h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Quick Links</h4>
              {['About School','Notice Board','Admissions','Fees'].map(l => <a key={l} href="https://skpp-school.onrender.com" className="block text-sm py-1 text-gray-500 hover:text-white transition">{l}</a>)}</div>
            <div><h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Portals</h4>
              {['Student Login','Staff Login','Contact','Careers'].map(l => <a key={l} href="https://skpp-school.onrender.com" className="block text-sm py-1 text-gray-500 hover:text-white transition">{l}</a>)}</div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex justify-between flex-wrap gap-2 text-xs">
            <span>&copy; SK Presidency Public School 2025-2028</span>
            <span>Powered by Astra Infotech</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
