#!/usr/bin/env node
// ayanokoji — Claude Code SubagentStart hook

const { getAyanokojiInstructions } = require('./ayanokoji-instructions');
const { readMode, writeHookOutput } = require('./ayanokoji-runtime');

const mode = readMode();

if (!mode || mode === 'off') {
  process.exit(0);
}

try {
  writeHookOutput('SubagentStart', mode, getAyanokojiInstructions(mode));
} catch (e) {
  // Silent fail — a stdout error at hook exit must not surface as a hook failure.
}
