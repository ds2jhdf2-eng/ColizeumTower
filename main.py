import http.server
import socketserver
import os

# Порт
PORT = 8080

# Путь до твоей папки с index.html
WEB_DIR = os.path.join(os.path.dirname(__file__), "webapp", "tower", "tower_game")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Все пути ищем внутри WEB_DIR
        path = path.lstrip("/")
        full_path = os.path.join(WEB_DIR, path)
        if os.path.isdir(full_path):
            index_file = os.path.join(full_path, "index.html")
            if os.path.exists(index_file):
                return index_file
        return full_path

os.chdir(WEB_DIR)

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"🌐 WebApp запущен на http://127.0.0.1:{PORT}")
    print("🚀 Сервер работает! Нажми Ctrl+C для выхода.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен.")
