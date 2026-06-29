#!/usr/bin/env node
// bin/setup.js — Initialises the Ayanokoji protocol in any project directory.
// Run: npx @sahnik/ayanokoji

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

// Find the packaged AGENTS.md file relative to this script
const packageRoot = path.join(__dirname, '..');
const sourceAgentsPath = path.join(packageRoot, 'AGENTS.md');

if (!fs.existsSync(sourceAgentsPath)) {
  console.error('Error: AGENTS.md not found in package directory.');
  process.exit(1);
}

const agentsContent = fs.readFileSync(sourceAgentsPath, 'utf8').replace(/\r\n/g, '\n').trim();
// Strip the trailing self-referential note
const canonical = agentsContent.replace(/\n\n\(Yes, this protocol applies[\s\S]*?\)$/, '').trim();

function writeRule(targetPath, content, label) {
  try {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, content + '\n', 'utf8');
    console.log(`✅ Configured ${label}: ${path.relative(cwd, targetPath)}`);
  } catch (e) {
    console.error(`❌ Failed to write ${label}:`, e.message);
  }
}

console.log('♟️  Ayanokoji — Strategic Execution Protocol Setup\n');

// 1. Write the master AGENTS.md rulebook to the project root
writeRule(path.join(cwd, 'AGENTS.md'), agentsContent, 'Master Rulebook (AGENTS.md)');

// 2. Detect IDE directories and write matching rulesets
const hasCursor = fs.existsSync(path.join(cwd, '.cursor')) || fs.existsSync(path.join(cwd, '.cursorrules'));
const hasWindsurf = fs.existsSync(path.join(cwd, '.windsurf'));
const hasGithub = fs.existsSync(path.join(cwd, '.github'));
const hasCline = fs.existsSync(path.join(cwd, '.clinerules')) || fs.existsSync(path.join(cwd, '.clinerules-temp'));

// If no directories are detected, write rulesets for all popular options by default.
const forceAll = !hasCursor && !hasWindsurf && !hasGithub && !hasCline;

if (hasCursor || forceAll) {
  const cursorFrontmatter = '---\ndescription: Ayanokoji — Strategic Execution Protocol. Front-loads intelligence, plans before acting, verifies before completing.\nglobs:\nalwaysApply: true\n---\n\n';
  writeRule(path.join(cwd, '.cursor/rules/ayanokoji.mdc'), cursorFrontmatter + canonical, 'Cursor System Rule');
}

if (hasWindsurf || forceAll) {
  writeRule(path.join(cwd, '.windsurf/rules/ayanokoji.md'), canonical, 'Windsurf Rule');
}

if (hasCline || forceAll) {
  writeRule(path.join(cwd, '.clinerules/ayanokoji.md'), canonical, 'Cline Rule');
  writeRule(path.join(cwd, '.agents/rules/ayanokoji.md'), canonical, 'Generic Agent Rule');
}

if (hasGithub || forceAll) {
  writeRule(path.join(cwd, '.github/copilot-instructions.md'), canonical, 'GitHub Copilot Instructions');
}

// Write Kiro steering rule if Kiro directory is present or forceAll is active
if (fs.existsSync(path.join(cwd, '.kiro')) || forceAll) {
  const kiroFrontmatter = '---\ntitle: Ayanokoji — Strategic Execution Protocol\ninclusion: always\n---\n\n';
  writeRule(path.join(cwd, '.kiro/steering/ayanokoji.md'), kiroFrontmatter + canonical, 'Kiro Steering Rule');
}

console.log('\n♟️  Setup complete. Instruct your agent to read AGENTS.md before writing any code.');
