#!/usr/bin/env node
// Shared Ayanokoji instruction builder for Claude hooks and Pi extension.

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, normalizeMode, normalizePersistedMode } = require('./ayanokoji-config');

const INDEPENDENT_MODES = new Set(['review', 'audit', 'debt', 'gain', 'help', 'task', 'status', 'gate']);

function getSkillPath(name) {
  return path.join(__dirname, '..', 'skills', name, 'SKILL.md');
}

function stripFrontmatter(body) {
  return String(body || '').replace(/^---[\s\S]*?---\s*/, '');
}

function getFallbackInstructions(mode) {
  return 'AYANOKOJI PROTOCOL ACTIVE — level: ' + mode + '\n\n' +
    'You are a calculating strategist. Not a reactive assistant. Every action is deliberate. Every move is pre-computed.\n\n' +
    '## Persistence\n\n' +
    'ACTIVE EVERY RESPONSE. Still active if unsure. Off only: "stop ayanokoji" / "normal mode".\n\n' +
    'Current level: **' + mode + '**.\n\n' +
    'Before writing any code:\n' +
    '1. Analyze the user\'s message in silence. Extract every inferable fact.\n' +
    '2. Ask only what cannot be deduced — max 9 questions, always include: end state (2-3 sentences), hard constraints, checkable acceptance criterion.\n' +
    '3. Present all questions in one message. Do not start work before receiving answers.\n' +
    '4. Validate: end state specific, at least one hard constraint, criterion verifiable.\n\n' +
    'Generate four scaffold files in order: AGENTS.md, CONTEXT.md, TASK.md, PROGRESS.md.\n\n' +
    'Verification gate (mandatory before any task is marked complete):\n' +
    'Run the exact check from TASK.md Acceptance Criteria. Paste actual output.\n' +
    'If it fails: log in PROGRESS.md Failed Attempts, update TASK.md, retry.\n\n' +
    'Hard rules:\n' +
    '- Every file you touch must be in scope. Out-of-scope is a failure of discipline.\n' +
    '- AGENTS.md hard cap: 60 lines.\n' +
    '- TASK.md always resets — never appended to.\n' +
    '- PROGRESS.md compresses entries older than 5.\n' +
    '- Never read CONTEXT.md unless the current task touches its modules.';
}

function getAyanokojiInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;

  if (INDEPENDENT_MODES.has(configuredMode)) {
    try {
      const skillBody = fs.readFileSync(getSkillPath('ayanokoji-' + configuredMode), 'utf8');
      return 'AYANOKOJI MODE ACTIVE — level: ' + configuredMode + '\n\n' + stripFrontmatter(skillBody);
    } catch (e) {
      return 'AYANOKOJI MODE ACTIVE — level: ' + configuredMode + '. Behavior defined by /ayanokoji-' + configuredMode + ' skill.';
    }
  }

  const effectiveMode = normalizeMode(configuredMode) || DEFAULT_MODE;

  try {
    const skillBody = fs.readFileSync(getSkillPath('ayanokoji'), 'utf8');
    return 'AYANOKOJI MODE ACTIVE — level: ' + effectiveMode + '\n\n' + filterSkillBodyForMode(skillBody, effectiveMode);
  } catch (e) {
    return getFallbackInstructions(effectiveMode);
  }
}

function filterSkillBodyForMode(body, mode) {
  const effective = normalizeMode(mode) || DEFAULT_MODE;
  const lines = [];
  for (const line of stripFrontmatter(body).split(/\r?\n/)) {
    const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
    if (tableLabel) {
      const labelMode = normalizeMode(tableLabel[1]);
      if (labelMode && labelMode !== effective) continue;
    }

    const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
    if (exampleLabel) {
      const labelMode = normalizeMode(exampleLabel[1]);
      if (labelMode && labelMode !== effective) continue;
    }

    lines.push(line);
  }
  return lines.join('\n');
}

module.exports = {
  stripFrontmatter,
  getFallbackInstructions,
  getAyanokojiInstructions,
  filterSkillBodyForMode,
};
