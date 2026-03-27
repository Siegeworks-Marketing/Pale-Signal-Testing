"""
◈ PALE SIGNAL · Local Server
Serves the repo folder over HTTP with CORS headers.
Called by pale-bridge.bat — do not run directly unless you know the port.
"""
import http.server
import sys
import os

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

# Serve from the folder this script lives in
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def log_message(self, fmt, *args):
        # Only log HTML file requests
        if '.html' in str(args[0]):
            super().log_message(fmt, *args)

print(f"  Server running at http://localhost:{port}")
print("  Press Ctrl+C to stop\n")

with http.server.HTTPServer(('', port), Handler) as srv:
    srv.serve_forever()
