# CitySmashIndia

A browser-based, side-view city-destruction sandbox set in stylised versions of six Indian cities. The player chooses a city, selects a disaster power, and clicks or taps the scene to unleash it. There are no missions, scores, lives, win states, or loss states: the purpose is playful experimentation with physics, destruction, sound, and spectacle.

> **Status:** Product and setup specification. This repository is intended to be implemented with Codex; this document does not imply that the game already exists.

## Product summary

| Item | Decision |
| --- | --- |
| Platform | Modern web browsers; responsive desktop, tablet, and mobile landscape layouts |
| Presentation | 2D/2.5D side view inspired by the supplied screenshots |
| Cities | Delhi, Mumbai, Chennai, Bengaluru (Bangalore), Kochi, and Kolkata |
| Core interaction | Select a power, then click or tap a target location |
| Powers | Alien attack, earthquake, meteor, tornado, volcano, and lightning |
| Destruction | Buildings fracture into chunks; chunks fall, collide, settle, and form debris |
| Game mode | Pure sandbox with unlimited powers and no winning or losing |
| Feedback | Optional destruction percentage, effects, camera response, sound, and music |
| Required controls | Rebuild, pause, slow motion, day/night, music/SFX mute, and strength adjustment |
| Content tone | Spectacular environmental destruction without people, casualties, gore, or suffering |

## Product goals

1. Make each city recognisable at a glance through one hero landmark, a characteristic setting, and an otherwise fictional skyline.
2. Make every power feel mechanically and visually distinct while retaining a common select-and-target interaction.
3. Produce satisfying cumulative destruction using stable, performant 2D rigid-body physics.
4. Let the player experiment without resource limits, objectives, timers, or failure states.
5. Work with mouse, touch, and keyboard-assisted controls in current evergreen browsers.
6. Treat licensing and attribution as first-class build requirements.

## Non-goals for the first release

- A geospatially accurate recreation of any city.
- Photorealism, a movable 3D camera, first-person play, or a fully simulated structural engineering model.
- People, animals, vehicles with occupants, casualties, gore, emergency response, or political/religious messaging.
- Missions, scores, achievements, progression, unlocks, accounts, multiplayer, ads, purchases, or leaderboards.
- Server-side gameplay, persistent cloud saves, user-generated content, or runtime asset downloads.
- Tsunamis, floods, missiles, black holes, nuclear weapons, or powers other than the six listed above.

## Experience and player flow

1. **Load:** show a lightweight loading screen and initialise audio only after user input, as required by browser autoplay rules.
2. **Choose a city:** show six city cards with a name, a legally cleared thumbnail or original illustration, and a short visual descriptor.
3. **Enter sandbox:** load a side-on city scene with a compact HUD that does not block the target area.
4. **Choose a power:** select one of six power buttons. The selected state must be obvious by colour, outline, icon, and text/tooltip—not colour alone.
5. **Set strength:** choose 25%–200%; default to 100%. Strength affects damage, force, radius, duration, and audiovisual intensity within safe caps.
6. **Target:** click or tap a valid scene location. A short target preview may show the approximate area of effect.
7. **Observe and continue:** damage persists, disasters may combine, and powers remain unlimited. A short technical rate limit may prevent physics overload but must not behave as a gameplay cooldown.
8. **Control time and presentation:** pause, play, toggle 0.25× slow motion, change day/night, and mute music or sound effects independently.
9. **Rebuild:** restore the original version of the current city, its original time-of-day setting, intact structures, and a destruction value of 0%.
10. **Change city:** return to city selection without requiring a page refresh.

## Visual direction

The attached screenshots are **visual references only**. Do not copy, trace, extract, recolour, or ship their artwork, icons, UI, effects, layouts, or other assets.

Use the following high-level qualities from the references:

- fixed or gently panning side-on camera;
- clear ground line and readable building silhouettes;
- layered sky, distant skyline, active structures, ground, and underground/foreground strata;
- a compact edge-aligned power palette;
- high-contrast impact effects, dust, smoke, sparks, fire, and falling debris;
- obvious day and night treatments;
- restrained camera shake and short hit-stop/slow-motion emphasis for major impacts.

Create an original interface, icon set, skyline composition, colour palette, and effects treatment. The scene should read like a stylised diorama rather than a photograph with effects painted on top.

### Scene composition

Each city contains:

