'use client';
import Link from 'next/link';

const sidebarLinks = [
  {h:'/noticeboard',l:'Noticeboard',i:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',c:'#2563EB'},
  {h:'/eventcalendar',l:'Event Calendar',i:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',c:'#059669'},
  {h:'/admission',l:'Admissions',i:'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2',c:'#DC2626'},
  {h:'/fees',l:'Fees Structure',i:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',c:'#D97706'},
  {h:'/facilities',l:'Facilities',i:'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4',c:'#7C3AED'},
  {h:'/aboutschool',l:'About School',i:'M22 10l-10-7L2 10M4 11v8M20 11v8M8 11v8h8v-8M12 18v-3',c:'#0F766E'},
  {h:'/sports',l:'School Sports',i:'M12 2a15.3 15.3 0 014 10M12 2a15.3 15.3 0 00-4 10M2 12h20',c:'#EA580C'},
  {h:'/principal',l:"Principal's Message",i:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8',c:'#4F46E5'},
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-gray-900">
          <img src="/images/logo-transparent.png" alt="SKPPS" className="w-8 h-8 object-contain rounded-lg"/>
          SK Presidency Public School
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/student" className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.97]">Student Login</Link>
          <Link href="/staff" className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition hidden sm:inline">Staff</Link>
        </div>
      </header>

      <div className="bg-blue-600 text-white overflow-hidden"><div className="flex items-center gap-2 px-5 py-2 max-w-6xl mx-auto">
        <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full flex-shrink-0">LATEST</span>
        <div className="overflow-hidden"><div className="flex gap-12 text-xs whitespace-nowrap animate-[ticker_30s_linear_infinite]">
          <a href="/Prospectus.pdf" className="text-white/90 hover:text-white">Registration Open 2026-2027</a><span className="opacity-30">|</span>
          <a href="/AdmissionForm.pdf" className="text-white/90 hover:text-white">Admission Form</a><span className="opacity-30">|</span>
          <span>CBSE: 2133231 | Contact: 86017 35757</span><span className="opacity-30">|</span>
          <a href="/Prospectus.pdf" className="text-white/90 hover:text-white">Registration Open 2026-2027</a><span className="opacity-30">|</span>
          <a href="/AdmissionForm.pdf" className="text-white/90 hover:text-white">Admission Form</a>
        </div></div>
      </div></div>

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
              <div className="w-44 h-44 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center animate-[float_6s_ease-in-out_infinite] shadow-xl shadow-blue-100/30">
                <img src="/images/logo-transparent.png" alt="SKPPS" className="w-20 h-20 object-contain"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white border-y border-gray-200"><div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 text-center">
        {[{n:'800+',l:'Students'},{n:'40+',l:'Teachers'},{n:'15+',l:'Years'},{n:'100%',l:'Results'}].map((s,i)=>(
          <div key={i} className="py-8 px-4"><div className="text-3xl md:text-4xl font-black tracking-tight">{s.n}</div><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mt-1">{s.l}</div></div>
        ))}
      </div></div>

      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex gap-8">
          <aside className="w-52 flex-shrink-0 hidden lg:block sticky top-[72px] self-start">
            <div className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.1em] px-3.5 py-2.5 rounded-t-lg">Quick Links</div>
            <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden shadow-sm">
              {sidebarLinks.map(s=>(
                <Link key={s.h} href={s.h} className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium border-b border-gray-100 last:border-0 transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-800">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.c} strokeWidth="2" opacity="0.5"><path d={s.i}/></svg>{s.l}
                </Link>
              ))}
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-amber-700 mb-1">Admissions Open 2026-27</p>
              <Link href="/admission" className="text-[10px] font-semibold text-amber-600 hover:text-amber-800">Apply Now →</Link>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-10">
              <div className="mb-6"><span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Why Choose Us</span><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">Education Beyond the Classroom</h2></div>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/aboutschool" className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M22 10l-10-7L2 10M4 11v8M20 11v8M8 11v8h8v-8M12 18v-3"/></svg></div>
                  <h3 className="font-bold text-sm">About Our School</h3><p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Founded by Dr. Shrikant Upadhyaya Educational & Charitable Trust. Complete learning from Play Group to Standard XII.</p>
                </Link>
                <Link href="/academiccurriculum" className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg></div>
                  <h3 className="font-bold text-sm">Academic Curriculum</h3><p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Rigorous CBSE-aligned academics with smart classrooms and modern audio-visual aids for interactive learning.</p>
                </Link>
                <Link href="/sports" className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M12 12a5 5 0 100-10M12 12a15.3 15.3 0 014 10M12 12a15.3 15.3 0 00-4 10M2 12h20"/></svg></div>
                  <h3 className="font-bold text-sm">Sports & Activities</h3><p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Comprehensive sports program, annual meets, yoga, and physical education for all-round development.</p>
                </Link>
              </div>
            </div>

            <div>
              <div className="mb-6"><span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Quick Access</span><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">Everything You Need</h2></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/noticeboard" className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{background:'#2563EB15',color:'#2563EB'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg></div>
                  <div><div className="font-semibold text-sm">Notice Board</div><div className="text-xs text-gray-400">Latest announcements & results</div></div><span className="ml-auto text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">&rarr;</span>
                </Link>
                <Link href="/eventcalendar" className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-emerald-200 transition-all group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{background:'#05966915',color:'#059669'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
                  <div><div className="font-semibold text-sm">Event Calendar</div><div className="text-xs text-gray-400">Academic schedule & activities</div></div><span className="ml-auto text-gray-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">&rarr;</span>
                </Link>
                <Link href="/admission" className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-red-200 transition-all group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{background:'#DC262615',color:'#DC2626'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg></div>
                  <div><div className="font-semibold text-sm">Admissions</div><div className="text-xs text-gray-400">Session 2026-2027 open now</div></div><span className="ml-auto text-gray-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all">&rarr;</span>
                </Link>
                <Link href="/fees" className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-amber-200 transition-all group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{background:'#D9770615',color:'#D97706'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
                  <div><div className="font-semibold text-sm">Fees Structure</div><div className="text-xs text-gray-400">Transparent fee details</div></div><span className="ml-auto text-gray-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">&rarr;</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-16 text-center">
        <div className="max-w-6xl mx-auto px-5"><h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Join the SK Presidency Family</h2><p className="text-blue-200 mb-8 max-w-md mx-auto">Admissions open for Play Group to Class XII.</p>
        <div className="flex gap-3 justify-center flex-wrap"><Link href="/admission" className="bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold text-sm hover:shadow-xl transition">Apply for Admission</Link><Link href="/contact" className="border border-blue-400/40 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition">Contact Us</Link></div></div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12"><div className="max-w-6xl mx-auto px-5">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img src="/images/logo-transparent.png" alt="SKPPS" className="w-10 h-10 object-contain rounded-lg"/>
              <h3 className="text-white font-bold text-lg">SK Presidency Public School</h3>
            </div>
            <p className="text-sm text-gray-500">Dr. Shrikant Upadhyaya Educational & Charitable Trust<br/>CBSE: 2133231<br/>Vill. Odara, Faizabad Sultanpur Bypass, Sultanpur, UP — 228001<br/>86017 35757 | 86017 38180</p>
          </div>
          <div><h4 className="text-white text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Quick Links</h4>
            <Link href="/aboutschool" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">About School</Link>
            <Link href="/noticeboard" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">Notice Board</Link>
            <Link href="/admission" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">Admissions</Link>
            <Link href="/fees" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">Fees Structure</Link>
            <Link href="/eventcalendar" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">Event Calendar</Link>
            <Link href="/contact" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">Contact</Link>
          </div>
          <div><h4 className="text-white text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Portals</h4>
            <Link href="/student" className="block text-sm py-0.5 text-blue-400 hover:text-blue-300 font-medium">Student Login</Link>
            <Link href="/staff" className="block text-sm py-0.5 text-blue-400 hover:text-blue-300 font-medium">Staff Login</Link>
            <Link href="/governingbody" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">Governing Body</Link>
            <Link href="/career" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">Careers</Link>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-4 flex justify-between flex-wrap gap-2 text-xs"><span>&copy; SK Presidency Public School 2025-2028</span><span>Powered by Astra Infotech</span></div>
      </div></footer>
    </div>
  );
}
