import type { ContentType } from '../data/content';

/**
 * The portfolio filter rule, extracted from the page so it can be tested in
 * isolation. The /portfolio browser script is a thin DOM adapter over this: it
 * reads the searchable fields off each card's data-* attributes and toggles
 * visibility from the boolean this returns. See CONTEXT.md ("facet").
 */

/** The active filter state, using the sentinels the filter buttons emit. */
export interface FilterCriteria {
  /** 'all' means no type constraint. */
  type: 'all' | ContentType;
  /** 'all' means no source (channel) constraint. */
  channel: 'all' | string;
  /** Already lowercased and trimmed; '' means no text constraint. */
  query: string;
}

/** The few fields of a content item the filter matches against. */
export interface SearchableFields {
  type: string;
  source: string;
  /** Lowercase "title description source" blob, precomputed by the template. */
  search: string;
}

/** Whether a card matches the active filter: type AND channel AND search. */
export function matchesCriteria(fields: SearchableFields, criteria: FilterCriteria): boolean {
  const typeOk = criteria.type === 'all' || fields.type === criteria.type;
  const channelOk = criteria.channel === 'all' || fields.source === criteria.channel;
  const textOk = criteria.query === '' || fields.search.includes(criteria.query);
  return typeOk && channelOk && textOk;
}
