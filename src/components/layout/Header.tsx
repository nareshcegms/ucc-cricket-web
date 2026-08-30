'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';

const links = [
  { href: '/', key: 'nav.home' },
  { href: '/about/', key: 'nav.about' },
  { href: '/team/', key: 'nav.team' },
  { href: '/matches/', key: 'nav.matches' },
  { href: '/gallery/', key: 'nav.gallery' },
  { href: '/sponsors/', key: 'nav.sponsors' },
  { href: '/contact/', key: 'nav.contact' },
];

export function Header() {
  const pathname = usePathname();
  const { lang, setLang, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-line backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'bg-paper/95 shadow-md' : 'bg-cream/90'
      }`}
    >
      <div className={`wrap flex items-center justify-between gap-4 transition-all ${scrolled ? 'h-14' : 'h-[72px]'}`}>
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold text-willow">
          <span className="inline-block h-6 w-6 rounded-full border-2 border-ball" aria-hidden />
          Udaya CC
        </Link>

        <div className="flex items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-full border border-line bg-paper">
            {(['en', 'ta'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs ${
                  lang === code ? 'bg-willow text-cream' : 'text-ink-soft'
                }`}
              >
                {code === 'en' ? 'EN' : 'தமிழ்'}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="rounded border border-ink px-2 py-1 font-[family-name:var(--font-mono)] text-xs md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {t('nav.menu')}
          </button>

          <nav className={`${open ? 'block' : 'hidden'} absolute left-0 right-0 top-full border-b border-line bg-cream p-4 md:static md:block md:border-0 md:bg-transparent md:p-0`}>
            <ul className="flex flex-col gap-1 md:flex-row md:flex-wrap md:justify-end md:gap-3">
              {links.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`block px-1 py-2 text-sm font-medium transition-colors md:py-1 ${
                        active ? 'border-b-2 border-ball text-ball' : 'text-ink hover:text-ball'
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
