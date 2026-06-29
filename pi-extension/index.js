import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  DEFAULT_MODE,
  getDefaultMode,
  normalizeMode,
  normalizeConfigMode,
  normalizePersistedMode,
  isDeactivationCommand,
  writeDefaultMode,
} = require("../hooks/ayanokoji-config.js");
const { getAyanokojiInstructions, filterSkillBodyForMode } = require("../hooks/ayanokoji-instructions.js");

export { filterSkillBodyForMode };
export const readDefaultMode = getDefaultMode;

export function resolveSessionMode(entries, fallbackMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(fallbackMode) || DEFAULT_MODE;
  if (!Array.isArray(entries)) return fallback;

  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry?.type !== "custom" || entry?.customType !== "ayanokoji-mode") continue;

    const mode = normalizePersistedMode(entry?.data?.mode);
    if (mode) return mode;
  }

  return fallback;
}

export function parseAyanokojiCommand(text, defaultMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(defaultMode) || DEFAULT_MODE;
  const normalizedText = String(text || "").trim().toLowerCase();

  if (!normalizedText) {
    return { type: "set-mode", mode: fallback === "off" ? "full" : fallback };
  }

  const [primary, secondary] = normalizedText.split(/\s+/);

  if (primary === "status") return { type: "status" };

  if (primary === "default") {
    const mode = normalizeConfigMode(secondary);
    return mode ? { type: "set-default", mode } : { type: "invalid", reason: "invalid-default-mode" };
  }

  const mode = normalizeMode(primary);
  return mode ? { type: "set-mode", mode } : { type: "invalid", reason: "invalid-mode", mode: primary };
}

export { writeDefaultMode };

export default function ayanokojiExtension(pi) {
  let currentMode = DEFAULT_MODE;
  let configuredDefaultMode = getDefaultMode();
  let isActive = false;
  let lastCtx = null;

  // -- Status bar --
  function syncStatus(ctx) {
    if (ctx) lastCtx = ctx;
    const c = ctx || lastCtx;
    if (!c?.ui?.setStatus || !c.ui.theme?.fg) return;
    const theme = c.ui.theme;
    if (currentMode === "off") {
      c.ui.setStatus("ayanokoji", "");
      return;
    }
    const levelIcons = { lite: "🌿", full: "⚡", ultra: "🔥" };
    const icon = levelIcons[currentMode] || "";
    const label = currentMode.toUpperCase();
    const indicator = isActive ? theme.fg("accent", "●") : theme.fg("dim", "○");
    c.ui.setStatus("ayanokoji", indicator + " 🐴 " + theme.fg("muted", "ayanokoji: ") + theme.fg("text", icon + " " + label));
  }

  const setMode = (mode, ctx) => {
    const normalized = normalizePersistedMode(mode);
    if (!normalized) return;

    currentMode = normalized;
    pi.appendEntry("ayanokoji-mode", { mode: normalized });
    syncStatus(ctx);
    ctx?.ui?.notify?.(`Ayanokoji mode set to ${normalized}.`, "info");
  };

  const sendAlias = (skillName, args, ctx) => {
    const normalized = String(args || "").trim();
    const message = normalized ? `${skillName} ${normalized}` : skillName;

    if (ctx?.isIdle?.() === false) {
      pi.sendUserMessage(message, { deliverAs: "followUp" });
      ctx?.ui?.notify?.(`${skillName} queued as follow-up.`, "info");
      return;
    }

    pi.sendUserMessage(message);
  };

  pi.registerCommand("ayanokoji", {
    description: "Set or report Ayanokoji mode",
    handler: async (args, ctx) => {
      const parsed = parseAyanokojiCommand(args, configuredDefaultMode);

      if (parsed.type === "status") {
        ctx?.ui?.notify?.(`Ayanokoji: current ${currentMode} • default ${configuredDefaultMode}`, "info");
        return;
      }

      if (parsed.type === "set-default") {
        const written = writeDefaultMode(parsed.mode);
        if (written) {
          configuredDefaultMode = getDefaultMode();
          const message = configuredDefaultMode === written
            ? `Default Ayanokoji mode set to ${written}.`
            : `Saved default ${written}, but env override keeps default at ${configuredDefaultMode}.`;
          ctx?.ui?.notify?.(message, "info");
        }
        return;
      }

      if (parsed.type === "set-mode") {
        setMode(parsed.mode, ctx);
        return;
      }

      ctx?.ui?.notify?.("Unknown or unsupported /ayanokoji mode.", "warning");
    },
  });

  pi.registerCommand("ayanokoji-review", {
    description: "Run /skill:ayanokoji-review",
    handler: (_args, ctx) => sendAlias("/skill:ayanokoji-review", "", ctx),
  });

  pi.registerCommand("ayanokoji-audit", {
    description: "Run /skill:ayanokoji-audit",
    handler: (_args, ctx) => sendAlias("/skill:ayanokoji-audit", "", ctx),
  });

  pi.registerCommand("ayanokoji-gain", {
    description: "Run /skill:ayanokoji-gain",
    handler: (_args, ctx) => sendAlias("/skill:ayanokoji-gain", "", ctx),
  });

  pi.registerCommand("ayanokoji-debt", {
    description: "Run /skill:ayanokoji-debt",
    handler: (_args, ctx) => sendAlias("/skill:ayanokoji-debt", "", ctx),
  });

  pi.registerCommand("ayanokoji-help", {
    description: "Run /skill:ayanokoji-help",
    handler: (_args, ctx) => sendAlias("/skill:ayanokoji-help", "", ctx),
  });

  pi.registerCommand("ayanokoji-task", {
    description: "Run /skill:ayanokoji-task",
    handler: (args, ctx) => sendAlias("/skill:ayanokoji-task", args, ctx),
  });

  pi.registerCommand("ayanokoji-status", {
    description: "Run /skill:ayanokoji-status",
    handler: (_args, ctx) => sendAlias("/skill:ayanokoji-status", "", ctx),
  });

  pi.registerCommand("ayanokoji-gate", {
    description: "Run /skill:ayanokoji-gate",
    handler: (_args, ctx) => sendAlias("/skill:ayanokoji-gate", "", ctx),
  });

  pi.on("input", async (event) => {
    if (event?.source === "extension") return;

    const text = String(event?.text || "");
    if (currentMode !== "off" && isDeactivationCommand(text)) {
      setMode("off");
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx?.sessionManager?.getBranch?.() || ctx?.sessionManager?.getEntries?.() || [];
    configuredDefaultMode = getDefaultMode();
    currentMode = resolveSessionMode(entries, configuredDefaultMode);
    syncStatus(ctx);
    ctx?.ui?.notify?.(`Ayanokoji loaded: ${currentMode}`, "info");
  });

  pi.on("agent_start", async (_event, ctx) => {
    isActive = true;
    syncStatus(ctx);
  });

  pi.on("agent_end", async (_event, ctx) => {
    isActive = false;
    syncStatus(ctx);
  });

  pi.on("before_agent_start", async (event) => {
    if (!currentMode || currentMode === "off") return;
    return { systemPrompt: `${event.systemPrompt}\n\n${getAyanokojiInstructions(currentMode)}` };
  });
}
