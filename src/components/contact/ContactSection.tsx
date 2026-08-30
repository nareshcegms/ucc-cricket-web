'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ContactInfo } from '@/types';
import { useI18n } from '@/components/providers/I18nProvider';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

type FormData = z.infer<typeof schema>;

export function ContactSection({ contact }: { contact: ContactInfo }) {
  const { lang } = useI18n();
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Contact inquiry (placeholder):', data);
    reset();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl">Get in touch</h2>
        <ul className="mt-6 space-y-3 text-ink-soft">
          <li><strong>Email:</strong> <a href={`mailto:${contact.email}`} className="text-ball">{contact.email}</a></li>
          <li><strong>Phone:</strong> {contact.phone}</li>
          <li><strong>WhatsApp:</strong> <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} className="text-ball">{contact.whatsapp}</a></li>
          <li><strong>Address:</strong> {lang === 'ta' ? contact.address_ta : contact.address_en}</li>
        </ul>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contact.membership_plans.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-line bg-paper p-4">
              <h3 className="font-semibold">{lang === 'ta' ? plan.name_ta : plan.name_en}</h3>
              <p className="text-ball">{lang === 'ta' ? plan.price_ta : plan.price_en}</p>
              <ul className="mt-2 list-inside list-disc text-sm text-ink-soft">
                {(lang === 'ta' ? plan.benefits_ta : plan.benefits_en).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-line bg-paper p-6">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input {...register('name')} className="mt-1 w-full rounded border border-line bg-cream px-3 py-2" />
            {errors.name && <p className="text-sm text-ball">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input {...register('email')} type="email" className="mt-1 w-full rounded border border-line bg-cream px-3 py-2" />
            {errors.email && <p className="text-sm text-ball">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea {...register('message')} rows={4} className="mt-1 w-full rounded border border-line bg-cream px-3 py-2" />
            {errors.message && <p className="text-sm text-ball">{errors.message.message}</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full">Send inquiry</button>
          {isSubmitSuccessful && (
            <p className="text-sm text-willow">Thanks — payment integration &amp; email delivery coming in Phase 4 Firebase hookup.</p>
          )}
        </form>

        <div className="mt-6 aspect-video overflow-hidden rounded-lg border border-line">
          <iframe
            src={contact.map_embed}
            className="h-full w-full border-0"
            loading="lazy"
            title="Club location"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
