---
name: laws-of-ux
description: >-
  Slash-menu entry for /laws-of-ux. Route doihave.space UI/UX review through the
  Laws of UX orchestrator using a product trigger (address search, sample
  reports, interstitial, results card, site map, connect/leads, empty/error,
  mobile, eligibility badge) — pick 1–3 laws, or run a full 30-law audit on
  named src/app and src/components/features paths. Run locally on this device.
disable-model-invocation: true
---

# /laws-of-ux

This skill is the **Cursor slash-menu name** `/laws-of-ux` (folder + `name` must match). Follow the orchestrator in full:

1. `@.cursor/skills/laws-of-ux-orchestrator/SKILL.md`
2. `@.cursor/agents/laws-of-ux-orchestrator.md`
3. `@.cursor/agents/laws-of-ux/README.md`

Then execute the session steps in `@.cursor/commands/laws-of-ux.md` (route 1–3 laws or a full audit on the home funnel if no surface is named, each agent observe → diagnose → prescribe, emit LAW/SURFACE/OBSERVATION/SEVERITY/RECOMMENDED CHANGE/DO NOT CHANGE). Use **local** subagents, not cloud.

**Project command (same slash name):** `.cursor/commands/laws-of-ux.md`
**User-global copy:** `~/.cursor/commands/laws-of-ux.md`
