#!/usr/bin/env python3
"""Validate Laws of UX agent wiring: 30 subagents + orchestrator references."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AGENTS_DIR = ROOT / ".cursor" / "agents" / "laws-of-ux"
ORCHESTRATOR = ROOT / ".cursor" / "agents" / "laws-of-ux-orchestrator.md"
README = AGENTS_DIR / "README.md"
GENERATOR = ROOT / "scripts" / "generate_laws_of_ux_agents.py"
SKILL = ROOT / ".cursor" / "skills" / "laws-of-ux-orchestrator" / "SKILL.md"

EXPECTED_COUNT = 30
REQUIRED_SECTIONS = (
    "## When to invoke",
    "## How to apply",
    "## Envirostar surfaces",
    "## Review checklist",
    "## Finding format",
    "## Anti-patterns",
    "## Handoff",
)
REQUIRED_FINDING_KEYS = (
    "LAW:",
    "SURFACE:",
    "OBSERVATION:",
    "SEVERITY:",
    "RECOMMENDED CHANGE:",
    "DO NOT CHANGE:",
)


def main() -> int:
    errors: list[str] = []

    agent_files = sorted(AGENTS_DIR.glob("*.md"))
    agent_files = [p for p in agent_files if p.name != "README.md"]

    if len(agent_files) != EXPECTED_COUNT:
        errors.append(f"Expected {EXPECTED_COUNT} agent files, found {len(agent_files)}")

    for path in agent_files:
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---\nname: ux-"):
            errors.append(f"{path.name}: missing ux- name frontmatter")
        for section in REQUIRED_SECTIONS:
            if section not in text:
                errors.append(f"{path.name}: missing {section}")
        for key in REQUIRED_FINDING_KEYS:
            if key not in text:
                errors.append(f"{path.name}: missing finding key {key}")
        if "### Product triggers" not in text:
            errors.append(f"{path.name}: missing product triggers")
        if "### What not to do" not in text:
            errors.append(f"{path.name}: missing what-not-to-do")
        if "apps/web/src" not in text:
            errors.append(f"{path.name}: missing apps/web/src surface citation")

    orch_text = ORCHESTRATOR.read_text(encoding="utf-8")
    if "Product-trigger matrix" not in orch_text:
        errors.append("Orchestrator missing product-trigger matrix")
    if "1–3" not in orch_text and "1-3" not in orch_text:
        errors.append("Orchestrator missing 1–3 targeting rule")

    skill_text = SKILL.read_text(encoding="utf-8")
    if "Product-trigger matrix" not in skill_text:
        errors.append("Skill missing product-trigger matrix")

    readme_text = README.read_text(encoding="utf-8")
    for path in agent_files:
        slug = path.stem
        ref = f"laws-of-ux/{slug}.md"
        if ref not in orch_text:
            errors.append(f"Orchestrator missing reference to {ref}")
        if f"{slug}.md" not in readme_text:
            errors.append(f"README missing reference to {slug}.md")

    gen_text = GENERATOR.read_text(encoding="utf-8")
    slug_count = len(re.findall(r'"slug":\s*"', gen_text))
    if slug_count != EXPECTED_COUNT:
        errors.append(f"Generator defines {slug_count} laws, expected {EXPECTED_COUNT}")

    if errors:
        for err in errors:
            print(f"ERROR: {err}", file=sys.stderr)
        return 1

    print(f"OK: {EXPECTED_COUNT} laws-of-ux agents validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
