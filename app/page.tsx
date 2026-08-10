'use client';
import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/aboutschool', label: 'About School' },
  { href: '/governingbody', label: 'Governing Body' },
  { href: '/vision', label: 'Vision & Mission' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/academiccurriculum', label: 'Curriculum' },
  { href: '/studentsservices', label: 'Services' },
  { href: '/career', label: 'Career' },
  { href: '/contact', label: 'Contact' },
];

const SIDEBAR = [
  {h:'/noticeboard',l:'Noticeboard',i:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',c:'#2563EB'},
  {h:'/eventcalendar',l:'Event Calendar',i:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',c:'#059669'},
  {h:'/admission',l:'Admissions',i:'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2',c:'#DC2626'},
  {h:'/fees',l:'Fees Structure',i:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',c:'#D97706'},
  {h:'/facilities',l:'Facilities',i:'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4',c:'#7C3AED'},
  {h:'/aboutschool',l:'About School',i:'M22 10l-10-7L2 10M4 11v8M20 11v8M8 11v8h8v-8M12 18v-3',c:'#0F766E'},
  {h:'/sports',l:'School Sports',i:'M12 2a15.3 15.3 0 014 10M12 2a15.3 15.3 0 00-4 10M2 12h20',c:'#EA580C'},
  {h:'/principal',l:"Principal's Message",i:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8',c:'#4F46E5'},
  {h:'https://www.skpresidency.com/Prospectus.pdf',l:'Download Prospectus',i:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10 12 15 17 10M12 15V3',c:'#0891B2'},
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ═══ TOPBAR ═══ */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-gray-900">
          <img src="/images/logo-transparent.png" alt="SKPPS" className="w-8 h-8 object-contain rounded-lg"/>
          SK Presidency Public School
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/student" className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.97]">Student Login</Link>
          <Link href="/staff" className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition hidden sm:inline">Staff</Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95">
            <div className="w-4 h-3 flex flex-col justify-between">
              <span className={`block w-full h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}/>
              <span className={`block w-full h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`}/>
              <span className={`block w-full h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}/>
            </div>
          </button>
        </div>
      </header>

      {/* ═══ SLIDE-IN MOBILE MENU ═══ */}
      <div className={`sm:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-black/50 to-indigo-900/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)}/>
        <div className={`absolute top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{transition:'transform 400ms cubic-bezier(0.16,1,0.3,1)'}}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5">
                <img src="/images/logo-transparent.png" alt="SKPPS" className="w-9 h-9 object-contain rounded-lg"/>
                <div className="text-white"><div className="font-bold text-sm leading-tight">SK Presidency</div><div className="text-[9px] text-blue-200">Public School</div></div>
              </Link>
              <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="flex gap-2">
              <Link href="/student" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-white text-blue-700 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition">Student Login</Link>
              <Link href="/staff" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-white/15 text-white rounded-lg text-[11px] font-bold hover:bg-white/25 transition">Staff</Link>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-3 px-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 px-2">Navigate</div>
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-sm font-medium transition-all ${n.href==='/' ? 'bg-blue-50 text-blue-600 font-semibold shadow-[inset_0_0_0_1px_rgba(37,99,235,.2)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.href==='/'?'bg-blue-600 scale-125 shadow-[0_0_8px_rgba(37,99,235,.4)]':'bg-gray-300'}`}/>{n.label}{n.href==='/'&&<span className="ml-auto text-[10px] text-blue-400">● Active</span>}
              </Link>
            ))}
            <div className="my-4 border-t border-gray-100"/>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 px-2">Quick Links</div>
            {SIDEBAR.map((s, i) => (
              <Link key={s.h} href={s.h} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={s.c} strokeWidth="2" opacity="0.4"><path d={s.i}/></svg>{s.l}
              </Link>
            ))}
          </div>
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50"><div className="flex items-center justify-between text-[9px] text-gray-400"><span>CBSE: 2133231</span><span>Astra Infotech</span></div></div>
        </div>
      </div>

      {/* ═══ NEWS TICKER ═══ */}
      <div className="bg-blue-600 text-white overflow-hidden"><div className="flex items-center gap-2 px-5 py-2 max-w-6xl mx-auto">
        <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full flex-shrink-0">LATEST</span>
        <div className="overflow-hidden"><div className="flex gap-12 text-xs whitespace-nowrap animate-[ticker_30s_linear_infinite]">
          <a href="https://www.skpresidency.com/Prospectus.pdf" className="text-white/90 hover:text-white">Registration Open 2026-2027</a><span className="opacity-30">|</span>
          <a href="https://www.skpresidency.com/AdmissionForm.pdf" className="text-white/90 hover:text-white">Admission Form</a><span className="opacity-30">|</span>
          <span>CBSE: 2133231 | Contact: 86017 35757</span><span className="opacity-30">|</span>
          <a href="https://www.skpresidency.com/Prospectus.pdf" className="text-white/90 hover:text-white">Registration Open 2026-2027</a><span className="opacity-30">|</span>
          <a href="https://www.skpresidency.com/AdmissionForm.pdf" className="text-white/90 hover:text-white">Admission Form</a>
        </div></div>
      </div></div>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(#CBD5E1 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="animate-[fadeUp_.6s_ease-out_both]">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] mb-4">Shaping<br/><span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Future Leaders</span></h1>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">Play Group to Class XII — CBSE Affiliated. Founded 2013 in Sultanpur. World-class academics blended with character building.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/aboutschool" className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg transition-all">About Our School</Link>
                <Link href="/admission" className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">Admissions 2026-27</Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-44 h-44 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center animate-[float_6s_ease-in-out_infinite] shadow-xl shadow-blue-100/30 hover:shadow-2xl hover:shadow-blue-200/40 transition-shadow duration-500">
                <img src="/images/logo-transparent.png" alt="SKPPS" className="w-20 h-20 object-contain"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <div className="bg-white border-y border-gray-200"><div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 text-center stagger">
        {[{n:'800+',l:'Students'},{n:'40+',l:'Teachers'},{n:'15+',l:'Years'},{n:'100%',l:'Results'}].map((s,i)=>(
          <div key={i} className="py-8 px-4"><div className="text-3xl md:text-4xl font-black tracking-tight transition-all duration-300">{s.n}</div><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mt-1">{s.l}</div></div>
        ))}
      </div></div>

      {/* ═══ CONTENT + DESKTOP SIDEBAR ═══ */}
      <div className="max-w-6xl mx-auto px-5 py-12"><div className="flex gap-8">
        <aside className="w-52 flex-shrink-0 hidden lg:block sticky top-[72px] self-start">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] font-bold uppercase tracking-[0.1em] px-3.5 py-2.5 rounded-t-lg shadow-sm">Quick Links</div>
          <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden shadow-sm">
            {SIDEBAR.map(s=>(
              <Link key={s.h} href={s.h} className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium border-b border-gray-100 last:border-0 transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-800 hover:border-l-[3px] hover:border-l-gray-200 hover:translate-x-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.c} strokeWidth="2" opacity="0.5"><path d={s.i}/></svg>{s.l}
              </Link>
            ))}
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center hover:shadow-md hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-bold text-amber-700 mb-1">Admissions Open 2026-27</p>
            <Link href="/admission" className="text-[10px] font-semibold text-amber-600 hover:text-amber-800">Apply Now →</Link>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <div className="mb-6"><span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Why Choose Us</span><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">Education Beyond the Classroom</h2></div>
            <div className="grid md:grid-cols-3 gap-4 stagger">
              <Link href="/aboutschool" className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"><div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M22 10l-10-7L2 10M4 11v8M20 11v8M8 11v8h8v-8M12 18v-3"/></svg></div><h3 className="font-bold text-sm">About Our School</h3><p className="text-xs text-gray-500 mt-1.5">Founded by Dr. Shrikant Upadhyaya Educational & Charitable Trust.</p></Link>
              <Link href="/academiccurriculum" className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300"><div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg></div><h3 className="font-bold text-sm">Academic Curriculum</h3><p className="text-xs text-gray-500 mt-1.5">Rigorous CBSE-aligned academics with smart classrooms.</p></Link>
              <Link href="/sports" className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300"><div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M12 12a5 5 0 100-10M12 12a15.3 15.3 0 014 10M12 12a15.3 15.3 0 00-4 10M2 12h20"/></svg></div><h3 className="font-bold text-sm">Sports & Activities</h3><p className="text-xs text-gray-500 mt-1.5">Comprehensive sports program and physical education.</p></Link>
            </div>
          </div>
          <div>
            <div className="mb-6"><span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Quick Access</span><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">Everything You Need</h2></div>
            <div className="grid sm:grid-cols-2 gap-4 stagger">
              {[
                {h:'/noticeboard',t:'Notice Board',s:'Latest announcements',c:'#2563EB',i:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0'},
                {h:'/eventcalendar',t:'Event Calendar',s:'Academic schedule',c:'#059669',i:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7'},
                {h:'/admission',t:'Admissions',s:'Session 2026-2027',c:'#DC2626',i:'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2'},
                {h:'/fees',t:'Fees Structure',s:'Transparent details',c:'#D97706',i:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5'},
              ].map((q,i)=>(<Link key={i} href={q.h} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all group"><div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" style={{background:q.c+'15',color:q.c}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={q.i}/></svg></div><div><div className="font-semibold text-sm">{q.t}</div><div className="text-xs text-gray-400">{q.s}</div></div><span className="ml-auto text-gray-300 group-hover:translate-x-1.5 transition-all">&rarr;</span></Link>))}
            </div>
          </div>
        </main>
      </div></div>

      {/* ═══ CTA ═══ */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-16 text-center"><div className="max-w-6xl mx-auto px-5"><h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Join the SK Presidency Family</h2><p className="text-blue-200 mb-8 max-w-md mx-auto">Admissions open for Play Group to Class XII.</p><div className="flex gap-3 justify-center flex-wrap"><Link href="/admission" className="bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.97]">Apply for Admission</Link><Link href="/contact" className="border border-blue-400/40 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all active:scale-[0.97]">Contact Us</Link></div></div></section>

      {/* ═══ YOUTUBE VIDEO + REGISTRATION ═══ */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
                <h3 className="text-white font-bold text-sm">Video on the School</h3>
              </div>
              <div className="aspect-video bg-gray-900">
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/IWTaYEczNkg?rel=0" title="SKPPS" allowFullScreen className="w-full h-full"/>
              </div>
              <div className="p-3 bg-gray-50 border-t">
                <a href="https://www.youtube.com/channel/UCyYHfZf4gxt_aKjEqqqkmYg" target="_blank" rel="noopener" className="text-[11px] text-blue-600 font-semibold hover:underline">Subscribe to YouTube Channel &rarr;</a>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Registration Open For Session 2026-2027</h3>
                <p className="text-blue-100 text-sm mb-4">Contact <strong className="text-white">86017 35757, 86017 38180</strong></p>
                <div className="flex gap-3">
                  <a href="https://www.skpresidency.com/Prospectus.pdf" className="bg-white text-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-50 transition">Prospectus</a>
                  <a href="https://www.skpresidency.com/AdmissionForm.pdf" className="bg-white/15 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/25 transition">Admission Form</a>
                </div>
              </div>
              <div className="bg-white border rounded-2xl p-4"><div className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"/><div><p className="text-sm font-semibold">XII standard classes approved</p><a href="https://www.skpresidency.com/Prospectus.pdf" className="text-[11px] text-blue-600 font-semibold hover:underline">Prospectus 2026-2027</a></div></div></div>
              <div className="bg-white border rounded-2xl p-4"><div className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"/><div><p className="text-sm font-semibold">Plant Tree campaign by HDFC Bank</p><Link href="/eventcalendar" className="text-[11px] text-blue-600 font-semibold hover:underline">Details</Link></div></div></div>
              <div className="bg-white border rounded-2xl p-4"><div className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"/><div><p className="text-sm font-semibold">Mango Day celebrated on 14th July, 2023</p><Link href="/eventcalendar" className="text-[11px] text-blue-600 font-semibold hover:underline">Details</Link></div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCROLLING PHOTO STRIP ═══ */}
      <div className="bg-white border-y border-gray-200 py-3 overflow-hidden">
        <div className="flex gap-3 animate-[ticker_35s_linear_infinite]">
          {Array.from({length:13},(_,i)=>(
            <img key={i} src={`https://skpresidency.com/images/scroll/${(i%9)+1}.jpg`} alt="" className="h-20 w-auto rounded-lg object-cover flex-shrink-0 shadow-sm"/>
          ))}
          <img src="https://skpresidency.com/images/scroll/12.jpg" alt="" className="h-20 w-auto rounded-lg object-cover flex-shrink-0 shadow-sm"/>
          {Array.from({length:13},(_,i)=>(
            <img key={`d${i}`} src={`https://skpresidency.com/images/scroll/${(i%9)+1}.jpg`} alt="" className="h-20 w-auto rounded-lg object-cover flex-shrink-0 shadow-sm"/>
          ))}
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-gray-400 py-12"><div className="max-w-6xl mx-auto px-5">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2"><div className="flex items-center gap-3 mb-3"><img src="/images/logo-transparent.png" alt="SKPPS" className="w-10 h-10 object-contain rounded-lg"/><h3 className="text-white font-bold text-lg">SK Presidency Public School</h3></div><p className="text-sm text-gray-500">Dr. Shrikant Upadhyaya Educational & Charitable Trust<br/>CBSE: 2133231<br/>Vill. Odara, Faizabad Sultanpur Bypass, Sultanpur, UP — 228001<br/>86017 35757 | 86017 38180</p></div>
          <div><h4 className="text-white text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Quick Links</h4><Link href="/aboutschool" className="block text-sm py-0.5 text-gray-500 hover:text-white">About School</Link><Link href="/noticeboard" className="block text-sm py-0.5 text-gray-500 hover:text-white">Notice Board</Link><Link href="/admission" className="block text-sm py-0.5 text-gray-500 hover:text-white">Admissions</Link><Link href="/fees" className="block text-sm py-0.5 text-gray-500 hover:text-white">Fees</Link><Link href="/contact" className="block text-sm py-0.5 text-gray-500 hover:text-white">Contact</Link></div>
          <div><h4 className="text-white text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Portals</h4><Link href="/student" className="block text-sm py-0.5 text-blue-400 hover:text-blue-300 font-medium">Student Login</Link><Link href="/staff" className="block text-sm py-0.5 text-blue-400 hover:text-blue-300 font-medium">Staff Login</Link><Link href="/governingbody" className="block text-sm py-0.5 text-gray-500 hover:text-white">Governing Body</Link><Link href="/career" className="block text-sm py-0.5 text-gray-500 hover:text-white">Careers</Link></div>
        </div>
        <div className="border-t border-gray-800 pt-4 flex justify-between flex-wrap gap-2 text-xs"><span>&copy; SK Presidency Public School 2025-2028</span><span>Powered by Astra Infotech</span></div>
      </div></footer>
    </div>
  );
}
