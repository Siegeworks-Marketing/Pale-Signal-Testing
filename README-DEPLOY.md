# PALE SIGNAL · DEPLOYMENT & VERSION MANAGEMENT
## Complete guide for GitHub Pages hosting, local bridge, and release workflow
**Against Soul Kernel v7.11 · Last updated: 2026-03-27**

---

## QUICK START — IPHONE + WLLAMA (on-device, no PC needed)

**What you need:** iPhone 12 or newer. WiFi for the one-time model download (~700MB).

```
1. Open https://siegeworksmarketingllc.com/Pale-Signal/ on iPhone Safari
2. Tap SAEL tab → ◈ MODEL → select Llama 3.2 · 1B → LOAD MODEL
3. Wait for download (one time only — model caches in OPFS, loads offline forever)
4. Talk to Sael
```

To load your Soul Kernel: tap `◈ SK` → select `The-Soul-Kernel-vX_Y.md` from Files.
Content injects into Sael's context for this session. Never uploaded. Never persisted.

---

## QUICK START — IPHONE + OLLAMA VIA LOCAL BRIDGE (better model, any iPhone)

**What you need:** Mac or PC with Ollama installed. iPhone on the same WiFi.

```bash
# 1. Pull repo to local machine
git pull origin main

# 2. Run the bridge
./pale-bridge.sh          # Mac/Linux
pale-bridge.bat           # Windows

# 3. On iPhone: open http://[YOUR-IP]:8080
# 4. Hub → SAEL → ◈ MODEL → LOCAL OLLAMA → enter URL shown → TEST
```

The bridge prints your local IP and the Ollama URL to enter. No HTTPS/mixed-content issues.

---

## REPO STRUCTURE — v7.11

```
Pale-Signal/
├── index.html                  ← Hub v2.0 · SK v7.11
├── PaleSignalRPG-v3_12.html    ← RPG · creatures, NPC role shapes, engrams, RAG
├── PaleSignalTCG-v1_2.html     ← TCG · animated pixel Echo portraits
├── pixel-engine-v1_2.html      ← Pixel Engine · stable
├── chemistry-v1_1.html         ← Chemistry · mobile fix
├── sw.js                       ← Service Worker v2.14
├── manifest.json               ← PWA manifest
├── pale-bridge.sh              ← Local bridge (Mac/Linux)
├── pale-bridge.bat             ← Local bridge (Windows)
├── pale_server.py              ← Python HTTP server (called by bridges)
├── Sael-Modelfile              ← Ollama modelfile v7.9 (SQ-21 audit pending)
├── sael-wllama-test.html       ← Dev tool: standalone wllama test page
├── README-DEPLOY.md            ← This file
├── VERSIONS.md                 ← Changelog
└── lib/
    ├── wllama.js               ← @wllama/wllama engine (268KB, self-hosted)
    ├── wllama.wasm             ← llama.cpp WASM binary (2.1MB, self-hosted)
    └── pale-pixel.js           ← Shared pixel art library (9KB)
```

**Not in repo:** `The-Soul-Kernel-*.md` — private, stays on device.

---

## TIER ARCHITECTURE — HOW SAEL RUNS

```
TIER 0  — Inert / authored responses
  No model. Game complete. Sael responds from rule-based authored trees.
  Works everywhere with a browser.

TIER 1  — wllama (llama.cpp as WebAssembly · CPU inference)
  *** CONFIRMED LIVE ON IPHONE SAFARI 2026-03-27 ***
  Engine: lib/wllama.js + lib/wllama.wasm (self-hosted, sovereign)
  Model: Llama-3.2-1B-Instruct-Q4_K_M.gguf (~700MB)
  Storage: OPFS — downloads once, loads offline forever
  allowOffline:true — loads from OPFS even if HuggingFace unreachable
  Works in Safari. No WebGPU needed. No App Store.
  Speed: ~5-8 tok/s on iPhone 15 Pro (~20-25s per response)
  Note: instruct template required — raw completion ignores system prompt on 1B models

TIER 2  — Ollama on local network
  Better model, full context window, faster responses.
  Detected at boot (localhost:11434 check). Requires pale-bridge for iPhone.
  Windows: pale-bridge.bat + pale_server.py + McAfee firewall exception needed.

TIER ∞  — Open
  Model quality improves as better GGUFs appear on HuggingFace.
  Cartridge doesn't change. Environment improves around it.
```

---

