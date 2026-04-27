from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request

class ProxyHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def handle_request(self):
        target_url = self.headers.get('x-proxy-url')
        if not target_url:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Missing x-proxy-url header")
            return

        req = urllib.request.Request(target_url, method=self.command)

        # 🛡️ THE FIX: Strip GZIP so we get readable text, not garbled machine code
        for key, value in self.headers.items():
            if key.lower() not in ['host', 'x-proxy-url', 'content-length', 'accept-encoding']:
                req.add_header(key, value)

        if self.command == 'POST':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                req.data = self.rfile.read(content_length)

        try:
            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                self.send_header('Access-Control-Allow-Origin', '*')
                for k, v in response.headers.items():
                    if k.lower() not in ['transfer-encoding', 'connection', 'content-encoding']:
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            for k, v in e.headers.items():
                if k.lower() not in ['transfer-encoding', 'connection', 'content-encoding']:
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(e.read())

    def do_GET(self): self.handle_request()
    def do_POST(self): self.handle_request()

print("🌉 A-CAM Production Bridge Active on port 8001 (GZIP Disabled)")
HTTPServer(('127.0.0.1', 8001), ProxyHTTPRequestHandler).serve_forever()