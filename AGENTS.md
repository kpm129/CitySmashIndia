# AGENTS.md — CitySmashIndia

Instructions for Codex and other coding agents working in this repository. These rules apply to the entire repository unless a more specific `AGENTS.md` in a subdirectory adds stricter local rules.

## Mission

Build the browser game specified in `README.md`: a side-view, physics-driven sandbox in which the player chooses Delhi, Mumbai, Chennai, Bengaluru, Kochi, or Kolkata and uses alien attack, earthquake, meteor, tornado, volcano, or lightning powers. There are no missions, scores, win states, or loss states.

`README.md` is the product and setup specification. This file governs implementation behaviour, quality, testing, licensing, and scope. If the documents appear inconsistent, preserve the explicit product decisions in `README.md` and choose the interpretation that is safer, simpler, more accessible, and easier to verify. Do not silently expand scope.

## Working principles

1. Read `README.md`, this file, and relevant existing code before editing.
2. Inspect the repository state and existing scripts; do not assume it is empty.
3. Make the smallest coherent change that fully satisfies the task.
4. Prefer data-driven additions over city- or power-specific branching.
5. Keep the game runnable after each change. Do not commit knowingly broken intermediate states.
6. Verify behaviour with automated tests and a production build, not only by reading code.
7. Explain material assumptions in the change summary. Ask the project owner only when a decision affects scope, licensing, privacy, monetisation, backend services, or architecture in a hard-to-reverse way.
8. Do not claim a feature, test, asset clearance, performance result, or browser result that was not actually verified.

## Fixed product decisions

Do not change these without explicit project-owner direction:

- Platform: browser.
- Presentation: original 2D/2.5D side view inspired by, but not copied from, the supplied screenshots.
- Cities: Delhi, Mumbai, Chennai, Bengaluru, Kochi, and Kolkata.
- City identity: one recognisable hero landmark plus fictional surrounding buildings.
- Powers: alien attack, earthquake, meteor, tornado, volcano, and lightning.
- Interaction: select a power, then click or tap a target.
- Destruction: pre-authored chunks detach, fall, collide, settle, and remain as debris.
- Mode: unlimited-use sandbox with no winning or losing.
- Required features: destruction percentage, Rebuild, pause, 0.25× slow motion, day/night, music/SFX mute, and adjustable strength.
- Content: environmental destruction only; no visible people, animals, casualties, gore, or suffering.
- Technology baseline: TypeScript, Vite, Phaser 3 with Phaser’s Matter integration, semantic HTML/CSS UI, Vitest, and Playwright.
- No runtime server or account system for v1.

## Scope boundaries

### In scope

- Responsive city selection and sandbox UI.
- Original art and effects for six cities and six powers.
- Rigid-body destruction assembled from authored convex chunks and constraints.
- Mouse, touch, and keyboard-assisted controls.
- Local preference persistence for audio, strength, accessibility, and presentation settings.
- Asset manifest, attribution notices, license validation, and offline-bundled assets.
- Accessibility, browser compatibility, deterministic tests, performance caps, and graceful errors.

### Out of scope

Do not add any of the following opportunistically:

- missions, objectives, challenges, points, achievements, progression, unlocks, currency, lives, timers, win/loss screens, or leaderboards;
- multiplayer, accounts, cloud saves, analytics, telemetry, ads, payments, social sharing, or a backend;
- geospatial maps, real-time weather, live city data, or external APIs at runtime;
- first-person or free-roaming 3D cameras;
- arbitrary runtime mesh/pixel fracturing or high-fidelity engineering simulation;
- additional cities or powers;
- people, traffic casualties, emergency response, gore, or political/religious commentary;
- copied, traced, extracted, or closely imitated screenshot art, icons, effects, or UI;
- screenshot capture, persistent damaged-city saves, full-screen mode, or graphics settings unless separately requested.

A task may require internal tooling that is not a player-facing feature. Keep such tooling minimal and documented.

## Repository and tooling rules

