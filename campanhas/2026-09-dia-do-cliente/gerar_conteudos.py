# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, r"c:\Users\marce\Desktop\claude comnéctar\.claude\skills\planejamento-conteudo")
from gerar_excel import build_workbook

semanas = {
    "Ter 15 - Qua 16 set": [
        [
            "Ter 15/09",
            "Instagram",
            "Carrossel (feed)",
            "Lançamento - 10% off em toda a loja",
            "SLIDE 1 (capa)\n"
            "Feliz Dia do Cliente 🍷\n"
            "10% off em toda a loja, só até quarta\n\n"
            "SLIDE 2\n"
            "Cada garrafa que sai daqui carrega uma escolha: a sua, de confiar na curadoria da comnéctar.\n"
            "Hoje é sobre agradecer isso.\n\n"
            "SLIDE 3\n"
            "10% de desconto em todos os itens da loja\n"
            "Cupom: DIACLIENTE10\n"
            "Válido até quarta-feira, 16/09\n\n"
            "SLIDE 4\n"
            "Só usar o cupom DIACLIENTE10 na hora de fechar o pedido. Desconto direto na loja inteira.\n\n"
            "SLIDE 5 (CTA)\n"
            "Aproveita e garante o vinho que já tava namorando há um tempo. Link na bio.\n\n"
            "SLIDE 6 (fechamento)\n"
            "comnéctar agradece por fazer parte disso. Te esperamos na loja 🥂",
            "6 slides no padrão da marca: capa com garrafa(s) ambientada(s) e máscara escura pro texto (produto sempre visível, fora da máscara). Slides 2-4 podem ser arte gráfica no fundo de marca (vinho/dourado), sem foto. Slide 5-6 com foto de garrafa em destaque. Seguir marca/design-guide.md.",
        ],
        [
            "Ter 15/09",
            "Instagram",
            "Stories",
            "Reforço lançamento + link direto",
            "10% off em toda a loja 🍷\n"
            "Só até quarta.\n"
            "Link na bio ou toca aqui ⬆️",
            "Stories vertical 1080x1920, arte de marca com o mesmo visual do carrossel (reaproveitar capa). Incluir sticker de link 'Compre agora' apontando pra loja.",
        ],
        [
            "Ter 15/09",
            "WhatsApp",
            "Disparo",
            "Lançamento oferta 10% off",
            "Oi, [nome]! 🍷\n\n"
            "Hoje é Dia do Cliente e queremos comemorar com você: 10% off em toda a loja da comnéctar, até quarta-feira (16/09).\n\n"
            "É só usar o cupom DIACLIENTE10 no carrinho.\n\n"
            "Aproveita pra garantir aquele vinho que você já tava de olho.\n"
            "Ver a loja: [link]",
            "Foto de produto: garrafa ambientada (mesa posta, taça ao lado) ou reaproveitar a capa do carrossel em formato quadrado/vertical pro WhatsApp.",
        ],
        [
            "Ter 15/09",
            "Email",
            "Disparo (newsletter)",
            "Lançamento - Dia do Cliente comnéctar",
            "Assunto: Feliz Dia do Cliente: 10% off em toda a loja 🍷\n"
            "Preview: Nosso jeito de agradecer por fazer parte disso\n\n"
            "Oi, [nome].\n\n"
            "Hoje é Dia do Cliente e, aqui na comnéctar, isso é motivo de comemoração de verdade. Cada pedido que sai daqui carrega uma confiança que a gente não leva por garantido.\n\n"
            "Pra agradecer, colocamos 10% de desconto em toda a loja, até quarta-feira (16/09). Use o cupom DIACLIENTE10 no carrinho.\n\n"
            "É a loja inteira: do espumante que você já ama ao tinto que você ainda não experimentou.\n\n"
            "[Botão: Aproveitar o desconto]\n\n"
            "Um brinde a você, que faz a comnéctar continuar de pé.\n"
            "Equipe comnéctar",
            "Banner de topo com foto de garrafas ambientadas (mesa, taças) e máscara escura pro texto do cupom. Pode reaproveitar a arte da capa do carrossel em formato horizontal.",
        ],
        [
            "Qua 16/09",
            "Instagram",
            "Stories",
            "Últimas horas - oferta termina hoje",
            "Últimas horas do desconto de Dia do Cliente\n"
            "10% off termina hoje à noite\n"
            "Ainda dá tempo: link na bio",
            "Stories vertical 1080x1920, mesma arte de marca da campanha com selo ou destaque de 'últimas horas'. Sticker de link 'Compre agora'.",
        ],
        [
            "Qua 16/09",
            "WhatsApp",
            "Disparo",
            "Lembrete - últimas horas da oferta",
            "Oi, [nome]! Só um lembrete rápido: o desconto de Dia do Cliente (10% off em toda a loja) termina hoje à noite.\n\n"
            "Se ainda não aproveitou, esse é o momento. Cupom DIACLIENTE10, direto no carrinho.\n\n"
            "Ver a loja: [link]",
            "Mesma foto de produto usada no disparo de terça, ou variação simples com selo 'últimas horas' sobre a mesma arte.",
        ],
    ],
}

build_workbook(
    out_path=r"c:\Users\marce\Desktop\claude comnéctar\campanhas\2026-09-dia-do-cliente\conteudos-dia-do-cliente.xlsx",
    semanas=semanas,
)
print("Excel gerado com sucesso.")
