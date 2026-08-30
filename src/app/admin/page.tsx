import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin — Udaya CC',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="section-block">
      <div className="wrap">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-4xl">Club CMS dashboard</h1>
        <p className="mt-3 text-ink-soft">Manage content dynamically — JSON files in repo or Firebase when configured.</p>
        <div className="mt-10">
          <AdminDashboard />
        </div>
      </div>
    </section>
  );
}
