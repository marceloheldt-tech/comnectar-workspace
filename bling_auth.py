"""
Bling OAuth 2.0 — geração inicial do access_token e refresh_token.
Fluxo manual: sem servidor local, sem redirect URI configurado.
"""
import os, base64, secrets, webbrowser, urllib.parse
import requests

# Carrega .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
env = {}
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k] = v

CLIENT_ID     = env.get("BLING_CLIENT_ID", "")
CLIENT_SECRET = env.get("BLING_API_KEY", "")
REDIRECT_URI  = "https://localhost/callback"
STATE         = secrets.token_hex(16)

if not CLIENT_ID or not CLIENT_SECRET:
    print("ERRO: BLING_CLIENT_ID ou BLING_API_KEY não encontrados no .env")
    exit(1)

# Monta URL de autorização
auth_url = (
    f"https://www.bling.com.br/Api/v3/oauth/authorize"
    f"?response_type=code&client_id={CLIENT_ID}&state={STATE}"
    f"&redirect_uri={urllib.parse.quote(REDIRECT_URI)}"
)

print("\n=== Bling OAuth ===")
print("Abrindo o Bling no navegador para você autorizar...\n")
webbrowser.open(auth_url)

print("Depois de clicar em Autorizar, o navegador vai dar um erro de conexão.")
print("Isso é NORMAL. Você só precisa copiar a URL completa que aparece na barra do navegador.")
print("\nEx: https://localhost/callback?code=XXXXXX&state=YYYYYY\n")

callback_url = input("Cole aqui a URL da barra do navegador: ").strip()

# Extrai o code da URL colada
params = urllib.parse.parse_qs(urllib.parse.urlparse(callback_url).query)
code  = params.get("code",  [""])[0]
state = params.get("state", [""])[0]

if not code:
    print("ERRO: não consegui encontrar o 'code' na URL. Tente novamente.")
    exit(1)

if state != STATE:
    print("AVISO: state diferente do esperado. Continuando mesmo assim...")

print(f"\nCódigo recebido. Trocando por tokens...")

# Troca o código pelos tokens
credentials = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
response = requests.post(
    "https://api.bling.com.br/Api/v3/oauth/token",
    headers={
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "1.0",
    },
    data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    },
    timeout=15,
)

if response.status_code != 200:
    print(f"ERRO ao obter tokens: {response.status_code}")
    print(response.text)
    exit(1)

tokens = response.json()
access_token  = tokens["access_token"]
refresh_token = tokens["refresh_token"]
expires_in    = tokens["expires_in"]

print(f"Tokens obtidos! Access token expira em {expires_in//3600}h.")

# Salva no .env
new_lines = []
added_access = added_refresh = False

with open(env_path) as f:
    for line in f:
        if line.startswith("BLING_ACCESS_TOKEN="):
            new_lines.append(f"BLING_ACCESS_TOKEN={access_token}\n")
            added_access = True
        elif line.startswith("BLING_REFRESH_TOKEN="):
            new_lines.append(f"BLING_REFRESH_TOKEN={refresh_token}\n")
            added_refresh = True
        else:
            new_lines.append(line)

if not added_access:
    new_lines.append(f"BLING_ACCESS_TOKEN={access_token}\n")
if not added_refresh:
    new_lines.append(f"BLING_REFRESH_TOKEN={refresh_token}\n")

with open(env_path, "w") as f:
    f.writelines(new_lines)

print("Tokens salvos no .env. Integração pronta!")
