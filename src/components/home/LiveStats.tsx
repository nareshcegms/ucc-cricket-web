'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { SiteStats } from '@/types';
import { useI18n } from '@/components/providers/I18nProvider';

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function LiveStats({ stats }: { stats: SiteStats }) {
  const { t } = useI18n();
  const items = [
    { label: t('home.statYears'), value: stats.years },
    { label: t('home.statMatches'), value: stats.total_matches },
    { label: 'Wins', value: stats.wins },
    { label: 'Win %', value: stats.win_percentage },
    { label: 'Championships', value: stats.championships },
    { label: 'Players', value: stats.players },
  ];

  return (
    <section className="section-block border-t border-line bg-gradient-to-b from-transparent to-willow/5">
      <div className="wrap">
        <p className="eyebrow">Live statistics</p>
        <h2 className="mt-2 text-3xl">Club at a glance</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded border border-line bg-paper p-4 text-center shadow-sm"
            >
              <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-willow">
                <Counter value={item.value} />
                {item.label === 'Win %' ? '%' : ''}
              </div>
              <div className="mt-1 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-wider text-ink-soft">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
