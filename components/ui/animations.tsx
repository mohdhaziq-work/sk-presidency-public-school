'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function useScrollReveal(threshold = 0.15, rootMargin = '0px 0px -40px 0px') {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setRevealed(true); return; }
    const node = ref.current; if (!node) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.unobserve(node); } }, { threshold, rootMargin });
    obs.observe(node); return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return { ref, revealed };
}

export function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useScrollReveal(0.1);
  return <div ref={ref} className={className} style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(16px)', transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>{children}</div>;
}

export function StaggerContainer({ children, className = '', delay = 0.06 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useScrollReveal(0.08);
  const kids = Array.isArray(children) ? children : [children];
  return <div ref={ref} className={className}>{kids.map((child, i) => <div key={i} style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${i * delay}s` }}>{child}</div>)}</div>;
}

export function ScaleIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useScrollReveal(0.12);
  return <div ref={ref} className={className} style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1)' : 'scale(0.92)', transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s` }}>{children}</div>;
}

export function GlowCard({ children, className = '', glow = 'rgba(37,99,235,0.08)' }: { children: ReactNode; className?: string; glow?: string }) {
  const { ref, revealed } = useScrollReveal(0.12);
  return <div ref={ref} className={className}><div className={`bg-white border border-gray-200 rounded-2xl transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16,1,0.3,1)', boxShadow: revealed ? '0 1px 3px rgba(0,0,0,0.04)' : 'none' }} onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = `0 20px 50px ${glow}, 0 0 0 1px rgba(37,99,235,0.1)` }} onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}>{children}</div></div>;
}
