import { describe, it, expect } from 'vitest';
import { matchesCriteria, type FilterCriteria, type SearchableFields } from './catalogFilter';

const fields = (over: Partial<SearchableFields> = {}): SearchableFields => ({
  type: 'video',
  source: 'YouTube',
  search: 'intro to dataweave youtube',
  ...over,
});

const criteria = (over: Partial<FilterCriteria> = {}): FilterCriteria => ({
  type: 'all',
  channel: 'all',
  query: '',
  ...over,
});

describe('matchesCriteria', () => {
  it('matches everything when all criteria are unconstrained', () => {
    expect(matchesCriteria(fields(), criteria())).toBe(true);
  });

  describe('type', () => {
    it('matches when the type equals the active type', () => {
      expect(matchesCriteria(fields({ type: 'video' }), criteria({ type: 'video' }))).toBe(true);
    });
    it('rejects a different type', () => {
      expect(matchesCriteria(fields({ type: 'article' }), criteria({ type: 'video' }))).toBe(false);
    });
    it("treats 'all' as no type constraint", () => {
      expect(matchesCriteria(fields({ type: 'article' }), criteria({ type: 'all' }))).toBe(true);
    });
  });

  describe('channel (source)', () => {
    it('matches when the source equals the active channel', () => {
      expect(matchesCriteria(fields({ source: 'GitHub' }), criteria({ channel: 'GitHub' }))).toBe(true);
    });
    it('rejects a different source', () => {
      expect(matchesCriteria(fields({ source: 'Medium' }), criteria({ channel: 'GitHub' }))).toBe(false);
    });
    it("treats 'all' as no channel constraint", () => {
      expect(matchesCriteria(fields({ source: 'Medium' }), criteria({ channel: 'all' }))).toBe(true);
    });
  });

  describe('query', () => {
    it('matches on a substring of the search blob', () => {
      expect(matchesCriteria(fields({ search: 'intro to dataweave' }), criteria({ query: 'dataweave' }))).toBe(true);
    });
    it('rejects when the substring is absent', () => {
      expect(matchesCriteria(fields({ search: 'intro to dataweave' }), criteria({ query: 'kubernetes' }))).toBe(false);
    });
    it("treats '' as no text constraint", () => {
      expect(matchesCriteria(fields({ search: 'anything' }), criteria({ query: '' }))).toBe(true);
    });
  });

  describe('combined (AND)', () => {
    it('requires type, channel, and query to all match', () => {
      const f = fields({ type: 'video', source: 'YouTube', search: 'intro to dataweave youtube' });
      expect(matchesCriteria(f, criteria({ type: 'video', channel: 'YouTube', query: 'dataweave' }))).toBe(true);
    });
    it('fails when any single dimension misses', () => {
      const f = fields({ type: 'video', source: 'YouTube', search: 'intro to dataweave youtube' });
      expect(matchesCriteria(f, criteria({ type: 'video', channel: 'YouTube', query: 'kubernetes' }))).toBe(false);
      expect(matchesCriteria(f, criteria({ type: 'article', channel: 'YouTube', query: 'dataweave' }))).toBe(false);
      expect(matchesCriteria(f, criteria({ type: 'video', channel: 'GitHub', query: 'dataweave' }))).toBe(false);
    });
  });
});