## GITHUB PAGES — PUBLISHING A NEW VERSION

```bash
# 1. Edit files
# 2. Always bump SW cache version in sw.js:
#    const CACHE = 'pale-signal-v2.X';  ← increment X
# 3. Update CORE list in sw.js if filenames changed
# 4. Commit and push:
git add .
git commit -m "vX.Y — what changed"
git push origin main
# 5. GitHub Pages deploys in ~30 seconds
# 6. Users online see update banner → tap RELOAD → new version active
```

**Rule: bump CACHE on every file change or SW serves stale files indefinitely.**

### Enabling GitHub Pages (first time)
Settings → Pages → Source: Deploy from branch → main → / (root)

---

## SERVICE WORKER — UPDATE FLOW

```
You push to GitHub
    ↓
GitHub Pages serves new files
    ↓
User opens app online
    ↓
SW detects new version (updatefound)
    ↓
Banner: "◈ UPDATE READY — new version installed"
    ↓
User taps RELOAD
    ↓
SW posts SKIP_WAITING → activates → page reloads
```

---

## LOCAL BRIDGE — WHY IT EXISTS

GitHub Pages forces HTTPS. Ollama runs on plain HTTP (`localhost:11434`).
Safari blocks HTTP requests from HTTPS pages (mixed content wall).

The bridge starts a Python HTTP server on port 8080, serving Pale Signal over HTTP.
An HTTP page can freely reach HTTP Ollama — no mixed content issue.
Service Worker does not register on non-localhost HTTP; game runs fully from local server.

---

## SOUL KERNEL INJECTION — HOW IT WORKS (SQ-04, complete)

The `◈ SK` button in the Sael tab opens a file picker. User selects their
`The-Soul-Kernel-vX_Y.md` from device storage. The file is read with `FileReader`
(client-side only — never sent anywhere). Content is stored in `skContent` variable
for the current session only.

- **wllama (Tier 1):** First 6000 chars injected into system prompt.
  Full SK is ~10KB/~2500 tokens — exceeds 1B model context budget.
  6000 chars ≈ 1500 tokens — fits comfortably.
- **Ollama (Tier 2):** Full content injected — larger model handles full context.
- **On page close:** `skContent` is gone. Reload → tap `◈ SK` again.
- **Sovereignty:** The file never leaves the device. This is correct.

---

## SAEL MODELFILE — SETUP (Tier 2 Ollama)

```bash
# Install Sael custom model (once):
ollama create sael -f Sael-Modelfile

# Or use standard model (simpler):
ollama pull llama3.2
ollama serve
```

SQ-21 pending: Sael-Modelfile is v7.9. Needs update to v7.11 moral architecture
and wllama reference (WebLLM retired). Do this before any Ollama-dependent distribution.

### Best Ollama models for Pale Signal (2026):
| Model | Size | Quality | Notes |
|---|---|---|---|
| llama3.2 | 2GB | Good | Default, always works |
| qwen2.5:3b | 1.8GB | Good | Fast on older hardware |
| phi3.5-mini | 2.2GB | Better | Richer NPC dialog |
| gemma3:4b | 2.5GB | Best | Highest quality |

---

## VERSION NAMING CONVENTION

```
Soul Kernel:    v7.11 → v7.12      (session increments)
RPG:            v3.12              (feature increments)
Hub:            v2.0               (increment on major UI changes)
SW cache:       v2.14              (increment on ANY file change)
TCG:            v1.2               (stable)
Pixel Engine:   v1.2               (stable)
Chemistry:      v1.1               (stable)
```

**Cartridge principle:** Ship once, run forever. 2026 version still works in 2031.

---

## WHAT TO UPDATE EACH SESSION

Minimum:
- [ ] New `The-Soul-Kernel-vX_Y.md` with updated THREE-TIER STATE
- [ ] `sw.js` CACHE version if any file changed
- [ ] `VERSIONS.md` entry for the session

When making a build with new features:
- [ ] Increment RPG version string (title, `gba-top-label`, `sael-mark`)
- [ ] Update sw.js CORE list if filenames changed
- [ ] Update `launchRPG()` in index.html if RPG filename changed
- [ ] Commit with meaningful message: `"v3.12 — creatures, NPC role shapes"`

---

*PALE SIGNAL · DEPLOYMENT GUIDE · 2026-03-27*
*Against Soul Kernel v7.11 · The cartridge ships. The environment improves around it.*
