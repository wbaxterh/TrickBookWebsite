# TrickBook Product Principles Checklist

Use this before opening a PR that changes product behavior, UI, or data flow.

## 1) Rider Value (required)
- [ ] This change helps riders **progress**, **stay stoked**, or **connect**.
- [ ] Primary user action is obvious (one clear main action).
- [ ] This is not feature bloat; scope is focused.

## 2) Trust & Correctness (required)
- [ ] Filters/categories/sport types are correct and tested.
- [ ] No misleading states (counts, labels, empty states, loading states).
- [ ] No duplicate sends/events/playback in realtime paths.

## 3) Simplicity & Information Hierarchy (required)
- [ ] Page follows context → action → support hierarchy (rule of thirds).
- [ ] Only essential data is above the fold.
- [ ] Advanced/secondary details are progressively disclosed.

## 4) Data UX Rules (required)
- [ ] No raw backend-only fields shown as primary UI (e.g., raw lat/lng).
- [ ] User-facing navigation uses practical links/actions (maps, save, plan, share).
- [ ] Metrics shown are actionable for riders.

## 5) Companion / Voice Quality (if touched)
- [ ] Voice path avoids duplicate playback.
- [ ] Emotes/lipsync degrade gracefully if data/audio is missing.
- [ ] Fallback behavior is explicit and non-annoying.

## 6) Feedback Loop (required)
- [ ] There is a measurable success signal (adoption, clarity, or impact).
- [ ] Added/updated instrumentation or validation notes for this change.
- [ ] A follow-up review date/owner is identified (weekly loop).

## 7) Aesthetic Consistency (required)
- [ ] Spacing, typography, and visual rhythm are consistent with TrickBook style.
- [ ] UI feels energetic but clean (not noisy/cluttered).
- [ ] Interactions are obvious, tactile, and accessible.

---

## PR Summary block (copy into PR)

**Rider outcome:**

**What changed:**

**Trust checks done:**

**Feedback signal to watch:**

**Rollback plan:**
