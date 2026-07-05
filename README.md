# alexmartinez.ca

Personal portfolio for Alex Martinez. Fast, content-first, self-updating.

- **Primary brand (content / devrel):** Alex Martinez. Homepage, `/portfolio`.
- **Bookkeeping (client audience):** `/bookkeeping`, a calmer trust-first zone branded
  "Alex Amkins" with a name bridge back to Alex Martinez.
- **Startup (CleaningPal):** a single footnote, never a section.

Built with **Astro 7** (static, zero-JS by default) + **Tailwind v4**. Hosts on
**Cloudflare Pages**. All content (videos, repos, articles, talks) is a hand-maintained
list in `src/data/content.ts`. The `/portfolio` page has a search box over the whole catalog.

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Build to `./dist/`                      |
| `npm run preview` | Preview the production build            |
| `npx astro check` | Typecheck                               |

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
  Salesforce Developers posts). Delete the two `_example-*.md` files once you add real ones.

## TODO before going live

Still open (`src/config.ts` unless noted):

1. **Bookkeeping**: add `bookkeeping.contactEmail` if you want a "Book a call" mailto (Fiverr
   is the CTA for now), and `bookkeeping.proAdvisor` if you want the ProAdvisor link shown.
2. **Replace the example link entries** in `src/content/links/` with real MuleSoft /
   Salesforce Developers posts (or delete the `_example-*.md` files).
3. **Old GitBook redirects**: fill in `public/_redirects` with the real legacy paths.
4. **OG image**: drop a `public/og-default.png` (1200x630) for nice link previews.
5. **Confirm socials/LinkedIn URL** in `src/config.ts`.

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub. Connect it in Cloudflare Pages.
2. Build command `npm run build`, output directory `dist`.
3. Point the custom domain `www.alexmartinez.ca` at the Pages project.

## How content works

`src/data/content.ts` exports a single `content` array (the full catalog) and
`getAllContent()`, which returns it sorted newest-first. `/portfolio` and the homepage import
that; `/portfolio` adds a client-side search box plus type filters over the rendered cards. To
publish something new, add an item to the array and redeploy. There are no build-time
network calls.
