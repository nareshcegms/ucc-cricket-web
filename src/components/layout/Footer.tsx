'use client';

import { useI18n } from '@/components/providers/I18nProvider';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line py-10">
      <div className="wrap flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-[family-name:var(--font-display)] text-lg font-semibold text-willow">Udaya CC</div>
          <p className="mt-1 text-sm text-ink-soft">{t('footer.tagline')}</p>
        </div>
        <p className="text-sm text-ink-soft">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
