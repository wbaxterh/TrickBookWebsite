# TrickBook Blog Implementation Checklist

## 1. Phase 1 - Foundation
- [x] Review `TRICKBOOK-BLOG-RESEARCH-PLAN.md` and `TRICKBOOK-BLOG-FRONTEND-IMPLEMENTATION-SPEC.md` before edits.
- [x] Add blog design tokens file for typography, spacing, color, and measure values from spec.
- [x] Import blog tokens into the app without changing existing non-blog style behavior.
- [x] Add isolated blog body styles for readable measure, vertical rhythm, heading hierarchy, links, images, blockquotes, and code.
- [x] Keep Phase 1 styling scoped to the blog post content container only.
- [x] Wire the scoped content styles into the existing blog post route/template.
- [x] Run quick lint/format validation for changed files.
- [x] Commit Phase 1 changes with a clear message.

Acceptance checks
- [x] Blog article body is constrained to approximately `66ch` on desktop.
- [x] Body typography uses the tokenized font, scale, and line-height values from spec.
- [x] Heading spacing is consistent and readable on mobile and desktop.
- [x] Link and code styles are applied only inside the blog article content scope.
- [x] Existing blog page structure still renders with no required template rewrite.

## 2. Phase 2 - Core Components
- [x] Implement `PostHero`.
- [x] Implement `PostBody` with `narrow`, `body`, and `wide` measure options.
- [x] Implement `CodeBlock`.
- [x] Implement `FigureWithCaption`.
- [x] Replace current hero/body markup on one live blog template with the reusable components.

Acceptance checks
- [x] Hero title, deck, metadata, and cover image align with component contract.
- [x] Content width tokens are controlled by component props instead of ad hoc CSS.
- [x] Code and figure blocks are reusable across posts.

## 3. Phase 3 - Editorial Enhancers
- [x] Implement `SectionHeader`.
- [x] Implement `InsightCallout`.
- [x] Implement `DataBlock`.
- [x] Implement `ResearchReferences`.
- [x] Implement `PostFooterCTA`.
- [x] Add desktop-only sticky table of contents behavior.

Acceptance checks
- [x] Enhanced components render from post content without breaking reading flow.
- [x] TOC remains non-sticky on mobile and does not overpower the article.
- [x] Editorial support components use the same token system as the article body.

## 4. Phase 4 - Accessibility and Polish
- [x] Add explicit visible focus states for blog interactions.
- [x] Verify heading hierarchy and single `h1` semantics on blog pages.
- [x] Verify image `alt` handling for hero and inline figures.
- [x] Tune spacing, line length, and block styles across key breakpoints.
- [x] Respect `prefers-reduced-motion` for any added transitions.

Acceptance checks
- [ ] WCAG AA contrast passes for blog text and links.
- [ ] Keyboard-only navigation works for article interactions and footer CTA.
- [ ] 200% zoom remains readable without horizontal scrolling in the article column.

Validation note
- [ ] Playwright/browser smoke test run against local dev server.

## 5. Phase 5 - Instrumentation and Launch
- [ ] Emit `blog_post_view`.
- [ ] Emit `blog_scroll_25/50/75/100`.
- [ ] Emit `blog_time_30s/60s/120s`.
- [ ] Emit `blog_cta_click`.
- [ ] Emit `blog_copy_code`.
- [ ] Publish the first three posts on the upgraded template.
- [ ] Review weekly KPI reporting fields against the spec payload.

Acceptance checks
- [ ] Analytics payload includes `postId`, `slug`, `category`, `tags`, `author`, and `templateVersion`.
- [ ] Seed posts use the reusable component template rather than one-off markup.
- [ ] Weekly KPI review can measure completion, engaged time, and CTA performance.
