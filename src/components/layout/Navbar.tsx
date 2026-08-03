'use client';

import { useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Navbar
 * ------
 * Minimal fixed top bar. The links scroll to story beats using GSAP's
 * ScrollToPlugin (registered once in src/lib/gsap), keeping the whole journey
 * inside the smooth-scroll system.
 */
const LINKS = [
  { label: 'Vision', beat: 'hero' },
  { label: 'Problem', beat: 'problem' },
  { label: 'Solution', beat: 'solution' },
  { label: 'Tech', beat: 'technology' },
  { label: 'Contact', beat: 'cta' },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, beat: string) => {
    e.preventDefault();
    const target = document.querySelector<HTMLElement>(`[data-beat="${beat}"]`);
    if (target) {
      gsap.to(window, {
        duration: 1.4,
        scrollTo: target,
        ease: 'power3.inOut',
      });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/5 bg-black/30 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Primary"
      >
        <a
          href="#"
          onClick={(e) => jump(e, 'hero')}
          className="text-sm font-semibold tracking-[0.3em] text-white/90"
        >
          MORPHIN<span className="text-indigo-300">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.beat}>
              <a
                href={`#${link.beat}`}
                onClick={(e) => jump(e, link.beat)}
                className="text-[13px] font-medium text-white/50 transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#cta"
          onClick={(e) => jump(e, 'cta')}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur-md transition-colors duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          Get access
        </a>
      </nav>
    </header>
  );
}