'use client';
import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase/config';
import { signInAnonymously } from 'firebase/auth';
import {
  getNotesByClassSection, getCurriculum, getNotices, addNote,
  findStudent, getStudentsByClass,
  type NoteSubmission, type SubjectCurriculum, type StudentProfile,
} from '@/lib/firebase/firestore';
import Link from 'next/link';

// ═══════════════════════════════════════════════════
// STUDENT PORTAL — Old Login System
// Tab 1: Student ID + Password (DOB: DDMMYYYY)
// Tab 2: Mobile Number → Find → Select + Password
// ═══════════════════════════════════════════════════

type Tab = 'home'|'profile'|'notices'|'notes'|'links';
type View = 'login'|'dashboard';

export default function StudentPortal() {
  const [view, setView] = useState<View>('login');
  const [profile, setProfile] = useState<StudentProfile|null>(null);
  const [uid, setUid] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!auth) { setReady(true); return; }
    const u = auth.onAuthStateChanged((user) => { if (user) setUid(user.uid); setReady(true); });
    return () => u();
  }, []);

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (view === 'dashboard' && profile) return <Dashboard profile={profile} uid={uid} onLogout={() => { setProfile(null); setView('login'); auth.signOut(); }} />;
  return <LoginScreen onSuccess={async (p: StudentProfile) => { if (!auth.currentUser) await signInAnonymously(auth); setProfile(p); setView('dashboard'); }} />;
}

