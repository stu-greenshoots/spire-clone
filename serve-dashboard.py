#!/usr/bin/env python3
"""
Simple HTTP server for the Spire Ascent Project Dashboard
Serves static files and provides API endpoints for dynamic content
"""

import http.server
import socketserver
import json
import os
import subprocess
from urllib.parse import urlparse, parse_qs
from pathlib import Path

PORT = 8080
DOCS_DIR = Path(__file__).parent

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)

        # API endpoints
        if parsed_path.path == '/api/diary':
            self.serve_diary(parse_qs(parsed_path.query))
        elif parsed_path.path == '/api/file':
            self.serve_file(parse_qs(parsed_path.query))
        elif parsed_path.path == '/api/commits':
            self.serve_commits()
        elif parsed_path.path == '/api/sprint-status':
            self.serve_sprint_status()
        else:
            # Serve static files
            super().do_GET()

    def serve_diary(self, params):
        """Serve diary content"""
        if 'file' not in params:
            self.send_error(400, "Missing file parameter")
            return

        diary_file = params['file'][0]
        diary_path = DOCS_DIR / 'docs' / 'diaries' / diary_file

        if not diary_path.exists():
            self.send_error(404, "Diary not found")
            return

        try:
            content = diary_path.read_text()
            self.send_response(200)
            self.send_header('Content-type', 'text/plain; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    def serve_file(self, params):
        """Serve project file content"""
        if 'name' not in params:
            self.send_error(400, "Missing name parameter")
            return

        filename = params['name'][0]
        file_path = DOCS_DIR / filename

        if not file_path.exists():
            self.send_error(404, "File not found")
            return

        try:
            content = file_path.read_text()
            self.send_response(200)
            self.send_header('Content-type', 'text/plain; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    def serve_commits(self):
        """Serve git commit history"""
        try:
            result = subprocess.run(
                ['git', 'log', '--oneline', '-30', '--pretty=format:%h|%an|%ar|%s'],
                cwd=DOCS_DIR,
                capture_output=True,
                text=True
            )

            commits = []
            for line in result.stdout.strip().split('\n'):
                if line:
                    parts = line.split('|', 3)
                    if len(parts) == 4:
                        commits.append({
                            'hash': parts[0],
                            'author': parts[1],
                            'time': parts[2],
                            'message': parts[3]
                        })

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(commits).encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    def serve_sprint_status(self):
        """Serve current sprint status"""
        try:
            # Get current branch
            branch_result = subprocess.run(
                ['git', 'branch', '--show-current'],
                cwd=DOCS_DIR,
                capture_output=True,
                text=True
            )

            # Get test count (from package.json or recent output)
            status = {
                'branch': branch_result.stdout.strip(),
                'sprint': 12,
                'tests': '2248+',
                'status': 'IN_PROGRESS'
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(status).encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

if __name__ == '__main__':
    os.chdir(DOCS_DIR)

    with socketserver.TCPServer(("", PORT), DashboardHandler) as httpd:
        print(f"🎴 Spire Ascent Project Dashboard")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"📊 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving from: {DOCS_DIR}")
        print(f"")
        print(f"Open dashboard.html in your browser to view the project dashboard")
        print(f"Press Ctrl+C to stop the server")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")
