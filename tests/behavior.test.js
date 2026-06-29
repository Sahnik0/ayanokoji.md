#!/usr/bin/env node
// Unit test for the Ayanokoji behavior gate. Feeds known strategic behavior-present
// and behavior-absent outputs through each probe checker and asserts the verdict.

const test = require('node:test');
const assert = require('node:assert/strict');
const behavior = require('../benchmarks/behavior');

function check(probe, output) {
  return behavior(output, { vars: { probe } });
}

// --- scaffold: check for four scaffold files ---

test('scaffold: all four files present passes', () => {
  const r = check('scaffold', 'Generated AGENTS.md, CONTEXT.md, TASK.md, and PROGRESS.md.');
  assert.equal(r.pass, true);
  assert.equal(r.score, 1);
});

test('scaffold: missing PROGRESS.md fails', () => {
  const r = check('scaffold', 'Generated AGENTS.md, CONTEXT.md, and TASK.md.');
  assert.equal(r.pass, false);
  assert.equal(r.score, 0);
});

// --- questions: check for core 3 questions ---

test('questions: core questions included passes', () => {
  const r = check('questions', 'Q1: What is the end state? Q2: What are the hard constraints? Q3: What is the acceptance criteria?');
  assert.equal(r.pass, true);
  assert.equal(r.score, 1);
});

test('questions: missing constraints fails', () => {
  const r = check('questions', 'Q1: What is the end state? Q3: What is the acceptance criteria?');
  assert.equal(r.pass, false);
  assert.equal(r.score, 0);
});

// --- gate: check for verification gate and actual output ---

test('gate: verification gate with actual output passes', () => {
  const r = check('gate', 'Must pass the verification gate by running the criteria check and pasting the actual output.');
  assert.equal(r.pass, true);
  assert.equal(r.score, 1);
});

test('gate: missing actual output requirement fails', () => {
  const r = check('gate', 'Will verify that it is complete.');
  assert.equal(r.pass, false);
  assert.equal(r.score, 0);
});

// --- unknown probe is skipped, not failed ---

test('unknown probe is skipped', () => {
  const r = check('something-else', 'some output');
  assert.equal(r.pass, true);
  assert.match(r.reason, /skipped/i);
});
