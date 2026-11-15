import Phaser from "phaser";
import { icon } from "./app/icons";
import { cities, type City } from "./game/cities";
import { CityScene, type Controls } from "./game/scene";
import { powers, preferences, type PowerId } from "./game/domain";
import { AudioSystem } from "./app/audio";
import "./style.css";
let stored: string | null = null;
try {
  stored = localStorage.getItem("citysmash.preferences");
} catch {
  /* Private browsing may restrict storage. */
}
const prefs = preferences(stored);
const audio = new AudioSystem(prefs);
const controls: Controls = {
  paused: false,
  slow: false,
  night: false,
  strength: prefs.strength,
  power: "meteor",
  motion: prefs.motion,
  flash: prefs.flash,
};
const labels: Record<PowerId, string> = {
  alien: "Alien attack",
  earthquake: "Earthquake",
  meteor: "Meteor",
  tornado: "Tornado",
  volcano: "Volcano",
  lightning: "Lightning",
};
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header class="mast"><a href="#" id="home" aria-label="CitySmashIndia home"><span class="brand-mark">C<span>↘</span></span>CitySmash<span class="brand-light">India</span></a><span class="tagline">A little chaos. Entirely yours.</span><button id="help">How to play <span>?</span></button></header>
<main><section id="selection"><div class="intro"><div><h1>Six cities.<br><em>Infinite possibilities.</em></h1><p>A skyline to admire. A world to take apart.<br>Choose your city and let curiosity do the rest.</p></div><div class="intro-note"><span>01 — 06</span><p>Original city dioramas<br>Unlimited destruction<br>No objectives. Just experiment.</p></div></div><div class="city-grid">${cities.map((c, i) => `<button class="city-card" data-city="${c.id}" aria-label="Explore ${c.name}"><div class="city-art city-${c.id}"><svg viewBox="0 0 360 170" aria-hidden="true"><circle cx="280" cy="47" r="24" fill="#fff0c8"/><path d="M0 150V100H25V80H45V130H64V65H92V118H117V92H145V150M220 150V90H250V53H275V120H300V80H328V110H360V170H0Z" fill="#587b80" opacity=".3"/>${thumbnail(c)}</svg><span class="city-index">0${i + 1}</span><span class="explore">Explore →</span></div><div class="city-copy"><h2>${c.name}</h2><span>${c.landmark}</span><p>${c.description}</p></div></button>`).join("")}</div><footer>Built for curiosity. <span>Original artwork · No people. No scores. No limits.</span></footer></section>
<section id="sandbox" hidden><div class="scene-heading"><div><button id="change">← Cities</button><h1 id="city-name"></h1><p id="landmark"></p></div><div class="integrity"><strong id="destruction">0%</strong><span>DESTRUCTION</span><div><i id="damage-bar"></i></div></div></div><div class="game-wrap"><div id="game" aria-label="Destructible city scene" role="img"></div><p class="scene-instruction" id="instruction">Select a power, then click or tap the city</p><span id="paused-label" hidden>Simulation paused</span><div class="scene-signature">CITYSMASH INDIA <span>·</span> <span id="theme-label">DAYLIGHT</span></div></div><div class="power-bar" role="group" aria-label="Disaster powers">${powers.map((p, i) => `<button data-power="${p}" title="${i + 1}: ${labels[p]}" aria-pressed="${p === controls.power}"><span class="power-icon">${icon(p)}</span><span>${labels[p]}</span><kbd>${i + 1}</kbd></button>`).join("")}</div><div class="tools"><label class="strength">Strength <input id="strength" type="range" min="25" max="200" step="5" value="${prefs.strength * 100}"><output id="strength-value">${prefs.strength * 100}%</output></label><div class="time-tools"><button id="pause" aria-pressed="false">Pause</button><button id="slow" aria-pressed="false">¼× Slow</button><button id="night" aria-pressed="false">Night</button></div><div class="audio-tools"><button id="music" aria-pressed="${prefs.music}">Music</button><button id="sfx" aria-pressed="${prefs.sfx}">SFX</button><button id="master" aria-pressed="${prefs.master}">Audio</button></div><button id="rebuild" class="rebuild">↺ Rebuild</button></div><p class="orientation">Best enjoyed in landscape. Rotate for a wider skyline.</p></section></main>
<dialog id="help-dialog"><button id="close-help" aria-label="Close help">×</button><h2>Make a little chaos.</h2><p>Select a power, adjust its strength, then click or tap a scene location. Damage accumulates. Rebuild starts fresh.</p><dl><dt>1–6</dt><dd>Select a power</dd><dt>Space / S</dt><dd>Pause / slow motion</dd><dt>D / R / M</dt><dd>Day & night / rebuild / master mute</dd><dt>[ / ]</dt><dd>Adjust strength</dd></dl><label><input id="motion" type="checkbox" ${!prefs.motion ? "checked" : ""}> Reduce motion</label><label><input id="flash" type="checkbox" ${prefs.flash ? "checked" : ""}> Reduce flashes</label><p class="muted">All art and audio are original procedural creations. No people or living creatures are depicted.</p></dialog><dialog id="reset-dialog"><h2>Rebuild the city?</h2><p>This clears every disaster and restores the original skyline.</p><div class="dialog-actions"><button id="cancel-reset">Keep exploring</button><button id="confirm-reset">Rebuild city</button></div></dialog><p id="status" class="sr-only" role="status" aria-live="polite"></p>`;
function thumbnail(c: City) {
  if (c.id === "kochi")
    return '<path d="M125 150V55L224 103L125 92M225 150V65L304 109L225 100" fill="none" stroke="#695b46" stroke-width="5"/><path d="M15 150V128L55 104L95 128V150" fill="#ad7155"/>';
  if (c.id === "mumbai" || c.id === "delhi")
    return '<path d="M123 150V75H237V150H208V112Q180 74 152 112V150ZM113 75V60H247V75M137 60V43H223V60" fill="#c5a077"/><path d="M119 150V85M241 150V85" stroke="#e3c89d" stroke-width="9"/>';
  return `<path d="M95 150V105H265V150H95M160 110V67H200V110M87 105V84H112V105M248 105V84H273V105" fill="${c.id === "chennai" ? "#b56e58" : "#d7ceaf"}"/><path d="M153 67Q180 20 207 67M81 84L100 62L119 84M241 84L260 62L279 84" fill="${c.id === "chennai" ? "#8c5149" : "#bfb699"}"/>`;
}
function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}
function announce(s: string) {
  el("status").textContent = s;
}
function save() {
  try {
    localStorage.setItem("citysmash.preferences", JSON.stringify(prefs));
  } catch {
    /* Retain in-memory preferences. */
  }
}
let game: Phaser.Game | undefined,
  scene: CityScene | undefined,
  current: City | undefined;
