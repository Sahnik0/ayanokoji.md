# Agent Portability

Ayanokoji is an agent-portable skill distribution. The skills in `skills/` hold
the core behavior; host-specific files are adapters that make that behavior easy
to load in a given agent.

## Supported Adapters

| Host | Files | Notes |
|------|-------|-------|
| Claude Code | `.claude-plugin/plugin.json`, `commands/`, `hooks/claude-codex-hooks.json`, `hooks/` | Full plugin install with session activation, mode tracking, commands, and statusline support. |
| Codex | `.codex-plugin/plugin.json`, `hooks/claude-codex-hooks.json`, `hooks/`, `skills/` | Plugin install with the same skills plus lifecycle hooks for activation and mode tracking. |
| OpenCode | `.opencode/plugins/ayanokoji.mjs`, `.opencode/command/`, `hooks/`, `skills/` | Server plugin injects the ruleset each turn via `experimental.chat.system.transform` and persists `/ayanokoji` switches; reuses the shared instruction builder. |
| pi | `pi-extension/`, `skills/`, `hooks/` | Package extension: injects the ruleset each turn through the shared instruction builder and registers the `/ayanokoji` commands. |
| Hermes Agent | `plugin.yaml`, `__init__.py`, `skills/` | Native Hermes plugin: injects active mode through `pre_llm_call`, rewrites gateway `/ayanokoji-*` skill commands into agent prompts, registers `/ayanokoji` mode switching, and exposes bundled skills as `ayanokoji:<skill>`. |
| Gemini CLI | `gemini-extension.json`, `AGENTS.md`, `commands/`, `skills/` | Extension manifest points `contextFileName` at `AGENTS.md` for always-on rules, and reuses the existing `commands/*.toml` and `skills/`, which Gemini CLI auto-discovers. The Claude/Codex hook map is not placed at Gemini's auto-discovered `hooks/hooks.json` path. |
| Cursor | `.cursor/rules/ayanokoji.mdc` | Always-on project rule. |
| Windsurf | `.windsurf/rules/ayanokoji.md` | Project rule. |
| Cline | `.clinerules/ayanokoji.md` | Project rule. |
| GitHub Copilot | `.github/copilot-instructions.md` | Repository instruction file. |
| GitHub Copilot CLI | `.github/plugin/`, `AGENTS.md`, `.github/copilot-instructions.md`, `~/.copilot/copilot-instructions.md` | Plugin-supported (`copilot plugin marketplace add Sahnik0/ayanokoji.md` + `copilot plugin install ayanokoji@ayanokoji`). Fallback instruction mode remains: per-project from `AGENTS.md` or `.github/copilot-instructions.md`, or globally from `~/.copilot/copilot-instructions.md` (instruction-tier, no `/ayanokoji` levels or hooks). |
| Antigravity | `AGENTS.md` | Reads `AGENTS.md` at the repo root as always-on rules (like `.cursorrules`/`CLAUDE.md`); `.agents/rules/` also works for workspace rules. Instruction-tier. |
| CodeWhale | `AGENTS.md` | Reads `AGENTS.md` from the repo root as project instructions; also reads `CLAUDE.md` and `.claude/instructions.md` as fallbacks. Instruction-tier. |
| Swival | `.swival/skills/`, `AGENTS.md` | `swival skills add https://github.com/Sahnik0/ayanokoji.md` installs the six skills straight into `.swival/skills/`. Add `--global` to stage them in the library (`~/.config/swival/library`) first, then `swival skills add ayanokoji` (or `--global ayanokoji`) to activate per-project or everywhere. Also reads `AGENTS.md` from the repo root and `~/.config/swival/AGENTS.md` globally as instruction-tier fallback. |
| VS Code + Codex extension | `AGENTS.md` | The Codex extension reads `AGENTS.md` (repo root, or `~/.codex/AGENTS.md` globally). Instruction-tier; the full Codex plugin row above adds `/ayanokoji` levels and hooks. |
| Kiro | `.kiro/steering/ayanokoji.md` | Steering rule; copy globally or into a project. |
| Generic agents | `AGENTS.md` or `skills/*/SKILL.md` | Copy the compact rule file or load the skill files directly. |

## Adapter Rule

Keep adapters thin. When a host supports skills or hooks, point it at the
existing `skills/` and `hooks/` files. When a host only supports project
instructions, keep its copied rule text aligned with `AGENTS.md`.

## Portable Behavior

- `skills/ayanokoji/SKILL.md`: strategic execution protocol — intake, scaffold generation, verification gate
- `skills/ayanokoji-review/SKILL.md`: inspect TASK.md for strategic completeness before execution
- `skills/ayanokoji-audit/SKILL.md`: audit all four scaffold files for protocol drift
- `skills/ayanokoji-debt/SKILL.md`: surface deferred decisions and unresolved blockers
- `skills/ayanokoji-gain/SKILL.md`: strategic progress summary from PROGRESS.md
- `skills/ayanokoji-help/SKILL.md`: protocol quick reference card
- `skills/ayanokoji-task/SKILL.md`: initialize a clean TASK.md template for a new task from the description
- `skills/ayanokoji-status/SKILL.md`: show a consolidated strategic dashboard of current task, blockers, failures, and progress
- `skills/ayanokoji-gate/SKILL.md`: run the verification gate checks for the current task and update scaffold files
- `AGENTS.md`: compact always-on instruction set for agents without skill support