- Use npm. Commit `package-lock.json` and do not introduce another lockfile.
- Use an active LTS version of Node compatible with the version stated in `README.md` and package metadata.
- Use TypeScript strict mode. Avoid `any`; if unavoidable at a library boundary, isolate and explain it.
- Use Phaser’s bundled Matter integration. Do not install a second Matter package without demonstrating a specific compatibility need.
- Prefer platform APIs and small focused dependencies. Justify every new runtime dependency.
- Never commit secrets, tokens, private URLs, local machine paths, generated browser profiles, or large unoptimised source files.
- Keep generated build output, test artefacts, coverage, and local caches out of version control unless the repository explicitly tracks them.
- Do not rewrite unrelated code, reformat the entire repository, or upgrade dependencies unless required by the assigned task.
- When changing package metadata, run installation and commit the updated lockfile.

### Expected scripts

Preserve or establish these scripts:

```text
npm run dev
npm run build
npm run preview
npm run lint
npm run format:check
npm run typecheck
npm test
npm run test:e2e
npm run validate:assets
```

If the repository is initially empty, scaffold it according to `README.md` before implementing gameplay. If a script cannot exist yet during the first scaffold, add a documented placeholder only if it exits successfully for an honest reason; never use a placeholder to conceal missing validation.

## Architecture rules

### Layering

Keep these concerns separate:

1. **Data:** immutable city, structure, material, power-tuning, and asset metadata.
2. **Simulation:** damage, constraints, physics queries, time scale, cleanup, and deterministic randomness.
3. **Presentation:** Phaser sprites, particles, lighting overlays, camera feedback, and audio playback.
4. **Application UI:** semantic HTML menus, buttons, dialogs, sliders, help, and accessible status text.
5. **Persistence:** versioned local preferences only.

Rendering code must not contain the authoritative damage formula. DOM components must not reach into Matter internals. City data must not hold live Phaser/Matter objects.

### Required interfaces

Use equivalent typed contracts even if names differ:

```ts
type CityId = 'delhi' | 'mumbai' | 'chennai' | 'bengaluru' | 'kochi' | 'kolkata';
type PowerId = 'alien' | 'earthquake' | 'meteor' | 'tornado' | 'volcano' | 'lightning';

type TargetPoint = Readonly<{ x: number; y: number }>;

type PowerContext = Readonly<{
  strength: number; // normalised, 0.25–2.0
  seed: number;
  timeScale: number;
}>;

interface DisasterPower {
  readonly id: PowerId;
  preview(target: TargetPoint, context: PowerContext): PowerPreview;
  activate(target: TargetPoint, context: PowerContext): PowerActivation;
  dispose(): void;
}
```

Do not force rendering or engine objects into pure domain types merely to match this example.

### City definitions

A city definition must provide, directly or by referenced data:

- stable ID and localised display name;
- hero landmark metadata;
- city-card thumbnail and attribution key;
- day and night palettes/backgrounds;
- parallax layers;
- foreground structures and pre-cut chunk definitions;
- collision/ground/water bounds;
- camera bounds and safe HUD region;
- ambience and optional city-specific audio keys;
- initial structural-integrity total;
- asset dependencies.

Adding a city should not require changing the implementation of a power. Adding a power should not require editing each city definition unless a city intentionally overrides material response data.

### Powers

- Each power implements the common lifecycle and owns cleanup for temporary bodies, timers, emitters, lights, and sounds.
- Use the selected target for every power. A moving power such as the tornado may drift after spawning, but the initial click/tap remains meaningful.
- Strength must have a monotonic, clamped effect. Keep visual shake/flash caps separate from physical force caps.
- Powers have unlimited gameplay use. A short input debounce or concurrency cap is allowed only to protect the simulation and must be visible/testable rather than disguised as a cooldown.
- Use bounded physics queries; never iterate unbounded over every body on every frame.
- Power randomness must accept a seed. Unit and browser tests must be able to request deterministic outcomes.

### Destruction

- Author buildings as convex chunks connected by constraints. Validate convexity and body count during asset processing or scene creation.
- Track integrity per structural chunk and/or constraint. Damage persists until Rebuild.
- Calculate destruction percentage from original versus remaining structural integrity, not pixels, body count, or debris count.
- Keep background layers non-interactive and exclude them from destruction calculations.
- Treat settled debris as simulation state. Do not remove meaningful visible debris merely to make tests easier.
- Pool cosmetic debris and particles separately from structural chunks.
- Apply sleeping, bounds cleanup, and caps deterministically.
- Rebuild must tear down the scene and recreate it from immutable data. It must not attempt to repair mutated live objects in place.

### Time and pause