- one **hero landmark** that is immediately recognisable and destructible;
- five to nine fictional foreground buildings with varied height, material, and fracture patterns;
- two or three non-destructible parallax background layers;
- city-specific ground, vegetation, water, signage shapes, and atmosphere;
- one continuous physics ground/collision boundary, with additional boundaries where the scene requires water or a waterfront edge.

The landmark may be simplified for readability and performance. It must not reproduce a source photograph’s exact composition, lighting, texture, or camera angle. Surrounding buildings must be fictional.

## City art briefs

| City | Hero landmark | Original scene brief | Day/night cues |
| --- | --- | --- | --- |
| Delhi | India Gate | Broad ceremonial avenue, warm sandstone tones, trees and low civic blocks with a fictional modern skyline behind | Hazy amber day; deep-blue night with restrained monument lighting |
| Mumbai | Gateway of India | Waterfront foreground, Gateway silhouette, sea wall, palms, ferries as distant non-interactive shapes, and dense fictional towers | Humid coastal daylight; warm harbour lights and reflected moonlight |
| Chennai | Chennai Central station façade and clock tower | Red-brick landmark, rail/road edge, tropical trees, and fictional mid-rise commercial blocks | Hot, bright daylight; sodium-warm station lighting at night |
| Bengaluru | Vidhana Soudha | Monumental civic foreground, tree canopy, broad road, and fictional technology-district towers in the distance | Soft green/blue day; cooler night with window clusters |
| Kochi | Chinese fishing nets | Low-rise waterfront, destructible timber fishing-net rigs, tiled-roof fictional buildings, palms, and harbour silhouettes | Golden coastal day; sunset/night reflections and sparse harbour lights |
| Kolkata | Victoria Memorial | Marble landmark, lawns and water edge, tram-wire silhouettes, and fictional colonial/modern mixed blocks | Humid pale day; softly lit memorial and warm street lighting |

Use “Bengaluru” in the in-game UI, with “Bangalore” accepted as a search or internal alias.

## Selected public-source image references

These files are selected as visual-reference and city-card-thumbnail candidates. They are **not gameplay art**. Before adding any source file or derivative to the repository, re-check the live file page, download the original from that page, and record its author, source URL, license URL, required credit, modifications, local path, and SHA-256 checksum in the asset ledger.

