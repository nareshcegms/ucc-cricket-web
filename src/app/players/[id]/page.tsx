import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayerCharts } from '@/components/players/PlayerCharts';
import { getPlayer, getPlayers } from '@/lib/data';
import { roleLabel } from '@/lib/i18n';

export function generateStaticParams() {
  return getPlayers().map((p) => ({ id: p.id }));
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();

  return (
    <section className="section-block">
      <div className="wrap">
        <Link href="/team/" className="text-sm text-ball">← Back to squad</Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="rounded-lg border border-line bg-willow p-6 text-center text-cream">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-brass/50 text-4xl font-bold">
              {player.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-cream">{player.name}</h1>
            <p className="text-brass">{roleLabel('en', player.role)}</p>
            <p className="mt-2 text-sm opacity-80">{player.team}</p>
            {player.cricheroes_url && (
              <a href={player.cricheroes_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 inline-block text-sm">
                CricHeroes profile
              </a>
            )}
          </div>

          <div>
            <h2 className="text-2xl">Career statistics</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ['Matches', player.matches],
                ['Runs', player.runs],
                ['Wickets', player.wickets],
                ['Average', player.average],
                ['Highest', player.highest_score],
                ['Best bowling', player.best_bowling],
              ].map(([label, val]) => (
                <div key={String(label)} className="rounded border border-line bg-paper p-3 text-center">
                  <div className="text-2xl font-bold text-willow">{val}</div>
                  <div className="text-xs uppercase text-ink-soft">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <PlayerCharts player={player} />
            </div>

            <h2 className="mt-10 text-2xl">Match history</h2>
            <div className="mt-4 space-y-3">
              {(player.leather_matches || []).map((m) => (
                <div key={m.id} className="rounded border border-line bg-paper p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {new Date(m.date).toLocaleDateString()} · {m.ground}
                    </span>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-ball">
                      Scorecard →
                    </a>
                  </div>
                  <p className="mt-1 text-ink-soft">{m.team_a} {m.team_a_score} vs {m.team_b} {m.team_b_score}</p>
                  <p>{m.result}</p>
                  <p className="mt-1">Bat: {m.batting} · Bowl: {m.bowling}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
