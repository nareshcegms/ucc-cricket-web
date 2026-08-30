export type Lang = 'en' | 'ta';

export interface LeatherMatch {
  id: number;
  date: string;
  ground: string;
  city: string;
  overs: number;
  tournament: string;
  team_a: string;
  team_b: string;
  team_a_score: string;
  team_b_score: string;
  result: string;
  ball_type: string;
  url: string;
  batting: string;
  bowling: string;
  awards: string[];
}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  bio: string;
  cricheroes_url?: string;
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  highest_score: string;
  best_bowling: string;
  last_synced?: string;
  leather_matches?: LeatherMatch[];
  batting_style?: string;
  bowling_style?: string;
  strike_rate?: number;
  mvp_awards?: number;
  photo?: string;
}

export interface Story {
  id: string;
  date: string;
  type: string;
  type_ta?: string;
  title: string;
  title_ta?: string;
  highlights: string[];
  highlights_ta?: string[];
  paragraphs: string[];
  paragraphs_ta?: string[];
  match_id?: number;
  auto?: boolean;
  url?: string;
}

export interface ClubMatch extends LeatherMatch {
  contributions: { name: string; batting: string; bowling: string; awards: string[] }[];
}

export interface HeroSlide {
  id: string;
  title_en: string;
  title_ta: string;
  subtitle_en: string;
  subtitle_ta: string;
  cta_en: string;
  cta_ta: string;
  ctaTab: string;
  ctaHref?: string;
  theme: string;
}

export interface GalleryItem {
  id: string;
  category: 'matches' | 'practice' | 'events' | 'celebrations' | 'awards';
  title_en: string;
  title_ta: string;
  caption_en: string;
  caption_ta: string;
  image: string;
  date: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'gold' | 'silver' | 'bronze';
  logo: string;
  website: string;
  tagline_en: string;
  tagline_ta: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role_en: string;
  role_ta: string;
  quote_en: string;
  quote_ta: string;
}

export interface MembershipPlan {
  id: string;
  name_en: string;
  name_ta: string;
  price_en: string;
  price_ta: string;
  benefits_en: string[];
  benefits_ta: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address_en: string;
  address_ta: string;
  map_embed: string;
  social: { instagram: string; facebook: string; youtube: string };
  membership_plans: MembershipPlan[];
}

export interface SiteStats {
  years: number;
  total_matches: number;
  wins: number;
  win_percentage: number;
  runs_scored: number;
  wickets_taken: number;
  championships: number;
  players: number;
  followers: number;
}
