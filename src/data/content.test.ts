import { describe, it, expect } from 'vitest';
import {
  content,
  getCatalog,
  getLatest,
  getFeatured,
  facets,
  linkEntryToItem,
  featuredEntryToItem,
  type LinkEntry,
  type FeaturedEntry,
} from './content';

const linkEntry = (over: Partial<LinkEntry['data']> & { id?: string } = {}): LinkEntry => {
  const { id, ...data } = over;
  return {
    id,
    data: {
      type: 'article',
      title: 'A link',
      url: 'https://example.com/a',
      source: 'MuleSoft',
      date: new Date('2025-01-01T00:00:00Z'),
      ...data,
    },
  };
};

const featuredEntry = (over: Partial<FeaturedEntry['data']> = {}): FeaturedEntry => ({
  data: {
    type: 'video',
    title: 'Best talk',
    url: 'https://example.com/f',
    blurb: 'A blurb',
    order: 0,
    ...over,
  },
});

describe('linkEntryToItem', () => {
  it('maps a link entry, converting the date to an ISO string', () => {
    const item = linkEntryToItem(linkEntry({ date: new Date('2025-03-04T00:00:00Z') }));
    expect(item).toMatchObject({
      type: 'article',
      title: 'A link',
      source: 'MuleSoft',
      date: '2025-03-04T00:00:00.000Z',
    });
  });

  it('leaves the date empty when the entry has none', () => {
    expect(linkEntryToItem(linkEntry({ date: undefined })).date).toBe('');
  });
});

describe('featuredEntryToItem', () => {
  it('maps blurb to description and builds meta only from present fields', () => {
    const item = featuredEntryToItem(featuredEntry({ blurb: 'Great', duration: '2:52', stars: 10 }));
    expect(item.description).toBe('Great');
    expect(item.meta).toEqual({ duration: '2:52', stars: 10 });
  });

  it('includes a zero star/fork count but omits undefined ones', () => {
    const item = featuredEntryToItem(featuredEntry({ stars: 0, forks: undefined }));
    expect(item.meta).toEqual({ stars: 0 });
  });
});

describe('getCatalog', () => {
  it('merges the live list with link items, newest first', () => {
    const old = linkEntry({ url: 'https://x/old', date: new Date('2000-01-01T00:00:00Z') });
    const recent = linkEntry({ url: 'https://x/new', date: new Date('2999-01-01T00:00:00Z') });
    const catalog = getCatalog([old, recent]);
    // The far-future link sorts to the very front; the ancient one to the back.
    expect(catalog[0].url).toBe('https://x/new');
    expect(catalog[catalog.length - 1].url).toBe('https://x/old');
    expect(catalog.length).toBe(content.length + 2);
  });

  it('drops seeded _example link entries', () => {
    const catalog = getCatalog([linkEntry({ id: '_example-foo', url: 'https://x/ex' })]);
    expect(catalog.some((i) => i.url === 'https://x/ex')).toBe(false);
    expect(catalog.length).toBe(content.length);
  });

  it('returns the live list alone when no links are passed', () => {
    expect(getCatalog().length).toBe(content.length);
  });
});

describe('getLatest', () => {
  it('returns the newest n live items and never link entries', () => {
    const latest = getLatest(6);
    expect(latest.length).toBe(6);
    for (let i = 1; i < latest.length; i++) {
      expect((latest[i - 1].date || '') >= (latest[i].date || '')).toBe(true);
    }
  });
});

describe('getFeatured', () => {
  it('orders by the order field ascending, lower first', () => {
    const items = getFeatured([
      featuredEntry({ title: 'second', order: 2 }),
      featuredEntry({ title: 'first', order: 1 }),
    ]);
    expect(items.map((i) => i.title)).toEqual(['first', 'second']);
  });
});

describe('facets', () => {
  it('returns the distinct types and sources present, unordered', () => {
    const { types, sources } = facets([
      { type: 'video', title: 't', url: 'u1', date: '', source: 'YouTube' },
      { type: 'video', title: 't', url: 'u2', date: '', source: 'YouTube' },
      { type: 'article', title: 't', url: 'u3', date: '', source: 'Medium' },
    ]);
    expect(new Set(types)).toEqual(new Set(['video', 'article']));
    expect(new Set(sources)).toEqual(new Set(['YouTube', 'Medium']));
  });
});
