"""
sync_stats.py
-------------
Reads players.json and, for every player with a cricheroes_url set, pulls
leather-ball career stats plus the last five leather-ball match performances
(batting, bowling, and awards) from CricHeroes.

CricHeroes has no official public API. This script uses the same JSON endpoints
their website calls. If those change, update the paths below.
"""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent / "players.json"
API_BASE = "https://api.cricheroes.in/api/v1"
API_KEY = "cr!CkH3r0s"
LAST_N_MATCHES = 5
AWARD_PAGES = 8

STAT_TITLE_MAP = {
    "Matches": "matches",
    "Runs": "runs",
    "Wickets": "wickets",
    "Avg": "average",
    "Highest Runs": "highest_score",
    "Best Bowling": "best_bowling",
}


def api_get(path: str) -> dict:
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "api-key": API_KEY,
            "device-type": "Chrome",
            "udid": "udaya-cc-sync",
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            ),
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def player_id_from_url(url: str) -> int | None:
    match = re.search(r"/player-profile/(\d+)", url.strip())
    return int(match.group(1)) if match else None


def stat_value(stats: list[dict], title: str):
    for item in stats or []:
        if item.get("title") == title:
            return item.get("value")
    return None


def sync_leather_stats(player_id: int) -> dict:
    payload = api_get(f"/player/get-player-statistic/{player_id}?ballType=LEATHER")
    stats = payload.get("data", {}).get("statistics", {})
    batting = stats.get("batting", [])
    bowling = stats.get("bowling", [])

    updated = {}
    for title, field in STAT_TITLE_MAP.items():
        source = batting if title in {"Matches", "Runs", "Avg", "Highest Runs"} else bowling
        value = stat_value(source, title)
        if value is None:
            continue
        if field == "average":
            updated[field] = float(value)
        elif field in {"matches", "runs", "wickets"}:
            updated[field] = int(value)
        else:
            updated[field] = str(value)

    return updated


def fetch_awards_by_match(player_id: int) -> dict[int, list[str]]:
    awards_by_match: dict[int, set[str]] = {}

    for page in range(1, AWARD_PAGES + 1):
        payload = api_get(
            f"/player/get-player-award-new/{player_id}/match?pageno={page}"
        )
        rows = payload.get("data") or []
        if not rows:
            break

        for row in rows:
            match_id = row.get("match_id")
            name = row.get("name")
            if match_id and name:
                awards_by_match.setdefault(match_id, set()).add(name)

        if not payload.get("page", {}).get("next"):
            break

    return {match_id: sorted(names) for match_id, names in awards_by_match.items()}


def format_overs(overs, balls) -> str:
    if balls in (None, 0):
        return str(overs)
    if balls >= 6:
        whole = balls // 6
        rem = balls % 6
        return f"{whole}.{rem}" if rem else str(whole)
    return f"{overs}.{balls}"


def extract_performance(scorecard: dict, player_id: int) -> tuple[str, str]:
    batting = None
    bowling = None

    def walk(obj):
        nonlocal batting, bowling
        if isinstance(obj, list):
            for item in obj:
                walk(item)
            return
        if not isinstance(obj, dict):
            return

        pid = obj.get("player_id") or obj.get("playerId")
        if int(pid or 0) == player_id:
            if "how_to_out" in obj or (
                "runs" in obj and ("balls" in obj or "4s" in obj or "SR" in obj)
            ):
                batting = obj
            if "wickets" in obj and "overs" in obj and (
                "maidens" in obj or "economy_rate" in obj
            ):
                bowling = obj

        for value in obj.values():
            walk(value)

    walk(scorecard.get("data") or scorecard)

    if batting:
        not_out = re.search(
            r"not out|retired hurt|retired not out",
            str(batting.get("how_to_out") or ""),
            re.IGNORECASE,
        )
        balls = batting.get("balls")
        if balls:
            batting_display = f"{batting['runs']}{'*' if not_out else ''} ({balls})"
        else:
            batting_display = str(batting["runs"])
    else:
        batting_display = "Did not bat"

    if bowling:
        bowling_display = (
            f"{bowling['wickets']}/{bowling['runs']} "
            f"({format_overs(bowling['overs'], bowling.get('balls'))} ov)"
        )
    else:
        bowling_display = "Did not bowl"

    return batting_display, bowling_display


def sync_recent_matches(player_id: int, awards_by_match: dict[int, list[str]]) -> list[dict]:
    payload = api_get(
        f"/player/get-player-match/{player_id}"
        f"?pagesize={LAST_N_MATCHES}&ballType=LEATHER&matchTypeId=1&pageno=1"
    )
    rows = payload.get("data") or []
    matches = []

    for row in rows[:LAST_N_MATCHES]:
        match_id = row["match_id"]
        scorecard = api_get(f"/scorecard/get-scorecard/{match_id}")
        batting, bowling = extract_performance(scorecard, player_id)

        matches.append(
            {
                "id": match_id,
                "date": row.get("match_start_time"),
                "ground": row.get("ground_name"),
                "city": row.get("city_name"),
                "overs": row.get("overs"),
                "tournament": row.get("tournament_name") or "Individual Match",
                "team_a": row.get("team_a"),
                "team_b": row.get("team_b"),
                "team_a_score": row.get("team_a_summary"),
                "team_b_score": row.get("team_b_summary"),
                "result": (row.get("match_summary") or {}).get("summary", ""),
                "ball_type": "LEATHER",
                "url": f"https://cricheroes.com/scorecard/{match_id}",
                "batting": batting,
                "bowling": bowling,
                "awards": awards_by_match.get(match_id, []),
            }
        )

    return matches


def sync_player(player: dict) -> dict:
    url = player.get("cricheroes_url", "").strip()
    if not url:
        print(f"  Skipping {player['name']} — no cricheroes_url set yet.")
        return player

    player_id = player_id_from_url(url)
    if not player_id:
        print(f"  Could not parse player id from {url}")
        return player

    print(f"  Syncing {player['name']} (id {player_id})")

    try:
        player.update(sync_leather_stats(player_id))
        awards_by_match = fetch_awards_by_match(player_id)
        player["leather_matches"] = sync_recent_matches(player_id, awards_by_match)
        player["last_synced"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        print(f"    Updated stats + {len(player['leather_matches'])} recent matches")
    except urllib.error.HTTPError as err:
        print(f"    HTTP error while syncing: {err}")
    except urllib.error.URLError as err:
        print(f"    Network error while syncing: {err}")

    return player


def main():
    if not DATA_FILE.exists():
        print(f"Could not find {DATA_FILE}")
        sys.exit(1)

    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    for index, player in enumerate(data.get("players", [])):
        data["players"][index] = sync_player(player)

    DATA_FILE.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {DATA_FILE}")


if __name__ == "__main__":
    main()
