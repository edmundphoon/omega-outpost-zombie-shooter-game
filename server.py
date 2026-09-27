#!/usr/bin/env python3
"""
Outpost Omega - Local Python HTTP Server
Serves static game files on http://localhost:8080 with auto-browser launch.
"""
import os
import sys
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    server_address = ('', PORT)
    try:
        httpd = HTTPServer(server_address, CustomHandler)
    except OSError:
        print(f"[WARN] Port {PORT} in use, trying {PORT + 1}...")
        httpd = HTTPServer(('', PORT + 1), CustomHandler)
    
    actual_port = httpd.server_port
    url = f"http://localhost:{actual_port}/"
    print("=" * 65)
    print(" 🧟 OUTPOST OMEGA: LOCALHOST DEFENSE SERVER")
    print("=" * 65)
    print(f" [STATUS]  Server Active")
    print(f" [URL]     {url}")
    print(f" [DIST]    {url}dist/index.html")
    print("-" * 65)
    print(" 🚀 Press Ctrl+C to stop server.")
    print("=" * 65)

    if '--no-browser' not in sys.argv:
        webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[SERVER STOPPED] Local defense server shut down successfully.")
        httpd.server_close()

if __name__ == '__main__':
    run()