- Centralise simulation time scale. Pause uses 0; slow motion uses 0.25; normal uses 1.
- Pause physics, power timers, particles, and simulation-driven audio together. UI remains responsive.
- Do not multiply arbitrary durations in scattered feature code. Use a shared simulation clock or engine time-scale abstraction.
- Clamp frame deltas after tab suspension. Pause nonessential work while the document is hidden.

### Day/night

- Day/night is presentation state, not a city rebuild.
- Preserve all physics bodies, damage, active debris, selected power, strength, time scale, and destruction percentage across the toggle.
- Swap palettes, backgrounds, window states, ambience, and lighting through a single city-theme interface.

### Audio

- Use separate master, music, ambience, SFX, and UI buses or an equivalent hierarchy.
- Never start audible playback before a user gesture.
- Missing or blocked audio must not break gameplay.
- Cap simultaneous impact voices and avoid stacking duplicate loops.
- Stop and release scene audio on city change and Rebuild.
- Persist preferences, not current playback position.

### State and persistence

Persist only small, versioned preferences such as:

- music and SFX volume/mute;
- master mute;
- last strength;
- reduced motion and reduced flash;
- optional last selected city or power if desired.

Do not persist destruction, debris, city state, scores, or user identifiers. Handle corrupt/old local-storage data by validating and falling back to defaults.

## Visual and interaction rules

- The attached screenshots are references for side view, scene readability, compact controls, and spectacle only.
- Create new UI composition, iconography, effects, building silhouettes, and textures.
- Do not use the screenshots in builds, tests, documentation previews, or marketing.
- Keep the central impact area clear of permanent UI.
- Make selected, hover, focus, disabled, and pressed states distinct.
- Use both icon and label/tooltip. Do not rely on colour alone.
- Distinguish camera drag from power activation with a movement threshold and pointer-capture strategy.
- Ensure touch targets are at least 44 by 44 CSS pixels.
- Recommend landscape on narrow portrait screens, but do not trap the user in an unusable page.

## Asset and licensing policy

Asset compliance is a release gate, not an afterthought.

### Allowed

- Original project artwork and audio.
- CC0/public-domain material.
- CC BY material with complete attribution.
- Specifically approved CC BY-SA or Free Art License files whose share-alike/copyleft requirements are understood and isolated to the affected asset/derivative.
- The custom-permission Mumbai source listed in `README.md`, only with the exact acknowledgement and restrictions preserved.
- Other freely reusable material only after explicit license review.

### Not allowed by default

- Assets with no identifiable license or author.
- “Free download” assets without reuse terms.
- Editorial-use-only, personal-use-only, NonCommercial, or NoDerivatives material.
- Assets copied from search-result previews, social posts, map/street-view services, stock-watermarked images, or the supplied screenshots.
- Hotlinked third-party files or runtime downloads from asset sites.
- AI-generated assets whose model/source terms or provenance cannot be recorded.
- Fonts without an embeddable web license.

### Required asset records

Every third-party file in the repository must have an entry in `public/assets/asset-manifest.json` with at least:

```json
{
  "id": "stable-machine-id",
  "localPath": "public/assets/...",
  "title": "Original asset title",
  "creator": "Credited creator",
  "sourcePage": "https://...",
  "originalFile": "https://...",
  "license": "CC BY 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
  "attribution": "Required display credit",
  "changes": "Cropped; colour adjusted",
  "retrieved": "YYYY-MM-DD",
  "sha256": "...",
  "usage": ["city-card-thumbnail"]
}
```

Rules:

- `sourcePage` must be the human-readable file page, not only the raw image URL.
- Store the license name and canonical license URL.
- Record changes even when the only change is resizing or format conversion.
- Generate or maintain `THIRD_PARTY_NOTICES.md` from the manifest; keep the output human-readable.
- Keep license/permission snapshots for custom terms where practical.
- For share-alike assets, mark derivatives explicitly and keep source/editable files where the license requires them.
- Do not imply that a photographer, government, or platform endorses the game.
- If license facts conflict or are unclear, do not ship the asset. Substitute original/CC0 material or ask the project owner.

### Source photos and gameplay art

The city photos named in `README.md` may be used as references and, after verification, as thumbnails. Gameplay art must be an original stylised interpretation assembled from multiple factual references; do not trace a single photo or reproduce its exact crop, texture, lighting, or composition.

A landmark’s general architectural appearance may be represented, but decorative detail should be simplified. Surrounding structures must be fictional. Keep the treatment playful and non-realistic.

