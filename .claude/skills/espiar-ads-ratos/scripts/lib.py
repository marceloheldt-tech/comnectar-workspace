#!/usr/bin/env python3
"""
espiar-ads-ratos - biblioteca compartilhada.
Fala com a API da ScrapeCreators (Biblioteca de Anuncios da Meta) e traz helpers
de parsing dos anuncios. Sem dependencias externas (so stdlib).
"""
import os, re, json, sys, datetime, urllib.request, urllib.parse, subprocess

BASE = "https://api.scrapecreators.com"
HOJE = datetime.date.today()
_SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ---------------------------------------------------------------- chave / auth
def _resolve_op(ref):
    """Resolve uma referencia op://... via 1Password CLI (opcional).
    Se voce usa a chave crua no .env, isso nem roda."""
    try:
        out = subprocess.run(["op", "read", ref], capture_output=True, text=True, timeout=60)
        if out.returncode == 0:
            return out.stdout.strip()
    except Exception:
        pass
    return None


def load_key():
    """Ordem: env var -> .env da skill. Aceita valor cru ou referencia op://."""
    val = os.environ.get("SCRAPECREATORS_API_KEY")
    if not val:
        env_path = os.path.join(_SKILL_DIR, ".env")
        if os.path.exists(env_path):
            for line in open(env_path):
                line = line.strip()
                if line.startswith("SCRAPECREATORS_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    if val and val.startswith("op://"):
        resolved = _resolve_op(val)
        if not resolved:
            sys.exit("ERRO: chave e uma referencia op:// mas o 1Password CLI nao resolveu. "
                     "Configura a chave crua no .env ou instala/loga o `op`.")
        val = resolved
    if not val:
        sys.exit("ERRO: SCRAPECREATORS_API_KEY nao configurada. Roda o setup primeiro "
                 "(scripts/setup.py) ou cria o .env a partir do .env.example.")
    return val


# ---------------------------------------------------------------- chamadas API
_LAST_CREDITS = None

def credits_remaining():
    """Creditos restantes reportados pela ultima chamada (ou None)."""
    return _LAST_CREDITS

def api_get(path, params=None, key=None):
    global _LAST_CREDITS
    key = key or load_key()
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
    req = urllib.request.Request(url, headers={"x-api-key": key, "User-Agent": "espiar-ads-ratos"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            d = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 401:
            sys.exit("ERRO 401: chave da ScrapeCreators invalida. Confere no painel app.scrapecreators.com.")
        if e.code == 402:
            sys.exit("ERRO 402: creditos da ScrapeCreators esgotados. Veja seu saldo em app.scrapecreators.com.")
        raise
    if isinstance(d, dict) and d.get("credits_remaining") is not None:
        _LAST_CREDITS = d["credits_remaining"]
    return d


def resolve_company(query, key=None):
    """Nome/@ -> lista de paginas candidatas [{name, page_id, likes, ig_username,...}]."""
    d = api_get("/v1/facebook/adLibrary/search/companies", {"query": query}, key)
    out = []
    for c in (d.get("searchResults") or []):
        out.append({
            "name": c.get("name"),
            "page_id": str(c.get("page_id") or ""),
            "likes": c.get("likes"),
            "verified": bool(c.get("verification") and c.get("verification") != "NOT_VERIFIED"),
            "category": c.get("category"),
            "ig_username": c.get("ig_username"),
            "ig_followers": c.get("ig_followers"),
            "image": c.get("image_uri"),
        })
    return [c for c in out if c["page_id"]]


def ig_to_name(handle, key=None):
    """Resolve um @ do Instagram pro nome real da pessoa/marca (custa 1 credito).
    Usa a parte antes do '|' (ex: 'Fulano | Curso de X' -> 'Fulano')."""
    handle = handle.lstrip("@").strip()
    try:
        d = api_get("/v1/instagram/profile", {"handle": handle}, key)
    except Exception:
        return None
    user = (d.get("data") or {}).get("user") or {}
    fn = user.get("full_name")
    if not fn:
        return None
    return re.split(r"[|\-–—]", fn)[0].strip()


def page_ads(page_id, country=None, status="ACTIVE", cursor=None, key=None):
    """Uma pagina de anuncios de uma empresa. Retorna (lista, cursor)."""
    d = api_get("/v1/facebook/adLibrary/company/ads",
                {"pageId": page_id, "country": country, "status": status, "cursor": cursor}, key)
    return d.get("results") or [], d.get("cursor")


def search_ads(query, country=None, cursor=None, key=None):
    """Busca anuncios por palavra-chave (modo nicho). Retorna (lista, cursor, total)."""
    d = api_get("/v1/facebook/adLibrary/search/ads",
                {"query": query, "country": country, "cursor": cursor}, key)
    return d.get("searchResults") or [], d.get("cursor"), d.get("searchResultsCount")


def parse_page_id_from_url(url):
    """Extrai view_all_page_id de uma URL da Ad Library. Ou None + keyword se for busca."""
    m = re.search(r"view_all_page_id=(\d+)", url)
    if m:
        return {"page_id": m.group(1)}
    q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
    if q.get("q"):
        return {"query": q["q"][0]}
    m = re.search(r"/(\d{6,})", url)
    if m:
        return {"page_id": m.group(1)}
    return {}


# ---------------------------------------------------------------- helpers de ad
def snap(a):
    return a.get("snapshot") or {}

def dias_rodando(a):
    sd = a.get("start_date")
    try:
        return (HOJE - datetime.date.fromtimestamp(sd)).days
    except Exception:
        return -1

def copy_text(a):
    b = snap(a).get("body") or {}
    return (b.get("text") if isinstance(b, dict) else "") or ""

def hook(a):
    t = copy_text(a).strip()
    return t.split("\n")[0].strip() if t else ""

def landing(a):
    return snap(a).get("link_url") or ""

def dominio(url):
    m = re.search(r"https?://([^/]+)", url or "")
    return m.group(1) if m else ""

def formato(a):
    return snap(a).get("display_format") or "?"

def cta(a):
    return snap(a).get("cta_text") or snap(a).get("cta_type") or ""

def ad_url(a):
    return a.get("ad_library_url") or a.get("url") or (
        f"https://www.facebook.com/ads/library/?id={a.get('ad_archive_id')}" if a.get("ad_archive_id") else "")

def thumb_url(a):
    s = snap(a)
    vids = s.get("videos") or []
    if vids:
        return vids[0].get("video_preview_image_url") or ""
    imgs = s.get("images") or []
    if imgs:
        return imgs[0].get("resized_image_url") or imgs[0].get("original_image_url") or ""
    cards = s.get("cards") or []
    if cards:
        return cards[0].get("resized_image_url") or cards[0].get("original_image_url") or ""
    return ""

def video_url(a):
    for v in (snap(a).get("videos") or []):
        u = v.get("video_hd_url") or v.get("video_sd_url")
        if u:
            return u
    return ""

def download(url, path):
    if not url:
        return False
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=90) as r:
            open(path, "wb").write(r.read())
        return True
    except Exception:
        return False


def dedupe_conceitos(ads):
    """Agrupa anuncios por collation_id (variacoes do mesmo criativo).
    Retorna lista de conceitos ordenada por longevidade desc."""
    from collections import defaultdict
    grupos = defaultdict(list)
    for a in ads:
        grupos[a.get("collation_id") or a.get("ad_archive_id")].append(a)
    conceitos = []
    for cid, g in grupos.items():
        rep = max(g, key=dias_rodando)
        conceitos.append({"cid": cid, "n": len(g), "dias": dias_rodando(rep), "rep": rep, "ads": g})
    conceitos.sort(key=lambda c: c["dias"], reverse=True)
    return conceitos
