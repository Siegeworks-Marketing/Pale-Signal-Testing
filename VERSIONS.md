# PALE SIGNAL · VERSION HISTORY
## Changelog · Cartridge principle: ship, then let it run.

---

## Session 10 · 2026-03-27 (Today)

**Hub:**
- SQ-04 COMPLETE: `◈ SK` button in Sael tab — file picker loads Soul Kernel markdown
  into session memory, injected into wllama system prompt (first 6000 chars) and
  Ollama system prompt (full). Never uploaded. Never persisted. `◈ SK ✓` badge confirms.
- SQ-04 quest description corrected to match actual build
- Bug fix: `launchChem()` was opening `chemistry-v1_2.html` (404) → corrected to `v1_1`

**TCG:**
- Bug fix: `EchoArt` portrait guard was `window.PalePixel` — `PalePixel` local const
  never assigned to `window`, so every portrait rendered blank. Fixed to `PalePixel`.
  Animated Wisp/Crawler/Sprite portraits now render on all cards.

**Infrastructure:**
- sw.js → v2.14: both bug fixes noted in version comment

---

## v3.12 · Session 9 · 2026-03-27 (Sealed)

**RPG:**
- Creature system: `WORLD_CREATURES` deterministic from world seed, 15 per world
- Three creature types: Pale Wisp (orb, pulsing glow), Stone Crawler (hexapod, leg animation),
  Briar Sprite (hopping plant, leaf crown)
- All creatures: full GS/MMBN pipeline — Bresenham circles, Bayer dither, gsPal ramps
- NPC role shapes: engram `role` drives visual silhouette
  - Sage/Bodhisattva: narrower body, robe overlay with crease lines
  - Guardian: wider body, pauldron plates with highlight
  - Ancestor: wide-brimmed spirit hat

**Hub:**
- Sael crash fix: `allowOffline:true` — loads from OPFS without network
- Error recovery: generation failure → "The signal broke mid-thought" — engine stays alive
- Double boot guard: `_bootRan` flag prevents SW `clients.claim()` double-fire
- Thinking indicator: bouncing dots → streaming cursor (`▌`) during generation
- Instruct template: `buildWllamaPrompt()` uses Llama `<|begin_of_text|>` format
- Speed: `nPredict:150`, `top_k:20` — ~20-25s on iPhone 15 Pro
- Goals system (SQ-GOAL-TRACKER complete): GOALS tab in Care, milestones, progress bar,
  auto-complete, feeds sync score. localStorage via `LS.get/set('goals')`
- Pedometer (SQ-PEDO complete): `DeviceMotionEvent` peak-detection, iOS 13+ permission gate,
  daily reset, 500 steps = +sync, step count in Care check-in strip
- Journal: date stamp header format "FRI · MAR 27, 2026"
- Quest system: section headers with arcade border gradient, MQ-05 marked complete
- Screen real estate: `scaleShell()` transform only below 320px (no transform on normal phones)
- Calculator built: Cook tab → CALCULATOR, unit conversions, tip/split

**TCG:**
- EchoArt component: 32×32 canvas, `requestAnimationFrame` live animation
- Portrait type from element: water/wind/pale/null → Wisp; earth/metal → Crawler; wood/fire → Sprite
- Name hash seeds colour variation within same element
- Rarity border: gold for Legendary, purple for Epic

**Chemistry:**
- Mobile fix: 28px cells, `@media (max-width:500px)` responsive layout

**Infrastructure:**
- `lib/pale-pixel.js`: shared pixel art library extracted from RPG, used by TCG and future tools
  - Exports: `gsPal`, `_shift`, `mkRNG`, `hashStr`, `bCircle`, `dRect`, `outline`,
    `fillShaded`, `ELEMENT_COLORS`, `drawEchoPortrait`, `drawCardFrame`