### Audio sourcing

- Prefer original, CC0, or CC BY audio.
- Verify each Freesound/OpenGameArt item individually; a site-wide reputation is not a file license.
- Preserve creator, file-page URL, license, and modification notes.
- Normalisation, trimming, layering, pitch changes, and format conversion count as modifications.
- Do not use a track merely because it is streamable or downloadable.

## Accessibility requirements

Treat accessibility regressions as functional defects.

- Menus and HUD controls must be semantic HTML where practical and keyboard operable.
- Canvas-only information needed to operate the game must be mirrored in accessible HTML/status text.
- Use visible focus styles and logical focus order.
- Provide accessible names for icon buttons and current-value text for sliders/toggles.
- Announce city changes, pause state, selected power, strength, and Rebuild completion without announcing every debris collision.
- Honour `prefers-reduced-motion` and expose a persistent reduced-motion override.
- Provide a persistent reduced-flash option. Avoid rapid full-screen luminance changes.
- Test day and night contrast for UI text and controls.
- The game must remain usable with audio muted, unavailable, or blocked.
- Avoid preventing browser zoom and standard browser gestures outside the gameplay surface.

## Performance rules

Use the budgets in `README.md` as release gates.

- Profile production builds on at least one desktop and one representative mobile viewport/device class.
- Pool high-frequency cosmetic objects.
- Reuse materials/textures and atlas compatible sprites where sensible.
- Limit physics-body, particle, decal, light, and audio-voice counts centrally.
- Prefer coarse bounded queries and spatial filters over scanning all bodies.
- Do not allocate large arrays or temporary objects in per-frame loops without measured justification.
- Put stable bodies to sleep; wake only when affected.
- Dispose event listeners, timers, observers, textures created at runtime, emitters, and audio nodes on scene teardown.
- Add diagnostic counters in development mode for active bodies, constraints, particles, sounds, and pooled objects. Exclude or disable verbose diagnostics in production.

A performance optimisation must not make destruction visibly disappear without a documented significance rule.

## Testing expectations

### Unit tests

Cover pure logic, including:

- strength normalisation and clamping;
- distance falloff and material resistance;
- accumulated damage and constraint break thresholds;
- destruction-percentage calculation and rounding;
- deterministic seeded random sequences;
- preference validation/migration;
- city/power ID parsing and exhaustive mappings;
- body/particle cap decisions and debris significance rules.

Use fixed fixtures and avoid real timers where a controllable clock is possible.

### Integration tests

Cover engine-level behaviour with deterministic seeds, including:

- loading every city definition and its required assets;
- spawning every structure without invalid convex polygons or missing constraints;
- activating every power at minimum, default, and maximum strength;
- cumulative damage across different powers;
- pause, resume, slow motion, and tab-suspension delta clamping;
- day/night preservation of damaged state;
- Rebuild restoring initial integrity and resource counts;
- city teardown releasing timers, listeners, bodies, emitters, and audio;
- asset manifest validation and third-party notice generation.

Do not assert exact free-running physics coordinates after long simulations. Assert bounded outcomes, state transitions, body counts, integrity ranges, and deterministic snapshots at controlled steps.

### End-to-end tests

Use Playwright for the user-visible contract:

1. App loads and city cards for all six cities are present.
2. Each city can be entered and changed without a reload.
3. A power can be selected by pointer and keyboard, strength changed, and a target activated.
4. Destruction percentage increases after a deterministic damaging action.
5. Pause freezes the simulation and resume restarts it.
6. Slow motion changes the exposed time-scale state and visible simulation rate.
7. Day/night changes presentation without resetting damage.
8. Rebuild returns destruction to 0% and restores intact structures.
9. Music/SFX/master mute controls persist after reload.
10. Reduced-motion and reduced-flash preferences apply.
11. HUD controls remain reachable and unobscured at supported desktop and mobile viewports.
12. No uncaught page errors, failed same-origin asset requests, or serious accessibility violations occur in the tested flow.

Use stable test hooks or public state adapters in non-production test builds. Do not select elements by transient CSS classes or pixel colour.

### Visual tests

Maintain a small set of deterministic screenshots for:

- city selection;
- each city at intact day and intact night;
- one representative damaged scene;
- desktop and mobile-landscape HUD;
- reduced-motion/reduced-flash state where visually relevant.

