#!/usr/bin/env node
// bin/setup.js — Initialises the Ayanokoji protocol in any project directory.
// Run: npx ayanokoji.md
//
// When invoked as a postinstall script (npm install ayanokoji.md), npm sets
// INIT_CWD to the directory where the user ran npm install.  process.cwd() is
// the unpacked package directory instead, so we use INIT_CWD when available.

const fs = require('fs');
const path = require('path');

// Resolve the actual user project directory.
// postinstall: npm sets INIT_CWD = where the user ran npm install.
// npx / direct run: process.cwd() is already the user's project.
const cwd = process.env.INIT_CWD || process.cwd();

// Safety guard: don't let postinstall stomp on our own development checkout.
const packageRoot = path.join(__dirname, '..');
if (path.resolve(cwd) === path.resolve(packageRoot)) {
  // Running inside the package source tree — nothing to set up.
  process.exit(0);
}

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

// ---------------------------------------------------------------------------
// Explicit target flag resolution
//
// Priority order:
//   1. process.argv flags:      npx ayanokoji.md --claude
//   2. npm_config_* env vars:   npm install ayanokoji.md --claude
//      (npm forwards --flag to lifecycle scripts as npm_config_flag=true)
//   3. AYANOKOJI_FOR env var:   AYANOKOJI_FOR=claude npx ayanokoji.md
//
// Supported flags: --claude  --cursor  --windsurf  --cline
//                  --kiro    --copilot --all
// ---------------------------------------------------------------------------
const VALID_FLAGS = ['claude', 'cursor', 'windsurf', 'cline', 'kiro', 'copilot', 'all'];

function resolveExplicitTargets() {
  const targets = new Set();

  // 1. process.argv  (npx ayanokoji.md --claude --cursor)
  for (const arg of process.argv.slice(2)) {
    const key = arg.replace(/^--/, '').toLowerCase();
    if (VALID_FLAGS.includes(key)) targets.add(key);
  }

  // 2. npm_config_*  (npm sets these when you pass --flag to npm install)
  for (const key of VALID_FLAGS) {
    if (process.env[`npm_config_${key}`] !== undefined) targets.add(key);
  }

  // 3. AYANOKOJI_FOR env var  (space- or comma-separated list)
  const envFor = (process.env.AYANOKOJI_FOR || '').toLowerCase();
  for (const part of envFor.split(/[\s,]+/)) {
    if (VALID_FLAGS.includes(part)) targets.add(part);
  }

  return targets;
}

const explicitTargets = resolveExplicitTargets();
// --all is sugar for "every agent"
const forceAll = explicitTargets.has('all') ||
  (explicitTargets.size === 0 &&
    // auto-detect fallback: no IDE markers found anywhere
    !fs.existsSync(path.join(cwd, '.claude')) &&
    !fs.existsSync(path.join(cwd, 'CLAUDE.md')) &&
    !fs.existsSync(path.join(cwd, '.cursor')) &&
    !fs.existsSync(path.join(cwd, '.cursorrules')) &&
    !fs.existsSync(path.join(cwd, '.windsurf')) &&
    !fs.existsSync(path.join(cwd, '.github')) &&
    !fs.existsSync(path.join(cwd, '.clinerules')) &&
    !fs.existsSync(path.join(cwd, '.clinerules-temp')) &&
    !fs.existsSync(path.join(cwd, '.kiro'))
  );

// Helper: should we configure a given agent?
// Explicit flag always wins. Fall back to auto-detection or forceAll.
function shouldConfigure(flag, ...detectionPaths) {
  if (explicitTargets.size > 0 && !explicitTargets.has('all')) {
    return explicitTargets.has(flag);
  }
  if (forceAll) return true;
  return detectionPaths.some(p => fs.existsSync(p));
}

// ---------------------------------------------------------------------------

console.log('♟️  Ayanokoji — Strategic Execution Protocol Setup\n');

// 1. Write the master AGENTS.md rulebook to the project root (always)
writeRule(path.join(cwd, 'AGENTS.md'), agentsContent, 'Master Rulebook (AGENTS.md)');

// 2. Configure each agent based on explicit flags or auto-detection
const configured = [];
// Collect the root config dir for each activated agent so we can dump
// skills + AGENTS.md directly inside it (e.g. .claude/skills/, .cursor/skills/).
const agentDirs = [];

// --- Claude Code ---
if (shouldConfigure('claude', path.join(cwd, '.claude'), path.join(cwd, 'CLAUDE.md'))) {
  writeRule(path.join(cwd, 'CLAUDE.md'), canonical, 'Claude Code (CLAUDE.md)');
  configured.push('Claude Code');
  agentDirs.push(path.join(cwd, '.claude'));
}

