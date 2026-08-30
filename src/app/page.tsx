import Link from 'next/link';
import { HeroSlider } from '@/components/home/HeroSlider';
import { LiveStats } from '@/components/home/LiveStats';
import { ScoreboardWidget } from '@/components/matches/StoryPicker';
import { PlayerSlider } from '@/components/team/PlayerSlider';
import {
  getHeroSlides,
  getPlayers,
  getSiteStats,
} from '@/lib/data';

export default function HomePage() {
  const slides = getHeroSlides();
  const players = getPlayers();
  const stats = getSiteStats();

  return (
    <>
      <HeroSlider slides={slides} />

      <section className="section-block">
        <div className="wrap grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Est. 1999 · Leather-ball cricket · Chennai</p>
            <h1 className="mt-3 text-4xl leading-tight">
              Twenty-five years on the <em className="text-ball not-italic">pitch</em>, together.
            </h1>
            <p className="mt-4 text-ink-soft">
              Same club colours, same weekend ritual — tea at the boundary, stats on CricHeroes, and stories worth telling after every match.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/team/" className="btn btn-primary">Squad profiles</Link>
              <Link href="/matches/" className="btn btn-ghost">Match stories</Link>
            </div>
          </div>
          <ScoreboardWidget />
        </div>
      </section>

      <LiveStats stats={stats} />

      <section className="section-block bg-paper/50">
        <div className="wrap">
          <p className="eyebrow">Player Spotlight</p>
          <h2 className="mt-2 text-3xl">Profiles, one player at a time.</h2>
          <div className="mt-8">
            <PlayerSlider players={players} />
          </div>
          <div className="mt-6 text-center">
            <Link href="/team/" className="text-ball underline">View full squad →</Link>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="wrap grid gap-6 md:grid-cols-3">
          {[
            { title: 'Gallery', desc: 'Matches, practice, events & awards', href: '/gallery/' },
            { title: 'Sponsors', desc: 'Partners who back the club', href: '/sponsors/' },
            { title: 'Contact', desc: 'Membership, inquiries & location', href: '/contact/' },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="rounded-lg border border-line bg-paper p-6 transition hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl">{card.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
