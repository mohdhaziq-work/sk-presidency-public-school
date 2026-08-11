'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

// CURSOR GLOW — follows mouse, lights up cards
export function useCursorGlow(containerRef: React.RefObject<HTMLElement>, glowColor = '66,133,244') {
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
      el.style.setProperty('--glow', `radial-gradient(circle 300px at ${x}% ${y}%, rgba(${glowColor},0.12), transparent 60%)`);
    };
    const handleLeave = () => { el.style.setProperty('--glow', 'none'); };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => { el.removeEventListener('mousemove', handleMove); el.removeEventListener('mouseleave', handleLeave); };
  }, [containerRef, glowColor]);
}

// SCROLL PARALLAX
export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => { el.style.transform = `translateY(${window.scrollY * speed}px)`; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return ref;
}

// FLOATING ORBS - canvas particle system
export function FloatingOrbs({ count = 10 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    let w = 0, h = 0;
    const orbs: any[] = [];
    const resize = () => { w = c.width = c.parentElement!.offsetWidth; h = c.height = c.parentElement!.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    const colors = ['66,133,244', '52,168,83', '234,67,53', '251,188,4'];
    for (let i = 0; i < count; i++) {
      orbs.push({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 100 + 30,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.04 + 0.01, c: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    function animate() {
      ctx!.clearRect(0, 0, w, h);
      for (const o of orbs) {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = w + o.r; if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r; if (o.y > h + o.r) o.y = -o.r;
        const g = ctx!.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.c},${o.a * 2})`);
        g.addColorStop(0.5, `rgba(${o.c},${o.a})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx!.fillStyle = g; ctx!.beginPath(); ctx!.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx!.fill();
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => { window.removeEventListener('resize', resize); };
  }, [count]);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

// 3D TILT CARD
export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    el.style.boxShadow = `${-x * 16}px ${-y * 16}px 32px rgba(0,0,0,0.05)`;
  };
  const handleLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
    el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
  };
  return <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={className} style={{ transition: 'transform 0.15s ease-out, box-shadow 0.25s ease-out' }}>{children}</div>;
}

// ANIMATED COUNTER
export function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const num = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(el);
      let start = 0;
      function tick(ts: number) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 2000, 1);
        setCount(Math.floor((1 - Math.pow(1 - p, 4)) * num));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [num]);
  return <div className="text-center"><div ref={ref} className="text-3xl md:text-5xl font-black tracking-tighter">{count}{suffix}</div><div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#80868B] mt-2">{label}</div></div>;
}
