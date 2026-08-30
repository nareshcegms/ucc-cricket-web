import Link from 'next/link';
import { PlayerSlider } from '@/components/team/PlayerSlider';
import { getPlayers } from '@/lib/data';

export default function TeamPage() {
  const players = getPlayers();

  return (
    <section className="section-block">
      <div className="wrap">
        <p className="eyebrow">Player Spotlight</p>
        <h1 className="mt-2 text-4xl">Profiles, one player at a time.</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          CricHeroes stats, leather-ball numbers, and recent performances — synced weekly.
        </p>

        <div className="mt-10">
          <PlayerSlider players={players} />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.id}/`}
              className="rounded-lg border border-line bg-paper p-4 transition hover:border-ball"
            >
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-sm text-ink-soft">{p.role} · {p.matches} matches</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
