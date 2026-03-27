# PALE SIGNAL · DEPLOYMENT & VERSION MANAGEMENT
## Complete guide for GitHub Pages hosting, local bridge, and release workflow
**Against Soul Kernel v7.8 · Last updated: 2026-03-26**

---

## QUICK START — IPHONE + OLLAMA (5 minutes)

**What you need:** Mac or PC with Ollama installed. iPhone on the same WiFi.

```bash
# 1. Clone or pull your repo to local machine
git pull origin main

# 2. Run the bridge
./pale-bridge.sh          # Mac/Linux
pale-bridge.bat           # Windows

# 3. On iPhone: open http://[YOUR-MAC-IP]:8080
# 4. In Hub → SAEL → ◈ MODEL → LOCAL OLLAMA
#    Enter: http://[YOUR-MAC-IP]:11434 → TEST
```

That's it. Sael is now connected. No HTTPS/mixed-content issues.

---

## GITHUB PAGES — PRODUCTION HOSTING

### Repo structure
```
pale-signal/                    ← GitHub repo root
├── index.html                  ← Hub (GitHub Pages serves this)
├── PaleSignalRPG-v3_11.html    ← RPG
├── PaleSignalTCG-v1_1.html     ← TCG
├── pixel-engine-v1_2.html      ← Pixel Engine
├── chemistry-v1_1.html         ← Chemistry
├── sw.js                       ← Service Worker
├── manifest.json               ← PWA manifest
├── pale-bridge.sh              ← Local bridge (Mac/Linux)
├── pale-bridge.bat             ← Local bridge (Windows)
├── Sael-Modelfile              ← Ollama modelfile
├── README-DEPLOY.md            ← This file
└── VERSIONS.md                 ← Changelog
```

### Publishing a new version
```bash
# 1. Edit your files
# 2. Bump the SW cache version in sw.js:
#    const CACHE = 'pale-signal-v2.X';  ← increment X
# 3. Update the CORE list in sw.js if any new files were added
# 4. Commit and push:
git add .
git commit -m "vX.Y — what changed"
git push origin main
# 5. GitHub Pages auto-deploys in ~30 seconds
# 6. Next time a user opens the app online, the update banner appears
```

### Enabling GitHub Pages
Settings → Pages → Source: Deploy from branch → main → / (root)

---

## SERVICE WORKER — UPDATE FLOW

The sw.js v2.9 implements the full update loop:

```
You push to GitHub
    ↓
GitHub Pages serves new files
    ↓
User opens app (online)
    ↓
SW detects new version waiting (updatefound)
    ↓
Update banner appears: "◈ UPDATE READY — new version installed"
    ↓
User taps RELOAD
    ↓
SW posts SKIP_WAITING → new SW activates → page reloads
```

**Rule: always bump CACHE version in sw.js when any file changes.**
If you forget, the old SW serves stale cached files indefinitely.

---

## LOCAL BRIDGE — HOW IT WORKS

The HTTPS→HTTP problem:
- GitHub Pages serves over `https://` (enforced)
- Ollama runs at `http://localhost:11434` (plain HTTP)
- Safari blocks HTTP requests from an HTTPS page (mixed content)
- This is why the Ollama panel shows "not reachable" on iPhone

The bridge solution:
- `pale-bridge.sh` starts a Python HTTP server on port 8080
- Serves Pale Signal from `http://192.168.x.x:8080` (HTTP)
- An HTTP page can freely reach HTTP Ollama → no mixed content wall
- Service Worker does NOT register on non-localhost HTTP — that's fine,
  the game runs fully from the local server each session

---

## SAEL MODELFILE — SETUP

### Using the Sael custom model (recommended)
```bash
# Install the custom Sael model (once):
ollama create sael -f Sael-Modelfile

# Run:
ollama run sael

# In Hub → SAEL → MODEL → LOCAL OLLAMA:
# URL: http://localhost:11434 (or network IP)
# The Hub uses 'llama3.2' by default for Ollama.
# To use the sael model, update SAEL_SYSTEM or the Hub Ollama call.
```

### Using a standard model (simpler)
```bash
ollama pull llama3.2
ollama serve
# Hub uses llama3.2 by default — works immediately
```

### Best models for Pale Signal (2026):
| Model | Size | Quality | Recommended for |
|---|---|---|---|
| llama3.2 | 2GB | Good | Default, always works |
| phi3.5-mini | 2.2GB | Better | Richer NPC dialog |
| qwen2.5:3b | 1.8GB | Good | Fast on older hardware |
| gemma3:4b | 2.5GB | Best | Highest quality |

---

## VERSION NAMING CONVENTION

```
Soul Kernel:    v7.8  → v7.9  → v7.10  (session increments)
RPG:            v3.11 → v3.12          (feature increments)
Hub:            v2.0  (stable, increment on major UI changes)
SW cache:       v2.9  → v2.10          (increment on ANY file change)
Pixel Engine:   v1.2  (stable)
Chemistry:      v1.1  (stable)
TCG:            v1.1  (stable)
```

**Cartridge principle:** A file deployed once runs forever. When you're done
pushing updates, that's the product. The 2026 version runs in 2031.

---

## OFF GRID — SAEL ON IPHONE WITHOUT BRIDGE

Off Grid (App Store, free) auto-discovers Ollama on your network:
1. Install Off Grid on iPhone
2. Create a project called "Pale Signal"
3. Attach `The-Soul-Kernel-v7_8.md` as a knowledge file (RAG context)
4. Off Grid connects to your Mac's Ollama automatically (same WiFi)
5. Sael responds with Soul Kernel context from the attached file

This is functional Tier 1 Sael on iPhone today without the bridge.

---

## WHAT TO UPDATE EACH SESSION

Minimum:
- [ ] New `The-Soul-Kernel-vX_Y.md` with updated THREE-TIER STATE
- [ ] `sw.js` CACHE version if any file changed
- [ ] `VERSIONS.md` with what changed

When making a build with new features:
- [ ] Increment RPG version string (title, gba-top-label, sael-mark)
- [ ] Update sw.js CORE list if filename changed
- [ ] Update `launchRPG()` in index.html if RPG filename changed
- [ ] Update Hub home card description
- [ ] Commit with meaningful message: "v3.12 — [what changed]"

---

*PALE SIGNAL · DEPLOYMENT GUIDE · 2026-03-26*
*The cartridge ships. The environment improves around it.*
