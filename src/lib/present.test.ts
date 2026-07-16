import { describe, it, expect } from 'vitest';
import { presentContentItem, typeLabel, typeLabelPlural } from './present';
import type { ContentItem, ContentType } from '../data/content';

const ALL_TYPES: ContentType[] = ['video', 'short', 'repo', 'article', 'talk', 'stream', 'podcast', 'slides'];

const item = (over: Partial<ContentItem> = {}): ContentItem => ({
  type: 'video',
  title: 'A thing',
  url: 'https://youtu.be/abcdef',
  date: '2025-05-01T00:00:00.000Z',
  source: 'YouTube',
  ...over,
});

describe('label tables', () => {
  it('typeLabel has a singular entry for every content type', () => {
    for (const t of ALL_TYPES) expect(typeLabel[t]).toBeTruthy();
  });
  it('typeLabelPlural has a plural entry for every content type', () => {
    for (const t of ALL_TYPES) expect(typeLabelPlural[t]).toBeTruthy();
  });
  it('keeps the singular/plural distinction the UI relies on', () => {
    expect(typeLabel.video).toBe('Video');
    expect(typeLabelPlural.video).toBe('Videos');
  });
});

describe('presentContentItem', () => {
  it('derives a YouTube cover and marks videos playable', () => {
    const p = presentContentItem(item({ type: 'video', url: 'https://youtu.be/abcdef', thumbnail: undefined }));
    expect(p.cover).toBe('https://i.ytimg.com/vi/abcdef/hqdefault.jpg');
    expect(p.playable).toBe(true);
    expect(p.label).toBe('Video');
  });

  it('gives repos the static cover and marks them not playable', () => {
    const p = presentContentItem(item({ type: 'repo', url: 'https://github.com/alex/thing', thumbnail: undefined }));
    expect(p.cover).toBe('/repo-cover.jpg');
    expect(p.playable).toBe(false);
    expect(p.label).toBe('Repo');
  });

  it('prefers an explicit thumbnail over a derived one', () => {
    const p = presentContentItem(item({ type: 'article', url: 'https://youtu.be/abcdef', thumbnail: 'https://img/og.png' }));
    expect(p.cover).toBe('https://img/og.png');
    expect(p.playable).toBe(false);
  });

  it('leaves the cover undefined when nothing derives one', () => {
    const p = presentContentItem(item({ type: 'article', url: 'https://example.com/post', thumbnail: undefined }));
    expect(p.cover).toBeUndefined();
  });

  it('formats a valid date and empties an invalid or missing one', () => {
    expect(presentContentItem(item({ date: '2025-05-01T00:00:00.000Z' })).dateLabel).not.toBe('');
    expect(presentContentItem(item({ date: '' })).dateLabel).toBe('');
    expect(presentContentItem(item({ date: 'not-a-date' })).dateLabel).toBe('');
  });
});
