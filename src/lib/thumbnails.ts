/**
 * URL to cover-image derivation, pure string parsing with no network. Used by
 * content-item presentation (see present.ts) and available to a future reel
 * component. Kept separate from both catalog data and reel data: deriving a
 * thumbnail from a URL is its own concern.
 */

/**
 * Extract a YouTube video id from any of Alex's URL shapes
 * (watch?v=, /shorts/, youtu.be/, /embed/).
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
 * Cover image for a GitHub repo link. We deliberately serve one shared static
 * card (public/repo-cover.jpg) for every repo rather than GitHub's per-repo
 * social preview at opengraph.githubassets.com: that endpoint loads
 * intermittently, so repo cards would flicker between an image and an empty
 * box. The static card is self-contained (mid-tone indigo panel) so it reads
 * on both the dark and light themes. Returns null for non-repo GitHub URLs
 * (profiles, gists) and non-GitHub URLs, so the caller renders no cover.
 */
export function gitHubThumb(url: string): string | null {
  const isRepo = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(url);
  return isRepo ? '/repo-cover.jpg' : null;
}
