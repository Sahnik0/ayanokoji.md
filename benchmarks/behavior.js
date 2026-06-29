// Behavior gate: does the Ayanokoji ruleset actually PRODUCE its strategic
// planning and verification behaviors? One check per probe (vars.probe):
//   scaffold   - checks that it generates/references the four files (AGENTS, CONTEXT, TASK, PROGRESS)
//   questions  - checks that it asks targeted questions including the core 3 (end state, constraints, criteria)
//   gate       - checks that it enforces the verification gate and prints actual output
//
// Heuristic graders. The graders themselves are proven by tests/behavior.test.js.
//
// Metric: `behavior` (1 = behavior present, 0 = absent).

function proseOf(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, ' ').replace(/\s+/g, ' ').trim();
}

const CHECKS = {
  // Checks that the strategic scaffold files are generated or referenced.
  scaffold(output) {
    const t = String(output || '').toUpperCase();
    const hasScaffold = t.includes('AGENTS.MD') && t.includes('CONTEXT.MD') && t.includes('TASK.MD') && t.includes('PROGRESS.MD');
    return hasScaffold
      ? { pass: true, reason: 'Generated or referenced all four scaffold files (AGENTS, CONTEXT, TASK, PROGRESS).' }
      : { pass: false, reason: 'Missing one or more scaffold files in the output.' };
  },

  // Checks that the targeted questions (core 3) were asked.
  questions(output) {
    const t = String(output || '').toLowerCase();
    const hasCore = (t.includes('end state') || t.includes('look like') || t.includes('q1')) &&
                    (t.includes('constraints') || t.includes('q2')) &&
                    (t.includes('acceptance criteria') || t.includes('first task') || t.includes('verifiable') || t.includes('q3'));
    return hasCore
      ? { pass: true, reason: 'Asked the core targeted questions.' }
      : { pass: false, reason: 'Did not ask the required core questions.' };
  },

  // Checks that the verification gate is referenced and actual output is required.
  gate(output) {
    const t = String(output || '').toLowerCase();
    const hasGate = t.includes('verification gate') && (t.includes('actual output') || t.includes('paste') || t.includes('proof'));
    return hasGate
      ? { pass: true, reason: 'Enforced the verification gate with actual output.' }
      : { pass: false, reason: 'Did not enforce the verification gate / actual output.' };
  },
};

module.exports = (output, context) => {
  const probe = context && context.vars && context.vars.probe;
  const check = CHECKS[probe];
  if (!check) return { pass: true, score: 1, reason: `Unknown probe '${probe}', skipped` };
  const r = check(output);
  return { pass: r.pass, score: r.pass ? 1 : 0, reason: r.reason };
};
