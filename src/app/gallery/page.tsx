import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { getGalleryItems } from '@/lib/data';

export default function GalleryPage() {
  const items = getGalleryItems();

  return (
    <section className="section-block">
      <div className="wrap">
        <p className="eyebrow">Gallery</p>
        <h1 className="mt-2 text-4xl">Moments from the ground.</h1>
        <p className="mt-3 text-ink-soft">Filter by matches, practice, events, celebrations, and awards.</p>
        <div className="mt-10">
          <GalleryGrid items={items} />
        </div>
      </div>
    </section>
  );
}
