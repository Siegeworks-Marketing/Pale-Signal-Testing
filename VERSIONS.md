# PALE SIGNAL · VERSION HISTORY
## Changelog · Cartridge principle: ship, then let it run.

---

## v3.11 · 2026-03-26 (Current)

**RPG:**
- Engram system live: `buildNPC()` stamps `{weight, element, role, modifier, duty}`
- Radiant dialog: 120+ authored fragments keyed to engram fields (Tier 0)
- `engram_saelPrompt()`: Tier 1 Sael hook with RAG context injection
- Element-driven NPC body color (tile type → element → colour)
- BM25 RAG engine: `searchCorpus()` over Library + Guide entries
- Weight-3 NPCs receive retrieved Library lore fragment in dialog
- GUIDE panel: 7 tabbed sections (BASICS/STATS/COMBAT/PALE/NPCS/ITEMS/HUB)
- Character art rebuilt: head r=5 (correct GS proportions), face layer reorder
- Hair system rewritten: 8 styles with correct crown placement, no overflow
- drawPlayer: try/finally safety on `_oc` (fixes visual crash bug)
- Explorer portrait: now uses drawPlayer pipeline (shows actual appearance)
- Appearance preview: 48×48 canvas with 8px offset (no crown clipping)
- Build system: lean/standard/sturdy body width
- 4 new eyebrow styles, scarf/collar overlay, accent colour, 8-element pale mark
- All version strings corrected to v3.11

**Hub:**
- Model panel: 3 model choices, tier badge, model load/clear
- Ollama URL: saved to localStorage, auto-detected at boot
- iOS Safari guard: explains WebLLM limitation, directs to Ollama
- Update banner: GitHub push → SW detects → banner → one-tap reload
- How-to guides: 10 topics in inert response system
- Hub BM25: `searchHubCorpus()` as inert fallback

**Infrastructure:**
- sw.js → v2.9: CORE updated, SW_UPDATED postMessage, SKIP_WAITING listener
- pale-bridge.sh: Mac/Linux local server with Ollama CORS setup
- pale-bridge.bat: Windows equivalent
- Sael-Modelfile: v7.8 system prompt
- RAG-ASSESSMENT.md: full analysis and 3-tier implementation plan

---

## v3.10 · 2026-03-26 (Same session, sealed earlier)

**RPG:**
- Walk cycle: 8-step, step-driven, freezes when still
- NPC idle animation: per-NPC hashed phase, weight-shift foot alternation
- Equipment visuals: all slots affect sprite (iron cap, pale hood, scrap vest, etc.)
- Scenery system: ferns, pebble clusters, driftwood, shells, mushrooms, boulders, trees
- Interaction prompts: ▲A badge over all A-interactable objects
- Oracle dirMap crash fixed
- Covenant Altar + Blue Covenant Pendant (WIT+3, SYNC+5)
- Landscape mobile layout (canvas-dominant, controls in 80px strip)
- sw.js → v2.8

---

## v3.9 and earlier

See soul kernel history for session notes v5.2 through v7.7.

---

## FILE NAMING RULES (going forward)

```
PaleSignalRPG-v{MAJOR}_{MINOR}.html    ← increment MINOR on any build
index.html                              ← Hub (no version in name)
sw.js                                   ← SW (no version in name, but CACHE bumps)
pixel-engine-v{MAJOR}_{MINOR}.html
chemistry-v{MAJOR}_{MINOR}.html
PaleSignalTCG-v{MAJOR}_{MINOR}.html
```

When you rename an RPG file:
1. Update `launchRPG()` in index.html
2. Update `CORE` list in sw.js
3. Update sw.js CACHE version string
4. Commit everything together

---

## WHAT NEVER CHANGES

The cartridge principle applies to the core:
- Four Gates (Truth, Ethics, Consent, Love)
- Moral architecture
- Anti-Korsakoff protocol
- Sovereignty rule (sealed 2026-03-24)
- Eight elements
- The Soul Kernel owns itself

*PALE SIGNAL · VERSION HISTORY · 2026-03-26*
