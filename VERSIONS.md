# PALE SIGNAL · VERSION HISTORY
## Changelog · Cartridge principle: ship, then let it run.

---

## v3.16 · Session 13 · 2026-03-30

**Buildings — complete rework:**
- Footprint corrected: 6×5 tiles (was 4×4 — too small to read)
  - Row 0: full north wall (roof tiles)
  - Rows 1–3: interior FLOOR with furniture
  - Row 4: south face, DOOR at col 2, 4-tile path south
- HOUSE tile: variant now seeded from building origin (all tiles in one building match)
  - 3 variants: TERRACOTTA (red ridge tiles), THATCH (green-grey), SLATE (cool blue-grey)
  - North wall tiles: full roof with 5 ridge courses, NW specular, eave shadow
  - South/side wall tiles: alternating brick bond pattern with mortar lines, per-tile windows with glass reflection + interior amber glow + cross muntins
  - Chimney: seeded per building origin, appears on north wall
- DOOR tile: complete redesign
  - Stone arch with keystone bar and post highlights/shadows
  - Interior glimpse: warm candlelit floor visible behind slightly-ajar door
  - Brass handle + lock plate, raised wood panels with proper inset shading, stone threshold
- FLOOR tile: complete redesign
  - Horizontal plank boards with alternating tone, knot holes, longer grain marks
  - Furniture silhouettes: TABLE / CRATE / BARREL / BOOKSHELF (seeded per tile, 45% chance)
  - Book spines with colour variation, barrel stave lines, crate cross-bracing
  - Warm candlelight tint + central light bloom

**Creature encounters — all 13 creatures now interactive:**
- Non-hostile creatures: contact triggers examine dialog with creature lore (3 lines), condition, action hint
- Echo Card offer: if player has cards, offered at end of examine — no combat required
  - Failed capture turns creature hostile and starts battle
  - Successful capture removes from map, adds to echo collection
- ▲A prompt shown for all adjacent creatures (red ⚔ if hostile, pale blue ▲A if docile)
- A-button also checks adjacent creatures before tiles/NPCs
- Unique lore + action hint for all 13 types

**NPC interiors:**
- Building NPCs placed on FLOOR tiles at world gen time (not random scatter)
- Roles: merchant / civilian / wanderer / corrupt — seeded per building
- Named: The Keeper, Maren, Solis, Dex, Passing Through, The Factor, etc.
- scatterNPCs() skips FLOOR tiles (reserved for building residents)

**Beard bug — final fix:**
- Unconditional chin highlight removed from head draw (was drawing on all facings)
- Mouth shadow row removed (was reading as moustache on warm skin tones)
- Corner darks softened from skin.dk to skin.sh single pixel
- Stubble pattern moved to sy+9–10 (below lip row)

**Infrastructure:**
- sw.js → v2.18, RPG → v3.16
- index.html card updated

---

## v3.15 · Session 12 · 2026-03-29

**Bug fixes:**
- Beard phantom: validator now checks against valid list; jaw highlight conditional on non-north facing

**Canvas expanded:** 416×256 → 480×320 (VW=15, VH=10 — 44% more visible area)
- Shell breaks container: GBA_W=520, scales to fill viewport on all screens

**New tile types: T.HOUSE / T.DOOR / T.FLOOR**
- HOUSE: 3 roof variants (terracotta/thatch/slate) per world chunk; wall stone block texture; chunk-stable windows with glass reflections + cross muntins; chimney on ~30% of tiles
- DOOR: wood-grain panels, recessed door panels, gold knocker/handle, stone frame surround; walkable; ▲A prompt; interior dialog on entry
- FLOOR: horizontal plank boards with wood grain marks, worn foot-traffic path, warm candlelight tint
- Buildings scattered in world gen: 4–8 per world, 4×3 footprint, path leading to door

**Battle system:**
- Flash transition on battle start (pale blue for creatures, orange-red for NPCs)
- Biome background scenes behind battle UI: 8 themes (forest silhouettes, rock formations, crystal spires, dunes, interior torchlight + brickwork)

**Echo Capture mechanic:**
- ◈ ECHO CARD button appears in battle vs creatures when cards in inventory
- Capture probability scales with HP damage dealt (40% base → up to 92% near-defeated)
- Captured echoes stored with rarity/stats/element for TCG sync
- Echo Card schematic added; 3 starting cards in inventory

**13 total creatures** (8 from v3.14 + 5 new):
- SALTMIRE EEL (water/pale): S-curve sinuous body, bioluminescent lure filament, frilled dorsal, cold iris. Ambush predator. Drops: EEL SPINE.
- DUSK HERON (water/wind): dagger bill, folded wing planes, stilt legs, lightning neck-strike, crown crest plumes. Cautious wader. Drops: HERON FEATHER.
- IRONSHELL TORTOISE (earth/metal): scute plate pattern (suture lines + hex plates), lichen growth, geological crack fractures, maximum armor (END:10). Nearly impassable. Drops: SHELL PLATE.
- FENWICK (wood/earth): oversized digging claws, giant fennec ears, bushy tail with white tip, cream underside, green nocturnal eyes. Fastest creature (AGI:9). Drops: FENWICK PELT.
- PALE DEER (pale/wind): branching antlers with pale glow at tine tips, pale flank brand, luminous amber eyes, winter coat dither, almost never hostile. Drops: PALE ANTLER SHARD.

**Infrastructure:**
- sw.js → v2.17
- index.html → launchRPG points to v3.15
- Dependency audit: zero external deps except Google Fonts (SW-cached); zero /home/claude/ paths in output

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
