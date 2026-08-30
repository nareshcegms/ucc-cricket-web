import { ContactSection } from '@/components/contact/ContactSection';
import { getContactInfo } from '@/lib/data';

export default function ContactPage() {
  const contact = getContactInfo();

  return (
    <section className="section-block">
      <div className="wrap">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 text-4xl">Membership & inquiries.</h1>
        <div className="mt-10">
          <ContactSection contact={contact} />
        </div>
      </div>
    </section>
  );
}
