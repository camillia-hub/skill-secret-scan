#!/usr/bin/env node
// Marketplace validation: skill/SKILL.md must exist, carry frontmatter with
// name and description, and contain at least 2 KB of real content.
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillFile = join(repoRoot, "skill", "SKILL.md");
const MIN_BYTES = 2048;

function fail(message) {
  console.error(`validate: FAIL - ${message}`);
  process.exit(1);
}

let stats;
try {
  stats = statSync(skillFile);
} catch {
  fail("skill/SKILL.md does not exist");
}

if (stats.size < MIN_BYTES) {
  fail(`skill/SKILL.md is ${stats.size} bytes; expected at least ${MIN_BYTES} bytes of real content`);
}

const text = readFileSync(skillFile, "utf8");

if (!text.startsWith("---")) {
  fail("skill/SKILL.md must start with a '---' frontmatter block");
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

console.log(`validate: OK - skill/SKILL.md (${stats.size} bytes) has frontmatter with name and description`);
