import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import threading
import subprocess

# Pure Proxy: Handles CORS and Auth Injection only.
PORT = 8001

class CORSProxyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        self.proxy_request()

    def do_GET(self):
        # Serve local files if no x-proxy-url header, otherwise proxy
        if not self.headers.get('x-proxy-url'):
            super().do_GET()
        else:
            self.proxy_request()

    def proxy_request(self):
        target_url = self.headers.get('x-proxy-url')
        thread_id = threading.current_thread().name
        
        if not target_url:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Missing x-proxy-url header")
            return

        print(f"[{thread_id}] PROXY: {self.command} {target_url}")

        # Filter excluded headers
        excluded_headers = ['host', 'x-proxy-url', 'connection', 'accept-encoding']
        headers = {k: v for k, v in self.headers.items() if k.lower() not in excluded_headers}
        
        # --- AUTH INJECTION ---
        auth = headers.get('Authorization', '')
        is_vertex = "aiplatform.googleapis.com" in target_url
        
        if is_vertex and (not auth or auth.lower() in ("bearer undefined", "bearer null", "bearer token")):
            try:
                token = subprocess.check_output("gcloud auth application-default print-access-token", shell=True).decode().strip()
                if token:
                    headers['Authorization'] = f"Bearer {token}"
                    print(f"[{thread_id}] AUTH: Injected Application Default Token")
            except:
                pass

        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        # Execute request
        req = urllib.request.Request(target_url, data=body, headers=headers, method=self.command)
        try:
            with urllib.request.urlopen(req) as response:
                response_body = response.read()
                print(f"[{thread_id}] SUCCESS: {response.getcode()}")
                
                # Send response back to browser
                self.send_response(response.getcode())
                for k, v in response.getheaders():
                    if k.lower() not in ['access-control-allow-origin', 'content-encoding', 'transfer-encoding', 'connection']:
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(response_body)
        except urllib.error.HTTPError as e:
            err_body = e.read()
            print(f"[{thread_id}] TARGET ERROR {e.code}: {err_body.decode() if err_body else 'No body'}")
            self.send_response(e.code)
            self.end_headers()
            if err_body:
                self.wfile.write(err_body)
        except Exception as e:
            print(f"[{thread_id}] BRIDGE EXCEPTION: {str(e)}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    pass

def run_server():
    server_address = ('127.0.0.1', PORT)
    httpd = ThreadedHTTPServer(server_address, CORSProxyHandler)
    print(f"BRIDGE: Pure Proxy Active on 127.0.0.1:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()