// --- Cursor ---
if (shouldConfigure('cursor', path.join(cwd, '.cursor'), path.join(cwd, '.cursorrules'))) {
  const cursorFrontmatter = '---\ndescription: Ayanokoji — Strategic Execution Protocol. Front-loads intelligence, plans before acting, verifies before completing.\nglobs:\nalwaysApply: true\n---\n\n';
  writeRule(path.join(cwd, '.cursor/rules/ayanokoji.mdc'), cursorFrontmatter + canonical, 'Cursor');
  configured.push('Cursor');
  agentDirs.push(path.join(cwd, '.cursor'));
}

// --- Windsurf ---
if (shouldConfigure('windsurf', path.join(cwd, '.windsurf'))) {
  writeRule(path.join(cwd, '.windsurf/rules/ayanokoji.md'), canonical, 'Windsurf');
  configured.push('Windsurf');
  agentDirs.push(path.join(cwd, '.windsurf'));
}

// --- Cline / generic agent ---
if (shouldConfigure('cline', path.join(cwd, '.clinerules'), path.join(cwd, '.clinerules-temp'))) {
  writeRule(path.join(cwd, '.clinerules/ayanokoji.md'), canonical, 'Cline');
  writeRule(path.join(cwd, '.agents/rules/ayanokoji.md'), canonical, 'Generic Agent');
  configured.push('Cline');
  agentDirs.push(path.join(cwd, '.clinerules'));
}

// --- GitHub Copilot ---
if (shouldConfigure('copilot', path.join(cwd, '.github'))) {
  writeRule(path.join(cwd, '.github/copilot-instructions.md'), canonical, 'GitHub Copilot');
  configured.push('GitHub Copilot');
  agentDirs.push(path.join(cwd, '.github'));
}

// --- Kiro ---
if (shouldConfigure('kiro', path.join(cwd, '.kiro'))) {
  const kiroFrontmatter = '---\ntitle: Ayanokoji — Strategic Execution Protocol\ninclusion: always\n---\n\n';
  writeRule(path.join(cwd, '.kiro/steering/ayanokoji.md'), kiroFrontmatter + canonical, 'Kiro');
  configured.push('Kiro');
  agentDirs.push(path.join(cwd, '.kiro'));
}

// 3. Install skills.
//    a) Always copy to .openclaw/skills/ (universal — picked up by OpenClaw / Antigravity).
//    b) Also copy into each activated agent's config directory so it is self-contained:
//         .claude/skills/   .cursor/skills/   .windsurf/skills/   etc.
//    c) Also write AGENTS.md into each agent directory for easy access.
const sourceSkillsDir = path.join(packageRoot, '.openclaw', 'skills');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Installed skill: ${path.relative(cwd, destPath)}`);
    }
  }
}

if (fs.existsSync(sourceSkillsDir)) {
  // a) Universal .openclaw/skills/ copy
  copyDir(sourceSkillsDir, path.join(cwd, '.openclaw', 'skills'));

  // b+c) Per-agent copy: skills + AGENTS.md inside the agent's config dir
  for (const agentDir of agentDirs) {
    // skills/
    copyDir(sourceSkillsDir, path.join(agentDir, 'skills'));
    // AGENTS.md
    try {
      fs.mkdirSync(agentDir, { recursive: true });
      fs.copyFileSync(sourceAgentsPath, path.join(agentDir, 'AGENTS.md'));
      console.log(`✅ Installed AGENTS.md: ${path.relative(cwd, path.join(agentDir, 'AGENTS.md'))}`);
    } catch (e) {
      console.error(`❌ Failed to copy AGENTS.md into ${path.relative(cwd, agentDir)}:`, e.message);
    }
  }
} else {
  console.warn('⚠️  Skills source directory not found in package — skipping skill install.');
}


// 4. Self-cleanup when installed via `npm install ayanokoji.md`.
//    The package has no runtime value sitting in node_modules after setup runs.
//    Remove it from dependencies/devDependencies so the project stays clean.
if (process.env.npm_lifecycle_event === 'postinstall' && process.env.INIT_CWD) {
  const pkgJsonPath = path.join(cwd, 'package.json');
  try {
    const raw  = fs.readFileSync(pkgJsonPath, 'utf8');
    const pkg  = JSON.parse(raw);
    let changed = false;
    for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      if (pkg[section] && pkg[section]['ayanokoji.md']) {
        delete pkg[section]['ayanokoji.md'];
        // Remove the section entirely if it is now empty.
        if (Object.keys(pkg[section]).length === 0) delete pkg[section];
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      console.log('🗑️  Removed ayanokoji.md from package.json (one-shot setup tool, not a runtime dep).');
    }
  } catch (_) {
    // No package.json or read error — silently skip, not a fatal condition.
  }
}

// 5. Summary
console.log('\n♟️  Setup complete.');
if (configured.length > 0) {
  console.log(`   Configured for: ${configured.join(', ')}`);
} else {
  console.log('   AGENTS.md written. No agent-specific files were needed.');
}
console.log('   Instruct your agent to read AGENTS.md before writing any code.');
