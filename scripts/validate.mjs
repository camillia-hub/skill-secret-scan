#!/usr/bin/env node
// Marketplace validation: the skill follows the anti-collision placement
// contract. extension.json declares the extension id; every payload file lives
// under extensions/<id>/; extensions/<id>/SKILL.md carries frontmatter with
// name and description and at least 2 KB of real content.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIN_BYTES = 2048;
const KEBAB_ID = /^[a-z0-9](-?[a-z0-9]){2,39}$/;

function fail(message) {
  console.error(`validate: FAIL - ${message}`);
  process.exit(1);
}

function isSafeRelativePath(p) {
  if (!p || p.length > 400) return false;
  if (p.startsWith("/") || p.includes("\\") || p.includes(":")) return false;
  return p.split("/").every((s) => s.length > 0 && s !== "." && s !== "..");
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, base));
    else out.push(relative(base, full).split(sep).join("/"));
  }
  return out.sort();
}

let hub;
try {
  hub = JSON.parse(readFileSync(join(repoRoot, "extension.json"), "utf8"));
} catch {
  fail("extension.json is missing or not valid JSON");
}
const id = hub.id;
if (typeof id !== "string" || !KEBAB_ID.test(id)) {
  fail("extension.json must declare a unique kebab-case extension 'id'");
}
if (hub.kind !== "skill") {
  fail(`extension.json kind must be 'skill' (found '${hub.kind}')`);
}
if (hub.contentDir !== `extensions/${id}`) {
  fail(`extension.json contentDir must be 'extensions/${id}' (found '${hub.contentDir}')`);
}

const payloadRoot = `extensions/${id}`;
let payload;
try {
  payload = walk(join(repoRoot, "extensions"), repoRoot);
} catch {
  fail(`payload directory ${payloadRoot}/ does not exist`);
}
if (payload.length === 0) {
  fail(`no payload files under ${payloadRoot}/`);
}

for (const rel of payload) {
  if (!isSafeRelativePath(rel)) fail(`unsafe payload path '${rel}'`);
  if (rel === ".workspace" || rel.startsWith(".workspace/")) {
    fail(`'${rel}' must not carry the .workspace/ prefix`);
  }
  const segments = rel.split("/");
  if (segments[0] !== "extensions" || segments.length < 3 || segments[1] !== id) {
    fail(`'${rel}' is outside the skill's own directory ${payloadRoot}/`);
  }
  for (const segment of segments) {
    if (segment.startsWith("cam-ext-")) {
      fail(`'${rel}' misuses the reserved cam-ext- prefix`);
    }
  }
}

const skillPath = join(repoRoot, "extensions", id, "SKILL.md");
let stats;
try {
  stats = statSync(skillPath);
} catch {
  fail(`${payloadRoot}/SKILL.md does not exist`);
}

if (stats.size < MIN_BYTES) {
  fail(`${payloadRoot}/SKILL.md is ${stats.size} bytes; expected at least ${MIN_BYTES} bytes of real content`);
}

const text = readFileSync(skillPath, "utf8");

if (!text.startsWith("---")) {
  fail(`${payloadRoot}/SKILL.md must start with a '---' frontmatter block`);
}

const closingIndex = text.indexOf("\n---", 3);
if (closingIndex === -1) {
  fail("frontmatter block is not closed by a second '---' line");
}

const frontmatter = text.slice(3, closingIndex);

if (!/^name:\s*\S+/m.test(frontmatter)) {
  fail("frontmatter must contain a 'name:' field");
}

if (!/^description:\s*\S+/m.test(frontmatter)) {
  fail("frontmatter must contain a 'description:' field");
}

console.log(`validate: OK - ${payloadRoot}/SKILL.md (${stats.size} bytes) has frontmatter with name and description; ${payload.length} payload file(s) under ${payloadRoot}/`);
