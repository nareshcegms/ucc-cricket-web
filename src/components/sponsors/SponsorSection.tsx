'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Sponsor, Testimonial } from '@/types';
import { localized } from '@/lib/data';
import { useI18n } from '@/components/providers/I18nProvider';

export function SponsorSection({ sponsors, testimonials }: { sponsors: Sponsor[]; testimonials: Testimonial[] }) {
  const { lang } = useI18n();
  const [tIndex, setTIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="space-y-12">
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-8"
          animate={{ x: [0, -600] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {[...sponsors, ...sponsors].map((s, i) => (
            <div key={`${s.id}-${i}`} className="flex min-w-[180px] flex-col items-center rounded-lg border border-line bg-paper p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logo} alt={s.name} className="h-16 w-16 rounded-full object-cover" />
              <p className="mt-2 font-semibold">{s.name}</p>
              <p className="text-xs text-ink-soft">{localized(s, 'tagline', lang)}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sponsors.map((s) => (
          <div key={s.id} className="rounded-lg border border-line bg-paper p-5">
            <span className="eyebrow capitalize">{s.tier}</span>
            <h3 className="mt-2 text-xl">{s.name}</h3>
            <p className="text-sm text-ink-soft">{localized(s, 'tagline', lang)}</p>
          </div>
        ))}
      </div>

      {testimonials.length > 0 && (
        <div className="rounded-lg border border-line bg-willow p-8 text-cream">
          <motion.div key={tIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-lg italic">&ldquo;{localized(testimonials[tIndex], 'quote', lang)}&rdquo;</p>
            <p className="mt-4 font-semibold">{testimonials[tIndex].author}</p>
            <p className="text-sm text-cream/70">{localized(testimonials[tIndex], 'role', lang)}</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
