// Find new ProstDev content and draft an issue listing it.
//
// Reads https://prostdev.com/llms.txt (the machine-readable site map), finds
// blog posts and videos that are NOT already in src/data/content.ts, and drafts
// a paste-ready ContentItem for each. It NEVER edits code: content.ts is a
// hand-maintained source of truth, so this only writes an issue body to
// .github/sync-issue.md. The daily GitHub Action (sync-prostdev.yml) creates or
// updates a single tracking issue from it; you add the items via the
// editing-content skill.
//
// No API key, no build-time fetching at runtime: this only runs in CI and the
// site stays static. Node 22+ (global fetch). Run `node scripts/sync-prostdev.mjs`
// (writes the issue body) or with `--dry` to print to stdout only.
//
// Authorship rule (per the request): include everything published by Alex. A
// post is INCLUDED unless it carries an explicit `Author:` that is someone
// else. Videos have no author field in their .md, so they are always Alex's.
//
// What it derives reliably: type, title, url, date, source, description, and
// (for articles) an og:image thumbnail. What it CANNOT decide automatically is
// called out per-item for you to confirm: whether a video is really a `short`
// or `stream` (see the editing-content skill). Every new video is drafted as
// `type: "video"`.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = resolve(__dirname, "../src/data/content.ts");
const ISSUE_PATH = resolve(__dirname, "../.github/sync-issue.md");
const LLMS_URL = "https://prostdev.com/llms.txt";
const DRY = process.argv.includes("--dry");

// A browser UA: the YouTube watch page (for upload dates) returns JS-only HTML
// to non-browser agents, and some hosts gate on UA.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

/** Apply the site's reader-facing copy rules (see CLAUDE.md). */
function cleanCopy(s) {
  return s
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

/**
 * Parse llms.txt into a flat list of { kind, title, url, description }.
 * `kind` is "video" (anything under "## Video series") or "post" (under
 * "## Blog posts"). Other H2 sections (skills, topics, full content) are
 * skipped.
 */
function parseLlms(txt) {
  const items = [];
  let section = null; // "video" | "post" | null
  for (const line of txt.split("\n")) {
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) {
      const name = h2[1].trim().toLowerCase();
      if (name === "video series") section = "video";
      else if (name === "blog posts") section = "post";
      else section = null;
      continue;
    }
    if (!section) continue;
    // - [Title](url): description
    const m = line.match(/^-\s+\[(.+?)\]\((https?:\/\/[^)]+)\):\s*(.*)$/);
    if (!m) continue;
    items.push({
      kind: section,
      title: m[1].trim(),
      url: m[2].trim(),
      description: m[3].trim(),
    });
  }
  return items;
}

/** "Jul 9, 2026" / "May 28, 2026" -> ISO at UTC midnight. */
function parsePublished(s) {
  const m = s.match(/([A-Za-z]{3,})\s+(\d{1,2}),\s+(\d{4})/);
  if (!m) return null;
  const mon = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (!mon) return null;
  const day = String(m[2]).padStart(2, "0");
  return `${m[3]}-${String(mon).padStart(2, "0")}-${day}T00:00:00.000Z`;
}

/** Pull a labelled field out of a .md variant: `- **Label:** value`. */
function mdField(md, label) {
  const re = new RegExp(`^-\\s+\\*\\*${label}:\\*\\*\\s*(.+)$`, "im");
  const m = md.match(re);
  return m ? m[1].trim() : null;
}

/** Resolve details for a blog post from its .md variant. */
async function resolvePost(item) {
  const md = await fetchText(item.url.replace(/\/$/, "") + ".md");
  const author = mdField(md, "Author");
  // Include unless an explicit non-Alex author is present.
  if (author && !/alex\s+martinez/i.test(author)) {
    return { skip: `author is "${author}"` };
  }
  const published = mdField(md, "Published");
  const date = published ? parsePublished(published) : null;

  // og:image lives in the HTML page, not the .md (articles need an explicit
  // thumbnail per the editing-content skill).
  let thumbnail = null;
  try {
    const html = await fetchText(item.url);
    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (og) thumbnail = og[1];
  } catch {
    /* thumbnail is optional; leave it for the reviewer */
  }

  return {
    entry: {
      type: "article",
      title: cleanCopy(item.title),
      url: item.url,
      date: date || "",
      source: "ProstDev",
      description: clampDesc(item.description),
      ...(thumbnail ? { thumbnail } : {}),
    },
  };
}

/** Resolve details for a video from its .md variant + YouTube watch page. */
async function resolveVideo(item) {
  const md = await fetchText(item.url.replace(/\/$/, "") + ".md");
  const watch = mdField(md, "Watch"); // canonical YouTube URL
  if (!watch) return { skip: "no Watch URL in .md" };

  // Videos have no author field: they are Alex's by the stated rule.
  let date = "";
  try {
    const page = await fetchText(watch);
    const up = page.match(/"uploadDate":"([^"]+)"/);
    if (up) date = new Date(up[1]).toISOString();
  } catch {
    /* leave date empty; sorts last, reviewer can fill it */
  }

  return {
    entry: {
      type: "video",
      title: cleanCopy(item.title),
      url: watch,
      date,
      source: "ProstDev",
    },
    // Videos self-derive their YouTube thumbnail; no thumbnail field needed.
    note: "confirm type (video/short/stream) per the editing-content skill",
  };
}

