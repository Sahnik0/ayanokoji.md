#!/usr/bin/env node
// Generate the OpenClaw / ClawHub skill package (.openclaw/skills/) from the
// canonical skills/. OpenClaw skills are SKILL.md (frontmatter + body), the same
// format ayanokoji already uses, with one difference: `description` must be a
// single line under 160 chars. The canonical descriptions are long (tuned for
// Claude's skill picker), so each ships a short one here. The body is copied
// verbatim from skills/<name>/SKILL.md so the ruleset never drifts; only the
// frontmatter is rewritten.
//
// Run:  node scripts/build-openclaw-skills.js
// tests/openclaw-skills.test.js fails if the committed copies are stale.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOMEPAGE = 'https://github.com/Sahnik0/ayanokoji.md';

const DESCRIPTIONS = {
  'ayanokoji': 'Strategic execution protocol. Front-loads intelligence, plans before acting, enforces verification before completing.',
  'ayanokoji-review': 'Inspect the current TASK.md for strategic completeness before execution begins. One-shot report.',
  'ayanokoji-audit': 'Audit all four scaffold files for protocol drift, structural violations, and staleness. One-shot health report.',
  'ayanokoji-debt': 'Surface all deferred decisions and unresolved blockers across the scaffold files. Prioritized debt ledger.',
  'ayanokoji-gain': 'Strategic progress summary: completed tasks, retry rate, verification quality, protocol adherence.',
  'ayanokoji-help': 'Quick reference for the Ayanokoji protocol: phases, commands, scaffold rules, behavioral contract.',
  'ayanokoji-task': 'Initialize a clean TASK.md template for a new task from the description in arguments. One-shot report.',
  'ayanokoji-status': 'Show a consolidated strategic dashboard of current task, blockers, failures, and progress. One-shot display.',
  'ayanokoji-gate': 'Run the verification gate checks for the current task and update scaffold files. One-shot report.',
};

const NAMES = Object.keys(DESCRIPTIONS);

function sourceBody(name) {
  const src = fs.readFileSync(path.join(ROOT, 'skills', name, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
  const fm = src.match(/^---\n[\s\S]*?\n---\n?/);
  if (!fm) throw new Error(`skills/${name}/SKILL.md has no frontmatter`);
  return src.slice(fm[0].length);
}

function render(name) {
  const desc = DESCRIPTIONS[name];
  if (desc.length > 160 || desc.includes('\n') || desc.includes('"')) {
    throw new Error(`description for ${name} must be one line, no quotes, under 160 chars`);
  }
  const frontmatter =
    `---\nname: ${name}\ndescription: "${desc}"\nhomepage: ${HOMEPAGE}\nlicense: MIT\n---\n`;
  return frontmatter + sourceBody(name);
}

function outPath(name) {
  return path.join(ROOT, '.openclaw', 'skills', name, 'SKILL.md');
}

module.exports = { DESCRIPTIONS, NAMES, render, outPath, sourceBody };

if (require.main === module) {
  for (const name of NAMES) {
    const p = outPath(name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, render(name));
    console.log('wrote', path.relative(ROOT, p).replace(/\\/g, '/'));
  }
}
