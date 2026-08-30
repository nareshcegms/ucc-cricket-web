import type {
  ContactInfo,
  GalleryItem,
  HeroSlide,
  Player,
  SiteStats,
  Sponsor,
  Story,
  Testimonial,
} from '@/types';

import playersData from '../../players.json';
import storiesData from '../../stories.json';
import homeData from '../../home.json';
import galleryData from '../../gallery.json';
import sponsorsData from '../../sponsors.json';
import contactData from '../../contact.json';
import siteStatsData from '../../site-stats.json';

export function getPlayers(): Player[] {
  return (playersData as { players: Player[] }).players;
}

export function getPlayer(id: string): Player | undefined {
  return getPlayers().find((p) => p.id === id);
}

export function getStories(): Story[] {
  return [...(storiesData as { stories: Story[] }).stories].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getStory(id: string): Story | undefined {
  return getStories().find((s) => s.id === id);
}

export function getHeroSlides(): HeroSlide[] {
  return (homeData as { slides: HeroSlide[] }).slides;
}

export function getGalleryItems(): GalleryItem[] {
  return (galleryData as { items: GalleryItem[] }).items;
}

export function getSponsors(): Sponsor[] {
  return (sponsorsData as { sponsors: Sponsor[] }).sponsors;
}

export function getTestimonials(): Testimonial[] {
  return (sponsorsData as { testimonials: Testimonial[] }).testimonials;
}

export function getContactInfo(): ContactInfo {
  return contactData as ContactInfo;
}

export function getSiteStats(): SiteStats {
  return siteStatsData as SiteStats;
}

export function localized(
  item: object,
  field: string,
  lang: 'en' | 'ta'
): string {
  const record = item as Record<string, unknown>;
  const taKey = `${field}_ta`;
  if (lang === 'ta' && typeof record[taKey] === 'string') return record[taKey] as string;
  const enKey = `${field}_en`;
  if (typeof record[enKey] === 'string') return record[enKey] as string;
  if (typeof record[field] === 'string') return record[field] as string;
  return '';
}
