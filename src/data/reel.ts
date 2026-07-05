/**
 * The homepage "reel": a small, hand-curated, format-grouped showcase of
 * Alex's best video work, aimed at a hiring viewer who watches ~30 seconds.
 *
 * This is CURATION, not a taxonomy. It is separate from the full catalog in
 * src/data/content.ts and from the `featured` collection: it references
 * specific videos and assigns each to a display row, decoupled from the
 * catalog's `type` field. Reorder, add, and remove picks here freely; nothing
 * else in the site depends on this list.
 *
 * Maintain it by hand, like content.ts. Copy rules apply to any displayed text
 * (no em dashes, no ampersands).
 *
 * IMPORTANT, before this goes live:
 *   1. `duration` values below are PLACEHOLDERS. Open each video on YouTube and
 *      type the real runtime (e.g. "2:34", "18:20", "1:04:00").
 *   2. Confirm each pick is actually your strongest for that row, and that a
 *      "clip" really is a short (~3 min) horizontal video.
 *   3. The "stream" row has no real pick yet (the catalog seed had 0
 *      livestreams). Paste a real livestream URL + duration to make that row
 *      appear; until then it is skipped automatically.
 */

/** Which reel row a pick belongs to. Independent of ContentType. */
export type ReelRow = 'deep-dive' | 'clip' | 'short' | 'stream';

export interface ReelItem {
  row: ReelRow;
  title: string;
  /** Watch link (opens on YouTube in a new tab). */
  url: string;
  /** Human runtime, hand-typed to match YouTube, e.g. "2:34" or "1:04:00". */
  duration: string;
  /** Platform label; defaults to YouTube where omitted. */
  source?: string;
  /** Optional thumbnail override; by default derived from the URL (see youTubeThumb). */
  thumbnail?: string;
}

/** Row order + reader-facing copy. Rows render top-to-bottom in this order. */
export const REEL_ROWS: { row: ReelRow; label: string; blurb: string }[] = [
  { row: 'deep-dive', label: 'Deep dives', blurb: 'Full tutorials and comparisons.' },
  { row: 'clip', label: 'Quick explainers', blurb: 'Under three minutes, one idea each.' },
  { row: 'short', label: 'Shorts', blurb: 'Vertical, sixty seconds or less.' },
  { row: 'stream', label: 'Livestreams', blurb: 'Recorded live sessions.' },
];

/**
 * The curated picks. Seeded with REAL videos from the catalog so every row
 * demonstrates its shape; swap in your actual best work and confirm durations.
 */
export const reel: ReelItem[] = [
  // Deep dives (long-form 16:9).
  {
    row: 'deep-dive',
    title: 'Claude Code vs CurieTech AI: Solving Advent of Code 2025 in DataWeave',
    url: 'https://www.youtube.com/watch?v=C0QB4Z1LwxM',
    duration: '20:00', // PLACEHOLDER: confirm on YouTube.
  },
  {
    row: 'deep-dive',
    title: 'MuleSoft Anypoint Code Builder: Full CRUD Tutorial with MySQL and Docker',
    url: 'https://www.youtube.com/watch?v=_GY38ZvP8fI',
    duration: '25:00', // PLACEHOLDER: confirm on YouTube.
  },
  {
    row: 'deep-dive',
    title: 'I Built a Full MCP Server in 10 Minutes Using CurieTech AI',
    url: 'https://www.youtube.com/watch?v=EE1QLCuzGVk',
    duration: '12:00', // PLACEHOLDER: confirm on YouTube.
  },

  // Quick explainers (~3 min, 16:9). NOTE: confirm these are actually short.
  {
    row: 'clip',
    title: 'Why You Should Start Using Anypoint Code Builder (Even If You Love Studio)',
    url: 'https://www.youtube.com/watch?v=dlODB4cjXyU',
    duration: '3:00', // PLACEHOLDER: confirm on YouTube.
  },
  {
    row: 'clip',
    title: 'Apparently I Lied: How to Import JARs in Anypoint Code Builder',
    url: 'https://www.youtube.com/watch?v=5xgb0bbzWBs',
    duration: '2:30', // PLACEHOLDER: confirm on YouTube.
  },

  // Shorts (vertical 9:16).
  {
    row: 'short',
    title: 'Using Docker Compose for an instant local MySQL install',
    url: 'https://www.youtube.com/shorts/pgiwM8TH4sA',
    duration: '0:45', // PLACEHOLDER: confirm on YouTube.
  },
  {
    row: 'short',
    title: 'Anypoint Code Builder in sixty seconds',
    url: 'https://www.youtube.com/shorts/6RhN2O_CQ1k',
    duration: '0:50', // PLACEHOLDER: confirm on YouTube.
  },

  // Livestreams (16:9). No real pick yet: paste a livestream URL + duration and
  // this row appears automatically. Example shape:
  // {
  //   row: 'stream',
  //   title: 'Live: building a MuleSoft API end to end',
  //   url: 'https://www.youtube.com/watch?v=YOUR_STREAM_ID',
  //   duration: '1:04:00',
  // },
];

/**
 * Extract a YouTube video id from any of Alex's URL shapes
 * (watch?v=, /shorts/, youtu.be/, /embed/). Pure string parsing, no network.
 */
export function youTubeId(url: string): string | null {
  const m = url.match(/(?:v=|\/shorts\/|youtu\.be\/|\/embed\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

/**
 * Derive a thumbnail URL from a YouTube link, no fetching required.
 * Uses hqdefault.jpg: it exists for every video (unlike maxresdefault) and is
 * crisp at card sizes. Cards crop it with object-cover. Returns null for
 * non-YouTube URLs, in which case the caller should fall back to item.thumbnail.
 */
export function youTubeThumb(url: string): string | null {
  const id = youTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Derive a cover image from a GitHub repo link, no fetching required.
 * GitHub auto-generates a social preview per repo at opengraph.githubassets.com
 * (the same 1200x630 card you see when a repo is shared). The leading path
 * segment is a cache-busting token, so any value works. Returns null for
 * non-repo GitHub URLs (profiles, gists) and non-GitHub URLs.
 */
export function gitHubThumb(url: string): string | null {
  const m = url.match(/^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/);
  return m ? `https://opengraph.githubassets.com/1/${m[1]}/${m[2]}` : null;
}
