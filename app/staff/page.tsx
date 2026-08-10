'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { signInAnonymously } from 'firebase/auth';
import { getDoc, doc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import Link from 'next/link';

export default function StaffPortal() {
  const [tab, setTab] = useState<'mgmt'|'tchr'>('mgmt');
  const [code, setCode] = useState(''); const [mpass, setMpass] = useState('');
  const [uname, setUname] = useState(''); const [tpass, setTpass] = useState('');
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const MC = 'Haziq1962', MP = 'Haziq1962';

  async function doLogin(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      if (tab === 'mgmt') {
        if (!code || !mpass) { setErr('Please fill both fields'); setLoading(false); return; }
        // Try Firestore
        let ok = false;
        try { const d = await getDoc(doc(db, 'settings', 'management')); if (d.exists()) { const dt = d.data(); if (dt.security_code === code && dt.password === mpass) ok = true; } } catch (e) {}
        if (!ok && code === MC && mpass === MP) ok = true;
        if (!ok) { setErr('Invalid security code or password'); setLoading(false); return; }
        sessionStorage.setItem('skpps_role', 'mgmt'); sessionStorage.setItem('skpps_name', 'Management'); sessionStorage.setItem('skpps_auth', '1');
        setUser({ role: 'mgmt', name: 'Management' });
      } else {
        if (!uname || !tpass) { setErr('Please fill both fields'); setLoading(false); return; }
        let t: any = null;
        try {
          const qq = query(collection(db, 'teachers'), where('username', '==', uname), limit(1));
          const s = await getDocs(qq);
          if (!s.empty) { const d = s.docs[0]; t = d.data(); t.id = d.id; }
        } catch (e) {}
        if (!t || t.password !== tpass) { setErr('Invalid username or password'); setLoading(false); return; }
        sessionStorage.setItem('skpps_role', 'teacher'); sessionStorage.setItem('skpps_name', t.full_name || t.name);
        sessionStorage.setItem('skpps_tclass', t.class || ''); sessionStorage.setItem('skpps_tsection', t.section || ''); sessionStorage.setItem('skpps_auth', '1');
        setUser({ role: 'teacher', id: t.id, name: t.full_name || t.name, class: t.class || '', section: t.section || '' });
      }
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  if (user) return <StaffDash data={user} onLogout={() => { setUser(null); auth.signOut(); }} />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#F9FAFB',backgroundImage:'radial-gradient(#E2E8F0 1px,transparent 1px)',backgroundSize:'28px 28px'}}>
    <div className="w-full max-w-[400px] bg-white border border-[#E2E8F0] rounded-[10px] p-8 shadow-[0_8px_32px_rgba(0,0,0,.06)]" style={{animation:'scaleIn .4s cubic-bezier(0.16,1,0.3,1)'}}>
      <div className="text-center mb-6">
        <img src="/images/logo-transparent.png" alt="SKPPS" className="w-12 h-12 object-contain mx-auto mb-2 rounded-full" onError={(e:any)=>{e.target.style.display='none'}}/>
        <div className="text-[11px] font-bold tracking-[0.03em] text-[#0F172A]">SK PRESIDENCY PUBLIC SCHOOL</div>
        <div className="text-[9px] text-[#94A3B8] mt-0.5">CBSE: 2133231 | Sultanpur, UP</div>
      </div>
      <h2 className="text-xl font-bold text-center mb-1 text-[#0F172A]">Staff Portal</h2>
      <p className="text-xs text-[#64748B] text-center mb-5">Management & Teacher Access</p>
      <div className="flex border-b border-[#E2E8F0] mb-5">
        <button onClick={() => { setTab('mgmt'); setErr(''); }} className={`flex-1 pb-2.5 text-[13px] font-semibold border-b-2 transition ${tab==='mgmt'?'text-[#2563EB] border-[#2563EB]':'text-[#64748B] border-transparent'}`}>Management</button>
        <button onClick={() => { setTab('tchr'); setErr(''); }} className={`flex-1 pb-2.5 text-[13px] font-semibold border-b-2 transition ${tab==='tchr'?'text-[#2563EB] border-[#2563EB]':'text-[#64748B] border-transparent'}`}>Teacher</button>
      </div>
      {err && <div className="bg-[#FEF2F2] text-[#DC2626] p-2.5 rounded-[10px] text-xs mb-3 font-medium">{err}</div>}
      <form onSubmit={doLogin}>
        {tab === 'mgmt' ? <>
          <div className="mb-3.5"><input type="password" value={code} onChange={e => setCode(e.target.value)} className="w-full p-[11px_14px] border border-[#E2E8F0] rounded-[10px] text-sm bg-[#F9FAFB] outline-none focus:border-[#2563EB] focus:bg-white" placeholder="Security Access Code" autoComplete="off"/></div>
          <div className="mb-5"><input type="password" value={mpass} onChange={e => setMpass(e.target.value)} className="w-full p-[11px_14px] border border-[#E2E8F0] rounded-[10px] text-sm bg-[#F9FAFB] outline-none focus:border-[#2563EB] focus:bg-white" placeholder="Management Password" autoComplete="off"/></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#2563EB] text-white rounded-[10px] text-sm font-semibold hover:bg-[#1D4ED8] hover:-translate-y-px transition disabled:opacity-50">{loading ? '' : 'Access Management Panel'}</button>
        </> : <>
          <div className="mb-3.5"><input value={uname} onChange={e => setUname(e.target.value)} className="w-full p-[11px_14px] border border-[#E2E8F0] rounded-[10px] text-sm bg-[#F9FAFB] outline-none focus:border-[#2563EB] focus:bg-white" placeholder="Teacher Username" autoComplete="off"/></div>
          <div className="mb-5"><input type="password" value={tpass} onChange={e => setTpass(e.target.value)} className="w-full p-[11px_14px] border border-[#E2E8F0] rounded-[10px] text-sm bg-[#F9FAFB] outline-none focus:border-[#2563EB] focus:bg-white" placeholder="Password" autoComplete="off"/></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#2563EB] text-white rounded-[10px] text-sm font-semibold hover:bg-[#1D4ED8] hover:-translate-y-px transition disabled:opacity-50">{loading ? '' : 'Sign In'}</button>
        </>}
      </form>
      <div className="text-center mt-4 text-[10px] text-[#94A3B8]"><Link href="/" className="text-[#94A3B8] hover:text-[#2563EB]">School Website</Link> | Staff Only</div>
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
        <Link href="/" className="flex items-center gap-2 font-bold text-sm">{isMgmt ? 'Management' : 'Staff'}<span className="text-[10px] text-gray-400 ml-1"> — {data.name}{data.class ? ` | ${data.class}${data.section ? '-' + data.section : ''}` : ''}</span></Link>
        <button onClick={onLogout} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Logout</button>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <aside className="w-48 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]">
          <div className="px-4 py-3 text-[10px] font-bold uppercase text-gray-400">{isMgmt ? 'Admin' : 'Staff'}</div>
          {tabs.map(t => (<button key={t} onClick={() => setTab(t)} className={`text-left flex items-center gap-2 px-4 py-2.5 mx-2 rounded-lg text-xs font-medium ${tab === t ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>))}
          <div className="mt-auto p-4 border-t text-center text-[10px] text-gray-400">SK Presidency</div>
        </aside>
        <main className="flex-1 p-4 md:p-6 pb-20"><h2 className="text-lg font-bold mb-4">Welcome, {data.name}</h2><p className="text-xs text-gray-400">Dashboard ready.</p></main>
      </div>
    </div>
  );
}
