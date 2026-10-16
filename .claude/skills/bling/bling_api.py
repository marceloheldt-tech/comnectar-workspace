"""Cliente minimo da API v3 do Bling: renova o token sozinho, respeita o limite
de 3 req/s e pagina listagens.

    from bling_api import get, listar
    listar("contas/pagar", {"dataPagamentoInicial": "2026-09-01", ...})
"""
import base64
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
TOKENS = RAIZ / "dados" / "bling" / "tokens.json"
BASE = "https://api.bling.com.br/Api/v3/"
TOKEN_URL = "https://www.bling.com.br/Api/v3/oauth/token"
_ultimo = [0.0]


def _env():
    env = {}
    for linha in (RAIZ / ".env").read_text(encoding="utf-8").splitlines():
        if "=" in linha and not linha.lstrip().startswith("#"):
            k, v = linha.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def _renovar(tok):
    env = _env()
    basic = base64.b64encode(f"{env['BLING_CLIENT_ID']}:{env['BLING_CLIENT_SECRET']}".encode()).decode()
    dados = urllib.parse.urlencode({"grant_type": "refresh_token", "refresh_token": tok["refresh_token"]}).encode()
    req = urllib.request.Request(TOKEN_URL, data=dados, method="POST", headers={
        "Authorization": f"Basic {basic}",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "1.0",
    })
    with urllib.request.urlopen(req) as r:
        novo = json.load(r)
    novo["obtido_em"] = int(time.time())
    TOKENS.write_text(json.dumps(novo, indent=2), encoding="utf-8")
    return novo


def _token():
    tok = json.loads(TOKENS.read_text(encoding="utf-8"))
    if time.time() > tok["obtido_em"] + tok["expires_in"] - 300:
        tok = _renovar(tok)
    return tok["access_token"]


def get(caminho, params=None):
    """GET em BASE+caminho. params pode ter listas (viram chave[]=v)."""
    pares = []
    for k, v in (params or {}).items():
        if isinstance(v, (list, tuple)):
            pares += [(f"{k}[]", x) for x in v]
        else:
            pares.append((k, v))
    url = BASE + caminho + ("?" + urllib.parse.urlencode(pares) if pares else "")
    for tentativa in range(5):
        espera = 0.36 - (time.time() - _ultimo[0])
        if espera > 0:
            time.sleep(espera)
        _ultimo[0] = time.time()
        req = urllib.request.Request(url, headers={"Authorization": "Bearer " + _token(), "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2 * (tentativa + 1))
                continue
            raise RuntimeError(f"{e.code} em {caminho}: {e.read()[:300]!r}") from e
    raise RuntimeError(f"Limite de requisicoes estourado em {caminho}")


def listar(caminho, params=None, limite=100):
    """Percorre todas as paginas e devolve a lista de itens de 'data'."""
    itens, pagina = [], 1
    while True:
        lote = get(caminho, {**(params or {}), "pagina": pagina, "limite": limite}).get("data", [])
        itens += lote
        if len(lote) < limite:
            return itens
        pagina += 1
