# alexmartinez.ca

Personal portfolio for Alex Martinez. Fast, content-first, hand-maintained.

**Live at [www.alexmartinez.ca](https://www.alexmartinez.ca).** Every push to `main`
builds and deploys automatically (see [Deploy](#deploy)).

- **Primary brand (content / devrel):** Alex Martinez. Homepage, `/portfolio`.
- **Bookkeeping (client audience):** `/bookkeeping`, a calmer trust-first zone branded
  "Alex Amkins" with a name bridge back to Alex Martinez.
- **Startup (CleaningPal):** a single footnote, never a section.

Built with **Astro 7** (static, zero-JS by default) + **Tailwind v4**, deployed to
**GitHub Pages**. All content (videos, repos, articles, talks) is a hand-maintained
list in `src/data/content.ts`. The `/portfolio` page has a search box over the whole catalog.

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Build to `./dist/`                      |
| `npm run preview` | Preview the production build            |
| `npx astro check` | Typecheck                               |

Versions are pinned on purpose (astro 7.0.0, tailwind 4.3.1); do not upgrade to
"fix" install errors. See the Gotchas in `CLAUDE.md`.

## Where to edit things

**Content** lives in **`src/data/content.ts`**: one array of items (videos, repos,
articles, talks), each with `type`, `title`, `url`, `date` (ISO), `source`, and optional
`description` / `meta`. Add, edit, or remove items by hand. This is what `/portfolio` and the
homepage "Latest" render from. Keep displayed text within the copy rules (no em dashes,
no ampersands).

Identity and links live in **`src/config.ts`**:

- **Socials** (`socials`): links shown in nav/footer.
- **Bookkeeping** (`bookkeeping`): certs, Fiverr URL, ProAdvisor URL, contact email.
- **Startup** (`startup`) and **identity** (`site`).

Curated content collections (markdown, no code needed):

- **`src/content/featured/`** — hand-picked "best work" cards, pinned on the homepage.
  `order:` controls position.
- **`src/content/links/`** — extra link entries merged into `/portfolio` (e.g. MuleSoft Blog /
  Salesforce Developers posts).

## Publishing a change

To publish something new, edit the relevant file and push to `main`; GitHub Actions
rebuilds and redeploys. There are no build-time network calls, so the site only
changes when the source does.

- **New video, article, repo, or talk** → add an item to `src/data/content.ts`.
- **New pinned "best work" card** → add a markdown file to `src/content/featured/`.
- **New external link entry** → add a markdown file to `src/content/links/`.
- **Renamed or removed a route** → add a 301 to `public/_redirects` (see Gotchas in `CLAUDE.md`).

## How content works

`src/data/content.ts` exports a single `content` array (the full catalog) and
`getAllContent()`, which returns it sorted newest-first. `/portfolio` and the homepage import
that; `/portfolio` adds a client-side search box plus type filters over the rendered cards.

## Deploy

Hosted on **GitHub Pages** from `alexandramartinez/alexandramartinez.github.io`.

- **`.github/workflows/deploy.yml`** builds with `withastro/action` and publishes `./dist`
  on every push to `main` (and on manual dispatch from the Actions tab).
- The custom domain `www.alexmartinez.ca` is set via **`public/CNAME`**; `astro.config.mjs`
  pins `site` to the same URL so canonical links and the sitemap are correct.
- Old paths are preserved with 301s in **`public/_redirects`**.

## Still open

Nice-to-haves, not blockers (the site is live without them):

1. **OG image**: drop a `public/og-default.png` (1200x630) for richer link previews.
2. **Legacy GitBook redirects**: map the real old GitBook paths in `public/_redirects`
   (currently only `/work` and `/about` are mapped; the GitBook slugs are still a TODO).
3. **Replace the example link entries** in `src/content/links/` (`_example-*.md`) with real
   MuleSoft / Salesforce Developers posts, or delete them.
4. **Bookkeeping ProAdvisor link**: set `bookkeeping.proAdvisor` in `src/config.ts` to show it.
