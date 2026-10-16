"""Autorizacao OAuth2 do Bling API v3 (app privado comnectar-claude).

Sobe um servidor em localhost:8080, espera o Bling redirecionar pra /callback
com o code, troca por access_token + refresh_token e salva em dados/bling/tokens.json.
So precisa rodar uma vez (ou de novo se o refresh_token expirar, ~30 dias sem uso).

Uso: py .claude/skills/bling/bling_auth.py
"""
import base64
import json
import secrets
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
TOKENS = RAIZ / "dados" / "bling" / "tokens.json"
TOKEN_URL = "https://www.bling.com.br/Api/v3/oauth/token"
AUTH_URL = "https://www.bling.com.br/Api/v3/oauth/authorize"


def ler_env():
    env = {}
    for linha in (RAIZ / ".env").read_text(encoding="utf-8").splitlines():
        if "=" in linha and not linha.lstrip().startswith("#"):
            k, v = linha.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def trocar_code(code, client_id, client_secret):
    basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    dados = urllib.parse.urlencode({"grant_type": "authorization_code", "code": code}).encode()
    req = urllib.request.Request(TOKEN_URL, data=dados, method="POST", headers={
        "Authorization": f"Basic {basic}",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "1.0",
    })
    with urllib.request.urlopen(req) as r:
        tok = json.load(r)
    tok["obtido_em"] = int(time.time())
    TOKENS.parent.mkdir(parents=True, exist_ok=True)
    TOKENS.write_text(json.dumps(tok, indent=2), encoding="utf-8")
    return tok


def main():
    env = ler_env()
    client_id, client_secret = env["BLING_CLIENT_ID"], env["BLING_CLIENT_SECRET"]
    state = secrets.token_hex(8)
    url = f"{AUTH_URL}?" + urllib.parse.urlencode(
        {"response_type": "code", "client_id": client_id, "state": state})
    print("Abra no navegador e clique em Autorizar:\n" + url, flush=True)

    resultado = {}

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if "code" not in q:
                self.send_response(404); self.end_headers(); return
            if q.get("state", [""])[0] != state:
                msg = "State invalido - rode o script de novo."
            else:
                try:
                    tok = trocar_code(q["code"][0], client_id, client_secret)
                    resultado["ok"] = True
                    msg = f"Pronto! Bling conectado. Token valido por {tok.get('expires_in')}s. Pode fechar essa aba."
                except Exception as e:
                    corpo = getattr(e, "read", lambda: b"")().decode(errors="ignore")
                    msg = f"Erro ao trocar o code: {e} {corpo}"
            resultado["msg"] = msg
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(msg.encode("utf-8"))

        def log_message(self, *a):
            pass

    srv = HTTPServer(("localhost", 8080), Handler)
    srv.timeout = 1
    limite = time.time() + 900
    while "msg" not in resultado and time.time() < limite:
        srv.handle_request()
    print(resultado.get("msg", "Tempo esgotado (15 min) sem autorizacao."), flush=True)


if __name__ == "__main__":
    main()
