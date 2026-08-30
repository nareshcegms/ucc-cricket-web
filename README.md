# Udaya Cricket Club — Next.js Website

Modern club website built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Content is driven by JSON files (CMS-style) with optional **Firebase** admin and weekly **CricHeroes** stat sync.

Live: [nareshcegms.github.io/ucc-cricket-web](https://nareshcegms.github.io/ucc-cricket-web/)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Phases implemented

| Phase | Features |
|-------|----------|
| **2** | Gallery (`gallery.json`), Sponsors (`sponsors.json`), Contact (`contact.json`), live stats (`site-stats.json`) |
| **3** | Next.js App Router, `/players/[id]` profile pages with Recharts, EN/தமிழ் i18n, Framer Motion animations |
| **4** | `/admin` dashboard, Firebase hookup (`.env.example`), PWA manifest + service worker |

## Routes

| Path | Description |
|------|-------------|
| `/` | Hero slider, scoreboard, live stats, player spotlight |
| `/team/` | Full squad slider + grid |
| `/players/[id]/` | Individual profile, charts, match history |
| `/matches/` | Match stories by date |
| `/gallery/` | Masonry gallery with filters & lightbox |
| `/sponsors/` | Logo slider, sponsor cards, testimonials |
| `/contact/` | Inquiry form, membership plans, map |
| `/about/` | Club history & stats |
| `/admin/` | CMS dashboard (Firebase or JSON editing guide) |

## Content files (edit these)

| File | Purpose |
|------|---------|
| `players.json` | Squad profiles — synced from CricHeroes weekly |
| `stories.json` | Match write-ups (EN + TA) |
| `home.json` | Homepage hero slider slides |
| `gallery.json` | Gallery images & categories |
| `sponsors.json` | Sponsors & testimonials |
| `contact.json` | Contact details, membership plans |
| `site-stats.json` | Animated counter stats on homepage |

## CricHeroes auto-sync

The GitHub Action `.github/workflows/sync-stats.yml` runs `sync_stats.py` weekly and commits updates to `players.json`.

1. Add each player's public CricHeroes URL to `players.json`
2. Push to `main` — sync runs every Monday (or trigger manually in Actions)

## Firebase admin (Phase 4)

1. Copy `.env.example` → `.env.local`
2. Add your Firebase project keys from [Firebase Console](https://console.firebase.google.com/)
3. Enable Email/Password auth and Firestore
4. Visit `/admin/` to sign in and save CMS drafts to Firestore

Without Firebase, edit the JSON files above and push — the site rebuilds automatically.

## Deploy

### GitHub Pages (static export)

1. Repo **Settings → Pages → Source: GitHub Actions**
2. Push to `main` — workflow `.github/workflows/deploy-next.yml` builds and deploys

Local static build:

```bash
npm run build:gh-pages
```

Output is in `out/` (base path `/ucc-cricket-web`).

### Vercel (recommended for admin + SSR)

Connect the repo at [vercel.com](https://vercel.com) — no base path needed. Set Firebase env vars in the Vercel dashboard.

## Legacy static site

The original `index.html` / `script.js` / `styles.css` files remain in the repo root for reference. The Next.js app replaces them when deployed via GitHub Actions.

## Tech stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 · Framer Motion · Recharts
- React Hook Form · Zod · Firebase (optional)
- PWA manifest + service worker
