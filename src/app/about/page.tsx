import { LiveStats } from '@/components/home/LiveStats';
import { getSiteStats } from '@/lib/data';

export default function AboutPage() {
  const stats = getSiteStats();

  return (
    <>
      <section className="section-block">
        <div className="wrap max-w-3xl">
          <p className="eyebrow">Our History</p>
          <h1 className="mt-2 text-4xl">Same club, twenty-five years running.</h1>
          <p className="mt-4 text-ink-soft">
            Udaya Cricket Club started with a handful of players and a borrowed ground, and has kept turning up every season since 1999.
            Founded in Chennai, the club plays leather-ball cricket with stats synced from CricHeroes and stories written after every match.
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-line bg-paper p-4"><dt className="text-sm text-ink-soft">Founded</dt><dd className="text-2xl font-bold">1999</dd></div>
            <div className="rounded border border-line bg-paper p-4"><dt className="text-sm text-ink-soft">Seasons</dt><dd className="text-2xl font-bold">25</dd></div>
            <div className="rounded border border-line bg-paper p-4"><dt className="text-sm text-ink-soft">Home ground</dt><dd className="text-xl font-bold">Udaya Ground</dd></div>
            <div className="rounded border border-line bg-paper p-4"><dt className="text-sm text-ink-soft">Format</dt><dd className="text-xl font-bold">Leather ball</dd></div>
          </dl>
        </div>
      </section>
      <LiveStats stats={stats} />
    </>
  );
}
