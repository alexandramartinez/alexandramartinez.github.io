import type { ContentItem, ContentType } from '../data/content';
import { youTubeThumb, gitHubThumb } from './thumbnails';

/**
 * How a content item is turned into the values a card renders. Extracted from
 * ContentCard so the derivation (cover, playable, label, date) is testable and
 * so the type labels have one home shared with the portfolio filter. The card
 * renders the returned bundle; badges (stars/forks/etc.) stay as markup in the
 * card since they are conditional JSX, not derivation. See CONTEXT.md.
 */

/** Singular label for a single item's tag, e.g. "Video". */
export const typeLabel: Record<ContentType, string> = {
  video: 'Video',
  short: 'Short',
  repo: 'Repo',
  article: 'Article',
  podcast: 'Podcast',
  talk: 'Talk',
  slides: 'Slides',
  stream: 'Livestream',
};

/** Plural label for a filter category, e.g. "Videos". */
export const typeLabelPlural: Record<ContentType, string> = {
  video: 'Videos',
  short: 'Shorts',
  repo: 'Repos',
  article: 'Articles',
  podcast: 'Podcasts',
  talk: 'Talks',
  slides: 'Slides',
  stream: 'Livestreams',
};

/** Content types that get a play glyph over the cover. */
const PLAYABLE: ReadonlySet<ContentType> = new Set<ContentType>([
  'video',
  'short',
  'stream',
  'talk',
  'podcast',
]);

/** The values a ContentCard renders for one item. */
export interface CardPresentation {
  /** Singular type label for the tag. */
  label: string;
  /** Localized date, or '' when the item has no valid date. */
  dateLabel: string;
  /** Cover image URL, or undefined when the card should render no cover. */
  cover: string | undefined;
  /** Whether to overlay a play glyph. */
  playable: boolean;
}

/** Localized date string, or '' for a missing or unparseable date. */
function formatDate(date: string): string {
  if (!date) return '';
  const str = new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return str === 'Invalid Date' ? '' : str;
}

/**
 * Map a content item to its card display values. An explicit thumbnail (e.g. an
 * article's fetched og:image) wins; otherwise the cover is derived from the URL
 * for YouTube and GitHub links, and is undefined when neither applies.
 */
export function presentContentItem(item: ContentItem): CardPresentation {
  return {
    label: typeLabel[item.type] ?? item.type,
    dateLabel: formatDate(item.date),
    cover: item.thumbnail ?? youTubeThumb(item.url) ?? gitHubThumb(item.url) ?? undefined,
    playable: PLAYABLE.has(item.type),
  };
}
