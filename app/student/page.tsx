'use client';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { signInAnonymously } from 'firebase/auth';
import Link from 'next/link';
import { getDoc, doc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import {
  getNotesByClassSection, getCurriculum, getNotices, addNote,
  type NoteSubmission, type SubjectCurriculum, type StudentProfile,
} from '@/lib/firebase/firestore';

type Tab = 'home'|'profile'|'notices'|'notes'|'links';

export default function StudentPortal() {
  const [view, setView] = useState<'login'|'dash'>('login');
  const [profile, setProfile] = useState<StudentProfile|null>(null);
  const [uid, setUid] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => { const u = auth.onAuthStateChanged((user) => { if (user) setUid(user.uid); setReady(true); }); return () => u(); }, []);
  if (!ready) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;
  if (view === 'dash' && profile) return <Dash profile={profile} uid={uid} onLogout={() => { setProfile(null); setView('login'); auth.signOut(); }} />;
  return <Login onSuccess={async (p: StudentProfile) => { if (!auth.currentUser) await signInAnonymously(auth); setProfile(p); setView('dash'); }} />;
}

/* EXACT old login replica */
function Login({ onSuccess }: { onSuccess: (p: StudentProfile) => void }) {
  const [tab, setTab] = useState<'id'|'mob'>('id');
  const [sid, setSid] = useState(''); const [pw, setPw] = useState('');
  const [mobile, setMobile] = useState(''); const [step, setStep] = useState(1);
  const [matches, setMatches] = useState<any[]>([]);
  const [selIdx, setSelIdx] = useState<number|null>(null);
  const [mpw, setMpw] = useState('');
  const [err, setErr] = useState(''); const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  function clr() { setErr(''); setOk(''); }
  function vp(s: any, p: string) { const d = (s.date_of_birth||s.dob||'').replace(/-/g,'').substring(0,8); return p===d||p===s.password; }
  function xe(s: any) { if(!s)return''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  async function idLogin(e: React.FormEvent) {
    e.preventDefault(); clr();
    if(!sid||!pw){setErr('Please fill both fields');return}
    setLoading(true);
    try{await signInAnonymously(auth);
      let stu:any=null;
      const d=await getDoc(doc(db,'students',sid.trim()));
      if(d.exists()){stu=d.data();stu.student_id=d.id}
      if(!stu){const qq=query(collection(db,'students'),where('student_id','==',sid.trim()),limit(1));const s=await getDocs(qq);if(!s.empty){stu=s.docs[0].data();stu.student_id=s.docs[0].id}}
      if(!stu){const all=await getDocs(collection(db,'students'));for(const dd of all.docs){const dt=dd.data();if(String(dt.roll_no)===String(sid)||dt.admission_no===sid){stu=dt;stu.student_id=dd.id;break}}}
      if(stu){if(vp(stu,pw))onSuccess({...stu,id:stu.student_id||stu.id}as StudentProfile);else setErr('Invalid password — default is DOB (DDMMYYYY)')}
      else setErr('Student not found — check your ID');
    }catch(e:any){setErr(e.message||'Login error')}
    setLoading(false);
  }

  async function findMobile() {
    const m=mobile.replace(/\D/g,'');if(m.length!==10){setErr('Please enter a valid 10-digit number');return}
    clr();setLoading(true);
    try{await signInAnonymously(auth);
      const qq=query(collection(db,'students'),where('parent_phone','==',m));
      const s=await getDocs(qq);const r=s.docs.map(d=>({...d.data(),student_id:d.id,id:d.id})).filter((x:any)=>x.is_active!==false);
      if(!r.length){setErr('No student found with this number');setLoading(false);return}
      setOk('Found '+r.length+' student(s). Select below.');
      setMatches(r);setStep(2);setSelIdx(null);
    }catch(e:any){setErr(e.message||'Search failed')}
    setLoading(false);
  }

  async function mobLogin() {
    if(selIdx===null){setErr('Select your name from the list');return}
    if(!mpw){setErr('Enter your password');return}
    clr();setLoading(true);
    const sel=matches[selIdx];
    if(vp(sel,mpw))onSuccess(sel as StudentProfile);else setErr('Invalid password');
    setLoading(false);
  }

  function back(){setStep(1);setMatches([]);setSelIdx(null);setMpw('');setOk('')}

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#F9FAFB',backgroundImage:'radial-gradient(#E2E8F0 1px,transparent 1px)',backgroundSize:'28px 28px'}}>
    <div className="w-full max-w-[400px] bg-white border border-[#DADCE0] rounded-[10px] p-8 shadow-[0_8px_32px_rgba(0,0,0,.06)]" style={{animation:'scaleIn .4s cubic-bezier(0.16,1,0.3,1)'}}>
      <div className="text-center mb-6">
        <img src="/images/logo-transparent.png" alt="SKPPS" className="w-12 h-12 object-contain mx-auto mb-2 rounded-full" onError={(e:any)=>{e.target.style.display='none'}}/>
        <div className="text-[11px] font-bold tracking-[0.03em] text-[#1A1C1E]">SK PRESIDENCY PUBLIC SCHOOL</div>
        <div className="text-[9px] text-[#80868B] mt-0.5">CBSE: 2133231 | Sultanpur, UP</div>
      </div>
      <h2 className="text-xl font-bold text-center mb-1 text-[#1A1C1E]">Student Portal</h2>
      <p className="text-xs text-[#5F6368] text-center mb-5">Sign in to your dashboard</p>
      <div className="flex border-b border-[#DADCE0] mb-5">
        <button onClick={()=>{setTab('id');clr();if(step===2)back()}} className={`flex-1 pb-2.5 text-[13px] font-semibold border-b-2 transition ${tab==='id'?'text-[#4285F4] border-[#4285F4]':'text-[#5F6368] border-transparent'}`}>Student ID</button>
        <button onClick={()=>{setTab('mob');clr()}} className={`flex-1 pb-2.5 text-[13px] font-semibold border-b-2 transition ${tab==='mob'?'text-[#4285F4] border-[#4285F4]':'text-[#5F6368] border-transparent'}`}>Mobile</button>
      </div>
      {err&&<div className="bg-[#FCE8E6] text-[#EA4335] p-2.5 rounded-[10px] text-xs mb-3 font-medium">{err}</div>}
      {ok&&<div className="bg-[#E6F4EA] text-[#34A853] p-2.5 rounded-[10px] text-xs mb-3 font-medium">{ok}</div>}
      {tab==='id'&&<form onSubmit={idLogin}>
        <div className="mb-3.5"><input type="text" value={sid} onChange={e=>setSid(e.target.value)} className="w-full p-[11px_14px] border border-[#DADCE0] rounded-[10px] text-sm bg-[#F8F9FA] outline-none focus:border-[#4285F4] focus:bg-white" placeholder="Student ID or Roll Number" autoComplete="off"/></div>
        <div className="mb-5"><input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="w-full p-[11px_14px] border border-[#DADCE0] rounded-[10px] text-sm bg-[#F8F9FA] outline-none focus:border-[#4285F4] focus:bg-white" placeholder="Password (DOB: DDMMYYYY)" autoComplete="off"/></div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-[#4285F4] text-white rounded-[10px] text-sm font-semibold hover:bg-[#3367D6] hover:-translate-y-px transition disabled:opacity-50">{loading?'':'Sign In'}</button>
      </form>}
      {tab==='mob'&&step===1&&<div>
        <div className="mb-5"><input type="tel" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,''))} maxLength={10} className="w-full p-[11px_14px] border border-[#DADCE0] rounded-[10px] text-sm bg-[#F8F9FA] outline-none focus:border-[#4285F4] focus:bg-white" placeholder="Registered Mobile Number" autoComplete="off"/></div>
        <button onClick={findMobile} disabled={loading} className="w-full py-3 bg-[#4285F4] text-white rounded-[10px] text-sm font-semibold hover:bg-[#3367D6] transition disabled:opacity-50">{loading?'':'Find My Account'}</button>
      </div>}
      {tab==='mob'&&step===2&&<div>
        <button onClick={back} className="flex items-center gap-1 text-[#4285F4] text-[11px] font-semibold bg-none border-none cursor-pointer mb-2.5 p-0">← Change mobile number</button>
        <div className="flex flex-col gap-1.5 mb-3 max-h-[200px] overflow-y-auto">
          {matches.map((s,i)=>(
            <div key={i} onClick={()=>{setSelIdx(i);clr()}} className={`flex items-center gap-2.5 p-2.5 border rounded-[10px] cursor-pointer transition ${selIdx===i?'border-[#4285F4] bg-[rgba(37,99,235,.04)]':'border-[#DADCE0] bg-white hover:bg-[#f8faff] hover:border-[#4285F4]'}`}>
              <div className="w-9 h-9 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-[15px] font-semibold flex-shrink-0">{(s.full_name||'S').charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold truncate">{xe(s.full_name)}</div><div className="text-[10px] text-[#5F6368]">Class {xe(s.class)}-{xe(s.section||'A')} | {xe(s.student_id||s.id)}</div></div>
              <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selIdx===i?'bg-[#4285F4] border-[#4285F4]':'border-[#DADCE0]'}`}>{selIdx===i&&<span className="text-white text-[10px] font-bold">✓</span>}</div>
            </div>
          ))}
        </div>
        <div className="mb-3.5"><input type="password" value={mpw} onChange={e=>setMpw(e.target.value)} className="w-full p-[11px_14px] border border-[#DADCE0] rounded-[10px] text-sm bg-[#F8F9FA] outline-none focus:border-[#4285F4] focus:bg-white" placeholder="Password (DOB: DDMMYYYY)" autoComplete="off"/></div>
        <button onClick={mobLogin} disabled={loading} className="w-full py-3 bg-[#34A853] text-white rounded-[10px] text-sm font-semibold hover:shadow-[0_4px_16px_rgba(5,150,105,.25)] transition disabled:opacity-50">{loading?'':'Sign In as Selected'}</button>
      </div>}
      <div className="text-center mt-4 text-[10px] text-[#80868B]"><Link href="/" className="text-[#80868B] hover:text-[#4285F4]">Back to School Website</Link><br/><span className="text-[9px] mt-1 block">Default password: Date of Birth (DDMMYYYY)</span></div>
    </div>
    </div>
  );
}

/* DASHBOARD */
const COLS: Record<string,[string,string]>={
  English:['#DBEAFE','#1E40AF'],Hindi:['#D1FAE5','#065F46'],Maths:['#FEF3C7','#92400E'],Science:['#FEE2E2','#991B1B'],
  'Social Studies':['#EDE9FE','#5B21B6'],Sanskrit:['#E0E7FF','#3730A3'],Computer:['#FFEDD5','#9A3412'],AI:['#FCE7F3','#9D174D'],
  'Physical Education':['#CCFBF1','#134E4A'],Art:['#F3E8FF','#6B21A8'],Music:['#FEF9C3','#854D0E'],'General Knowledge':['#E0F2FE','#075985'],
};

function Dash({profile,uid,onLogout}:{profile:StudentProfile;uid:string;onLogout:()=>void}){
  const[tab,setTab]=useState<Tab>('home');const[notes,setNotes]=useState<NoteSubmission[]>([]);
  const[curr,setCurr]=useState<SubjectCurriculum[]>([]);const[sub,setSub]=useState('');const[viewN,setViewN]=useState<NoteSubmission|null>(null);
  const cls=(profile.class||'').toUpperCase();const sec=(profile.section||'A').toUpperCase();
  useEffect(()=>{(async()=>{const[n,c,nt]=await Promise.all([getNotesByClassSection(cls,sec),getCurriculum(cls),getNotices(cls,sec)]);setNotes([...n,...nt]);setCurr(c)})()},[cls,sec]);
  const filtered=sub?notes.filter(n=>n.subject===sub&&n.type!=='Notice'):notes.filter(n=>n.type!=='Notice');
  const notices=notes.filter(n=>n.type==='Notice');
  const sj=curr.length?curr:[...new Set(notes.map(n=>n.subject))].map(s=>({id:s,class:cls,name:s,chapters:[]}as SubjectCurriculum));
  const chs=(()=>{const m:Record<string,NoteSubmission[]>={};filtered.forEach(n=>{const ch=n.chapter||n.title||'General';if(!m[ch])m[ch]=[];m[ch].push(n)});return Object.entries(m)})();
  const TABS=[{id:'home'as Tab,l:'Home'},{id:'profile'as Tab,l:'Profile'},{id:'notices'as Tab,l:'Notices'},{id:'notes'as Tab,l:'Notes'},{id:'links'as Tab,l:'Links'}];
  return <div className="min-h-screen bg-[#F8F9FA]">
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#DADCE0] h-14 flex items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-bold text-sm">SKPPS<span className="text-[10px] text-[#80868B] ml-1">{cls}-{sec}</span></Link><button onClick={onLogout} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Logout</button></header>
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-52 bg-white border-r border-[#DADCE0] hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]"><div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#80868B]">Student Portal</div>{TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 mx-2 rounded-lg text-xs font-medium text-left ${tab===t.id?'bg-[#E8F0FE] text-[#4285F4]':'text-[#5F6368] hover:bg-[#F8F9FA]'}`}>{t.l}</button>))}<div className="mt-auto p-4 border-t text-center text-[10px] text-[#80868B]">SK Presidency</div></aside>
      <main className="flex-1 p-4 md:p-6 pb-20">{tab==='home'?<HomeTab p={profile} n={notices.slice(0,3)} onNav={setTab}/>:tab==='profile'?<ProfTab p={profile}/>:tab==='notices'?<NotTab n={notices}/>:tab==='notes'?<NoteTab sub={sub} setSub={setSub} sj={sj} chs={chs} flt={filtered} vn={viewN} svn={setViewN} p={profile} uid={uid} rf={()=>{getNotesByClassSection(cls,sec).then(n=>getNotices(cls,sec).then(nt=>setNotes([...n,...nt])));getCurriculum(cls).then(setCurr)}}/>:<LinkTab/>}</main>
    </div>
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#DADCE0] h-16 flex md:hidden z-40">{TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-semibold ${tab===t.id?'text-[#4285F4]':'text-[#80868B]'}`}>{t.l}</button>))}</nav>
    {viewN&&<Vw note={viewN} onClose={()=>setViewN(null)}/>}
  </div>;
}

