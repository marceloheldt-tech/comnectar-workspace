"""Cliente minimo do MCP da Bevean (CRM da comnectar, somente leitura).
Usa a URL do .env (BEVEAN_MCP_URL), que ja carrega o token.

    py bevean.py tools                          # lista ferramentas e parametros
    py bevean.py run_report '{"report":"dashboard","from":"2026-09-01","to":"2026-09-30"}'
    py bevean.py search_customers '{"query":"silva","sort_by":"total_spent"}'

    from bevean import call
    call("list_orders", {"from": "2026-10-01", "limit": 50})
"""
import json
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]


def _url():
    for linha in (RAIZ / ".env").read_text(encoding="utf-8").splitlines():
        if linha.startswith("BEVEAN_MCP_URL="):
            return linha.split("=", 1)[1].strip()
    raise SystemExit("BEVEAN_MCP_URL nao encontrado no .env")


def _rpc(method, params=None):
    corpo = {"jsonrpc": "2.0", "id": 1, "method": method}
    if params is not None:
        corpo["params"] = params
    req = urllib.request.Request(
        _url(),
        data=json.dumps(corpo).encode(),
        headers={"Content-Type": "application/json",
                 "Accept": "application/json, text/event-stream",
                 # Cloudflare barra o User-Agent padrao do urllib (403)
                 "User-Agent": "comnectar-claude/1.0"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        texto = r.read().decode("utf-8")
    if texto.startswith("event:") or texto.startswith("data:"):
        texto = next(l[5:] for l in texto.splitlines() if l.startswith("data:"))
    resp = json.loads(texto)
    if "error" in resp:
        raise RuntimeError(resp["error"])
    return resp["result"]


def tools():
    return _rpc("tools/list")["tools"]


def call(nome, args=None):
    """Chama uma ferramenta e devolve o resultado (JSON decodificado quando der)."""
    res = _rpc("tools/call", {"name": nome, "arguments": args or {}})
    if res.get("isError"):
        raise RuntimeError(res["content"])
    if "structuredContent" in res:
        return res["structuredContent"]
    textos = [c["text"] for c in res.get("content", []) if c.get("type") == "text"]
    saida = "\n".join(textos)
    try:
        return json.loads(saida)
    except ValueError:
        return saida


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    if sys.argv[1] == "tools":
        for t in tools():
            print(f"## {t['name']}\n{t.get('description', '')}")
            for k, v in t.get("inputSchema", {}).get("properties", {}).items():
                extra = f" {v['enum']}" if "enum" in v else ""
                print(f"   - {k} ({v.get('type', '')}){extra} {v.get('description', '')}")
            print()
    else:
        args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        r = call(sys.argv[1], args)
        print(r if isinstance(r, str) else json.dumps(r, ensure_ascii=False, indent=2))
