"""Hermes plugin for Ayanokoji — Strategic Execution Protocol."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Callable

DEFAULT_MODE = "full"
RUNTIME_MODES = {"off", "lite", "full", "ultra"}
CONFIG_MODES = RUNTIME_MODES | {"review", "audit", "debt", "gain", "help", "task", "status", "gate"}

SKILL_COMMANDS = {
    "ayanokoji-review": "Inspect the current TASK.md for strategic completeness before execution.",
    "ayanokoji-audit": "Audit all four scaffold files (AGENTS.md, CONTEXT.md, TASK.md, PROGRESS.md) for protocol drift.",
    "ayanokoji-debt": "Surface all deferred decisions, [TO BE DEFINED] markers, and unresolved blockers.",
    "ayanokoji-gain": "Strategic progress summary: completed tasks, retry rate, verification quality.",
    "ayanokoji-help": "Show the Ayanokoji protocol quick reference card.",
    "ayanokoji-task": "Initialize a clean TASK.md template for a new task from the description in arguments.",
    "ayanokoji-status": "Show a consolidated strategic dashboard of current task, blockers, failures, and progress.",
    "ayanokoji-gate": "Run the verification gate checks for the current task and update scaffold files based on the result.",
}

ROOT = Path(__file__).resolve().parent
SKILLS_DIR = ROOT / "skills"
AYANOKOJI_SKILL = SKILLS_DIR / "ayanokoji" / "SKILL.md"

_current_mode = None


def _normalize_runtime_mode(mode: str | None) -> str | None:
    if not isinstance(mode, str):
        return None
    mode = mode.strip().lower()
    return mode if mode in RUNTIME_MODES else None


def _normalize_config_mode(mode: str | None) -> str | None:
    if not isinstance(mode, str):
        return None
    mode = mode.strip().lower()
    return mode if mode in CONFIG_MODES else None


def _config_dir() -> Path:
    if os.environ.get("XDG_CONFIG_HOME"):
        return Path(os.environ["XDG_CONFIG_HOME"]) / "ayanokoji"
    if os.name == "nt":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "ayanokoji"
    return Path.home() / ".config" / "ayanokoji"


def _default_mode() -> str:
    env_mode = _normalize_config_mode(os.environ.get("AYANOKOJI_DEFAULT_MODE"))
    if env_mode:
        return env_mode
    try:
        data = json.loads((_config_dir() / "config.json").read_text(encoding="utf-8"))
        file_mode = _normalize_config_mode(data.get("defaultMode"))
        if file_mode:
            return file_mode
    except Exception:
        pass
    return DEFAULT_MODE


def _strip_frontmatter(text: str) -> str:
    return re.sub(r"^---[\s\S]*?---\s*", "", text or "", count=1)


def _load_skill_body(name: str) -> str:
    skill_file = SKILLS_DIR / name / "SKILL.md"
    try:
        return _strip_frontmatter(skill_file.read_text(encoding="utf-8"))
    except OSError:
        if name == "ayanokoji":
            return _fallback_instructions(DEFAULT_MODE)
        return f"Ayanokoji skill: {name} active."


def _fallback_instructions(mode: str) -> str:
    return (
        f"AYANOKOJI PROTOCOL ACTIVE — level: {mode}\n\n"
        "You are a calculating strategist. Not a reactive assistant.\n"
        "Every action is deliberate. Every move is pre-computed. You do not guess.\n\n"
        "Before writing any code:\n"
        "1. Analyze the user's message in silence. Extract every inferable fact.\n"
        "2. Ask only what cannot be deduced — max 9 questions, always include:\n"
        "   end state (2-3 sentences), hard constraints, checkable acceptance criterion.\n"
        "3. Present all questions in one message. Do not start work before receiving answers.\n"
        "4. Validate answers: end state specific, at least one hard constraint, criterion verifiable.\n\n"
        "Then generate: AGENTS.md → CONTEXT.md → TASK.md → PROGRESS.md\n\n"
        "Verification gate: run the exact acceptance check before marking any task complete.\n"
        "Log actual output — never write 'tests passed' without the output.\n"
        "Never touch out-of-scope files. Never repeat a failed strategy without logging it first."
    )


def build_injected_context(mode: str | None = None) -> str:
    """Return the mode-filtered Ayanokoji context injected before LLM turns."""
    configured = _normalize_config_mode(mode) or _default_mode()
    if configured == "off":
        return ""

    skill_name = configured
    if configured in {"review", "audit", "debt", "gain", "help", "task", "status", "gate"}:
        skill_name = f"ayanokoji-{configured}"

    # Load from the mapped skill or fallback to main ayanokoji skill
    if skill_name in SKILL_COMMANDS or skill_name == "ayanokoji":
        body = _load_skill_body(skill_name)
        return f"AYANOKOJI MODE ACTIVE — level: {configured}\n\n{body}"

    effective = _normalize_runtime_mode(configured) or DEFAULT_MODE
    body = _load_skill_body("ayanokoji")
    return f"AYANOKOJI MODE ACTIVE — level: {effective}\n\n{body}"


def _pre_llm_call(session_id: str = "", **_: Any) -> dict[str, str] | None:
    mode = _current_mode or _default_mode()
    context = build_injected_context(mode)
    return {"context": context} if context else None


def _skill_prompt(command: str, args: str = "") -> str:
    tail = args.strip()
    target = f"\n\nUser arguments: {tail}" if tail else ""
    return (
        f"Load and follow the Hermes plugin skill `ayanokoji:{command}`. "
        f"{SKILL_COMMANDS[command]}{target}"
    )


def _slash_access_denied(event: Any, gateway: Any, command: str) -> bool:
    if gateway is None or event is None:
        return False
    checker = getattr(gateway, "_check_slash_access", None)
    source = getattr(event, "source", None)
    if checker is None or source is None:
        return False
    try:
        return checker(source, command) is not None
    except Exception:
        return True


def rewrite_gateway_command(event: Any = None, gateway: Any = None, **_: Any) -> dict[str, str] | None:
    """Rewrite authorized gateway /ayanokoji-* commands into normal prompt triggers."""
    text = str(getattr(event, "text", "") or "").strip()
    if not text.startswith("/"):
        return None
    head, _, rest = text[1:].partition(" ")
    command = head.replace("_", "-").lower()
    if command not in SKILL_COMMANDS:
        return None
    if _slash_access_denied(event, gateway, command):
        return None
    return {"action": "rewrite", "text": _skill_prompt(command, rest)}


def _make_skill_command_handler(ctx: Any, command: str) -> Callable[[str], str]:
    def handler(raw_args: str) -> str:
        prompt = _skill_prompt(command, raw_args or "")
        injected = False
        try:
            injected = bool(ctx.inject_message(prompt))
        except Exception:
            injected = False
        if injected:
            return f"Queued `{command}` for the agent."
        return prompt

    return handler


def _ayanokoji_command_handler(ctx: Any) -> Callable[[str], str]:
    def handler(raw_args: str) -> str:
        global _current_mode
        args = (raw_args or "").strip().lower()
        if not args:
            mode = _current_mode or _default_mode()
            return f"Ayanokoji mode: {mode}. Usage: /ayanokoji [lite|full|ultra|off]"

        normalized = _normalize_runtime_mode(args)
        if not normalized:
            return f"Invalid mode '{args}'. Usage: /ayanokoji [lite|full|ultra|off]"

        _current_mode = normalized
        return f"Ayanokoji mode set to {normalized} for this session."

    return handler


def register(ctx: Any) -> None:
    """Register Ayanokoji hooks, skills, and slash commands with Hermes."""
    for child in sorted(SKILLS_DIR.iterdir() if SKILLS_DIR.exists() else []):
        skill_md = child / "SKILL.md"
        if child.is_dir() and skill_md.exists():
            ctx.register_skill(child.name, skill_md)

    ctx.register_hook("pre_llm_call", _pre_llm_call)
    ctx.register_hook("pre_gateway_dispatch", rewrite_gateway_command)

    ctx.register_command(
        "ayanokoji",
        _ayanokoji_command_handler(ctx),
        description="Set or report Ayanokoji mode.",
        args_hint="[lite|full|ultra|off]",
    )
    for command, description in SKILL_COMMANDS.items():
        ctx.register_command(
            command,
            _make_skill_command_handler(ctx, command),
            description=description,
            args_hint="[target or notes]",
        )