// ═══════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════
function LoginScreen({ onSuccess }: { onSuccess: (p: StudentProfile) => void }) {
  const [mode, setMode] = useState<'id'|'mobile'>('id');

  // Tab 1: ID Login
  const [sid, setSid] = useState(''); const [pw, setPw] = useState('');
  // Tab 2: Mobile Login
  const [mobile, setMobile] = useState(''); const [step, setStep] = useState(1);
  const [matches, setMatches] = useState<StudentProfile[]>([]);
  const [selected, setSelected] = useState<StudentProfile|null>(null);
  const [mpw, setMpw] = useState('');

  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);

  // Tab 1: ID Login
  async function handleIdLogin(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      if (!sid || !pw) { setErr('Please fill both fields'); setLoading(false); return; }
      const student = await findStudent(sid.trim());
      if (!student) { setErr('Student not found. Please check your ID or try Mobile login.'); setLoading(false); return; }
      const expectedPw = (student.date_of_birth || '').replace(/-/g, '').substring(0, 8);
      if (pw !== expectedPw && pw !== (student as any).password) { setErr('Invalid password. Default password is your Date of Birth (DDMMYYYY).'); setLoading(false); return; }
      onSuccess(student);
    } catch (e: any) { setErr(e.message || 'Login error'); }
    setLoading(false);
  }

  // Tab 2: Mobile → Find
  async function handleMobileFind() {
    setErr(''); if (mobile.length !== 10) { setErr('Please enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      const all = await getStudentsByClass('', '');
      const found = all.filter(s => (s.parent_phone || '').replace(/\D/g, '') === mobile.replace(/\D/g, ''));
      if (!found.length) { setErr('No student found with this mobile number. Please check the number or try ID login.'); setLoading(false); return; }
      setMatches(found); setStep(2); setSelected(null);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  // Tab 2: Select + Password
  async function handleMobileLogin() {
    if (!selected) { setErr('Please select your name from the list above'); return; }
    if (!mpw) { setErr('Please enter your password'); return; }
    setErr(''); setLoading(true);
    try {
      const expectedPw = (selected.date_of_birth || '').replace(/-/g, '').substring(0, 8);
      if (mpw !== expectedPw && mpw !== (selected as any).password) { setErr('Invalid password. Default password is your Date of Birth (DDMMYYYY).'); setLoading(false); return; }
      onSuccess(selected);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  function goBack() { setStep(1); setMatches([]); setSelected(null); setMpw(''); }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4" style={{backgroundImage:'radial-gradient(#CBD5E1 1px,transparent 1px)',backgroundSize:'28px 28px'}}>
      <div className="w-full max-w-md bg-white/85 backdrop-blur-2xl border border-white/50 rounded-2xl p-8 shadow-xl animate-[scaleIn_.5s_ease]">
        {/* Logo */}
        <div className="text-center mb-5">
          <img src="/images/logo-transparent.png" alt="SKPPS" className="w-14 h-14 object-contain mx-auto mb-2 rounded-full" onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'; }}/>
          <div className="text-xs font-bold tracking-wide text-gray-700">SK PRESIDENCY PUBLIC SCHOOL</div>
          <div className="text-[10px] text-gray-400 mt-0.5">CBSE: 2133231 | Sultanpur, UP</div>
        </div>

        <h2 className="text-xl font-bold text-center mb-1">Student Portal</h2>
        <p className="text-xs text-gray-400 text-center mb-5">Sign in to your dashboard</p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          <button onClick={() => { setMode('id'); setErr(''); setStep(1); }} className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition ${mode === 'id' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Student ID</button>
          <button onClick={() => { setMode('mobile'); setErr(''); setStep(1); }} className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition ${mode === 'mobile' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Mobile Number</button>
        </div>

        {err && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 font-medium">{err}</div>}

        {/* Tab 1: Student ID */}
        {mode === 'id' && (
          <form onSubmit={handleIdLogin}>
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Student ID / Roll Number</label>
              <input value={sid} onChange={e => setSid(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Enter your Student ID or SR Number" autoComplete="off"/>
            </div>
            <div className="mb-5">
              <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Password</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Default: Date of Birth (DDMMYYYY)" autoComplete="off"/>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        )}

        {/* Tab 2: Mobile */}
        {mode === 'mobile' && step === 1 && (
          <div>
            <div className="mb-5">
              <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Registered Mobile Number</label>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))} maxLength={10} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Enter 10-digit mobile number" autoComplete="off"/>
            </div>
            <button onClick={handleMobileFind} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50">{loading ? 'Searching...' : 'Find My Account'}</button>
          </div>
        )}

        {mode === 'mobile' && step === 2 && (
          <div>
            <button onClick={goBack} className="text-xs font-semibold text-blue-600 hover:text-blue-700 mb-3 inline-flex items-center gap-1">&larr; Change mobile number</button>
            <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg mb-4 font-medium">Found {matches.length} student{matches.length>1?'s':''}. Please select your name below.</div>
            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
              {matches.map((s, i) => (
                <div key={i} onClick={() => setSelected(s)} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${selected?.student_id === s.student_id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}>
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{(s.full_name || 'S').charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{s.full_name}</div>
                    <div className="text-[10px] text-gray-400">Class {s.class}-{s.section || 'A'} | {s.student_id || s.id}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected?.student_id === s.student_id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                    {selected?.student_id === s.student_id && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Password</label>
              <input type="password" value={mpw} onChange={e => setMpw(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Default: Date of Birth (DDMMYYYY)" autoComplete="off"/>
            </div>
            <button onClick={handleMobileLogin} disabled={loading || !selected} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition active:scale-[0.98] disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In as Selected'}</button>
          </div>
        )}

        <div className="text-center mt-5 text-[10px] text-gray-400">
          <Link href="/" className="hover:text-blue-600">Back to School Website</Link>
          <br/><span className="text-[9px] mt-1 block">Default password: Date of Birth (DDMMYYYY)</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════
const COLORS: Record<string,[string,string]> = {
  English:['#DBEAFE','#1E40AF'], Hindi:['#D1FAE5','#065F46'], Maths:['#FEF3C7','#92400E'],
  Science:['#FEE2E2','#991B1B'], 'Social Studies':['#EDE9FE','#5B21B6'], Sanskrit:['#E0E7FF','#3730A3'],
  Computer:['#FFEDD5','#9A3412'], AI:['#FCE7F3','#9D174D'],
  'Physical Education':['#CCFBF1','#134E4A'], Art:['#F3E8FF','#6B21A8'], Music:['#FEF9C3','#854D0E'],
  'General Knowledge':['#E0F2FE','#075985'],
};

function Dashboard({ profile, uid, onLogout }: { profile: StudentProfile; uid: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('home');
  const [notes, setNotes] = useState<NoteSubmission[]>([]);
  const [curriculum, setCurriculum] = useState<SubjectCurriculum[]>([]);
  const [subject, setSubject] = useState('');
  const [viewingNote, setViewingNote] = useState<NoteSubmission|null>(null);

  const cls = (profile.class||'').toUpperCase(); const sec = (profile.section||'A').toUpperCase();

  useEffect(() => { (async() => { const [n,c,nt] = await Promise.all([getNotesByClassSection(cls,sec), getCurriculum(cls), getNotices(cls,sec)]); setNotes([...n,...nt]); setCurriculum(c); })(); }, [cls,sec]);

  const filtered = subject ? notes.filter(n=>n.subject===subject&&n.type!=='Notice') : notes.filter(n=>n.type!=='Notice');
  const notices = notes.filter(n=>n.type==='Notice');
  const subjList = curriculum.length ? curriculum : [...new Set(notes.map(n=>n.subject))].map(s=>({id:s,class:cls,name:s,chapters:[]}as SubjectCurriculum));
  const chapters = () => { const m: Record<string,NoteSubmission[]>={}; filtered.forEach(n=>{const ch=n.chapter||n.title||'General';if(!m[ch])m[ch]=[];m[ch].push(n)}); return Object.entries(m); };
  const chs = chapters();

  const TABS = [
    {id:'home',label:'Home',icon:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22 9 12 15 12 15 22'},
    {id:'profile',label:'Profile',icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8'},
    {id:'notices',label:'Notices',icon:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0'},
    {id:'notes',label:'Notes&HW',icon:'M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'},
    {id:'links',label:'Links',icon:'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07'},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm">SKPPS<span className="text-[10px] text-gray-400 font-medium ml-1">{cls}-{sec}</span></Link>
        <button onClick={onLogout} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Logout</button>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Student Portal</div>
          {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id as Tab)} className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-xs font-medium transition-all text-left ${tab===t.id?'bg-blue-50 text-blue-600':'text-gray-500 hover:bg-gray-50'}`}>
            <span className={`w-4 h-4 flex items-center justify-center ${tab===t.id?'opacity-100':'opacity-50'}`}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={t.icon}/></svg></span>{t.label}</button>))}
          <div className="mt-auto p-4 border-t text-center text-[10px] text-gray-400">SK Presidency</div>
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-6 pb-20 md:pb-6">
          {tab==='home'&&<HomeTab profile={profile} notices={notices.slice(0,3)} onNav={setTab}/>}
          {tab==='profile'&&<ProfileTab profile={profile}/>}
          {tab==='notices'&&<NoticesTab notices={notices}/>}
          {tab==='notes'&&<NotesTab subject={subject} setSubject={setSubject} subjects={subjList} chs={chs} filtered={filtered} viewingNote={viewingNote} setViewingNote={setViewingNote} profile={profile} uid={uid} onRefresh={async()=>{const[n,c,nt]=await Promise.all([getNotesByClassSection(cls,sec),getCurriculum(cls),getNotices(cls,sec)]);setNotes([...n,...nt]);setCurriculum(c);}}/>}
          {tab==='links'&&<LinksTab/>}
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 h-16 flex md:hidden z-40">
        {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id as Tab)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-semibold ${tab===t.id?'text-blue-600':'text-gray-400'}`}>{t.label}</button>))}
      </nav>
      {viewingNote&&<NoteViewer note={viewingNote} onClose={()=>setViewingNote(null)}/>}
    </div>
  );
}

function HomeTab({profile,notices,onNav}:{profile:StudentProfile;notices:NoteSubmission[];onNav:(t:Tab)=>void}){
  return <div>
    <h2 className="text-lg font-bold mb-1">Welcome, {(profile.full_name||'Student').split(' ')[0]}</h2>
    <p className="text-xs text-gray-400 mb-6">Class {profile.class}-{profile.section||'A'} | {profile.house||'Earth'} House | Roll {profile.roll_no||'-'}</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[{v:profile.class||'-',l:'Class'},{v:profile.house||'Earth',l:'House'},{v:profile.roll_no||'-',l:'Roll'},{v:profile.parent_phone||'-',l:'Contact'}].map((s,i)=>(<div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition"><div className="text-2xl font-extrabold">{s.v}</div><div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">{s.l}</div></div>))}
    </div>
    {notices.length>0&&<div className="bg-white border border-gray-200 rounded-xl mb-4"><div className="px-4 py-3 border-b font-semibold text-sm">Recent Notices</div><div className="p-4">{notices.map((n,i)=>(<div key={i} className="py-2 border-b border-gray-50 last:border-0"><strong className="text-xs">{n.title}</strong><p className="text-[11px] text-gray-500">{n.content?.substring(0,100)}</p></div>))}</div></div>}
    <div className="flex gap-2 flex-wrap"><button onClick={()=>onNav('notes')} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">View Notes</button><Link href="/" className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50">Website</Link></div>
  </div>;
}

function ProfileTab({profile}:{profile:StudentProfile}){
  const rows=[['Name',profile.full_name],['Father',profile.father_name],['Mother',profile.mother_name],['Class',profile.class+'-'+(profile.section||'A')],['Roll',profile.roll_no],['House',profile.house],['Gender',profile.gender],['DOB',profile.date_of_birth],['Phone',profile.parent_phone],['Blood',profile.blood_group],['SR No',profile.sr_no||profile.student_id]];
  return <div><h2 className="text-lg font-bold mb-4">My Profile</h2><div className="bg-white border border-gray-200 rounded-xl p-6"><div className="flex gap-5 items-start flex-wrap mb-6"><div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">{(profile.full_name||'S').charAt(0)}</div><div><h3 className="font-bold text-lg">{profile.full_name}</h3><p className="text-xs text-gray-400">{profile.class}-{profile.section||'A'} | Roll {profile.roll_no||'-'}</p></div></div><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{rows.map(([l,v],i)=>(<div key={i} className="flex gap-2 text-xs"><span className="font-semibold text-gray-400 uppercase text-[10px] w-16">{l}</span><span>{v||'-'}</span></div>))}</div></div></div>;
}

function NoticesTab({notices}:{notices:NoteSubmission[]}){
  return <div><h2 className="text-lg font-bold mb-4">Notices</h2>{notices.length?<div className="space-y-3">{notices.map((n,i)=>(<div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"><div className="flex justify-between items-start gap-2 mb-1"><strong className="text-sm">{n.title}</strong><span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Notice</span></div><p className="text-xs text-gray-500 whitespace-pre-wrap">{n.content}</p><div className="flex gap-3 text-[10px] text-gray-400 mt-3 pt-2 border-t"><span>{n.studentName||'Management'}</span><span>{n.createdAt?.toDate?.()?.toLocaleDateString()||''}</span></div></div>))}</div>:<p className="text-center text-gray-400 py-10 text-sm">No notices yet.</p>}</div>;
}

function LinksTab(){
  return <div><h2 className="text-lg font-bold mb-4">Quick Links</h2><div className="grid gap-3 max-w-lg">{[{href:'/',t:'School Website',s:'Main homepage',c:'#2563EB'},{href:'/noticeboard',t:'Noticeboard',s:'Announcements',c:'#059669'},{href:'/fees',t:'Fees Structure',s:'Fee details',c:'#D97706'},{href:'/eventcalendar',t:'Event Calendar',s:'Schedule',c:'#7C3AED'}].map((l,i)=>(<Link key={i} href={l.href} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:l.c+'15',color:l.c}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><div><div className="font-semibold text-sm">{l.t}</div><div className="text-[11px] text-gray-400">{l.s}</div></div><span className="ml-auto text-gray-300">&rarr;</span></Link>))}</div></div>;
}

function NotesTab({subject,setSubject,subjects,chs,filtered,viewingNote,setViewingNote,profile,uid,onRefresh}:any){
  const [showUpload,setShowUpload]=useState(false);
  return <div><h2 className="text-lg font-bold mb-4">Notes & Homework</h2>
    {!subject?<>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">{subjects.map((s:any,i:number)=>{const[bg,fg]=COLORS[s.name]||['#F1F5F9','#475569'];const cnt=filtered.filter((n:any)=>n.subject===s.name).length;
        return <button key={i} onClick={()=>setSubject(s.name)} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-lg hover:border-blue-300 transition hover:-translate-y-1"><div className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-extrabold" style={{background:bg,color:fg}}>{s.name.charAt(0)}</div><div className="font-semibold text-sm">{s.name}</div><div className="text-[10px] text-gray-400 mt-0.5">{s.noteCount||cnt} items{s.book?` | ${s.book}`:''}</div></button>})}</div>
      <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-4 flex-wrap"><span className="text-xs font-semibold">Upload study material</span><button onClick={()=>setShowUpload(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">Upload Notes / Homework</button></div>
    </>:<>
      <button onClick={()=>setSubject('')} className="text-xs font-semibold text-blue-600 mb-4">&larr; All Subjects</button>
      <h3 className="font-bold text-lg mb-1">{subject}</h3><p className="text-xs text-gray-400 mb-4">{chs.length} chapters | {filtered.length} items</p>
      {chs.length>0&&<div className="flex gap-3 overflow-x-auto pb-3 mb-4">{chs.map(([ch,ns]:any)=>(<button key={ch} onClick={()=>setViewingNote(ns[0])} className="flex-shrink-0 w-36 bg-white border rounded-lg overflow-hidden hover:shadow-md transition"><div className="h-16 bg-gray-100 flex items-center justify-center">{ns[0]?.files?.[0]?.thumb?<img src={ns[0].files[0].thumb} className="w-full h-full object-cover" alt=""/>:'📄'}</div><div className="p-2"><div className="text-[11px] font-semibold truncate">{ch}</div><div className="text-[9px] text-gray-400">{ns.length} items</div></div></button>))}</div>}
      <div className="space-y-2">{filtered.map((n:any)=>(<div key={n.id} onClick={()=>setViewingNote(n)} className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md"><div className="flex justify-between items-start gap-2"><strong className="text-sm">{n.title}</strong><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${n.type==='Homework'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{n.type}</span></div><p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content?.substring(0,150)}</p>{n.files?.length>0&&<div className="flex gap-1 mt-2">{n.files.slice(0,4).map((f:any,i:number)=>(<div key={i} className="w-9 h-9 rounded overflow-hidden">{f.type?.includes('image')?<img src={f.thumb||f.url} className="w-full h-full object-cover" alt=""/>:<div className="w-full h-full bg-red-50 flex items-center justify-center text-[7px] font-bold text-red-600">PDF</div>}</div>))}</div>}<div className="flex gap-3 text-[10px] text-gray-400 mt-2 pt-2 border-t"><span>{n.studentName}</span><span>{n.createdAt?.toDate?.()?.toLocaleDateString()||''}</span></div></div>))}</div></>}
    {showUpload&&<UploadModal subjects={subjects} profile={profile} uid={uid} onClose={()=>setShowUpload(false)} onRefresh={onRefresh}/>}
  </div>;
}

function UploadModal({subjects,profile,uid,onClose,onRefresh}:any){
  const[sub,setSub]=useState('');const[type,setType]=useState('Notes');const[ch,setCh]=useState('');const[title,setTitle]=useState('');const[cont,setCont]=useState('');const[files,setFiles]=useState<File[]>([]);const[uploading,setUploading]=useState(false);const fileRef=useRef<HTMLInputElement>(null);
  const curObj=subjects.find((c:any)=>c.name===sub);const hasCh=curObj?.chapters?.length>0;
  const doUpload=async()=>{if(!title.trim()){alert('Enter a title');return}setUploading(true);const upFiles:any[]=[];for(const f of files){const fd=new FormData();fd.append('file',f);try{const r=await fetch('/api/upload',{method:'POST',body:fd});const d=await r.json();if(!d.error)upFiles.push({url:d.url,thumb:d.thumb||d.url,originalName:d.originalName||f.name,size:d.size,source:d.source,type:d.type})}catch(e){}}await addNote({studentId:uid,studentName:profile.full_name,class:profile.class.toUpperCase(),section:(profile.section||'A').toUpperCase(),subject:sub,type:type as any,chapter:ch||title,title,content:cont||'See attached',files:upFiles});onClose();onRefresh();};
  return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between"><h3 className="font-bold">Upload Notes / Homework</h3><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">&times;</button></div><div className="p-5">
    <div className="grid grid-cols-2 gap-3 mb-3"><div><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Subject</label><select value={sub} onChange={e=>{setSub(e.target.value);setCh('')}} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"><option value="">Select</option>{subjects.map((s:any,i:number)=><option key={i} value={s.name}>{s.name}</option>)}</select></div><div><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Type</label><select value={type} onChange={e=>setType(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"><option>Notes</option><option>Homework</option></select></div></div>
    {type==='Notes'&&sub&&hasCh?<div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Chapter</label><select value={ch} onChange={e=>{if(e.target.value==='__custom__')setCh('');else setCh(e.target.value)}} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"><option value="">Select chapter</option>{curObj?.chapters.map((c:string,i:number)=><option key={i} value={c}>{c}</option>)}<option value="__custom__">Other</option></select></div>:type==='Notes'?<div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Chapter</label><input value={ch} onChange={e=>setCh(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50" placeholder="e.g. Chapter 3"/></div>:null}
    <div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Title *</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50" placeholder="Descriptive title"/></div>
    {type==='Homework'?<div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Homework Content</label><textarea value={cont} onChange={e=>setCont(e.target.value)} rows={4} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 resize-none" placeholder="Write homework here..."/></div>:<div className="mb-3"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Content (optional)</label><textarea value={cont} onChange={e=>setCont(e.target.value)} rows={3} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 resize-none" placeholder="Additional notes..."/></div>}
    <div className="mb-4"><label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Files (max 50)</label><div onClick={()=>fileRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" className="mx-auto mb-1"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/></svg><p className="text-xs text-gray-400">Click to select images/PDFs</p></div><input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={e=>{if(e.target.files)setFiles((p:File[])=>[...p,...Array.from(e.target.files!)].slice(0,50))}}/>
    {files.length>0&&<div className="flex flex-wrap gap-1 mt-2">{files.map((f,i)=>(<div key={i} className="relative w-9 h-9 rounded overflow-hidden border">{f.type.includes('image')?<img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt=""/>:<div className="w-full h-full bg-red-50 flex items-center justify-center text-[6px] font-bold text-red-600">PDF</div>}<button onClick={()=>setFiles((p:File[])=>p.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black/60 rounded-full text-white text-[7px] flex items-center justify-center">&times;</button></div>))}<span className="text-[9px] text-gray-400 self-center">{files.length}/50</span></div>}</div>
    <div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2.5 border rounded-xl text-sm font-semibold">Cancel</button><button onClick={doUpload} disabled={uploading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">{uploading?'Uploading...':'Upload'}</button></div>
  </div></div></div>;
}

function NoteViewer({note,onClose}:{note:NoteSubmission;onClose:()=>void}){
  return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b px-5 py-3 flex justify-between"><div><strong className="text-sm">{note.subject} — {note.title}</strong><div className="text-[10px] text-gray-400">{note.type} | {note.createdAt?.toDate?.()?.toLocaleDateString()||''}</div></div><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">&times;</button></div><div className="p-5">{note.files?.map((f:any,i:number)=>(<div key={i} className="mb-3">{f.type?.includes('image')?<img src={f.url} className="rounded-xl max-w-full shadow-md" alt=""/>:<a href={f.url} download className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-blue-600">📎 {f.originalName}</a>}</div>))}{note.content&&note.content!=='See attached'&&<div className="text-sm text-gray-700 whitespace-pre-wrap mt-3">{note.content}</div>}</div></div></div>;
}
