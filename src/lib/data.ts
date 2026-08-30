import type {
  ClubMatch,
  ContactInfo,
  GalleryItem,
  HeroSlide,
  LeatherMatch,
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

const CLUB_NAME = /udhaya|udaya\s*cc|udaya cricket/i;

function isClubTeam(name: string | undefined) {
  return CLUB_NAME.test(name || '');
}

function shortClubName(name: string | undefined) {
  return isClubTeam(name) ? 'Udaya CC' : name || 'Opposition';
}

function firstName(name: string) {
  return name.split(/\s+/)[0] || name;
}

function parseRuns(batting: string) {
  if (!batting || /did not bat/i.test(batting)) return null;
  const match = batting.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function parseWickets(bowling: string) {
  if (!bowling || /did not bowl/i.test(bowling)) return null;
  const match = bowling.match(/^(\d+)\s*\//);
  return match ? Number(match[1]) : null;
}

function clubOutcome(match: LeatherMatch) {
  const winner = (match.result || '').split(/\s+won/i)[0];
  if (/abandoned|no result|tied/i.test(match.result || '')) return 'other';
  if (isClubTeam(winner)) return 'won';
  if (/won/i.test(match.result || '')) return 'lost';
  return 'other';
}

export function getClubMatches(): ClubMatch[] {
  const byId = new Map<number, ClubMatch>();

  getPlayers().forEach((player) => {
    (player.leather_matches || []).forEach((match) => {
      if (!isClubTeam(match.team_a) && !isClubTeam(match.team_b)) return;
      if (!byId.has(match.id)) {
        byId.set(match.id, { ...match, contributions: [] });
      }
      byId.get(match.id)?.contributions.push({
        name: player.name,
        batting: match.batting,
        bowling: match.bowling,
        awards: match.awards || [],
      });
    });
  });

  return [...byId.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getLatestClubMatch(): ClubMatch | undefined {
  return getClubMatches()[0];
}

function writeAutoStory(match: ClubMatch): Story {
  const date = String(match.date || '').slice(0, 10);
  const opp = isClubTeam(match.team_a) ? match.team_b : match.team_a;
  const clubScore = isClubTeam(match.team_a) ? match.team_a_score : match.team_b_score;
  const oppScore = isClubTeam(match.team_a) ? match.team_b_score : match.team_a_score;
  const outcome = clubOutcome(match);
  const venue = [match.ground, match.city].filter(Boolean).join(', ');
  const bats = [...match.contributions]
    .filter((row) => parseRuns(row.batting) != null)
    .sort((a, b) => (parseRuns(b.batting) || 0) - (parseRuns(a.batting) || 0));
  const bowls = [...match.contributions]
    .filter((row) => (parseWickets(row.bowling) || 0) > 0)
    .sort((a, b) => (parseWickets(b.bowling) || 0) - (parseWickets(a.bowling) || 0));

  const title = outcome === 'won'
    ? `Udaya CC beat ${opp}`
    : outcome === 'lost'
      ? `Udaya CC fall short against ${opp}`
      : `Udaya CC vs ${opp}`;
  const titleTa = outcome === 'won'
    ? `உதயா கிரிக்கெட் கிளப் ${opp}-ஐ வென்றது`
    : outcome === 'lost'
      ? `உதயா கிரிக்கெட் கிளப் ${opp}-க்கு தோற்றது`
      : `உதயா கிரிக்கெட் கிளப் vs ${opp}`;

  const highlights = [
    `UCC ${clubScore || ''}`.trim(),
    `${shortClubName(opp)} ${oppScore || ''}`.trim(),
    ...bats.slice(0, 2).map((row) => `${firstName(row.name)} ${row.batting}`),
    ...bowls.slice(0, 2).map((row) => `${firstName(row.name)} ${row.bowling}`),
  ].filter((item) => item.length > 3).slice(0, 5);

  const batLine = bats.length
    ? bats.slice(0, 3).map((row) => `${row.name} ${row.batting}`).join('; ') + '.'
    : 'No synced batting figures are listed for this match yet.';
  const bowlLine = bowls.length
    ? bowls.slice(0, 3).map((row) => `${row.name} ${row.bowling}`).join('; ') + '.'
    : 'No synced wickets are listed for this match yet.';

  const open = [match.result, venue, match.overs ? `${match.overs} overs` : '']
    .filter(Boolean)
    .join(' · ') + '.';

  return {
    id: `auto-${match.id}`,
    date,
    match_id: match.id,
    auto: true,
    url: match.url,
    type: match.tournament || 'Match',
    type_ta: match.tournament || 'போட்டி',
    title,
    title_ta: titleTa,
    highlights,
    highlights_ta: highlights,
    paragraphs: [open, `With the bat: ${batLine}`, `With the ball: ${bowlLine}`],
    paragraphs_ta: [open, batLine, bowlLine],
  };
}

export function getStories(): Story[] {
  const written = [...(storiesData as { stories: Story[] }).stories];
  const matches = getClubMatches();
  const usedDates = new Set(written.map((story) => story.date));
  const usedIds = new Set(written.map((story) => story.match_id).filter(Boolean));

  written.forEach((story) => {
    const match = matches.find(
      (item) => item.id === story.match_id || String(item.date).slice(0, 10) === story.date
    );
    if (match) {
      story.match_id = story.match_id || match.id;
      story.url = story.url || match.url;
    }
  });

  const autos = matches
    .filter((match) => !usedIds.has(match.id) && !usedDates.has(String(match.date).slice(0, 10)))
    .map(writeAutoStory);

  return [...written, ...autos].sort(
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
  const stats = { ...(siteStatsData as SiteStats) };
  stats.players = getPlayers().length;
  return stats;
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
