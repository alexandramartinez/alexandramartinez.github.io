# Portfolio content

The vocabulary for the content shown on alexmartinez.ca: the things Alex publishes (videos, articles, repos, talks) and the two ways they are surfaced, chronologically or hand-picked.

## Language

**Content item**:
One published thing with a type, title, URL, date, and source. The normalized shape every surface renders from, regardless of where it came from.
_Avoid_: post, entry, card (a card is the rendering of a content item, not the item).

**Content type**:
The kind of a content item: video, short, repo, article, talk, stream, podcast, or slides.
_Avoid_: category, format, kind.

**Source**:
Where a content item was published, as a display name: "YouTube", "GitHub", "DEV.to", "Medium", "ProstDev Blog". `"Others"` is the catch-all bucket for one-off sources and always sorts last in the filter.
_Avoid_: channel (the portfolio filter is labelled "channel" in the UI, but the concept is the source), platform, provider.

**Catalog**:
The full chronological body of content items, newest first: the hand-maintained list plus the curated link entries, merged and date-sorted. This is what `/portfolio` lists and what the homepage "Latest" samples from.
_Avoid_: feed, list, archive.

**Featured**:
The hand-ordered showcase of best work on the homepage, sequenced by an explicit order rather than by date. Distinct from the catalog: a content item can be featured and also appear in the catalog, but featured is curated and ordered, never chronological.
_Avoid_: highlights, pinned, top picks.

**Facet**:
The set of distinct content types and sources actually present in a group of content items, used to build the portfolio filter bar. A facet reflects only what exists in the catalog, so an empty type shows no filter button.
_Avoid_: filter (a filter is the user action; a facet is the available set), dimension, tag.
