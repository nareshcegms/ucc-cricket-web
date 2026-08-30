import Link from 'next/link';
import { SponsorSection } from '@/components/sponsors/SponsorSection';
import { getSponsors, getTestimonials } from '@/lib/data';

export default function SponsorsPage() {
  const sponsors = getSponsors();
  const testimonials = getTestimonials();

  return (
    <section className="section-block">
      <div className="wrap">
        <p className="eyebrow">Sponsors</p>
        <h1 className="mt-2 text-4xl">Partners who back Udaya CC.</h1>
        <div className="mt-10">
          <SponsorSection sponsors={sponsors} testimonials={testimonials} />
        </div>
        <div className="mt-12 rounded-lg border border-ball/30 bg-ball/5 p-8 text-center">
          <h2 className="text-2xl">Become a sponsor</h2>
          <p className="mt-2 text-ink-soft">Partner with a club that has turned up every season since 1999.</p>
          <Link href="/contact/" className="btn btn-primary mt-4 inline-block">Get in touch</Link>
        </div>
      </div>
    </section>
  );
}
