'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Player } from '@/types';

export function PlayerCharts({ player }: { player: Player }) {
  const battingData = (player.leather_matches || []).slice(0, 5).map((m) => {
    const runs = parseInt(m.batting, 10) || 0;
    return { name: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), runs };
  }).reverse();

  const sr = player.strike_rate || (player.runs && player.matches ? Math.round((player.runs / player.matches) * 100) / 100 : 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-line bg-paper p-4">
        <h3 className="mb-4 font-semibold">Recent innings (runs)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={battingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcd2bc" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="runs" fill="#a3273a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-line bg-paper p-4">
        <h3 className="mb-4 font-semibold">Career snapshot</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-ink-soft">Strike rate</dt><dd className="text-xl font-bold text-willow">{sr}</dd></div>
          <div><dt className="text-ink-soft">MVP awards</dt><dd className="text-xl font-bold text-willow">{player.mvp_awards ?? '—'}</dd></div>
          <div><dt className="text-ink-soft">Batting</dt><dd>{player.batting_style || '—'}</dd></div>
          <div><dt className="text-ink-soft">Bowling</dt><dd>{player.bowling_style || '—'}</dd></div>
        </dl>
      </div>
    </div>
  );
}
