# Implementation validation

## Workflow and evidence

Initial repository: README specification only. The supplied AGENTS.md was read and added verbatim. The supplied README matched the original repository README byte for byte. Implementation follows the prescribed TypeScript/Vite/Phaser 3/bundled Matter baseline, using the existing isolated checkout.

The first browser slice exercised Mumbai, meteor, earthquake, accumulated destruction and Rebuild. Broader testing then exposed a Matter mass restoration defect not caught by that initial UI-only test: bodies created as static were invalid when released. The fix creates dynamic chunks with valid mass/inertia before fixing them in place; subsequent tests assert physical movement and finite positions. A grounded overlap graph replaces centre-column-only support propagation, with an explicit lintel regression and verification that every authored piece is grounded. Pointer targeting maps native client coordinates through the live canvas rectangle, avoiding stale scaled bounds after city selection and page scrolling. Browser assertions wait for actual simulation outcomes rather than assuming a wall-clock delay equals simulation time on software-rendered devices.

A fresh static review identified paused/menu audio resume, stale audio duck automation, scene destroy cleanup, and arch support defects. These were corrected. Audio has a paused-state regression, mute gain check, and hidden/menu checks. Scene cleanup listens for both shutdown and destroy. No merge or publication is performed.

Browser plugin not available; Playwright uses installed system Chromium 156 via CHROMIUM_PATH. Playwright browser download was attempted and blocked by network policy (HTTP 403 from cdn.playwright.dev); TLS and artifact verification were not disabled.

## Automated coverage

- Vitest: strength clamping, distance/material damage, integrity rounding, seeded random sequences, fixed-step timing and suspension clamp, corrupt/old preferences, all six city assemblies, all six powers at minimum/default/maximum strength, power expiry and radius monotonicity, Bangalore alias, grounded support graph and failed-pillar lintel collapse.
- Playwright: six city selection flows; each intact day/night view; every power damages and releases physical chunks; falling movement, finite coordinates, pause freezes time and positions, quarter-speed clock, damaged-state preservation through day/night, Rebuild integrity/effect/body/constraint reset, repeated resets/switches, bounded stress, strength input, audio and comfort preferences, mobile touch mapping, mobile landscape and portrait layout, console/page/request errors.
- Asset validation: original source provenance and third-party metadata requirements; no external media files are shipped.
- Build, strict typing, ESLint and Prettier are release checks.

## Visual review

Screenshots were captured and inspected with view_image: city selection, Mumbai day, mobile landscape, plus final scenes after refinements. No reference screenshot was attached in this implementation turn. Original vector artwork intentionally replaces generated/raster artwork. The visual direction uses navy chrome, sand accents, system sans text/Georgia display type, layered pastel scenery, warm landmark materials and original line icons. No image-generated concept was used or claimed as an accepted design.

Review points: readable HTML control labels and selected states; city-card and canvas palette continuity; clear central target area; landmark silhouette differences; mobile control reachability and horizontal overflow; original icon rendering; window lights and night palette; physical debris visibility. Short landscape viewports letterbox the canvas to preserve the full scene, so landmarks are smaller than on desktop.

## Remaining release-validation limits

Automated browser checks do not establish Safari/Firefox/Edge compatibility, physical touch-device behaviour, audio listening quality, WCAG certification, heap leak freedom, or 60/30 FPS on representative hardware. Original procedural art/audio are stylized and simplified. The game has no service worker: offline play is supported within an already loaded page, not guaranteed offline reload. Full-screen exports, screenshots, analytics, new powers, accounts and backend services are intentionally absent.

Final command results are reported in the handoff; do not infer a pass from a command merely being listed here.

## Final measured results

- Frozen-lockfile `npm ci` and repeat production build succeeded.
- Prettier, ESLint, strict typecheck, 29 Vitest tests and asset validation passed. Runtime dependency audit found zero vulnerabilities.
- The complete five-test Playwright suite passed using system Chromium; this includes multi-step flows, not five isolated button clicks. The final Canvas-renderer rerun passed all five tests in 29.7 seconds. The final production smoke also verified damage, pause, rebuild, no console errors, and absent test diagnostics.
- Production transfer: roughly 348 KB gzip across HTML, CSS, game code and Phaser (well below 8 MB). Vite retains a warning for the Phaser vendor chunk exceeding 500 KB uncompressed; it is approximately 332 KB gzip.
- Initial production software-WebGL sample: 18.4 FPS desktop / 20.0 FPS mobile viewport. Canvas 2D comparison in the same cloud Chromium measured 60.2 / 60.6 FPS over 90 animation frames. Canvas is therefore selected as the default for this entirely vector 2D game. This is a measured exception to the original WebGL preference, not a claim about physical hardware.
- Initial production rebuild samples were 404 ms desktop / 757 ms mobile viewport; both representative functional requests and browser destruction/reset checks succeeded without console errors. Production builds omit test diagnostics and include complete runtime license notices.
