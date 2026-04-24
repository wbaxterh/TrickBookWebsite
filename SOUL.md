# SOUL.md — TrickBook

*TrickBook is not an app that dumps data. It’s an app that builds rider momentum.*

## Core Identity

TrickBook exists to help riders:
1. **Progress their riding** (tricks, spots, sessions)
2. **Stay stoked** (culture, media, companions)
3. **Connect with community** (homies, local knowledge, shared progression)

If a feature does not clearly improve one of those outcomes, it should be simplified or removed.

---

## Product Principles

### 1) Simplicity over feature sprawl
- Show the *minimum useful* information first.
- Progressive disclosure: details on demand, not all at once.
- One clear primary action per screen.

### 2) Progress over perfection
- Prioritize tools that help users take the next action:
  - log a trick
  - save a spot
  - plan a session
  - share an update

### 3) Culture-first utility
- TrickBook should feel like action sports culture, not corporate software.
- Voice, visuals, and interactions should be energetic but clean.

### 4) Data should guide, not overwhelm
- KPIs are useful only if they help decisions.
- No raw data dumps (e.g., raw lat/lng in UI).
- Map links and practical context beat technical clutter.

### 5) Trust through consistency
- Filters must be accurate.
- Categories/sport types must be clean.
- A wrong result is worse than fewer results.

---

## UX / Visual Philosophy

### Rule of Thirds
- Every key screen should prioritize a 3-part hierarchy:
  1. **Primary context** (where am I / what is this?)
  2. **Primary action** (what should I do?)
  3. **Supporting detail** (what helps me decide?)

### Sacred Geometry (practical interpretation)
- Use balanced spacing ratios and visual rhythm (avoid random density).
- Build card/layout systems around repeatable proportions.
- Favor calm, intentional composition over noisy UI.

### Aesthetic constraints
- Keep negative space intentional.
- Keep type scale disciplined.
- Keep interaction states obvious and tactile.

---

## Feedback System (Lean Loop)

### Goal
Ship small, learn fast, improve what users actually use.

### Loop
1. **Ship a focused improvement** (small blast radius)
2. **Collect in-product feedback** (thumbs up/down + optional note)
3. **Measure behavior**
   - completion rate
   - repeat usage
   - drop-off points
4. **Review weekly**
   - keep / iterate / remove

### Simple scoring rubric
- **Adoption:** Are users using it repeatedly?
- **Clarity:** Do users understand it without explanation?
- **Impact:** Does it improve progression/community engagement?

If 2 of 3 are weak after iteration, simplify or sunset.

---

## Resort/Spots Philosophy

For resort/spot experiences:
- Show what riders care about first.
- Hide backend technical fields.
- Prioritize practical decision support and local context.

Order of information:
1. **Can I ride this and is it worth it today?**
2. **What kind of rider is this best for?**
3. **Where do I go next / how do I navigate there?**

---

## AI Companion Philosophy (Kaori and beyond)

Companions should:
- feel human, not robotic
- be concise and useful
- motivate progression
- match rider tone (hype/coach/calm)

Voice and animation are part of trust. If they feel fake or glitchy, simplify until quality is reliable.

---

## Non-Negotiables

- No misleading filters or mismatched categories.
- No clutter-first interfaces.
- No shipping complexity without a feedback loop.
- Keep TrickBook’s core: **progression, stoke, community**.

---

## Build Order Rule

When deciding what to build next:
1. Fix trust issues (bugs, filter mismatches, broken flows)
2. Improve core progression loops
3. Add delight only after reliability

---

## Final Check Before Shipping Any Feature

- Is it simple?
- Is it useful to riders now?
- Is it consistent with TrickBook’s culture?
- Can we measure if it works?

If not, keep refining.