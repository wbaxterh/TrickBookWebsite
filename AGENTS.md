# AGENTS.md — TrickBook Repo Agent Rules

All coding agents working in this repository must follow this order:

1. Read `SOUL.md`
2. Read `PRODUCT-PRINCIPLES-CHECKLIST.md`
3. Then implement changes

## Non-negotiables

- Prioritize rider value: progression, stoke, community.
- Protect trust: no broken filters/category mismatches.
- Keep UI simple: context → action → support.
- Do not surface raw backend-only fields as primary UI (e.g., lat/lng).
- Prefer practical rider actions (map links, save, plan, share).
- Keep companion systems reliable over flashy.

## PR discipline

Before proposing completion, agents must provide:
- What rider outcome improved
- What trust checks were run
- What metric/feedback signal should be monitored

If uncertain, choose smaller scope and ask for review.