| City | Selected source | Author/credit | License and use notes |
| --- | --- | --- | --- |
| Delhi | [India Gate in New Delhi 03-2016.jpg](https://commons.wikimedia.org/wiki/File:India_Gate_in_New_Delhi_03-2016.jpg) | A.Savin; required credit stated on the file page: “A.Savin, Wikipedia” | Free Art License 1.3. Attribution and copyleft conditions apply to reuse and adaptations. |
| Mumbai | [Gateway of India aerial view.jpg](https://commons.wikimedia.org/wiki/File:Gateway_of_India_aerial_view.jpg) | Government of Maharashtra | The file page permits reuse for any purpose with proper attribution and requires accurate, non-derogatory, non-misleading use and prominent source acknowledgement. This is a custom attribution permission, not a standard Creative Commons license; retain a snapshot of the terms. |
| Chennai | [Chennai Central Station panorama.jpg](https://commons.wikimedia.org/wiki/File:Chennai_Central_Station_panorama.jpg) | PlaneMad/Wikimedia | CC BY-SA 3.0. Credit the author, link the file page and license, identify changes, and preserve share-alike obligations for adapted image files. |
| Bengaluru | [Vidhana Souda, Bangalore.jpg](https://commons.wikimedia.org/wiki/File:Vidhana_Souda_,_Bangalore.jpg) | Bikashrd (Bikash Raman Das) | CC BY-SA 4.0. Credit, license link, change notice, and share-alike apply to adaptations. |
| Kochi | [Kochi, Chinese fishing nets, Kerala, India.jpg](https://commons.wikimedia.org/wiki/File:Kochi,_Chinese_fishing_nets,_Kerala,_India.jpg) | Vyacheslav Argenberg | CC BY 4.0. Credit, license link, and change notice are required. |
| Kolkata | [Victoria Memorial, Monument, Kolkata, India.jpg](https://commons.wikimedia.org/wiki/File:Victoria_Memorial,_Monument,_Kolkata,_India.jpg) | Vyacheslav Argenberg | CC BY 4.0. Credit, license link, and change notice are required. |

Recommended default: use these images as internal visual references and, only after license review, as unmodified or minimally cropped selection-screen thumbnails. Create gameplay landmarks and skylines as original vector/raster artwork. Cropping, colour correction, or overlaying text may create an adaptation, so the asset ledger and third-party notices must identify those changes.

Useful licensing references:

- [Wikimedia Commons: Reusing content outside Wikimedia](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/en)
- [Creative Commons license chooser and license texts](https://creativecommons.org/share-your-work/cclicenses/)
- [Free Art License 1.3](https://artlibre.org/licence/lal/en/)

### Other allowed asset sources

- [Kenney](https://kenney.nl/assets): suitable for CC0 interface, effects, prototype, or audio assets; verify the license included with each pack.
- [Freesound](https://freesound.org/help/faq/): use only individually verified CC0 or CC BY sounds. Record the uploader and sound-page URL. Do not use NonCommercial, NoDerivatives, Sampling+, or unclear licenses.
- [OpenGameArt](https://opengameart.org/content/faq): a discovery source only. Verify every item separately; prefer CC0 or CC BY. Avoid copyleft or ambiguous assets unless the project owner explicitly accepts their obligations.

Do not hotlink assets. Vendor approved assets into the repository and make the production build work offline after initial load.

## Powers

All powers use the same select-then-target model but have distinct mechanics. Strength is normalised to `0.25–2.0`, with an in-game display of `25%–200%`.

### Alien attack

- A UFO or alien craft appears above the target and fires a short energy beam or pulse.
- Applies focused thermal/impact damage, then a small radial impulse.
- The effect should be precise and readable, with a brief telegraph and no depiction of occupants.

### Earthquake

- The target sets the epicentre; the effect propagates through the ground across a strength-dependent radius.
- Applies oscillating horizontal and vertical impulses to grounded structures, weakens joints, and generates dust and cracks.
- Camera shake is visual only and must be capped separately from physics force.

### Meteor

- A meteor enters from above and impacts the selected point.
- Produces direct impact damage, a radial blast, ground debris, a dust plume, and optional cosmetic crater decal.
- The projectile must not leave the playable physics bounds indefinitely.

### Tornado

- A vortex spawns at the selected point, drifts a short deterministic distance, and expires.
- Applies inward and upward forces to nearby loose chunks and damaged structures.
- Use a capped body query and force budget to avoid destabilising the simulation.

### Volcano

- A temporary vent/fissure emerges at the selected point rather than permanently changing the city map.
- Ejects a capped number of rocks and lava particles; applies heat and impact damage in pulses.
- The cone/fissure is a stylised effect. Lava particles use pooling and expire.

### Lightning

- A targeted bolt strikes the selected location, followed by a small impulse and electrical/heat damage.
- The bolt path may be procedurally jittered from a deterministic seed.
- Limit intense flashes and provide a reduced-flash accessibility setting.

## Destruction and physics specification

Use Phaser 3 with its Matter physics integration. Buildings are authored as assemblies of pre-cut convex chunks connected by constraints; do not attempt arbitrary per-pixel runtime fracturing in the first release.

Each structural chunk has:

- material: masonry, concrete, glass, steel, timber, or ground;
- mass and friction appropriate to the material;
- current and maximum integrity;
- one or more constraints to parent/adjacent chunks;
- visual damage states;
- collision category and cleanup policy.

Damage combines a power-specific base value with distance falloff, strength, material resistance, and prior weakening. When a chunk or constraint crosses its threshold, it detaches and becomes a dynamic rigid body. Repeated attacks accumulate damage. Interactions are emergent: for example, an earthquake can weaken a tower before a meteor hits it, and a tornado can lift chunks created by a previous attack.

### Destruction percentage

Display an integer percentage from 0% to 100%:

```text
destruction = round(100 × (1 − remainingStructuralIntegrity / initialStructuralIntegrity))
```

- Include all foreground structures and the hero landmark.
- Exclude debris, particles, background art, cosmetic decals, water, and ground.
- Calculate from integrity, not from the number of active physics bodies.
- Update at most four times per second and animate the displayed value for readability.
- Destruction percentage is feedback only and never ends the session.

### Stability and cleanup

- Use object pools for dust, sparks, smoke, lava, and small debris.
- Cap active dynamic chunks, particles, audio voices, and long-lived decals.
- Put settled off-screen or tiny debris to sleep; remove only debris that is outside bounds or below a documented significance threshold.
- Never silently restore a damaged building except through Rebuild.
- Use a fixed physics step and clamp long frame deltas after tab suspension.
- Seed cosmetic randomness so tests can reproduce disasters.

## Controls and HUD

### Pointer/touch

- Tap/click a power to select it.
- Tap/click the city to activate at that location.
- Drag only when the camera supports limited horizontal panning; dragging must never accidentally activate a power.

### Keyboard

| Key | Action |
| --- | --- |
| `1`–`6` | Select alien, earthquake, meteor, tornado, volcano, or lightning |
| `Space` | Pause/resume |
| `S` | Toggle 0.25× slow motion |
| `D` | Toggle day/night |
| `R` | Rebuild after confirmation or a two-step safety interaction |
| `M` | Mute/unmute all audio |
| `[` / `]` | Decrease/increase strength |
| `Esc` | Close dialog or return focus to the HUD |

### Required HUD elements

- current city and destruction percentage;
- six labelled power buttons;
- strength slider with numeric percentage;
- pause/play and slow-motion controls;
- day/night toggle;
- separate music and SFX mute controls plus a master mute shortcut;
- Rebuild and Change City actions;
- concise tooltip/help overlay and visible keyboard focus.

The HUD may reflow between desktop and mobile but must not cover the central impact zone. Mobile uses a bottom tray or expandable side tray and recommends landscape orientation.

## Audio

- Separate buses for music, ambience, SFX, and UI; expose music and SFX mute controls and a master mute shortcut.
- Start audio only after a user gesture and remember volume/mute preferences in local storage.
- Use a small number of layered variations per power to reduce repetition.
- Limit simultaneous voices and duck music briefly for major impacts.
- Day/night may change ambience but must not automatically unmute anything.
- The game must remain fully playable with audio disabled or unavailable.

## Accessibility and comfort

- All HUD controls must be keyboard reachable and have accessible names.
- Provide text labels or tooltips for icons and never rely on colour alone.
- Respect `prefers-reduced-motion` by reducing camera shake, parallax, hit-stop, and large screen-space movement.
- Provide a reduced-flash option; lightning and explosions must avoid rapid full-screen flashes.
- Preserve legible contrast against both day and night scenes.
- Do not place essential instructions only inside the canvas; mirror them in accessible HTML.
- Support browser zoom without clipping core controls.

## Technical specification

### Recommended stack

- **Language:** TypeScript with strict mode.
- **Runtime/game framework:** Phaser 3.
- **Physics:** Phaser’s bundled Matter integration; do not install a second incompatible Matter version.
- **Build tooling:** Vite.
- **UI:** semantic HTML/CSS overlay for menus and controls; Phaser canvas for gameplay.
- **Unit/integration tests:** Vitest.
- **Browser tests:** Playwright.
- **Code quality:** ESLint and Prettier.
- **Package manager:** npm with a committed `package-lock.json`.
- **Runtime services:** none required for v1.

### Browser support

Target the latest two stable versions of Chrome, Edge, Firefox, and Safari, including current iOS Safari and Android Chrome. WebGL is preferred; the game must show a clear unsupported-browser message if required capabilities are unavailable.

### Suggested repository structure

```text
.
├── AGENTS.md
├── README.md
├── THIRD_PARTY_NOTICES.md        # created when the first external asset is added
├── package.json
├── package-lock.json
├── public/
│   └── assets/
│       ├── audio/
│       ├── cities/
│       ├── effects/
│       ├── ui/
│       └── asset-manifest.json
├── src/
│   ├── main.ts
│   ├── app/
│   │   ├── preferences.ts
│   │   └── accessibility.ts
│   ├── game/
│   │   ├── config.ts
│   │   ├── scenes/
│   │   ├── cities/
│   │   ├── powers/
│   │   ├── destruction/
│   │   ├── systems/
│   │   └── types/
│   ├── ui/
│   └── styles/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── tools/
    └── validate-assets.mjs
```

### Architecture rules

- Keep city definitions data-driven. A city config references layers, structures, landmark metadata, ambience, thumbnail, and default camera bounds.
- Implement powers behind a common interface such as `preview(target)`, `activate(target, strength, context)`, and `dispose()`.
- Keep damage calculation independent of rendering so it can be unit tested.
- Keep time scale, audio, particles, debris, preferences, and day/night state in focused systems rather than scene-specific globals.
- HTML UI dispatches typed commands to the game; gameplay publishes typed state snapshots to the UI.
- Rebuild destroys the current sandbox scene and constructs a fresh one from immutable city data.
- Do not store Phaser/Matter objects in serialised city configuration.

## Local setup

### Prerequisites

- Node.js 22 or a newer active LTS release.
- npm 10 or later.
- A browser supported by Playwright for end-to-end testing.

### Initialise an empty repository

Run these commands only if the repository has not yet been scaffolded:

```bash
npm create vite@latest . -- --template vanilla-ts
npm install phaser
npm install -D vitest @playwright/test eslint prettier typescript
npx playwright install
```

Then add the scripts described below and commit the generated lockfile.

### Expected commands

```bash
npm install              # install exactly from package metadata
npm run dev              # start the Vite development server
npm run build            # type-check and produce a production build
npm run preview          # serve the production build locally
npm run lint             # run ESLint
npm run format:check     # verify formatting
npm run typecheck        # run TypeScript without emitting
npm test                 # run Vitest unit/integration tests
npm run test:e2e         # run Playwright browser tests
npm run validate:assets  # validate asset manifest and attribution data
```

`npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run validate:assets` are release gates.

## Performance budgets

Measure using production builds, not the development server.

- Target 60 FPS on a typical recent desktop and a stable 30 FPS or better on a representative mid-range mobile device.
- Keep initial compressed transfer below 8 MB, excluding optional city packs; prefer loading one city at a time.
- Keep active dynamic rigid bodies at or below 250 by default and particles at or below 600; tune lower on mobile.
- Keep a single city’s authored structural chunks at or below 160 before disaster-created cosmetic debris.
- Avoid main-thread tasks longer than 50 ms during normal interaction.
- Rebuild the current city within 2 seconds on target desktop hardware and within 4 seconds on the representative mobile device.
- Pause physics and nonessential animation when the document is hidden.

Budgets may be changed only with a measured reason recorded in the pull request or project notes.

## Testing and acceptance criteria

The first release is acceptable when:

1. All six cities can be selected and each has its specified hero landmark plus fictional surrounding buildings.
2. Every city loads without console errors and can be rebuilt repeatedly without increasing active bodies/listeners after settling.
3. All six powers can be selected and targeted with mouse and touch, produce distinct effects, and damage compatible structures.
4. Damage accumulates; detached chunks fall, collide, settle, and remain as debris within performance caps.
5. Destruction percentage begins at 0%, increases after damage, never determines a win/loss state, and returns to 0% after Rebuild.
6. Pause stops simulation; 0.25× slow motion changes physics and effects consistently; resuming restores the prior selected power and strength.
7. Day/night changes visuals without rebuilding or changing damage.
8. Music, SFX, and master mute work and persist locally.
9. Strength from 25% to 200% produces monotonic, capped changes in force/radius/damage.
10. Keyboard focus, accessible names, reduced-motion behaviour, and reduced-flash behaviour pass their tests.
11. The production build passes unit, integration, end-to-end, asset-validation, lint, format, and type checks.
12. Every shipped third-party asset appears in `asset-manifest.json` and `THIRD_PARTY_NOTICES.md`, with no copied screenshot content or hotlinks.

## Delivery milestones

1. **Foundation:** Vite/TypeScript/Phaser scaffold, semantic UI shell, preferences, responsive layout, and empty city scene.
2. **Vertical slice:** Mumbai with an original Gateway of India-inspired landmark, fictional buildings, meteor and earthquake, destruction percentage, rebuild, and test harness.
3. **Core systems:** all six powers, time controls, strength, day/night, audio buses, pooling, cleanup, and accessibility settings.
4. **City production:** add Delhi, Chennai, Bengaluru, Kochi, and Kolkata through data-driven city definitions.
5. **Polish:** art/effects/audio pass, device tuning, full asset audit, browser matrix, and release build.

The vertical slice is an implementation order, not a reduced final scope: v1 includes all six cities and all six powers.

## Assumptions adopted

- The game is single-player and free-form, with unlimited power use.
- Landmarks are stylised, destructible structures; their treatment is playful and non-realistic.
- The game contains no visible people or living creatures.
- The default camera is fixed; limited horizontal panning is allowed only if required for responsive composition.
- Sessions are ephemeral. Only preferences—not city damage—persist across reloads.
- Gameplay works offline after the production bundle and selected city assets have loaded.
- English is the initial UI language; strings must be centralised so localisation can be added later.
- Original gameplay artwork is preferred over direct photo-derived art. Public-source photos are reference and thumbnail candidates with their licenses preserved.

## License for project code

No project-code license is assumed by this specification. Add a root `LICENSE` file only after the project owner chooses one. Third-party assets retain their own licenses regardless of any future code license.
