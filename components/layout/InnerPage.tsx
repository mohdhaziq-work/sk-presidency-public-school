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
  { href: '/noticeboard', label: 'Noticeboard', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
  { href: '/rules', label: 'Rules', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4' },
  { href: '/facilities', label: 'Facilities', icon: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4' },
  { href: '/sports', label: 'Sports', icon: 'M12 2a15.3 15.3 0 014 10M12 2a15.3 15.3 0 00-4 10M2 12h20' },
  { href: '/admission', label: 'Admissions', icon: 'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5' },
  { href: '/fees', label: 'Fees', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { href: '/principal', label: 'Principal', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8' },
  { href: '/eventcalendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7' },
];

export default function InnerPageLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-2.5 px-5">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[11px] font-extrabold">SK</span>
            <div className="hidden sm:block leading-tight"><div className="font-bold text-xs tracking-tight">SK Presidency Public School</div><div className="text-[9px] text-gray-400">CBSE: 2133231 | Sultanpur, UP</div></div>
          </Link>
          <div className="flex items-center gap-1.5 ml-auto">
            <Link href="/student" className="text-[10px] font-semibold bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition hidden sm:inline">Student Login</Link>
            <button onClick={()=>setNavOpen(!navOpen)} className="sm:hidden p-1.5 border border-gray-200 rounded-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
          </div>
        </div>
      </header>
      <nav className="bg-gray-900 sticky top-[49px] z-40 overflow-x-auto"><div className="max-w-6xl mx-auto flex">{NAV.map(n=>(<Link key={n.href} href={n.href} className={`flex-shrink-0 px-3.5 py-2.5 text-[11px] font-medium transition-colors whitespace-nowrap ${pathname===n.href?'text-white bg-white/10':'text-gray-400 hover:text-white hover:bg-white/5'}`}>{n.label}</Link>))}</div></nav>
      {navOpen&&<div className="sm:hidden bg-gray-800 flex flex-col">{NAV.map(n=>(<Link key={n.href} href={n.href} onClick={()=>setNavOpen(false)} className={`px-4 py-2.5 text-xs font-medium border-b border-gray-700/50 ${pathname===n.href?'text-white bg-white/10':'text-gray-400'}`}>{n.label}</Link>))}</div>}
      <div className="max-w-6xl mx-auto px-5 py-8"><div className="flex gap-8">
        <aside className="w-48 flex-shrink-0 hidden lg:block sticky top-[98px] self-start"><div className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.1em] px-3.5 py-2.5 rounded-t-lg">Quick Links</div><div className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">{SIDEBAR.map(s=>(<Link key={s.href} href={s.href} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium border-b border-gray-100 last:border-0 transition-all hover:bg-gray-50 ${pathname===s.href?'text-blue-600 bg-blue-50/50':'text-gray-600 hover:text-gray-800'}`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity={pathname===s.href?1:.4}><path d={s.icon}/></svg>{s.label}</Link>))}</div></aside>
        <main className="flex-1 min-w-0"><div className="animate-[fadeUp_.5s_ease-out_both]"><h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-1">{title}</h2>{subtitle&&<p className="text-xs text-gray-400 mb-6">{subtitle}</p>}<div className="text-sm text-gray-700 leading-relaxed">{children}</div></div></main>
      </div></div>
      <footer className="bg-gray-900 text-gray-500 py-8 mt-auto"><div className="max-w-6xl mx-auto px-5 text-center text-xs"><p className="mb-1">&copy; SK Presidency Public School 2025-2028</p><p>Powered by Astra Infotech</p></div></footer>
    </div>
  );
}