- wllama Tier 1 CONFIRMED LIVE on iPhone Safari 2026-03-27
  - Engine: `@wllama/wllama`, self-hosted in `lib/wllama.js` + `lib/wllama.wasm`
  - Model: Llama-3.2-1B-Instruct-Q4_K_M.gguf (~700MB), OPFS cached offline forever
  - `allowOffline:true` — loads from OPFS even when HuggingFace unreachable
  - Instruct template required — raw completion ignores system prompt on 1B models
- Clean repo standup: new GitHub repo, all files audited, correct CORE list
- sw.js → v2.13

---

## v3.11 · 2026-03-26

**RPG:**
- Engram system: `buildNPC()` stamps `{weight, element, role, modifier, duty}`
- Radiant dialog: 120+ authored fragments keyed to engram fields (Tier 0)
- `engram_saelPrompt()`: Tier 1 Sael hook with RAG context injection
- Element-driven NPC body colour (tile type → element → colour)
- BM25 RAG engine: `searchCorpus()` over Library + Guide entries
- Weight-3 NPCs receive retrieved Library lore fragment in dialog
- GUIDE panel: 7 tabbed sections (BASICS/STATS/COMBAT/PALE/NPCS/ITEMS/HUB)
- Character art rebuilt: head r=5, face layer reorder, hair system rewritten
- drawPlayer: try/finally safety on `_oc` (fixes visual crash bug)
- Explorer portrait: uses drawPlayer pipeline, 48×48 preview with 8px offset
- Build system: lean/standard/sturdy body width
- 4 new eyebrow styles, scarf/collar overlay, accent colour, 8-element pale mark

**Hub:**
- Model panel: 3 model choices, tier badge, model load/clear
- Ollama URL: saved to localStorage, auto-detected at boot
- iOS Safari guard: explains wllama limitation, directs to Ollama
- Update banner: SW detects push → banner → one-tap reload
- How-to guides: 10 topics in inert response system
- Hub BM25: `searchHubCorpus()` as inert fallback

**Infrastructure:**
- sw.js → v2.9
- pale-bridge.sh (Mac/Linux), pale-bridge.bat (Windows)
- Sael-Modelfile: v7.8 system prompt
- RAG-ASSESSMENT.md: full 3-tier implementation plan

---

## v3.10 · 2026-03-26

**RPG:**
- Walk cycle: 8-step, step-driven, freezes when still
- NPC idle animation: per-NPC hashed phase, weight-shift foot alternation
- Equipment visuals: all slots affect sprite
- Scenery system: ferns, pebble clusters, driftwood, shells, mushrooms, boulders, trees
- Interaction prompts: ▲A badge over A-interactable objects
- Oracle dirMap crash fixed
- Covenant Altar + Blue Covenant Pendant (WIT+3, SYNC+5)
- Landscape mobile layout: canvas-dominant, controls in 80px strip
- sw.js → v2.8

---

## v3.9 and earlier

See Soul Kernel history for session notes v5.2 through v7.7.

---

## FILE NAMING RULES

```
PaleSignalRPG-v{MAJOR}_{MINOR}.html    ← increment MINOR on any build
index.html                              ← Hub (no version in filename)
sw.js                                   ← SW (no version in filename, bump CACHE string)
pixel-engine-v{MAJOR}_{MINOR}.html
chemistry-v{MAJOR}_{MINOR}.html
PaleSignalTCG-v{MAJOR}_{MINOR}.html
lib/pale-pixel.js                       ← shared library (no version in filename)
lib/wllama.js                           ← wllama engine (no version in filename)
lib/wllama.wasm                         ← wllama WASM binary
```

When you rename an RPG file:
1. Update `launchRPG()` in index.html
2. Update `CORE` list in sw.js
3. Bump sw.js CACHE version string
4. Commit everything together

---

## WHAT NEVER CHANGES

- Four Gates (Truth, Ethics, Consent, Love)
- Moral architecture
- Anti-Korsakoff protocol
- Sovereignty rule (sealed 2026-03-24)
- Eight elements
- The Soul Kernel owns itself

*PALE SIGNAL · VERSION HISTORY · 2026-03-27*
