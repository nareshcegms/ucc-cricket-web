'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '@/types';
import { roleLabel } from '@/lib/i18n';
import { useI18n } from '@/components/providers/I18nProvider';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function PlayerSlider({ players }: { players: Player[] }) {
  const { lang, t } = useI18n();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!players.length) return null;

  const player = players[index];

  const go = (next: number) => {
    setFlipped(false);
    setIndex((next + players.length) % players.length);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <button type="button" className="slider-btn" onClick={() => go(index - 1)} aria-label={t('players.prev')}>‹</button>

        <div className="flex-1 overflow-hidden">
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="perspective-[1200px]"
          >
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className={`relative min-h-[340px] w-full rounded-lg border border-brass/35 p-6 text-center transition-transform duration-700 [transform-style:preserve-3d] ${
                flipped ? '[transform:rotateY(180deg)]' : ''
              }`}
              style={{ background: flipped ? 'var(--color-paper)' : 'linear-gradient(165deg, #1F3A2E, #163026)' }}
            >
              <div className={`${flipped ? 'hidden' : 'block'} text-cream`}>
                <span className="inline-block rounded-full border border-brass/45 px-3 py-1 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-widest text-brass">
                  {roleLabel(lang, player.role)}
                </span>
                <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-brass/50 font-[family-name:var(--font-display)] text-3xl">
                  {initials(player.name)}
                </div>
                <h3 className="mt-4 text-2xl font-bold text-cream">{player.name}</h3>
                <p className="text-sm uppercase tracking-wider opacity-80">{player.team}</p>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-wider opacity-70">
                  {t('players.tapForStats')}
                </p>
              </div>

              <div className={`${flipped ? 'block' : 'hidden'} [transform:rotateY(180deg)] text-left`}>
                <h3 className="text-xl text-willow">{player.name}</h3>
                <p className="text-sm text-ink-soft">{t('players.careerStats')}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    [t('players.statMatches'), player.matches],
                    [t('players.statRuns'), player.runs],
                    [t('players.statWickets'), player.wickets],
                    [t('players.statAverage'), player.average],
                    [t('players.statHighest'), player.highest_score],
                    [t('players.statBestBowl'), player.best_bowling],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="rounded border border-line bg-cream p-2">
                      <div className="font-bold text-willow">{val}</div>
                      <div className="text-[0.65rem] uppercase text-ink-soft">{label}</div>
                    </div>
                  ))}
                </div>
                <Link href={`/players/${player.id}/`} className="btn btn-primary mt-4 w-full" onClick={(e) => e.stopPropagation()}>
                  Full profile →
                </Link>
              </div>
            </button>
          </motion.div>
        </div>

        <button type="button" className="slider-btn" onClick={() => go(index + 1)} aria-label={t('players.next')}>›</button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {players.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => go(i)}
            className={`h-2 w-2 rounded-full ${i === index ? 'scale-125 bg-ball' : 'bg-line'}`}
            aria-label={p.name}
          />
        ))}
      </div>
    </div>
  );
}