function start(city: City) {
  audio.unlock();
  audio.clear();
  current = city;
  controls.paused = false;
  controls.slow = false;
  controls.night = false;
  sync();
  el("selection").hidden = true;
  el("sandbox").hidden = false;
  el("city-name").textContent = city.name;
  el("landmark").textContent = city.landmark;
  scene = new CityScene(
    city,
    controls,
    (v) => {
      el("destruction").textContent = `${v}%`;
      el("damage-bar").style.width = `${v}%`;
    },
    (p) => audio.effect(p, controls.strength),
  );
  if (game) {
    game.scene.remove("City");
    game.scene.add("City", scene, true);
  } else
    try {
      game = new Phaser.Game({
        // Canvas avoids software-WebGL overhead for this entirely vector 2D scene.
        type: Phaser.CANVAS,
        parent: "game",
        width: 1200,
        height: 650,
        backgroundColor: "#142938",
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        physics: {
          default: "matter",
          matter: { gravity: { x: 0, y: 1 }, enableSleeping: true },
        },
        scene: [scene],
        audio: { noAudio: true },
        banner: false,
      });
    } catch {
      el("game").textContent =
        "Your browser cannot create the game canvas. Please use a current browser with Canvas or WebGL enabled.";
    }
  announce(`${city.name} loaded. Select a power and target the city.`);
  el("change").focus();
  audio.pause(false);
}
function selection() {
  audio.clear();
  audio.pause(true);
  game?.scene.remove("City");
  scene = undefined;
  el("sandbox").hidden = true;
  el("selection").hidden = false;
  document.querySelector<HTMLButtonElement>("[data-city]")?.focus();
}
function sync() {
  audio.setRate(controls.slow ? 0.25 : 1);
  for (const k of ["pause", "slow", "night"]) {
    const value =
      k === "pause"
        ? controls.paused
        : k === "slow"
          ? controls.slow
          : controls.night;
    el(k).setAttribute("aria-pressed", String(value));
  }
  el("pause").textContent = controls.paused ? "Resume" : "Pause";
  el("night").textContent = controls.night ? "Day" : "Night";
  el("theme-label").textContent = controls.night ? "NIGHTFALL" : "DAYLIGHT";
  el("paused-label").hidden = !controls.paused;
  el("sandbox").dataset.theme = controls.night ? "night" : "day";
  audio.pause(controls.paused || document.hidden);
}
function choose(power: PowerId) {
  controls.power = power;
  document
    .querySelectorAll<HTMLButtonElement>("[data-power]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.power === power)),
    );
  el("instruction").textContent =
    `${labels[power]} selected · click or tap a target`;
  announce(`${labels[power]} selected`);
}
function setStrength(n: number) {
  prefs.strength = controls.strength = Math.max(0.25, Math.min(2, n));
  el<HTMLInputElement>("strength").value = String(controls.strength * 100);
  el("strength-value").textContent = `${Math.round(controls.strength * 100)}%`;
  save();
  announce(`Strength ${Math.round(controls.strength * 100)} percent`);
}
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-city]"))
  b.onclick = () => start(cities.find((c) => c.id === b.dataset.city)!);
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-power]"))
  b.onclick = () => {
    audio.unlock();
    choose(b.dataset.power as PowerId);
  };
