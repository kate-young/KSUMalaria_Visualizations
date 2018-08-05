from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

PORT = 8000

handler = SimpleHTTPRequestHandler

httpd = HTTPServer(("", PORT), handler)

print("serving at port", PORT)
httpd.serve_forever()
