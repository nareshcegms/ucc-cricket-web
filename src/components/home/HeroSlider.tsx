'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeroSlide } from '@/types';
import { localized } from '@/lib/data';
import { useI18n } from '@/components/providers/I18nProvider';

const themes: Record<string, string> = {
  willow: 'from-[#0f2419] via-willow to-[#163026]',
  sunset: 'from-[#1a2f24] via-[#3d2a1f] to-willow',
  gold: 'from-willow via-[#2a2218] to-[#1a3328]',
  night: 'from-[#0a1612] via-willow to-[#0f1f18]',
  dawn: 'from-willow via-willow-light to-[#1a2830]',
  brass: 'from-[#152820] via-willow to-[#2a1810]',
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const { lang } = useI18n();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];
  const href = slide.ctaHref || `/${slide.ctaTab === 'players' ? 'team' : slide.ctaTab}/`;

  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-willow md:min-h-[88vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${themes[slide.theme] || themes.willow}`}
        />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(241,234,217,0.12),transparent_50%)]" />

      <div className="relative z-10 flex min-h-[78vh] items-center md:min-h-[88vh]">
        <div className="wrap py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
            >
              <p className="eyebrow text-brass">Udaya CC · Est. 1999</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold text-cream md:text-5xl">
                {localized(slide, 'title', lang)}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-cream/85">
                {localized(slide, 'subtitle', lang)}
              </p>
              <Link href={href} className="btn btn-primary mt-8">
                {localized(slide, 'cta', lang)}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full border border-cream/50 ${
              i === index ? 'scale-125 bg-ball border-ball' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-cream/30 bg-black/30 px-3 py-2 text-cream"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        type="button"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-cream/30 bg-black/30 px-3 py-2 text-cream"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        aria-label="Next"
      >
        ›
      </button>
    </section>
  );
}
