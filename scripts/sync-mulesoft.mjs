// Find new MuleSoft blog posts by Alex and draft an issue listing them.
//
// The MuleSoft developer blog has no machine-readable feed like ProstDev's
// llms.txt, so this scrapes Alex's WordPress author page
// (https://blogs.mulesoft.com/author/alexandra-martinez/, paginated at
// /page/N/) for post links, finds the ones NOT already in src/data/content.ts,
// and drafts a paste-ready ContentItem for each. It NEVER edits code:
// content.ts is a hand-maintained source of truth, so this only writes an issue
// body to .github/mulesoft-sync-issue.md. The daily GitHub Action
// (sync-mulesoft.yml) creates or updates a single tracking issue from it; you
// add the items via the editing-content skill.
//
// No API key, no build-time fetching at runtime: this only runs in CI and the
// site stays static. Node 22+ (global fetch). Run `node scripts/sync-mulesoft.mjs`
// (writes the issue body) or with `--dry` to print to stdout only.
//
// Authorship: the author page only lists Alex's own posts, and each post page
// carries `article:author` pointing back to the same author URL. We verify that
// tag and skip anything that doesn't match, so a co-author byline on someone
// else's page can never sneak in.
//
// What it derives reliably from each post's HTML <head>: type ("article"),
// title (og:title, minus the " | MuleSoft Blog" suffix), url, date
// (article:published_time), source ("MuleSoft"), description (meta description),
// and an og:image thumbnail. Everything an article needs is present, so unlike
// the video path in sync-prostdev.mjs there is nothing left to confirm by hand
// beyond the usual copy review.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = resolve(__dirname, "../src/data/content.ts");
const ISSUE_PATH = resolve(__dirname, "../.github/mulesoft-sync-issue.md");
const AUTHOR_URL = "https://blogs.mulesoft.com/author/alexandra-martinez/";
// Also used to confirm each post really is Alex's (article:author tag).
const AUTHOR_ID = AUTHOR_URL;
const MAX_PAGES = 5; // author archive is small; a hard cap avoids runaway paging.
const DRY = process.argv.includes("--dry");

// A browser UA: some hosts gate on UA, and it keeps behavior consistent with
// sync-prostdev.mjs.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

