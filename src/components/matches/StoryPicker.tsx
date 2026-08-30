'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ClubMatch, Story } from '@/types';
import { storyField } from '@/lib/i18n';
import { useI18n } from '@/components/providers/I18nProvider';

export function StoryPicker({ stories }: { stories: Story[] }) {
  const { lang, t } = useI18n();
  const [activeId, setActiveId] = useState(stories[0]?.id ?? '');
  const story = stories.find((s) => s.id === activeId);

  useEffect(() => {
    if (stories.length && !activeId) setActiveId(stories[0].id);
  }, [stories, activeId]);

  if (!stories.length) {
    return <p className="text-ink-soft">{t('stories.empty')}</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <div>
        <p className="eyebrow">{t('stories.matchDate')}</p>
        <ul className="mt-3 space-y-2">
          {stories.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActiveId(s.id)}
                className={`w-full rounded-full border px-4 py-2 text-left text-sm ${
                  s.id === activeId ? 'border-ball bg-ball text-cream' : 'border-line bg-paper'
                }`}
              >
                {new Date(s.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {story && (
        <article className="rounded-lg border border-line bg-paper p-6">
          <p className="eyebrow">{storyField(story, 'type', lang)}</p>
          <h2 className="mt-2 text-2xl">{storyField(story, 'title', lang)}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {(lang === 'ta' && story.highlights_ta ? story.highlights_ta : story.highlights).map((h) => (
              <li key={h} className="rounded-full bg-willow/10 px-3 py-1 text-sm">{h}</li>
            ))}
          </ul>
          <div className="prose mt-6 max-w-none text-ink-soft">
            {(lang === 'ta' && story.paragraphs_ta ? story.paragraphs_ta : story.paragraphs).map((p) => (
              <p key={p.slice(0, 24)} className="mb-4">{p}</p>
            ))}
          </div>
          {story.auto && (
            <p className="mt-4 text-sm italic text-ink-soft">{t('stories.autoNote')}</p>
          )}
          {story.url && (
            <a href={story.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-ball">
              {t('stories.viewScorecard')} →
            </a>
          )}
        </article>
      )}
    </div>
  );
}

function clubLabel(name: string) {
  return /udhaya|udaya\s*cc|udaya cricket/i.test(name) ? 'Udaya CC' : name;
}

export function ScoreboardWidget({ match }: { match?: ClubMatch }) {
  const { t } = useI18n();

  if (!match) {
    return (
      <div className="rounded-lg border border-line bg-willow p-6 text-cream shadow-lg">
        <span className="eyebrow text-brass">{t('home.latestResult')}</span>
        <p className="mt-3 text-sm text-cream/80">{t('home.noResult')}</p>
      </div>
    );
  }

  const venue = [match.ground, match.city].filter(Boolean).join(', ');

  return (
    <div className="rounded-lg border border-line bg-willow p-6 text-cream shadow-lg">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-brass">{t('home.latestResult')}</span>
        <span className="rounded bg-ball px-2 py-0.5 text-xs">{t('home.final')}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm opacity-80">{clubLabel(match.team_a)}</div>
          <div className="text-3xl font-bold">{match.team_a_score || '—'}</div>
        </div>
        <span className="opacity-60">vs</span>
        <div className="text-right">
          <div className="text-sm opacity-80">{clubLabel(match.team_b)}</div>
          <div className="text-3xl font-bold">{match.team_b_score || '—'}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-cream/80">{[match.result, venue].filter(Boolean).join(' · ')}</p>
      <Link href="/matches/" className="btn btn-primary mt-4 inline-block">{t('home.readMatchStory')}</Link>
    </div>
  );
}
