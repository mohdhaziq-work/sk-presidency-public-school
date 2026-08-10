import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-gray-200 h-14 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-gray-900">
          <span className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold">SK</span>
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
                <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-[2.5rem] font-black text-blue-600">S</div>
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
      <section className="py-16 max-w-6xl mx-auto px-5">
        <div className="text-center mb-8"><span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Why Choose Us</span><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">Education Beyond the Classroom</h2></div>
        <div className="grid md:grid-cols-3 gap-4">
          {[{t:'About Our School',d:'Founded by Dr. Shrikant Upadhyaya Educational & Charitable Trust. Complete learning from Play Group to Standard XII.',bg:'bg-blue-50',c:'#2563EB',i:'M22 10l-10-7L2 10M4 11v8M20 11v8M8 11v8h8v-8M12 18v-3'},
            {t:'Academic Curriculum',d:'Rigorous CBSE-aligned academics with smart classrooms and modern audio-visual aids.',bg:'bg-emerald-50',c:'#059669',i:'M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'},
            {t:'Sports & Activities',d:'Comprehensive sports program, annual meets, yoga, and physical education for all-round development.',bg:'bg-amber-50',c:'#D97706',i:'M12 12a5 5 0 100-10M12 12a15.3 15.3 0 014 10M12 12a15.3 15.3 0 00-4 10M2 12h20'}].map((f,i)=>(
            <Link key={i} href="/aboutschool" className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
              <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.c} strokeWidth="2"><path d={f.i}/></svg></div>
              <h3 className="font-bold text-sm">{f.t}</h3><p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{f.d}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-white py-16"><div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-8"><span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Quick Access</span><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">Everything You Need</h2></div>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[{t:'Notice Board',s:'Latest announcements',c:'#2563EB'},{t:'Event Calendar',s:'Academic schedule',c:'#059669'},{t:'Admissions',s:'Session 2026-2027',c:'#DC2626'},{t:'Fees Structure',s:'Transparent details',c:'#D97706'}].map((q,i)=>(
            <Link key={i} href="/noticeboard" className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{background:q.c+'15',color:q.c}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>
              <div><div className="font-semibold text-sm">{q.t}</div><div className="text-xs text-gray-400">{q.s}</div></div><span className="ml-auto text-gray-300">&rarr;</span>
            </Link>
          ))}
        </div>
      </div></section>
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-16 text-center">
        <div className="max-w-6xl mx-auto px-5"><h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Join the SK Presidency Family</h2><p className="text-blue-200 mb-8 max-w-md mx-auto">Admissions open for Play Group to Class XII.</p>
        <div className="flex gap-3 justify-center flex-wrap"><Link href="/admission" className="bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold text-sm hover:shadow-xl transition">Apply for Admission</Link><Link href="/contact" className="border border-blue-400/40 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition">Contact Us</Link></div></div>
      </section>
      <footer className="bg-gray-900 text-gray-400 py-12"><div className="max-w-6xl mx-auto px-5">
        <div className="grid md:grid-cols-4 gap-6 mb-8"><div className="md:col-span-2"><h3 className="text-white font-bold text-lg mb-2">SK Presidency Public School</h3><p className="text-sm text-gray-500">Dr. Shrikant Upadhyaya Educational & Charitable Trust<br/>CBSE: 2133231<br/>Sultanpur, UP — 228001<br/>86017 35757</p></div><div><h4 className="text-white text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Links</h4>{['About','Notices','Admission','Fees'].map(l=><Link key={l} href="/" className="block text-sm py-0.5 text-gray-500 hover:text-white transition">{l}</Link>)}</div><div><h4 className="text-white text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Portals</h4><Link href="/student" className="block text-sm py-0.5 text-blue-400 hover:text-blue-300 font-medium">Student Login</Link><Link href="/staff" className="block text-sm py-0.5 text-blue-400 hover:text-blue-300 font-medium">Staff Login</Link></div></div>
        <div className="border-t border-gray-800 pt-4 flex justify-between flex-wrap gap-2 text-xs"><span>&copy; 2025-2028 SK Presidency</span><span>Astra Infotech</span></div>
      </div></footer>
    </div>
  );
}