/** Serialize a ContentItem to a TS object literal matching the file style. */
function formatEntry(e) {
  const lines = ["  {"];
  lines.push(`    type: ${tsString(e.type)},`);
  lines.push(`    title: ${tsString(e.title)},`);
  lines.push(`    url: ${tsString(e.url)},`);
  lines.push(`    date: ${tsString(e.date)},`);
  lines.push(`    source: ${tsString(e.source)},`);
  if (e.description) lines.push(`    description: ${tsString(e.description)},`);
  if (e.thumbnail) lines.push(`    thumbnail: ${tsString(e.thumbnail)},`);
  lines.push("  },");
  return lines.join("\n");
}

async function main() {
  const [llms, content] = await Promise.all([
    fetchText(LLMS_URL),
    readFile(CONTENT_PATH, "utf8"),
  ]);

  const parsed = parseLlms(llms);

  // Dedupe against the existing catalog. Posts are keyed by their /post/<slug>;
  // videos are stored by their YouTube URL, so key by the 11-char video id.
  const seenPostSlugs = new Set(
    [...content.matchAll(/prostdev\.com\/post\/([a-z0-9-]+)/gi)].map((m) => m[1].toLowerCase()),
  );
  const seenVideoIds = new Set(
    [...content.matchAll(/(?:watch\?v=|youtu\.be\/|\/shorts\/)([\w-]{11})/g)].map((m) => m[1]),
  );

  const candidates = [];
  for (const it of parsed) {
    if (it.kind === "post") {
      const slug = it.url.match(/\/post\/([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      if (slug && !seenPostSlugs.has(slug)) candidates.push(it);
    } else {
      // Can't know the video id from llms.txt (it links the /video page). We
      // resolve the Watch URL below, then dedupe. Keep all for now.
      candidates.push(it);
    }
  }

  const additions = [];
  const skipped = [];
  for (const it of candidates) {
    try {
      const r = it.kind === "post" ? await resolvePost(it) : await resolveVideo(it);
      if (r.skip) {
        skipped.push({ title: it.title, reason: r.skip });
        continue;
      }
      // Video dedupe now that we have the resolved YouTube URL.
      if (it.kind === "video") {
        const vid = r.entry.url.match(/(?:watch\?v=|youtu\.be\/|\/shorts\/)([\w-]{11})/)?.[1];
        if (vid && seenVideoIds.has(vid)) continue;
        if (vid) seenVideoIds.add(vid);
      }
      additions.push(r);
    } catch (err) {
      skipped.push({ title: it.title, reason: String(err.message || err) });
    }
  }

  if (additions.length === 0) {
    console.log("No new ProstDev content. Catalog is up to date.");
    if (skipped.length) console.log(`(skipped ${skipped.length}: see below)`);
    for (const s of skipped) console.log(`  - ${s.title}: ${s.reason}`);
    // Signal "nothing to do" to the workflow (the issue step is gated on this).
    if (process.env.GITHUB_OUTPUT) {
      await writeFile(process.env.GITHUB_OUTPUT, "added=0\n", { flag: "a" });
    }
    return;
  }

  // Build the issue body: one checklist entry per item, each with a paste-ready
  // ContentItem snippet to drop into src/data/content.ts via the
  // editing-content skill.
  const bodyLines = [
    `Found **${additions.length}** new ProstDev item(s) not yet in ` +
      "[`src/data/content.ts`](../blob/main/src/data/content.ts).",
    "",
    "Add each via the `editing-content` skill (`/portfolio` + homepage " +
      '"Latest" render from this file). Copy rules already applied to the ' +
      "drafted text (no em dashes, no ampersands); double-check before saving.",
    "",
  ];
  for (const a of additions) {
    const e = a.entry;
    bodyLines.push(`### ${e.type}: ${e.title}`);
    bodyLines.push(`- [ ] Add to \`content.ts\``);
    bodyLines.push(`- Source page: ${e.url}`);
    if (a.note) bodyLines.push(`- ⚠️ ${a.note}`);
    bodyLines.push("");
    bodyLines.push("```ts");
    bodyLines.push(formatEntry(e).replace(/,$/, "")); // drop the trailing comma for a standalone snippet
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
    "_Auto-drafted daily by `scripts/sync-prostdev.mjs`. New runs update this " +
      "same issue; close it once everything is added._",
  );
  const body = bodyLines.join("\n");

  if (DRY) {
    console.log(body);
    return;
  }

  // The workflow reads this file for the issue body. Never edits content.ts.
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
