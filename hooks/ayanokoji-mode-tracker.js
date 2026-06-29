#!/usr/bin/env node
// ayanokoji — UserPromptSubmit hook to track which mode is active
// Inspects user input for /ayanokoji commands and writes mode to flag file

const { getDefaultMode, isDeactivationCommand } = require('./ayanokoji-config');
const { clearMode, setMode, writeHookOutput } = require('./ayanokoji-runtime');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input.replace(/^\uFEFF/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    if (/^[/@$]ayanokoji/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/ayanokoji-review' || cmd === '/ayanokoji:ayanokoji-review') {
        mode = 'review';
      } else if (cmd === '/ayanokoji-audit' || cmd === '/ayanokoji:ayanokoji-audit') {
        mode = 'audit';
      } else if (cmd === '/ayanokoji-debt' || cmd === '/ayanokoji:ayanokoji-debt') {
        mode = 'debt';
      } else if (cmd === '/ayanokoji-gain' || cmd === '/ayanokoji:ayanokoji-gain') {
        mode = 'gain';
      } else if (cmd === '/ayanokoji-help' || cmd === '/ayanokoji:ayanokoji-help') {
        mode = 'help';
      } else if (cmd === '/ayanokoji-task' || cmd === '/ayanokoji:ayanokoji-task') {
        mode = 'task';
      } else if (cmd === '/ayanokoji-status' || cmd === '/ayanokoji:ayanokoji-status') {
        mode = 'status';
      } else if (cmd === '/ayanokoji-gate' || cmd === '/ayanokoji:ayanokoji-gate') {
        mode = 'gate';
      } else if (cmd === '/ayanokoji' || cmd === '/ayanokoji:ayanokoji') {
        if (arg === 'lite') mode = 'lite';
        else if (arg === 'full') mode = 'full';
        else if (arg === 'ultra') mode = 'ultra';
        else if (arg === 'off') mode = 'off';
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        setMode(mode);
        writeHookOutput(
          'UserPromptSubmit',
          mode,
          'AYANOKOJI MODE CHANGED — level: ' + mode,
        );
      } else if (mode === 'off') {
        clearMode();
        writeHookOutput('UserPromptSubmit', 'off', 'AYANOKOJI MODE OFF');
      }
    }

    if (isDeactivationCommand(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'AYANOKOJI MODE OFF');
    }
  } catch (e) {
    // Silent fail
  }
});
