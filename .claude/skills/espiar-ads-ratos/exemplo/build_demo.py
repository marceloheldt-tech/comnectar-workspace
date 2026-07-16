#!/usr/bin/env python3
"""
Gera o relatorio de EXEMPLO da skill com dados 100% ficticios (nenhum
concorrente real). Criativos sao placeholders borrados. Serve so pra ilustrar
o formato do relatorio no README.

  python3 exemplo/build_demo.py

Escreve exemplo/_demo/index.html (o print vira exemplo/relatorio-exemplo.png).
"""
import os, json, sys, random

random.seed(7)
HERE = os.path.dirname(os.path.abspath(__file__))
DEMO = os.path.join(HERE, "_demo")
os.makedirs(os.path.join(DEMO, "thumbs"), exist_ok=True)

# -------- placeholders borrados (creative redigido) --------
PALETAS = [((32,34,60),(90,60,140)), ((20,40,55),(30,110,120)), ((60,30,40),(150,70,60)),
           ((25,50,35),(60,130,90)), ((45,40,25),(140,110,50)), ((30,30,40),(70,70,110))]
def placeholder(path, seed):
    try:
        from PIL import Image, ImageFilter, ImageDraw
    except Exception:
        # sem PIL: cria um jpg minimo solido
        open(path, "wb").close(); return
    random.seed(seed)
    a, b = random.choice(PALETAS)
    w = h = 400
    img = Image.new("RGB", (w, h), a)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3)))
    for _ in range(6):
        x0, y0 = random.randint(0, w), random.randint(0, h)
        d.ellipse([x0, y0, x0+random.randint(60,180), y0+random.randint(60,180)],
                  fill=tuple(min(255, c+random.randint(10,50)) for c in b))
    img = img.filter(ImageFilter.GaussianBlur(14))
    img.save(path, "JPEG", quality=70)

# -------- dados ficticios --------
LABEL = "Aurora IA"
DOM_MAIN = "cursoaurora.com.br"
DOM_APP = "appaurora.com.br"
CTAS = ["Saiba mais", "Cadastre-se", "Baixar"]
COPY = ("Criei 30 dias de conteúdo numa tarde só, usando IA.\n\n"
        "O fluxo escreve, edita e agenda os posts sozinho, sem eu ficar na frente da tela em branco. "
        "Montei um passo a passo simples pra você fazer igual, mesmo começando do zero hoje.")
HOOKS = [
    ("Criei 30 dias de conteúdo numa tarde só.", 128, "VIDEO"),
    ("Esse fluxo escreve e agenda meus posts sozinho.", 121, "VIDEO"),
    ("Parei de travar na tela em branco.", 116, "VIDEO"),
    ("De 0 a 10 mil seguidores usando só IA.", 104, "IMAGE"),
    ("A ferramenta que virou meu social media.", 96, "VIDEO"),
    ("Faço num clique o que levava a semana toda.", 74, "IMAGE"),
    ("Testei por 30 dias e não volto mais atrás.", 63, "VIDEO"),
    ("Escreve igual gente, no seu tom de voz.", 41, "VIDEO"),
    ("As inscrições do Método Aurora estão abertas.", 33, "IMAGE"),
    ("Últimas 48h do preço de lançamento.", 19, "IMAGE"),
    ("Conteúdo que engaja, sem parecer robô.", 12, "VIDEO"),
    ("Ninguém mais tem desculpa pra não postar.", 6, "VIDEO"),
    ("O passo a passo copia e cola tá no ar.", 3, "IMAGE"),
    ("Bastidor: como montei minha máquina de conteúdo.", 2, "VIDEO"),
]
conceitos = []
for i, (hook, dias, fmt) in enumerate(HOOKS):
    placeholder(os.path.join(DEMO, "thumbs", f"c{i}.jpg"), i + 1)
    dom = DOM_MAIN if i % 3 != 0 else DOM_APP
    conceitos.append({
        "i": i, "dias": dias, "variacoes": random.randint(1, 5), "formato": fmt,
        "hook": hook, "cta": random.choice(CTAS),
        "landing": f"https://{dom}/?utm_source=meta", "dominio": dom,
        "copy": COPY, "ad_url": "https://www.facebook.com/ads/library/",
        "thumb": f"thumbs/c{i}.jpg", "imagem": "", "video": "",
    })
total = sum(c["variacoes"] for c in conceitos)
meta = {"label": LABEL, "page_id": "000000000000000", "pais": "BR", "status": "ACTIVE",
        "data": "2026-07-03", "total_ativos": total, "conceitos": len(conceitos),
        "paginas_lidas": 0, "creditos_restantes": 940, "top3_video": []}
json.dump({"meta": meta, "conceitos": conceitos},
          open(os.path.join(DEMO, "conceitos.json"), "w"), ensure_ascii=False, indent=2)

sintese = {
    "resumo_oferta": "A Aurora IA (marca fictícia deste exemplo) vende o Método Aurora, um curso de criação de conteúdo com IA, e um app de apoio. A tese é sempre a mesma: transformar horas de trabalho manual numa máquina de conteúdo automática, e mostrar o passo a passo pra qualquer pessoa replicar do zero.",
    "promessas": ["30 dias de conteúdo produzidos numa única tarde",
                  "Um fluxo que escreve, edita e agenda os posts sozinho",
                  "Manter o seu tom de voz, sem parecer robô",
                  "Passo a passo copia e cola pra começar hoje"],
    "angulos": ["Fim do bloqueio criativo", "Ganho de tempo", "Crescer seguidores",
                "Autoridade / bastidor", "Prova de que já funciona"],
    "publico": "Criador de conteúdo e dono de pequeno negócio que trava na frente da tela e quer terceirizar a produção pra IA sem virar técnico.",
    "analise_video": [
        {"titulo": "Criei 30 dias de conteúdo numa tarde só.", "dias": 128,
         "leitura": "Abre com o resultado na tela (o calendário de posts já pronto) antes de qualquer promessa. A prova visual mata o ceticismo logo no primeiro segundo, e o rosto entra só pra narrar."},
        {"titulo": "Esse fluxo escreve e agenda meus posts sozinho.", "dias": 121,
         "leitura": "Screen-recording da ferramenta rodando, com legenda grande de hook e o rosto num PIP pequeno. Mostra o 'como funciona' em vez de só falar, o que aumenta a credibilidade."},
        {"titulo": "Parei de travar na tela em branco.", "dias": 116,
         "leitura": "Talking head puro com uma dor específica no hook. Troca a promessa de ferramenta por uma dor emocional (o bloqueio), alcançando quem ainda não pensa em IA."},
    ],
    "ideias_pra_voce": [
        "Abrir o criativo com o resultado/ferramenta na tela antes de falar da promessa.",
        "Reciclar uma copy de corpo vencedora com vários hooks visuais diferentes e testar o hook como variável isolada.",
        "Usar uma dor emocional específica no hook (ex: 'travar na tela em branco') pra alcançar quem ainda não busca a solução.",
        "Colar um antídoto de ceticismo na promessa ('sem parecer robô', 'começando do zero').",
    ],
}
json.dump(sintese, open(os.path.join(DEMO, "sintese.json"), "w"), ensure_ascii=False, indent=2)

# gera o html reusando o gerador da skill
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "scripts"))
os.system(f'python3 "{os.path.join(os.path.dirname(HERE), "scripts", "gerar_relatorio.py")}" "{DEMO}"')
print("demo em:", os.path.join(DEMO, "index.html"))