function HomeTab({p,n,onNav}:{p:StudentProfile;n:NoteSubmission[];onNav:(t:Tab)=>void}){return <div><h2 className="text-lg font-bold mb-1">Welcome, {(p.full_name||'Student').split(' ')[0]}</h2><p className="text-xs text-[#80868B] mb-6">Class {p.class}-{p.section||'A'} | {p.house||'Earth'} House | Roll {p.roll_no||'-'}</p><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">{[{v:p.class,l:'Class'},{v:p.house||'Earth',l:'House'},{v:p.roll_no||'-',l:'Roll'},{v:p.parent_phone||'-',l:'Contact'}].map((s,i)=>(<div key={i} className="bg-white border border-[#DADCE0] rounded-xl p-4 text-center hover:shadow-md transition"><div className="text-2xl font-extrabold">{s.v}</div><div className="text-[9px] text-[#80868B] mt-1">{s.l}</div></div>))}</div>{n.length>0&&<div className="bg-white border rounded-xl mb-4"><div className="px-4 py-3 border-b font-semibold text-sm">Recent Notices</div><div className="p-4">{n.map((x,i)=>(<div key={i} className="py-2 border-b border-gray-50 last:border-0"><strong className="text-xs">{x.title}</strong><p className="text-[11px] text-[#5F6368]">{x.content?.substring(0,100)}</p></div>))}</div></div>}<div className="flex gap-2"><button onClick={()=>onNav('notes')} className="px-4 py-2 bg-[#4285F4] text-white text-xs rounded-lg">View Notes</button><Link href="/" className="px-4 py-2 border text-xs rounded-lg">Website</Link></div></div>;}
function ProfTab({p}:{p:StudentProfile}){const r=[['Name',p.full_name],['Father',p.father_name],['Mother',p.mother_name],['Class',p.class+'-'+(p.section||'A')],['Roll',p.roll_no],['House',p.house],['Gender',p.gender],['DOB',p.date_of_birth],['Phone',p.parent_phone],['Blood',p.blood_group],['SR No',p.sr_no||p.student_id]];return <div><h2 className="text-lg font-bold mb-4">My Profile</h2><div className="bg-white border rounded-xl p-6"><div className="flex gap-5 mb-6"><div className="w-16 h-16 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-2xl font-bold">{(p.full_name||'S').charAt(0)}</div><div><h3 className="font-bold text-lg">{p.full_name}</h3><p className="text-xs text-[#80868B]">{p.class}-{p.section||'A'}</p></div></div><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{r.map(([l,v],i)=>(<div key={i} className="flex gap-2 text-xs"><span className="font-semibold text-[#80868B] uppercase text-[10px] w-16">{l}</span><span>{v||'-'}</span></div>))}</div></div></div>;}
function NotTab({n}:{n:NoteSubmission[]}){return <div><h2 className="text-lg font-bold mb-4">Notices</h2>{n.length?<div className="space-y-3">{n.map((x,i)=>(<div key={i} className="bg-white border rounded-xl p-5"><div className="flex justify-between mb-1"><strong className="text-sm">{x.title}</strong><span className="text-[10px] bg-[#E8F0FE] text-[#4285F4] px-2 py-0.5 rounded">Notice</span></div><p className="text-xs text-[#5F6368] whitespace-pre-wrap">{x.content}</p><div className="flex gap-3 text-[10px] text-[#80868B] mt-3 pt-2 border-t"><span>{x.studentName||'Management'}</span><span>{x.createdAt?.toDate?.()?.toLocaleDateString()||''}</span></div></div>))}</div>:<p className="text-center text-[#80868B] py-10">No notices.</p>}</div>;}
function LinkTab(){return <div><h2 className="text-lg font-bold mb-4">Quick Links</h2><div className="grid gap-3 max-w-lg">{[{h:'/',t:'School Website',s:'Homepage',c:'#2563EB'},{h:'/noticeboard',t:'Noticeboard',s:'Announcements',c:'#059669'},{h:'/fees',t:'Fees',s:'Details',c:'#D97706'},{h:'/eventcalendar',t:'Calendar',s:'Schedule',c:'#7C3AED'}].map((l,i)=>(<Link key={i} href={l.h} className="flex items-center gap-3 p-4 bg-white border rounded-xl hover:shadow-md"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:l.c+'15',color:l.c}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><div><div className="font-semibold text-sm">{l.t}</div><div className="text-[11px] text-[#80868B]">{l.s}</div></div><span className="ml-auto text-gray-300">&rarr;</span></Link>))}</div></div>;}
function NoteTab({sub,setSub,sj,chs,flt,vn,svn,p,uid,rf}:any){const[sh,setSh]=useState(false);return <div><h2 className="text-lg font-bold mb-4">Notes & Homework</h2>{!sub?<><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">{sj.map((s:any,i:number)=>{const[bg,fg]=COLS[s.name]||['#F1F5F9','#475569'];const cnt=flt.filter((n:any)=>n.subject===s.name).length;return <button key={i} onClick={()=>setSub(s.name)} className="bg-white border rounded-xl p-5 text-center hover:shadow-lg hover:border-blue-300 transition hover:-translate-y-1"><div className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-extrabold" style={{background:bg,color:fg}}>{s.name.charAt(0)}</div><div className="font-semibold text-sm">{s.name}</div><div className="text-[10px] text-[#80868B] mt-0.5">{cnt} items</div></button>})}</div><div className="p-4 bg-[#E8F0FE] rounded-xl flex items-center gap-4"><span className="text-xs font-semibold">Upload study material</span><button onClick={()=>setSh(true)} className="px-4 py-2 bg-[#4285F4] text-white text-xs rounded-lg">Upload Notes</button></div></>:<><button onClick={()=>setSub('')} className="text-xs text-[#4285F4] mb-4">&larr; All Subjects</button><h3 className="font-bold text-lg mb-1">{sub}</h3><p className="text-xs text-[#80868B] mb-4">{chs.length} chapters | {flt.length} items</p>{chs.length>0&&<div className="flex gap-3 overflow-x-auto pb-3 mb-4">{chs.map(([ch,ns]:any)=>(<button key={ch} onClick={()=>svn(ns[0])} className="flex-shrink-0 w-36 bg-white border rounded-lg overflow-hidden hover:shadow-md"><div className="h-16 bg-gray-100 flex items-center justify-center">{ns[0]?.files?.[0]?.thumb?<img src={ns[0].files[0].thumb} className="w-full h-full object-cover" alt=""/>:'📄'}</div><div className="p-2"><div className="text-[11px] font-semibold truncate">{ch}</div><div className="text-[9px] text-[#80868B]">{ns.length} items</div></div></button>))}</div>}<div className="space-y-2">{flt.map((n:any)=>(<div key={n.id} onClick={()=>svn(n)} className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md"><div className="flex justify-between"><strong className="text-sm">{n.title}</strong><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${n.type==='Homework'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{n.type}</span></div><p className="text-xs text-[#5F6368] mt-1 line-clamp-2">{n.content?.substring(0,150)}</p>{n.files?.length>0&&<div className="flex gap-1 mt-2">{n.files.slice(0,4).map((f:any,i:number)=>(<div key={i} className="w-9 h-9 rounded overflow-hidden">{f.type?.includes('image')?<img src={f.thumb||f.url} className="w-full h-full object-cover" alt=""/>:<div className="w-full h-full bg-red-50 flex items-center justify-center text-[7px] font-bold text-red-600">PDF</div>}</div>))}</div>}<div className="flex gap-3 text-[10px] text-[#80868B] mt-2 pt-2 border-t"><span>{n.studentName}</span><span>{n.createdAt?.toDate?.()?.toLocaleDateString()||''}</span></div></div>))}</div></>}{sh&&<UpMod sj={sj} p={p} uid={uid} onClose={()=>setSh(false)} rf={rf}/>}</div>;}
function UpMod({sj,p,uid,onClose,rf}:any){const[sub,setSub]=useState('');const[tp,setTp]=useState('Notes');const[ch,setCh]=useState('');const[ti,setTi]=useState('');const[co,setCo]=useState('');const[fls,setFls]=useState<File[]>([]);const[up,setUp]=useState(false);const fr=useRef<HTMLInputElement>(null);const co2=sj.find((c:any)=>c.name===sub);const hc=co2?.chapters?.length>0;const du=async()=>{if(!ti.trim()){alert('Enter title');return}setUp(true);const uf:any[]=[];for(const f of fls){const fd=new FormData();fd.append('file',f);try{const r=await fetch('/api/upload',{method:'POST',body:fd});const d=await r.json();if(!d.error)uf.push({url:d.url,thumb:d.thumb||d.url,originalName:d.originalName||f.name,size:d.size,source:d.source,type:d.type})}catch(e){}}await addNote({studentId:uid,studentName:p.full_name,class:p.class.toUpperCase(),section:(p.section||'A').toUpperCase(),subject:sub,type:tp as any,chapter:ch||ti,title:ti,content:co||'See attached',files:uf});onClose();rf()};return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between"><h3 className="font-bold">Upload Notes</h3><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100">&times;</button></div><div className="p-5"><div className="grid grid-cols-2 gap-3 mb-3"><div><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Subject</label><select value={sub} onChange={e=>{setSub(e.target.value);setCh('')}} className="w-full p-2.5 border rounded-lg text-sm bg-[#F8F9FA]"><option value="">Select</option>{sj.map((s:any,i:number)=><option key={i} value={s.name}>{s.name}</option>)}</select></div><div><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Type</label><select value={tp} onChange={e=>setTp(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-[#F8F9FA]"><option>Notes</option><option>Homework</option></select></div></div>{tp==='Notes'&&sub&&hc?<div className="mb-3"><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Chapter</label><select value={ch} onChange={e=>{e.target.value==='__custom__'?setCh(''):setCh(e.target.value)}} className="w-full p-2.5 border rounded-lg text-sm bg-[#F8F9FA]"><option value="">Select</option>{co2?.chapters.map((c:string,i:number)=><option key={i} value={c}>{c}</option>)}<option value="__custom__">Other</option></select></div>:tp==='Notes'?<div className="mb-3"><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Chapter</label><input value={ch} onChange={e=>setCh(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-[#F8F9FA]" placeholder="e.g. Chapter 3"/></div>:null}<div className="mb-3"><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Title*</label><input value={ti} onChange={e=>setTi(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-[#F8F9FA]" placeholder="Descriptive title"/></div>{tp==='Homework'?<div className="mb-3"><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Homework Content</label><textarea value={co} onChange={e=>setCo(e.target.value)} rows={4} className="w-full p-2.5 border rounded-lg text-sm bg-[#F8F9FA] resize-none" placeholder="Write homework..."/></div>:<div className="mb-3"><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Content (optional)</label><textarea value={co} onChange={e=>setCo(e.target.value)} rows={3} className="w-full p-2.5 border rounded-lg text-sm bg-[#F8F9FA] resize-none"/></div>}<div className="mb-4"><label className="text-[10px] font-bold uppercase text-[#5F6368] block mb-1">Files (max 50)</label><div onClick={()=>fr.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-[#E8F0FE] transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" className="mx-auto mb-1"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/></svg><p className="text-xs text-[#80868B]">Click to select images/PDFs</p></div><input ref={fr} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={e=>{if(e.target.files)setFls((p:File[])=>[...p,...Array.from(e.target.files!)].slice(0,50))}}/>{fls.length>0&&<div className="flex flex-wrap gap-1 mt-2">{fls.map((f,i)=>(<div key={i} className="relative w-9 h-9 rounded overflow-hidden border">{f.type.includes('image')?<img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt=""/>:<div className="w-full h-full bg-red-50 flex items-center justify-center text-[6px] font-bold text-red-600">PDF</div>}<button onClick={()=>setFls((p:File[])=>p.filter((_,j)=>j!==i))} className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black/60 rounded-full text-white text-[7px]">&times;</button></div>))}<span className="text-[9px] text-[#80868B] self-center">{fls.length}/50</span></div>}</div><div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2.5 border rounded-xl text-sm">Cancel</button><button onClick={du} disabled={up} className="flex-1 py-2.5 bg-[#4285F4] text-white rounded-xl text-sm">{up?'Uploading...':'Upload'}</button></div></div></div></div>;}
function Vw({note,onClose}:{note:NoteSubmission;onClose:()=>void}){return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white/90 border-b px-5 py-3 flex justify-between"><div><strong className="text-sm">{note.subject} — {note.title}</strong><div className="text-[10px] text-[#80868B]">{note.type} | {note.createdAt?.toDate?.()?.toLocaleDateString()||''}</div></div><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100">&times;</button></div><div className="p-5">{note.files?.map((f:any,i:number)=>(<div key={i} className="mb-3">{f.type?.includes('image')?<img src={f.url} className="rounded-xl max-w-full shadow-md" alt=""/>:<a href={f.url} download className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-[#4285F4]">📎 {f.originalName}</a>}</div>))}{note.content&&note.content!=='See attached'&&<div className="text-sm text-gray-700 whitespace-pre-wrap mt-3">{note.content}</div>}</div></div></div>;}
