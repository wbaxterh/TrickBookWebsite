# Homepage design review and experiment

Branch: preview/homepage-progression

## Review
Set NEXT_PUBLIC_HOMEPAGE_PREVIEW=true on the preview Amplify branch and rebuild. Open /?homepage=control and /?homepage=progression. Root defaults to the redesign. Preview suppresses PostHog, GA and custom analytics, does not assign experiment cookies, and sends noindex on the homepage. The example trick list is local-only and explicitly labeled. Account and discovery links use the existing app services; the preview is not a separate user database.

## Production rollout (only after Wes approves)
Merge the approved code separately. Production defaults to the current homepage. Keep NEXT_PUBLIC_HOMEPAGE_PREVIEW unset/false. Enable HOMEPAGE_EXPERIMENT_ENABLED=true, set HOMEPAGE_PROGRESSION_PERCENT=50, and redeploy to start allocation. English homepage visits only; all other languages retain the translated control. An HttpOnly, Secure, SameSite=Lax cookie keeps the design stable for 90 days. Server rendering prevents a client-side design swap. Responses are private/no-store; validate actual Amplify CDN behavior before launch. Existing hero-headline variation is visually frozen to control during the whole-page test.

## Measurement
Use homepage_experiment_viewed as exposure. All custom events after exposure carry experiment=homepage-design-v1 and homepage_variant. Build PostHog funnels for exposure -> cta_clicked -> signup_started -> signup_completed (email only). Segment by variant, source and device. Demo events are diagnostic, not the primary success metric. OAuth account creation cannot currently be distinguished from an existing-user login and must be instrumented server-side before claiming a combined signup conversion rate. Do not use a social-login click as a completed signup. First-list activation and retained rider use also need verified product events before selecting a winner on those outcomes. Preview traffic is excluded.

Compare unique exposed visitors and signup arrivals first; add true activation before scaling acquisition. Cookie assignment is browser-based, not account-based or cross-device. Attribution persists in sessionStorage through same-tab signup navigation; blocked storage and cross-device journeys are not fully attributable. Pause other homepage experiments while evaluating this one. Set duration and sample-size requirements using baseline traffic and conversion, and do not call a winner from a few clicks.

## Rollback
Set HOMEPAGE_EXPERIMENT_ENABLED=false and redeploy. This gate overrides existing variant cookies. A future materially different experiment must use a new version and cookie name.

## Review checklist
Rider outcome: show progression value immediately and let visitors try a clearly labeled sample before joining.
Trust: no invented rider counts/testimonials; correct sport examples; real internal destinations; unchanged live main; preview does not send experiment events.
Validation: native Node allocation tests, scoped Biome checks, Next production build, desktop/mobile review, menu-to-signup navigation, sample toggle and preview comparison. Record actual results in the PR.
Owner: Wes Huber. Review first results seven days after an approved experiment launch; this document does not schedule an automation.

## Verification record ? September 10, 2026
Five allocation tests passed. Scoped Biome check passed (warnings remain in existing code/style overrides). Next production build passed with the existing next-i18next dynamic-dependency warning. Automated browser verified both design switches, example completion, sport change reset, 390px mobile layout without horizontal overflow, and menu closure when navigating to signup. Authentication was not submitted. A final build follows the mobile spacing refinement and removal of internal instructions from public docs.

## Temporary photo reference (September 10, 2026)
The preview uses Kris Pounds's opening Venice Skate Park photograph, VeniceSkatePark-12.jpg, only when NEXT_PUBLIC_HOMEPAGE_PREVIEW is true. The complete frame is preserved with a linked credit. Permission was requested through the photographer's contact form; the form confirmed Thank you. Permission is pending. Replace the photograph or obtain permission before public publication.
Rider outcome: show the shared session and community. Validation: browser confirmed the 1500 x 1000 photo loaded with contain sizing; scoped Biome check passed with warnings. Feedback signal: whether riders recognize the community feeling at first glance.

