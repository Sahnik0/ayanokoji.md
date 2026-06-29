import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  filterSkillBodyForMode,
  parseAyanokojiCommand,
  readDefaultMode,
  resolveSessionMode,
  writeDefaultMode,
} from "../index.js";

test("parseAyanokojiCommand falls back to full when invoked bare and default is off", () => {
  assert.deepEqual(parseAyanokojiCommand("", "off"), { type: "set-mode", mode: "full" });
});

test("parseAyanokojiCommand parses modes, status, and default subcommand", () => {
  assert.deepEqual(parseAyanokojiCommand("ultra", "full"), { type: "set-mode", mode: "ultra" });
  assert.deepEqual(parseAyanokojiCommand("status", "full"), { type: "status" });
  assert.deepEqual(parseAyanokojiCommand("default lite", "full"), { type: "set-default", mode: "lite" });
});

test("resolveSessionMode prefers latest persisted session mode", () => {
  const entries = [
    { type: "custom", customType: "ayanokoji-mode", data: { mode: "lite" } },
    { type: "custom", customType: "ayanokoji-mode", data: { mode: "ultra" } },
  ];

  assert.equal(resolveSessionMode(entries, "full"), "ultra");
});

test("resolveSessionMode returns fallback when entries is not an array", () => {
  assert.equal(resolveSessionMode(null, "ultra"), "ultra");
  assert.equal(resolveSessionMode(undefined, "lite"), "lite");
  assert.equal(resolveSessionMode({}, "full"), "full");
  assert.equal(resolveSessionMode("not an array"), "full"); // DEFAULT_MODE fallback
});

test("readDefaultMode and writeDefaultMode use XDG config path", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "ayanokoji-config-"));
  const previousXdg = process.env.XDG_CONFIG_HOME;
  const previousDefault = process.env.AYANOKOJI_DEFAULT_MODE;
  const configPath = join(tempDir, "ayanokoji", "config.json");
  process.env.XDG_CONFIG_HOME = tempDir;
  delete process.env.AYANOKOJI_DEFAULT_MODE;

  try {
    assert.equal(readDefaultMode(), "full");
    assert.equal(writeDefaultMode("ultra"), "ultra");
    assert.equal(readDefaultMode(), "ultra");
    assert.ok(existsSync(configPath));
    assert.deepEqual(JSON.parse(readFileSync(configPath, "utf8")), { defaultMode: "ultra" });
  } finally {
    if (previousXdg === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = previousXdg;
    if (previousDefault === undefined) delete process.env.AYANOKOJI_DEFAULT_MODE;
    else process.env.AYANOKOJI_DEFAULT_MODE = previousDefault;
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("filterSkillBodyForMode keeps only requested intensity examples and rows", () => {
  const body = `---\nname: ayanokoji\n---\n| **lite** | keep lite |\n| **full** | keep full |\n| **ultra** | keep ultra |\n- lite: Lite example\n- full: Full example\n- ultra: Ultra example\nOther line`;

  const filtered = filterSkillBodyForMode(body, "ultra");

  assert.ok(!filtered.includes("keep lite"));
  assert.ok(!filtered.includes("keep full"));
  assert.ok(filtered.includes("keep ultra"));
  assert.ok(!filtered.includes("Lite example"));
  assert.ok(filtered.includes("Ultra example"));
  assert.ok(filtered.includes("Other line"));
});

test("filterSkillBodyForMode keeps rule bullets that contain a colon", () => {
  // Regression: rule bullets outside the Intensity section (e.g. key: value)
  // contain a colon and must not be mistaken for mode-example lines.
  const body = `---\nname: ayanokoji\n---\n- **Project type**: new build\n- full: This is a full mode example\n- lite: This is a lite mode example\n- ultra: This is an ultra mode example`;

  const filtered = filterSkillBodyForMode(body, "full");

  assert.ok(filtered.includes("Project type"));
  assert.ok(filtered.includes("This is a full mode example"));
  assert.ok(!filtered.includes("This is a lite mode example"));
  assert.ok(!filtered.includes("This is an ultra mode example"));
});