/** Decode the handful of HTML entities WordPress puts in og:title. */
function decodeEntities(s) {
  return s
    .replace(/&#8217;|&#x2019;/g, "’") // right single quote (curly apostrophe)
    .replace(/&#8216;|&#x2018;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "-") // en dash -> hyphen (recast; review in PR)
    .replace(/&#8212;/g, ", ") // em dash -> comma (recast; review in PR)
    .replace(/&amp;/g, "&") // decode first; cleanCopy() then spells it "and"
    .replace(/&#0?38;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/** Apply the site's reader-facing copy rules (see CLAUDE.md). */
function cleanCopy(s) {
  return decodeEntities(s)
    .replace(/\s*—\s*/g, ", ") // em dash -> comma (recast; review in PR)
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Escape a string for a double-quoted TS literal. */
function tsString(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Clamp a description to ~200 chars on a word boundary. */
function clampDesc(s) {
  const c = cleanCopy(s);
  if (c.length <= 200) return c;
  return c.slice(0, 200).replace(/\s+\S*$/, "") + "...";
}

/** Pull a <meta> content value by property/name (either attribute works). */
function metaContent(html, key) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  let m = html.match(re);
  if (m) return m[1];
  // content attribute sometimes precedes property/name.
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
    "i",
  );
  m = html.match(re2);
  return m ? m[1] : null;
}

/**
 * Scrape the author archive (all pages) for canonical post URLs. Returns a Set
 * of URLs, each normalized to no trailing slash. WordPress renders each post as
 * a permalink under /dev-guides/, /mule/, /news/, etc.; author/tag/category
 * links are excluded.
 */
async function collectAuthorPostUrls() {
  const urls = new Set();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? AUTHOR_URL : `${AUTHOR_URL}page/${page}/`;
    let html;
    try {
      html = await fetchText(url);
    } catch {
      break; // 404 past the last page ends pagination.
    }
    const before = urls.size;
    for (const m of html.matchAll(
      /https:\/\/blogs\.mulesoft\.com\/(?:dev-guides|mule|news|api|automation|analytics)\/[a-z0-9/-]+/gi,
    )) {
      const clean = m[0].replace(/\/$/, "");
      // Skip section landing pages (no article slug) and author/tag noise.
      if (/\/(author|tag|category)\//.test(clean)) continue;
      if (clean.split("/").length < 5) continue; // needs a post slug segment
      urls.add(clean);
    }
    if (urls.size === before && page > 1) break; // a page added nothing new.
  }
  return urls;
}

/** Resolve a ContentItem from a post's HTML <head>. */
async function resolvePost(url) {
  const html = await fetchText(url);

  // Confirm authorship: the post must point back at Alex's author archive.
  const author = metaContent(html, "article:author");
  if (author && author.replace(/\/$/, "") !== AUTHOR_ID.replace(/\/$/, "")) {
    return { skip: `article:author is "${author}"` };
  }

  let title = metaContent(html, "og:title") || "";
  title = title.replace(/\s*\|\s*MuleSoft Blog\s*$/i, "");
  title = cleanCopy(title);

  // Real posts always carry a published date; category/landing pages (e.g.
  // /dev-guides/how-to-tutorials) do not. Require it to weed those out.
  const published = metaContent(html, "article:published_time");
  if (!published) return { skip: "no article:published_time (not a post)" };
  const date = new Date(published).toISOString();

  const thumbnail = metaContent(html, "og:image");
  const description =
    metaContent(html, "description") || metaContent(html, "og:description") || "";

  if (!title) return { skip: "no og:title" };

  return {
    entry: {
      type: "article",
      title,
      url,
      date,
      source: "MuleSoft",
      description: clampDesc(description),
      ...(thumbnail ? { thumbnail } : {}),
    },
  };
}

/** Serialize a ContentItem to a TS object literal matching the file style. */
function formatEntry(e) {
  const lines = ["  {"];
  lines.push(`    type: ${tsString(e.type)},`);
  lines.push(`    title: ${tsString(e.title)},`);
  lines.push(`    url: ${tsString(e.url)},`);
  if (e.thumbnail) lines.push(`    thumbnail: ${tsString(e.thumbnail)},`);
  lines.push(`    date: ${tsString(e.date)},`);
  lines.push(`    source: ${tsString(e.source)},`);
  if (e.description) lines.push(`    description: ${tsString(e.description)},`);
  lines.push("  },");
  return lines.join("\n");
}

async function main() {
  const content = await readFile(CONTENT_PATH, "utf8");

  // Dedupe against the existing catalog by post slug (last path segment of the
  // blogs.mulesoft.com URL). Matches how the URLs are stored, ignoring any
  // trailing slash.
  const seenSlugs = new Set(
    [...content.matchAll(/blogs\.mulesoft\.com\/[a-z0-9/-]+/gi)].map((m) =>
      m[0].replace(/\/$/, "").split("/").pop().toLowerCase(),
    ),
  );

  const authorUrls = await collectAuthorPostUrls();
  const candidates = [...authorUrls].filter((u) => {
    const slug = u.split("/").pop().toLowerCase();
    return slug && !seenSlugs.has(slug);
  });

  const additions = [];
  const skipped = [];
  for (const url of candidates) {
    try {
      const r = await resolvePost(url);
      if (r.skip) {
        skipped.push({ title: url, reason: r.skip });
        continue;
      }
      additions.push(r);
    } catch (err) {
      skipped.push({ title: url, reason: String(err.message || err) });
    }
  }

  // Newest first, matching how both catalog consumers sort.
  additions.sort((a, b) => (b.entry.date || "").localeCompare(a.entry.date || ""));

  if (additions.length === 0) {
    console.log("No new MuleSoft blog posts. Catalog is up to date.");
    if (skipped.length) console.log(`(skipped ${skipped.length}: see below)`);
    for (const s of skipped) console.log(`  - ${s.title}: ${s.reason}`);
    if (process.env.GITHUB_OUTPUT) {
      await writeFile(process.env.GITHUB_OUTPUT, "added=0\n", { flag: "a" });
    }
    return;
  }

  const bodyLines = [
    `Found **${additions.length}** new MuleSoft blog post(s) by Alex not yet in ` +
      "[`src/data/content.ts`](../blob/main/src/data/content.ts).",
    "",
    "Add each via the `editing-content` skill (`/portfolio` + homepage " +
      '"Latest" render from this file). Copy rules already applied to the ' +
      "drafted text (no em dashes, no ampersands); double-check before saving. " +
      "Verify each thumbnail (`curl -sI`, expect `200` + `image/*`) before trusting it.",
    "",
  ];
  for (const a of additions) {
    const e = a.entry;
    bodyLines.push(`### ${e.type}: ${e.title}`);
    bodyLines.push(`- [ ] Add to \`content.ts\``);
    bodyLines.push(`- Source page: ${e.url}`);
    bodyLines.push("");
    bodyLines.push("```ts");
    bodyLines.push(formatEntry(e).replace(/,$/, "")); // drop trailing comma for a standalone snippet
    bodyLines.push("```");
    bodyLines.push("");
  }
  if (skipped.length) {
    bodyLines.push("---", "", "<details><summary>Skipped items</summary>", "");
    for (const s of skipped) bodyLines.push(`- ${s.title}: ${s.reason}`);
    bodyLines.push("", "</details>");
  }
  bodyLines.push(
    "",
    "---",
    "_Auto-drafted daily by `scripts/sync-mulesoft.mjs`. New runs update this " +
      "same issue; close it once everything is added._",
  );
  const body = bodyLines.join("\n");

  if (DRY) {
    console.log(body);
    return;
  }

  await writeFile(ISSUE_PATH, body + "\n");
  console.log(`Wrote issue body for ${additions.length} item(s) to ${ISSUE_PATH}`);

  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `added=${additions.length}\n`, { flag: "a" });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
