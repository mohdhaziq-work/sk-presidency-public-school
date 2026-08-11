'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { href: '/noticeboard', label: 'Noticeboard', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0', color: '#2563EB' },
  { href: '/rules', label: 'Rules & Regulations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4', color: '#7C3AED' },
  { href: '/facilities', label: 'Facilities', icon: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4', color: '#0F766E' },
  { href: '/sports', label: 'School Sports', icon: 'M12 2a15.3 15.3 0 014 10M12 2a15.3 15.3 0 00-4 10M2 12h20', color: '#EA580C' },
  { href: '/admission', label: 'Admissions', icon: 'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5', color: '#DC2626' },
  { href: '/fees', label: 'Fees Structure', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', color: '#D97706' },
  { href: '/principal', label: "Principal's Message", icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8', color: '#4F46E5' },
  { href: '/eventcalendar', label: 'Event Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7', color: '#059669' },
  { href: 'https://www.skpresidency.com/Prospectus.pdf', label: 'Download Prospectus', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10 12 15 17 10M12 15V3', color: '#0891B2' },
];

export default function InnerPageLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-[#DADCE0] h-14 flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-[#1A1C1E]">
          <img src="/images/logo-transparent.png" alt="SKPPS" className="w-8 h-8 object-contain rounded-lg"/>
          <span className="hidden sm:inline">SK Presidency Public School</span>
          <span className="sm:hidden text-xs">SKPPS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/student" className="text-xs font-semibold bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#3367D6] hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.97]">Student Login</Link>
          <button onClick={() => setNavOpen(!navOpen)} className="sm:hidden relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#4285F4] to-[#3367D6] flex items-center justify-center shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-600/40 transition-all active:scale-95">
            <div className="w-4 h-3 flex flex-col justify-between">
              <span className={`block w-full h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${navOpen ? 'rotate-45 translate-y-[5px]' : ''}`}/>
              <span className={`block w-full h-[2px] bg-white rounded-full transition-all duration-300 ${navOpen ? 'opacity-0 scale-x-0' : ''}`}/>
              <span className={`block w-full h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${navOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}/>
            </div>
          </button>
        </div>
      </header>

      <nav className="bg-gradient-to-r from-[#4285F4] to-[#3367D6] sticky top-14 z-40 overflow-x-auto shadow-md">
        <div className="max-w-6xl mx-auto flex">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`flex-shrink-0 px-3.5 py-2.5 text-[11px] font-medium transition-all whitespace-nowrap ${
                pathname === n.href
                  ? 'text-white bg-white/20 font-semibold shadow-[inset_0_-2px_0_white]'
                  : 'text-[#D2E3FC] hover:text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all'
              }`}>{n.label}</Link>
          ))}
        </div>
      </nav>

      {/* ═══ MOBILE SLIDE-IN MENU ═══ */}
      <div className={`sm:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${navOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#174EA6]/60 via-[#1A1C1E]/50 to-[#174EA6]/60 backdrop-blur-sm" onClick={() => setNavOpen(false)}/>

        {/* Panel — slides from right */}
        <div className={`absolute top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-400 ease-out ${navOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{transitionDuration:'400ms',transitionTimingFunction:'cubic-bezier(0.16,1,0.3,1)'}}>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#4285F4] to-[#3367D6] px-5 py-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" onClick={() => setNavOpen(false)} className="flex items-center gap-2.5">
                <img src="/images/logo-transparent.png" alt="SKPPS" className="w-9 h-9 object-contain rounded-lg"/>
                <div className="text-white">
                  <div className="font-bold text-sm tracking-tight leading-tight">SK Presidency</div>
                  <div className="text-[9px] text-[#A8C7FA] tracking-wide">Public School</div>
                </div>
              </Link>
              <button onClick={() => setNavOpen(false)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex gap-2">
              <Link href="/student" onClick={() => setNavOpen(false)} className="flex-1 text-center py-2 bg-white text-[#3367D6] rounded-lg text-[11px] font-bold hover:bg-[#E8F0FE] hover:-translate-y-0.5 transition-all active:scale-[0.97]">Student Login</Link>
              <Link href="/staff" onClick={() => setNavOpen(false)} className="flex-1 text-center py-2 bg-white/15 text-white rounded-lg text-[11px] font-bold hover:bg-white/25 hover:-translate-y-0.5 transition-all active:scale-[0.97]">Staff</Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-3 px-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#80868B] mb-2 px-2">Main Navigation</div>
            {NAV.map((n, i) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} onClick={() => setNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-sm font-medium transition-all hover:scale-[1.02] ${
                    active
                      ? 'bg-[#E8F0FE] text-[#4285F4] font-semibold shadow-[inset_0_0_0_1px_rgba(37,99,235,.2)]'
                      : 'text-[#5F6368] hover:bg-[#F8F9FA] hover:scale-[1.02] hover:text-[#1A1C1E]'
                  }`}
                  style={{animationDelay: `${i * 0.03}s`}}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${active ? 'bg-[#4285F4] scale-125 shadow-[0_0_8px_rgba(37,99,235,.4)]' : 'bg-gray-300'}`}/>
                  {n.label}
                  {active && <span className="ml-auto text-[10px] text-[#669DF6]">● Active</span>}
                </Link>
              );
            })}

            <div className="my-4 border-t border-[#E8EAED]"/>

            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#80868B] mb-2 px-2">Quick Links</div>
            {SIDEBAR.map((s, i) => {
              const active = pathname === s.href;
              return (
                <Link key={s.href} href={s.href} onClick={() => setNavOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#E8F0FE] text-[#4285F4] font-semibold'
                      : 'text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#1A1C1E]'
                  }`}
                  style={{animationDelay: `${(i + NAV.length) * 0.03}s`}}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? s.color : 'currentColor'} strokeWidth="2" opacity={active ? 1 : 0.4}><path d={s.icon}/></svg>
                  {s.label}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-[#E8EAED] bg-[#F8F9FA]">
            <div className="flex items-center justify-between text-[9px] text-[#80868B]">
              <span>CBSE: 2133231</span>
              <span>Astra Infotech</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex gap-8">
          <aside className="w-52 flex-shrink-0 hidden lg:block sticky top-[100px] self-start">
            <div className="bg-gradient-to-r from-[#4285F4] to-[#3367D6] text-white text-[10px] font-bold uppercase tracking-[0.1em] px-3.5 py-2.5 rounded-t-lg shadow-sm animate-[fadeDown_.3s_ease-out]">Quick Links</div>
            <div className="bg-white border border-t-0 border-[#DADCE0] rounded-b-lg overflow-hidden shadow-sm">
              {SIDEBAR.map(s => {
                const active = pathname === s.href;
                return (
                  <Link key={s.href} href={s.href}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium border-b border-[#E8EAED] last:border-0 transition-all hover:bg-[#F8F9FA] hover:translate-x-1 ${
                      active ? 'text-[#4285F4] bg-[#E8F0FE]/60 font-semibold border-l-[3px] border-l-[#4285F4]' : 'text-[#5F6368] hover:text-[#1A1C1E] hover:bg-[#F8F9FA] hover:border-l-[3px] hover:border-l-gray-200 hover:translate-x-1'
                    }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? s.color : 'currentColor'} strokeWidth="2" opacity={active ? 1 : 0.45}><path d={s.icon}/></svg>
                    {s.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-[scaleIn_.3s_ease] shadow-[0_0_8px_rgba(37,99,235,.3)]"/>}
                  </Link>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white border border-[#DADCE0] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-up hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-1 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[3px] after:w-0 after:bg-[#4285F4] hover:after:w-full after:transition-all after:duration-500">{title}</h2>
              {subtitle && <p className="text-xs text-[#80868B] mb-6">{subtitle}</p>}
              <div className="text-sm text-[#1A1C1E] leading-relaxed">{children}</div>
            </div>
          </main>
        </div>
      </div>

      <div className="lg:hidden max-w-6xl mx-auto px-5 pb-8">
        <div className="bg-gradient-to-r from-[#4285F4] to-[#3367D6] text-white text-[10px] font-bold uppercase tracking-[0.1em] px-3.5 py-2 rounded-t-lg">Quick Links</div>
        <div className="bg-white border border-t-0 border-[#DADCE0] rounded-b-lg overflow-hidden grid grid-cols-2">
          {SIDEBAR.map(s => {
            const active = pathname === s.href;
            return (
              <Link key={s.href} href={s.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium border-b border-r border-[#E8EAED] transition-all ${active ? 'text-[#4285F4] bg-[#E8F0FE]' : 'text-[#5F6368] hover:bg-[#F8F9FA] hover:scale-[1.02]'}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={active ? s.color : 'currentColor'} strokeWidth="2"><path d={s.icon}/></svg>
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="bg-[#1A1C1E] text-[#80868B] py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/images/logo-transparent.png" alt="SKPPS" className="w-8 h-8 object-contain rounded-lg"/>
                <h4 className="text-white font-bold text-sm">SK Presidency Public School</h4>
              </div>
              <p className="text-xs text-[#5F6368] leading-relaxed">Dr. Shrikant Upadhyaya Educational & Charitable Trust | CBSE: 2133231 | Sultanpur, UP — 228001</p>
            </div>
            <div className="flex gap-8">
              <div>
                <h5 className="text-white text-[9px] font-bold uppercase tracking-[0.1em] mb-2">Navigate</h5>
                {['About School','Noticeboard','Admissions','Fees','Contact'].map(l => <Link key={l} href="/" className="block text-xs py-0.5 text-[#5F6368] hover:text-white hover:translate-x-1 transition-all">{l}</Link>)}
              </div>
              <div>
                <h5 className="text-white text-[9px] font-bold uppercase tracking-[0.1em] mb-2">Portals</h5>
                <Link href="/student" className="block text-xs py-0.5 text-[#669DF6] hover:text-blue-300 font-medium">Student Login</Link>
                <Link href="/staff" className="block text-xs py-0.5 text-[#669DF6] hover:text-blue-300 font-medium">Staff Login</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 flex justify-between flex-wrap gap-2 text-xs">
            <span>&copy; SK Presidency Public School 2025-2028. All rights reserved.</span>
            <span>Powered by Astra Infotech</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