Mask nondeterministic particle regions or freeze the simulation at a known seeded step. A visual diff is not proof of correct physics or accessibility.

### Manual checks

Before a release, manually verify:

- mouse, touch, and keyboard flows;
- current Chrome, Edge, Firefox, and Safari targets from `README.md`;
- audio unlock, background-tab behaviour, and mute persistence;
- repeated city changes and Rebuild operations;
- performance under maximum-strength repeated disasters;
- portrait fallback/landscape recommendation;
- third-party credits and license links.

Document untested browsers or devices honestly.

## Definition of done

A feature is done only when all relevant conditions hold:

- behaviour matches `README.md` and the task;
- TypeScript types are strict and public contracts are documented;
- tests cover happy paths, boundaries, and cleanup;
- affected end-to-end flows pass;
- accessibility remains intact;
- production build succeeds;
- no new console errors, unhandled promises, or failed asset loads occur;
- performance counters stay within documented caps or a measured exception is recorded;
- every new third-party asset has a complete manifest entry and notice;
- obsolete assets/code/tests are removed only when verified unused;
- the change summary lists what changed, what was tested, and any known limitation.

## Required validation before handoff

Run the commands appropriate to the change. For a normal feature handoff, run all of:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run validate:assets
npm run build
```

If a command fails because the repository has not yet reached the stage at which the script exists, implement the missing honest validation as part of the scaffold. If an external environment prevents a check, report the exact command, failure, and remaining risk; do not mark it as passing.

## Change discipline

- Keep commits and patches focused. Avoid mixing dependency upgrades, broad refactors, and feature work.
- Preserve public behaviour unless the task asks to change it.
- Update `README.md` when product behaviour, controls, setup, supported browsers, performance budgets, or milestone status changes.
- Update this file only when agent-wide implementation rules change.
- Update tests in the same change as behaviour.
- Update the asset manifest and notices in the same change as assets.
- Use comments for rationale and invariants, not to narrate obvious code.
- Prefer names from the product vocabulary: city, structure, chunk, integrity, constraint, debris, power, strength, target, Rebuild, time scale.
- Use “Bengaluru” in player-facing copy; “bangalore” may remain an alias for file discovery, migration, or search.

## Error handling and resilience

- Show a clear recoverable error if a city asset fails to load; allow return to city selection and retry.
- Validate city and asset data at load time in development and tests.
- If WebGL/canvas/required browser support is unavailable, show an accessible unsupported-browser message rather than a blank canvas.
- Treat optional audio failures as nonfatal.
- Guard storage access and fall back to in-memory defaults.
- Prevent duplicate power activations caused by a single pointer event passing through both DOM and canvas layers.
- Ensure teardown is idempotent so Rebuild and city change cannot double-dispose resources.

## Security and privacy

- No analytics, tracking, fingerprinting, advertising SDKs, or remote logging.
- Do not collect user data.
- Do not inject unsanitised strings into HTML.
- Keep dependencies current enough to avoid known high-severity vulnerabilities, but do not perform unrelated upgrades.
- Production builds must not expose source maps publicly unless the deployment policy explicitly allows them.
- Do not load executable code, images, audio, fonts, or configuration from untrusted remote origins at runtime.

## Implementation sequence

Unless the assigned task states otherwise, work in this order:

1. repository scaffold, scripts, strict typing, formatting, and test harness;
2. semantic app shell, city selection, responsive HUD, settings, and accessibility foundations;
3. deterministic simulation interfaces and one simple breakable-building fixture;
4. Mumbai vertical slice with original Gateway-inspired landmark, meteor, earthquake, destruction percentage, and Rebuild;
5. remaining powers and central time/audio/particle/debris systems;
6. day/night and all required controls;
7. remaining five cities through data-driven definitions;
8. art/audio polish, performance tuning, full asset audit, browser matrix, and release packaging.

Do not postpone asset records, accessibility, cleanup, or tests until the final milestone; establish them in the first feature that needs them.

## Handoff format

At the end of an implementation task, provide a concise report containing:

- **Implemented:** user-visible and architectural changes.
- **Validated:** exact commands and relevant manual/browser checks that passed.
- **Assets:** new or changed third-party assets and their manifest/notice status.
- **Limitations:** known issues, deferred in-scope work, or checks not run, with reasons.

Do not describe planned work as completed.
