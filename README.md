# Riverside CC — Team Website

A starter website for your cricket club: hero section, player profiles
(loaded from a data file), a weekly match-story feed, and a short club
history section. Player stats can sync automatically from CricHeroes.

## Files

- `index.html` — the page itself
- `styles.css` — all styling (colors, fonts, layout)
- `script.js` — mobile menu + loads player profiles from `data/players.json`
- `data/players.json` — player names, bios, stats, and CricHeroes profile URLs
- `scripts/sync_stats.py` — scrapes CricHeroes profile pages and updates `data/players.json`
- `.github/workflows/sync-stats.yml` — runs the sync script weekly via GitHub Actions

## Viewing it locally

Because the page now fetches `data/players.json` with JavaScript, opening
`index.html` directly by double-clicking it won't load the player cards
(browsers block that for local files). Instead, run a tiny local server
from inside the folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. This isn't needed once
it's hosted on GitHub Pages — it'll work normally there.

## What to personalize first

1. **Club name & tagline** — search `index.html` for "Riverside" and the
   hero heading/lede text near the top of `<body>`.
2. **Player profiles** — edit `data/players.json`. Add one object per
   player: `name`, `team`, `role`, `bio`, `matches`, `runs`, `wickets`,
   `average`. Leave `cricheroes_url` empty until you're ready to enable
   auto-sync for that player (see below).
3. **This week's story** — in the `#stories` section of `index.html`,
   replace the sample story's headline and paragraph.
4. **Club history** — in the `#legacy` section, update the founding year,
   home ground, and squad size.

## Turning on automatic stat syncing

1. Find your public CricHeroes profile URL (open your profile in the app,
   tap the share icon, copy the link — or grab it from cricheroes.com in
   a browser).
2. Paste it into the matching player's `cricheroes_url` field in
   `data/players.json`.
3. Commit and push. The GitHub Action (`.github/workflows/sync-stats.yml`)
   runs every Monday automatically, or you can trigger it manually any
   time from your repo's **Actions** tab → "Sync CricHeroes stats" →
   **Run workflow**.
4. It'll open your profile page, read off Matches / Runs / Wickets /
   Average, update `data/players.json`, and commit the change — so the
   live site picks it up automatically.

**Please read before relying on this:** CricHeroes has no official public
API. This sync works by loading your public profile page and reading the
numbers off it, the same way a person would — it's not officially
supported, so:
- It only works if your CricHeroes profile is set to public.
- If CricHeroes redesigns their page, the script may need a small update
  (details are in the comments at the top of `scripts/sync_stats.py`).
- Weekly is a reasonable schedule — there's no need to run it more often,
  and doing so is more likely to trip anti-bot protections.

## Hosting it for free

- **GitHub Pages** — push this folder to a GitHub repo, enable Pages in
  the repo settings, done. The scheduled sync will keep committing
  updates automatically once set up.
- **Netlify / Vercel** — drag-and-drop this folder onto their dashboard
  for an instant live URL (you'd still use the GitHub Action for syncing,
  since that needs a git repo to commit into).

## Next steps

- Add more players by adding more objects to the `players` array in
  `data/players.json` — no HTML editing needed.
- Add more story cards by duplicating a `.story-card` block in
  `index.html`.

