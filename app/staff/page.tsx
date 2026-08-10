'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { signInAnonymously } from 'firebase/auth';
import { getTeacherByUsername, verifyManagement } from '@/lib/firebase/firestore';
import Link from 'next/link';

export default function StaffPortal() {
  const [mode, setMode] = useState<'mgmt'|'tchr'>('mgmt');
  const [code, setCode] = useState(''); const [mpass, setMpass] = useState('');
  const [uname, setUname] = useState(''); const [tpass, setTpass] = useState('');
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      if (mode === 'mgmt') {
        if (!code || !mpass) { setErr('Please fill both fields'); setLoading(false); return; }
        const fireOk = await verifyManagement(code, mpass);
        const hardOk = code === 'Haziq1962' && mpass === 'Haziq1962';
        if (!fireOk && !hardOk) { setErr('Invalid security code or password'); setLoading(false); return; }
        setUser({ role: 'mgmt', name: 'Management' });
      } else {
        if (!uname || !tpass) { setErr('Please fill both fields'); setLoading(false); return; }
        const t = await getTeacherByUsername(uname);
        if (!t || t.password !== tpass) { setErr('Invalid username or password'); setLoading(false); return; }
        setUser({ role: 'teacher', id: t.id, name: t.full_name, class: t.class || '', section: t.section || '' });
      }
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  if (user) return <StaffDash data={user} onLogout={() => { setUser(null); auth.signOut(); }} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50/30 px-4" style={{backgroundImage:'radial-gradient(#CBD5E1 1px,transparent 1px)',backgroundSize:'28px 28px'}}>
      <div className="w-full max-w-md bg-white/85 backdrop-blur-2xl border border-white/50 rounded-2xl p-8 shadow-xl animate-[scaleIn_.5s_ease]">
        <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-blue-600 mb-4 inline-block">&larr; Back</Link>
        <div className="text-center mb-5">
          <img src="/images/logo-transparent.png" alt="SKPPS" className="w-14 h-14 object-contain mx-auto mb-2 rounded-full" onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'; }}/>
          <div className="text-xs font-bold tracking-wide text-gray-700">SK PRESIDENCY PUBLIC SCHOOL</div>
          <div className="text-[10px] text-gray-400 mt-0.5">CBSE: 2133231 | Sultanpur, UP</div>
        </div>
        <h2 className="text-xl font-bold text-center mb-1">Staff Portal</h2>
        <p className="text-xs text-gray-400 text-center mb-5">Management & Teacher Access</p>
        <div className="flex border-b border-gray-200 mb-5">
          <button onClick={()=>{setMode('mgmt');setErr('')}} className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition ${mode==='mgmt'?'text-blue-600 border-blue-600':'text-gray-400 border-transparent'}`}>Management</button>
          <button onClick={()=>{setMode('tchr');setErr('')}} className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition ${mode==='tchr'?'text-blue-600 border-blue-600':'text-gray-400 border-transparent'}`}>Teacher</button>
        </div>
        {err && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 font-medium">{err}</div>}
        <form onSubmit={doLogin}>
          {mode==='mgmt' ? <>
            <div className="mb-3"><label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Security Access Code</label><input type="password" value={code} onChange={e=>setCode(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 outline-none" placeholder="Security code" autoComplete="off"/></div>
            <div className="mb-5"><label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Management Password</label><input type="password" value={mpass} onChange={e=>setMpass(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 outline-none" placeholder="Password" autoComplete="off"/></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">{loading?'Signing in...':'Access Management Panel'}</button>
          </> : <>
            <div className="mb-3"><label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Teacher Username</label><input value={uname} onChange={e=>setUname(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 outline-none" placeholder="Username" autoComplete="off"/></div>
            <div className="mb-5"><label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Password</label><input type="password" value={tpass} onChange={e=>setTpass(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:border-blue-500 outline-none" placeholder="Password" autoComplete="off"/></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">{loading?'Signing in...':'Sign In'}</button>
          </>}
        </form>
        <p className="text-center mt-5 text-[10px] text-gray-400"><Link href="/">School Website</Link> | Staff Only</p>
      </div>
    </div>
  );
}

function StaffDash({ data, onLogout }: { data: any; onLogout: () => void }) {
  const [tab, setTab] = useState('home');
  const isMgmt = data.role === 'mgmt';
  const tabs = isMgmt ? ['home','students','teachers','curriculum','notices','settings'] : ['home','students','assign','notices','curriculum'];
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm">{isMgmt?'Management':'Staff'}<span className="text-[10px] text-gray-400 ml-1"> — {data.name}</span></Link>
        <button onClick={onLogout} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Logout</button>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <aside className="w-48 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="px-4 py-3 text-[10px] font-bold uppercase text-gray-400">{isMgmt?'Admin':'Staff'}</div>
          {tabs.map(t=>(<button key={t} onClick={()=>setTab(t)} className={`text-left flex items-center gap-2 px-4 py-2.5 mx-2 rounded-lg text-xs font-medium ${tab===t?'bg-blue-50 text-blue-600':'text-gray-500 hover:bg-gray-50'}`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>))}
          <div className="mt-auto p-4 border-t text-center text-[10px] text-gray-400">SK Presidency</div>
        </aside>
        <main className="flex-1 p-4 md:p-6 pb-20">
          <h2 className="text-lg font-bold mb-4">Welcome, {data.name}</h2>
          <p className="text-xs text-gray-400">Staff dashboard — full features coming soon.</p>
        </main>
      </div>
    </div>
  );
}
