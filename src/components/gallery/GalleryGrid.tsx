'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryItem } from '@/types';
import { localized } from '@/lib/data';
import { useI18n } from '@/components/providers/I18nProvider';

const filters = ['all', 'matches', 'practice', 'events', 'celebrations', 'awards'] as const;

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const { lang } = useI18n();
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.category === filter)),
    [filter, items]
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              filter === f ? 'border-ball bg-ball text-cream' : 'border-line bg-paper'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((item, i) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.05 }}
            onClick={() => setLightbox(item)}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border border-line bg-paper text-left shadow-sm transition hover:scale-[1.02]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={localized(item, 'title', lang)} className="w-full object-cover" loading="lazy" />
            <div className="p-3">
              <p className="font-semibold text-willow">{localized(item, 'title', lang)}</p>
              <p className="text-sm text-ink-soft">{localized(item, 'caption', lang)}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-paper"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.image} alt="" className="max-h-[70vh] w-full object-contain" />
              <div className="p-4">
                <h3 className="text-xl">{localized(lightbox, 'title', lang)}</h3>
                <p className="text-ink-soft">{localized(lightbox, 'caption', lang)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
