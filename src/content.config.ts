import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const contentType = z.enum(['video', 'short', 'repo', 'article', 'talk', 'stream', 'podcast', 'slides']);

/**
 * Hand-picked "best work", pinned at the top of the homepage. Curated, separate
 * from the main content catalog in src/data/content.ts.
 */
const featured = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/featured' }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    url: z.string().url(),
    type: contentType,
    source: z.string().optional(),
    date: z.coerce.date().optional(),
    // Optional cover image. Without one, YouTube/GitHub URLs derive a thumbnail
    // automatically; other sources (SlideShare, PDFs) need it set explicitly.
    thumbnail: z.string().url().optional(),
    // Optional runtime badge for playable media, e.g. "2:52" or "1:01:01".
    duration: z.string().optional(),
    // Optional engagement counts for repo cards, shown in the footer with
    // icons in place of a date (repos have no meaningful date). Hand-maintained.
    stars: z.number().optional(),
    forks: z.number().optional(),
    // Display order: lower numbers first.
    order: z.number().default(0),
  }),
});

/**
 * Manually pasted links for sources with no reliable per-author feed
 * (MuleSoft blog, Salesforce Developers blog). Title + URL + date.
 */
const links = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/links' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    source: z.string(), // e.g. "MuleSoft", "Salesforce Developers"
    type: contentType.default('article'),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { featured, links };
