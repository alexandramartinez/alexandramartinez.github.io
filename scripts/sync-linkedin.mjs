// Find new LinkedIn newsletter editions and draft a ContentItem for each.
//
// Alex's "AI Picked, Alex Approved" newsletter is authored in a PRIVATE GitHub
// repo (alexandramartinez/claude-linkedin-newsletter): one markdown file per
// edition under "linkedin newsletter/" (numbered 001-NNN) and a matching cover
// image per edition under "brand/covers/". This script lists those editions via
// the `gh` CLI (which uses your existing GitHub auth, so it works locally with
// no token to manage), finds the ones NOT already in src/data/content.ts, and
// drafts a paste-ready ContentItem for each. It NEVER edits code: content.ts is
// a hand-maintained source of truth, so this only prints to stdout.
//
// UNLIKE the ProstDev/MuleSoft syncs, the source is a repo, not a public web
// page, and it does NOT store the two things a catalog entry needs most: the
// published LinkedIn article URL (a pulse slug ending in a random suffix, e.g.
// "-hb0lc", that cannot be derived) and the publish date. So this script can
// DETECT a new edition and stage its cover, but you must supply the URL + date
// by hand (from LinkedIn). The sync-linkedin skill walks that last step.
//
// No API key beyond your `gh` login, nothing fetched at build time: the site
// stays static. Node 22+ (global fetch not needed; `gh` does the network).
// Run `node scripts/sync-linkedin.mjs` (or the same with `--dry`, which behaves
// identically here since the script only ever prints).

import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = resolve(__dirname, "../src/data/content.ts");
const REPO = "alexandramartinez/claude-linkedin-newsletter";
const NEWSLETTER_DIR = "linkedin newsletter"; // note the space
const COVERS_DIR = "brand/covers";
const SOURCE = "LinkedIn";

/** Call the GitHub API through the `gh` CLI (uses the user's existing auth). */
function ghApi(path) {
  // encodeURI keeps the "/" separators but escapes the space in the dir name.
  const out = execFileSync("gh", ["api", encodeURI(`repos/${REPO}/contents/${path}`)], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(out);
}

/** Decode the handful of HTML entities that show up in titles. */
function decodeEntities(s) {
  return s
    .replace(/&#8217;|&#x2019;/g, "’")
    .replace(/&#8216;|&#x2018;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, ", ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

/** Apply the site's reader-facing copy rules (see CLAUDE.md). */
function cleanCopy(s) {
  return decodeEntities(s)
    .replace(/\s*—\s*/g, ", ") // em dash -> comma (recast; review it)
    .replace(/\s*&\s*/g, " and ") // ampersand -> "and"
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize a title to a comparison key: emoji, punctuation, spacing, and
 * "&" vs "and" all collapse away, so a filename title and its (copy-cleaned)
 * catalog title match even though their surface text differs.
 */
function normKey(s) {
  return decodeEntities(s)
    .replace(/&/g, "and")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/** Escape a string for a double-quoted TS literal. */
function tsString(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Parse "NNN-Title.md" -> { num, title }. Tolerates a missing .md suffix. */
function parseEditionName(name) {
  const m = name.match(/^(\d{3})-(.*?)(?:\.md)?$/);
  if (!m) return null;
  return { num: m[1], title: cleanCopy(m[2]) };
}

/**
 * Has this edition already been added? Compared by normalized title. The
 * ".md" file extension is ambiguous here: editions 010+ carry it as a real
 * extension (stripped above), but a title can legitimately END in ".md" (006 is
 * "...Crush & AGENTS.md"), in which case the catalog stores the trailing "md"
 * and the filename-parsed title dropped it. So treat a trailing "md" as
 * optional on both sides.
 */
function isSeen(seen, title) {
  const k = normKey(title);
  return (
    seen.has(k) ||
    seen.has(k + "md") ||
    (k.endsWith("md") && seen.has(k.slice(0, -2)))
  );
}

/** Serialize a drafted ContentItem to a TS object literal (file style). */
function formatEntry(e) {
  const lines = ["  {"];
  lines.push(`    type: "article",`);
  lines.push(`    title: ${tsString(e.title)},`);
  lines.push(`    url: "TODO", // paste the LinkedIn pulse URL`);
  if (e.thumbnail) lines.push(`    thumbnail: ${tsString(e.thumbnail)},`);
  lines.push(`    date: "TODO", // ISO date, e.g. "2026-08-19T00:00:00.000Z"`);
  lines.push(`    source: ${tsString(SOURCE)},`);
  lines.push(`    description: "TODO", // write from the edition body (see repo file)`);
  lines.push("  },");
  return lines.join("\n");
}

async function main() {
  const content = await readFile(CONTENT_PATH, "utf8");

  // Existing catalog titles, normalized. Dedup by title because the repo does
  // not store the LinkedIn URL, so there is no stable id to match on.
  const seen = new Set(
    [...content.matchAll(/title:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) =>
      normKey(m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\")),
    ),
  );

  let editions, covers;
  try {
    editions = ghApi(NEWSLETTER_DIR);
    covers = ghApi(COVERS_DIR);
  } catch (err) {
    console.error(
      "Could not read the newsletter repo via `gh`. Make sure `gh auth status` " +
        "is logged in as an account with access to " +
        `${REPO} (it is private).\n\n${err.message || err}`,
    );
    process.exit(1);
  }

  // Map edition number -> cover file name (covers are named NNN-slug.ext).
  const coverByNum = new Map();
  for (const c of covers) {
    const m = (c.name || "").match(/^(\d{3})-/);
    if (m) coverByNum.set(m[1], c.name);
  }

  const additions = [];
  for (const f of editions) {
    const parsed = parseEditionName(f.name || "");
    if (!parsed) continue; // STRATEGY.md, _TEMPLATE.md, etc.
    if (isSeen(seen, parsed.title)) continue;
    const cover = coverByNum.get(parsed.num) || null;
    additions.push({
      num: parsed.num,
      title: parsed.title,
      cover,
      thumbnail: cover ? `/linkedin/${cover.replace(/\.[^.]+$/, ".jpg")}` : undefined,
    });
  }

  // Newest edition first (higher number = newer).
  additions.sort((a, b) => b.num.localeCompare(a.num));

  if (additions.length === 0) {
    console.log("No new LinkedIn newsletter editions. Catalog is up to date.");
    return;
  }

  console.log(
    `Found ${additions.length} new LinkedIn edition(s) not yet in content.ts.\n` +
      "Finish each per the sync-linkedin skill: supply the pulse URL + date, " +
      "write the description from the edition body, and stage the cover.\n",
  );
  for (const a of additions) {
    console.log(`### ${a.num}: ${a.title}`);
    console.log(`- Edition file: ${REPO} :: ${NEWSLETTER_DIR}/${a.num}-...`);
    if (a.cover) {
      console.log(`- Cover: ${COVERS_DIR}/${a.cover}  ->  public${a.thumbnail}`);
      console.log(
        `  Stage it: gh api -H "Accept: application/vnd.github.raw" ` +
          `${encodeURI(`repos/${REPO}/contents/${COVERS_DIR}/${a.cover}`)} > /tmp/${a.cover} && ` +
          `sips -s format jpeg -Z 800 /tmp/${a.cover} --out public${a.thumbnail}`,
      );
    } else {
      console.log("- Cover: none in repo (leave coverless, per editing-content)");
    }
    console.log("\n```ts");
    console.log(formatEntry(a).replace(/,$/, ""));
    console.log("```\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
