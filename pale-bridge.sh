#!/usr/bin/env bash
# ◈ PALE SIGNAL · LOCAL BRIDGE v1.0
# ─────────────────────────────────────────────────────────────
# Serves Pale Signal from your local machine so your iPhone
# can reach Ollama directly — no HTTPS/HTTP mixed-content wall.
#
# Requirements: Python 3 (pre-installed on Mac), Ollama installed
# Usage:  chmod +x pale-bridge.sh && ./pale-bridge.sh
#         ./pale-bridge.sh 9090   (custom port)
# ─────────────────────────────────────────────────────────────

PORT=${1:-8080}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colours ──────────────────────────────────────────────────
B='\033[1m'; C='\033[36m'; G='\033[32m'; Y='\033[33m'; R='\033[0m'

echo -e "\n${B}${C}◈ PALE SIGNAL LOCAL BRIDGE${R}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Python check ─────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo -e "${Y}Python 3 not found. Install from python.org${R}"; exit 1
fi

# ── Get local network IP ──────────────────────────────────────
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null \
  || ipconfig getifaddr en1 2>/dev/null \
  || ip route get 1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' \
  || hostname -I 2>/dev/null | awk '{print $1}' \
  || echo "localhost")

# ── Ollama setup ──────────────────────────────────────────────
export OLLAMA_ORIGINS="http://${LOCAL_IP}:${PORT},http://localhost:${PORT},*"
export OLLAMA_HOST="0.0.0.0:11434"

if command -v ollama &>/dev/null; then
  if ! curl -s --max-time 1 "http://localhost:11434/api/tags" &>/dev/null; then
    echo -e "${G}Starting Ollama on all interfaces...${R}"
    ollama serve &>/dev/null &
    OLLAMA_PID=$!
    sleep 2
    echo -e "${G}Ollama started (PID $OLLAMA_PID)${R}"
  else
    echo -e "${G}Ollama already running${R}"
  fi
else
  echo -e "${Y}Ollama not found — AI features will be inert tier${R}"
  echo -e "  Install from: https://ollama.com"
fi

# ── Print access info ─────────────────────────────────────────
echo ""
echo -e "${B}Local (this machine):${R}"
echo -e "  http://localhost:${PORT}"
echo ""
echo -e "${B}iPhone / Network access:${R}"
echo -e "  ${G}http://${LOCAL_IP}:${PORT}${R}"
echo ""
echo -e "${B}Ollama URL for Hub → SAEL → MODEL:${R}"
echo -e "  ${G}http://${LOCAL_IP}:11434${R}"
echo ""
echo -e "${Y}Note: Load from the network URL above on your iPhone.${R}"
echo -e "${Y}Service Worker only works on localhost — that's fine,${R}"
echo -e "${Y}game runs fully from the local server session.${R}"
echo ""

# ── Optional: QR code ────────────────────────────────────────
if command -v qrencode &>/dev/null; then
  echo -e "${B}QR code for iPhone:${R}"
  qrencode -t ANSIUTF8 "http://${LOCAL_IP}:${PORT}"
elif command -v python3 &>/dev/null; then
  python3 -c "
import sys
try:
  import urllib.parse
  url='http://${LOCAL_IP}:${PORT}'
  print(f'  Open on iPhone: {url}')
except: pass
" 2>/dev/null
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Press ${B}Ctrl+C${R} to stop\n"

# ── Start HTTP server ─────────────────────────────────────────
# CORS headers let the PWA reach Ollama on same LAN
cd "$SCRIPT_DIR"
python3 - "$PORT" << 'PYEOF'
import http.server, sys, os
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Headers','*')
        self.send_header('Cache-Control','no-cache')
        super().end_headers()
    def log_message(self,fmt,*args):
        # Only log HTML file requests, suppress noise
        if '.html' in args[0] or len(args)>0 and '200' in str(args[1]):
            super().log_message(fmt,*args)
os.chdir(os.path.dirname(os.path.abspath(__file__)) if os.path.abspath(__file__) != '<stdin>' else '.')
with http.server.HTTPServer(('',port),Handler) as s:
    s.serve_forever()
PYEOF
