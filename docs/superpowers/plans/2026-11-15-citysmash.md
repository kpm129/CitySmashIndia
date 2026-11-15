# CitySmashIndia implementation plan

Goal: implement the complete six-city destruction sandbox in README.md and AGENTS.md.
Architecture: immutable city geometry; pure damage, timing, preference and power logic; Phaser Matter scene; semantic DOM controls; Web Audio buses.
Tech stack: strict TypeScript, Vite, Phaser 3/bundled Matter, Vitest, Playwright, ESLint, Prettier.

- [x] Scaffold and failing tests for damage, timing, preferences, geometry and deterministic powers.
- [x] Mumbai slice: convex constrained chunks, meteor and earthquake, physical debris, reset; run unit/build/browser checks before expansion.
- [x] Add all six cities/powers, shared time/audio/effect lifecycle and accessible responsive controls.
- [x] Browser-check every power/city, reset resource counts, touch, persistence and timing; run all release checks.

Assumptions: original code-native vector art intentionally replaces generated/raster assets so landmark pieces match convex physics geometry. Original synthesized music and effects avoid third-party media and runtime requests. Fixed camera with FIT scaling. No extra gameplay features. No project-code license inferred. Existing isolated checkout is used.
Review focus: target mapping after resize; hidden-tab timing; corrupt storage; scene teardown; rapid repeated input at caps. Browser tests cover these alongside core flows. Full physical-device/browser performance matrix remains a separate release-validation requirement if unavailable here.

Execution rulings: used the existing isolated checkout and implemented directly as explicitly requested, without design/milestone approval prompts. Original procedural vector art is an intentional deviation from image-generated concepting. Canvas 2D replaces the WebGL preference based on the measured same-environment comparison above. No source license was inferred. Fresh review findings on audio, teardown and structural support were corrected and regression-tested. No commits, push, merge or publication are implied.
