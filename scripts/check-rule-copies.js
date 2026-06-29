#!/usr/bin/env node
// check-rule-copies.js — Verify that agent-specific rule files match AGENTS.md
// and that SKILL.md contains the load-bearing protocol invariants.
//
// Run: node scripts/check-rule-copies.js
// The test suite runs this to catch drift between the canonical ruleset and copies.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8').replace(/\r\n/g, '\n').trim();
}

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n*/, '').trim();
}

const agents = read('AGENTS.md');

// The canonical compact ruleset is AGENTS.md minus the trailing self-referential note.
const canonical = agents.replace(/\n\n\(Yes, this protocol applies[\s\S]*?\)$/, '').trim();

// All of these must have the same body as AGENTS.md (minus host-specific frontmatter).
const copies = [
  ['.cursor/rules/ayanokoji.mdc', stripFrontmatter],
  ['.windsurf/rules/ayanokoji.md', text => text.trim()],
  ['.clinerules/ayanokoji.md', text => text.trim()],
  ['.agents/rules/ayanokoji.md', text => text.trim()],
  ['.github/copilot-instructions.md', text => text.trim()],
  ['.kiro/steering/ayanokoji.md', stripFrontmatter],
];

let failed = false;

for (const [relPath, normalize] of copies) {
  const actual = normalize(read(relPath));
  if (actual !== canonical) {
    console.error(`${relPath} drifted from AGENTS.md`);
    failed = true;
  }
}

// SKILL.md is the full protocol and longer than AGENTS.md.
const INVARIANTS = [
  'calculating strategist',
  'Session Start Protocol',
  'PROGRESS.md',
  'TASK.md',
  'CONTEXT.md',
  'AGENTS.md',
];

const skill = read('skills/ayanokoji/SKILL.md');
const sources = [['skills/ayanokoji/SKILL.md', skill], ['AGENTS.md', agents]];

for (const phrase of INVARIANTS) {
  for (const [label, text] of sources) {
    if (!text.includes(phrase)) {
      console.error(`${label} is missing protocol invariant: "${phrase}"`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('Update the copied rule text, AGENTS.md, or SKILL.md so the shared rules match.');
  process.exit(1);
}

console.log(`Rule copies match AGENTS.md; ${INVARIANTS.length} protocol invariants present in SKILL.md and AGENTS.md.`);