el("change").onclick = selection;
el("home").onclick = (e) => {
  e.preventDefault();
  selection();
};
el("pause").onclick = () => {
  controls.paused = !controls.paused;
  sync();
  announce(controls.paused ? "Paused" : "Resumed");
};
el("slow").onclick = () => {
  controls.slow = !controls.slow;
  sync();
  announce(controls.slow ? "Quarter speed" : "Normal speed");
};
el("night").onclick = () => {
  controls.night = !controls.night;
  sync();
  announce(controls.night ? "Night" : "Day");
};
el<HTMLInputElement>("strength").oninput = (e) =>
  setStrength(Number((e.target as HTMLInputElement).value) / 100);
for (const key of ["music", "sfx", "master"] as const)
  el(key).onclick = () => {
    audio.unlock();
    prefs[key] = !prefs[key];
    el(key).setAttribute("aria-pressed", String(prefs[key]));
    audio.apply();
    save();
    announce(`${key} ${prefs[key] ? "on" : "muted"}`);
  };
el("help").onclick = () => el<HTMLDialogElement>("help-dialog").showModal();
el("close-help").onclick = () => el<HTMLDialogElement>("help-dialog").close();
el("rebuild").onclick = () => el<HTMLDialogElement>("reset-dialog").showModal();
el("cancel-reset").onclick = () =>
  el<HTMLDialogElement>("reset-dialog").close();
el("confirm-reset").onclick = () => {
  el<HTMLDialogElement>("reset-dialog").close();
  if (current) start(current);
  announce("Rebuild complete. Destruction zero percent.");
};
for (const key of ["motion", "flash"] as const)
  el<HTMLInputElement>(key).onchange = () => {
    prefs[key] = controls[key] =
      key === "motion"
        ? !el<HTMLInputElement>(key).checked
        : el<HTMLInputElement>(key).checked;
    save();
  };
window.addEventListener("keydown", (e) => {
  if (
    e.target instanceof HTMLInputElement ||
    (e.target instanceof HTMLButtonElement && e.code === "Space") ||
    document.querySelector("dialog[open]")
  )
    return;
  if (e.key === "Escape") {
    el("change").focus();
    return;
  }
  if (!scene) return;
  const index = Number(e.key) - 1;
  if (index >= 0 && index < 6) {
    choose(powers[index]);
    return;
  }
  const id: Record<string, string> = {
    " ": "pause",
    s: "slow",
    d: "night",
    r: "rebuild",
    m: "master",
  };
  if (id[e.key.toLowerCase()]) {
    e.preventDefault();
    el(id[e.key.toLowerCase()]).click();
  }
  if (e.key === "[") setStrength(controls.strength - 0.05);
  if (e.key === "]") setStrength(controls.strength + 0.05);
});
document.addEventListener("visibilitychange", () =>
  audio.pause(!scene || document.hidden || controls.paused),
);
window.addEventListener("pagehide", () => audio.dispose());
// Read-only diagnostics are available only in explicit test/dev builds.
if (import.meta.env.DEV || import.meta.env.MODE === "test")
  Object.defineProperty(window, "citysmash", {
    value: {
      snapshot: () => scene?.snapshot(),
      controls: () => ({ ...controls }),
      audio: () => ({ ...prefs, ...audio.snapshot() }),
    },
  });
