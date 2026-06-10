"""
Leitor de tabelas de fornecedores — comnéctar
Uso: python leitor.py --fornecedor "mistral" --markup 2.5 [--tipo tinto] [--pais Chile] [--uva malbec] [--max 300] [--min 50] [--busca "palavra"]
"""
import argparse
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.abspath(os.path.join(BASE, "..", "..", ".."))

with open(os.path.join(BASE, "mapeamento.json"), encoding="utf-8") as f:
    MAPA = json.load(f)

PASTA = os.path.join(WORKSPACE, MAPA["pasta_base"])


def col_to_idx(col):
    """Converte coluna (int 1-based ou letra) para índice 0-based."""
    if isinstance(col, int):
        return col - 1
    return ord(col.upper()) - ord('A')


def parse_preco(val):
    """Converte string de preço (ex: 'R$ 398,00' ou '398.5') para float."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip()
    s = s.replace("R$", "").replace(" ", "").replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def ler_excel(config):
    import openpyxl
    arquivo = os.path.join(PASTA, config["arquivo"])
    abas = config.get("abas", [config.get("aba")])
    vinhos = []

    for aba_nome in abas:
        wb = openpyxl.load_workbook(arquivo, read_only=True, data_only=True)
        ws = wb[aba_nome]
        data_inicio = config.get("data_inicio", 2)
        filtro = config.get("filtro_linha", "")

        for i, row in enumerate(ws.iter_rows(values_only=True)):
            linha_num = i + 1
            if linha_num < data_inicio:
                continue

            def get(col_key):
                idx = col_to_idx(config.get(col_key, 0)) if config.get(col_key) else None
                if idx is None or idx >= len(row):
                    return None
                return row[idx]

            nome = get("col_nome")
            custo_raw = get("col_custo")
            tipo = get("col_tipo")

            # Aplicar filtro de linha
            if filtro == "col_nome_nao_vazio":
                if not nome or str(nome).strip() == "":
                    continue
            elif filtro == "col_codigo_numerico":
                cod = get("col_codigo")
                try:
                    float(str(cod))
                except (TypeError, ValueError):
                    continue
            elif filtro == "col_custo_numerico":
                if parse_preco(custo_raw) is None:
                    continue
            elif filtro == "col_custo_numerico_e_col_nome_nao_vazio":
                if parse_preco(custo_raw) is None:
                    continue
                if not nome or str(nome).strip() == "":
                    continue
            elif filtro == "col_nome_nao_vazio_e_col_tipo_nao_vazio":
                if not nome or str(nome).strip() == "":
                    continue
                if not tipo or str(tipo).strip() == "":
                    continue
            elif filtro == "col_nome_nao_vazio_e_col_custo_numerico":
                if not nome or str(nome).strip() == "":
                    continue
                if parse_preco(custo_raw) is None:
                    continue
            elif filtro == "col_codigo_nao_vazio":
                cod = get("col_codigo")
                if not cod or str(cod).strip() == "":
                    continue

            custo = parse_preco(custo_raw)
            formula = config.get("formula", "direto")
            if formula != "direto" and "col_custo * 0.65" in formula:
                custo = custo * 0.65 if custo else None

            if custo is None:
                continue

            vinho = {
                "fornecedor": config["_nome"],
                "nome": str(nome).strip() if nome else "",
                "custo": round(custo, 2),
            }
            for campo in ["col_tipo", "col_safra", "col_pais", "col_regiao", "col_subregiao",
                          "col_uva", "col_produtor", "col_volume", "col_embalagem",
                          "col_codigo", "col_avaliacao"]:
                chave = campo.replace("col_", "")
                val = get(campo)
                if val is not None and str(val).strip() not in ("", "None"):
                    vinho[chave] = str(val).strip()
            vinhos.append(vinho)
        wb.close()
    return vinhos


def ler_pdf_cantu(config):
    import pdfplumber
    arquivo = os.path.join(PASTA, config["arquivo"])
    vinhos = []
    with pdfplumber.open(arquivo) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue
                header = [str(c).strip() if c else "" for c in table[0]]
                # Encontrar índices das colunas relevantes
                def idx(label):
                    for i, h in enumerate(header):
                        if label.lower() in h.lower():
                            return i
                    return None
                i_nome = idx("DESCRI")
                i_pais = idx("PA")
                i_custo = idx("FINAL")
                i_cod = idx("C")
                if i_nome is None or i_custo is None:
                    continue
                for row in table[1:]:
                    if len(row) <= max(filter(lambda x: x is not None, [i_nome, i_custo])):
                        continue
                    nome = row[i_nome] if i_nome is not None else ""
                    custo = parse_preco(row[i_custo]) if i_custo is not None else None
                    if not nome or custo is None:
                        continue
                    vinho = {
                        "fornecedor": "cantu",
                        "nome": str(nome).strip(),
                        "custo": round(custo, 2),
                    }
                    if i_pais is not None and row[i_pais]:
                        vinho["pais"] = str(row[i_pais]).strip()
                    if i_cod is not None and row[i_cod]:
                        vinho["codigo"] = str(row[i_cod]).strip()
                    vinhos.append(vinho)
    return vinhos


def ler_pdf_adega_alentejana(config):
    import pdfplumber
    arquivo = os.path.join(PASTA, config["arquivo"])
    vinhos = []
    GRUPOS_VINHO = ["VINHO", "ESPUMANTE", "CHAMPAGNE", "CAVA", "PROSECCO", "PORT", "JEREZ", "SHERRY", "SAKE"]
    em_grupo_vinho = False

    with pdfplumber.open(arquivo) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table:
                    continue
                for row in table:
                    if not row or not any(row):
                        continue
                    texto_row = " ".join(str(c) for c in row if c).upper()
                    # Detectar grupos
                    if "GRUPO" in texto_row:
                        em_grupo_vinho = any(g in texto_row for g in GRUPOS_VINHO)
                        continue
                    if not em_grupo_vinho:
                        continue
                    # Ignorar linhas de cabeçalho
                    if "PRODUTO" in texto_row and "PREÇO" in texto_row:
                        continue
                    # Tentar extrair: código, nome, país/região, preço final
                    vals = [c for c in row if c and str(c).strip()]
                    if len(vals) < 3:
                        continue
                    # Preço final é o último valor numérico
                    custo = None
                    nome = None
                    pais = None
                    for v in reversed(vals):
                        c = parse_preco(v)
                        if c is not None and c > 1:
                            custo = c
                            break
                    if custo is None:
                        continue
                    # Primeiro campo com texto longo é o nome
                    for v in vals:
                        if len(str(v)) > 8 and not str(v)[0].isdigit():
                            nome = str(v).strip()
                            break
                    if not nome:
                        continue
                    # País/região: campo com "/" ou código de país
                    for v in vals:
                        if "/" in str(v) and len(str(v)) < 20:
                            pais = str(v).strip()
                            break
                    vinho = {
                        "fornecedor": "adega alentejana",
                        "nome": nome,
                        "custo": round(custo, 2),
                    }
                    if pais:
                        vinho["pais"] = pais
                    vinhos.append(vinho)
    return vinhos


def ler_pdf_vila_porto(config):
    import pdfplumber
    arquivo = os.path.join(PASTA, config["arquivo"])
    vinhos = []
    with pdfplumber.open(arquivo) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue
                for row in table:
                    if not row or not any(row):
                        continue
                    vals = [str(c).strip() if c else "" for c in row]
                    # Ignorar cabeçalhos e separadores
                    if any(h in " ".join(vals).upper() for h in ["DESCRIÇÃO", "PRODUTOR", "ARGENTINA", "CHILE", "PORTUGAL", "ESPANHA", "ITÁLIA", "FRANCE", "CASSONE", "ANTAWARA"]):
                        if not vals[-1].startswith("R$"):
                            continue
                    nome = vals[0] if vals[0] else None
                    if not nome or len(nome) < 5:
                        continue
                    produtor = vals[1] if len(vals) > 1 else ""
                    pais = vals[2] if len(vals) > 2 else ""
                    preco_str = vals[-1] if vals else ""
                    custo = parse_preco(preco_str)
                    if custo is None or custo <= 0:
                        continue
                    vinho = {
                        "fornecedor": "vila porto",
                        "nome": nome,
                        "custo": round(custo, 2),
                    }
                    if produtor:
                        vinho["produtor"] = produtor
                    if pais:
                        vinho["pais"] = pais
                    vinhos.append(vinho)
    return vinhos


def carregar_fornecedor(nome):
    config = MAPA["fornecedores"].get(nome.lower())
    if not config:
        raise ValueError(f"Fornecedor '{nome}' não encontrado no mapeamento.")
    config["_nome"] = nome.lower()

    tipo = config["tipo"]
    if tipo == "excel":
        return ler_excel(config)
    elif tipo == "pdf":
        if nome.lower() == "cantu":
            return ler_pdf_cantu(config)
        elif nome.lower() == "adega alentejana":
            return ler_pdf_adega_alentejana(config)
        elif nome.lower() == "vila porto":
            return ler_pdf_vila_porto(config)
    raise ValueError(f"Tipo '{tipo}' não suportado para '{nome}'.")


def filtrar(vinhos, args):
    resultado = []
    for v in vinhos:
        nome = v.get("nome", "").upper()
        tipo = v.get("tipo", "").upper()
        pais = v.get("pais", "").upper()
        regiao = v.get("regiao", v.get("subregiao", "")).upper()
        uva = v.get("uva", "").upper()
        custo = v.get("custo", 0)

        if args.busca:
            termos = args.busca.upper().split()
            texto = f"{nome} {tipo} {pais} {regiao} {uva} {v.get('produtor', '').upper()}"
            if not all(t in texto for t in termos):
                continue
        if args.tipo:
            mapa_tipo = {"tinto": ["TT", "TINTO", "RED"], "branco": ["BC", "BCO", "BRANCO", "WHITE"], "rosado": ["RS", "ROSE", "ROSADO", "ROSÉ"], "espumante": ["ESP", "SPARKLING", "BRUT", "CHAMPAGNE", "CAVA", "PROSECCO"]}
            aceitos = mapa_tipo.get(args.tipo.lower(), [args.tipo.upper()])
            if not any(a in tipo or a in nome for a in aceitos):
                continue
        if args.pais:
            pais_busca = args.pais.upper()
            mapa_pais = {"chile": "CHI", "argentina": "ARG", "franca": "FRA", "france": "FRA", "italia": "ITA", "italy": "ITA", "portugal": "PRT", "espanha": "ESP", "spain": "ESP", "africa": "AFR", "africa do sul": "AFR"}
            abrev = mapa_pais.get(pais_busca.lower(), pais_busca)
            if abrev not in pais and pais_busca not in pais:
                continue
        if args.uva:
            if args.uva.upper() not in uva and args.uva.upper() not in nome:
                continue
        if args.regiao:
            if args.regiao.upper() not in regiao and args.regiao.upper() not in nome:
                continue
        if args.min is not None and custo < args.min:
            continue
        if args.max is not None and custo > args.max:
            continue

        resultado.append(v)
    return resultado


def main():
    parser = argparse.ArgumentParser(description="Consulta vinhos por fornecedor")
    parser.add_argument("--fornecedor", required=True, help="Nome do fornecedor (ex: mistral, decanter, 'world wine')")
    parser.add_argument("--markup", type=float, default=2.0, help="Fator de markup (ex: 2.5)")
    parser.add_argument("--tipo", help="Tipo de vinho: tinto, branco, rosado, espumante")
    parser.add_argument("--pais", help="País (ex: Chile, Argentina, França)")
    parser.add_argument("--uva", help="Uva (ex: Malbec, Chardonnay)")
    parser.add_argument("--regiao", help="Região (ex: Mendoza, Bordeaux)")
    parser.add_argument("--busca", help="Busca livre no nome/descrição")
    parser.add_argument("--min", type=float, help="Custo mínimo (R$)")
    parser.add_argument("--max", type=float, help="Custo máximo de custo (R$)")
    parser.add_argument("--json", action="store_true", help="Saída em JSON")
    args = parser.parse_args()

    vinhos = carregar_fornecedor(args.fornecedor)
    filtrados = filtrar(vinhos, args)

    for v in filtrados:
        v["preco_venda"] = round(v["custo"] * args.markup, 2)
        v["markup"] = args.markup

    if args.json:
        print(json.dumps(filtrados, ensure_ascii=False, indent=2))
        return

    print(f"\nFornecedor: {args.fornecedor.upper()} | Markup: {args.markup}x | Resultados: {len(filtrados)}\n")
    print(f"{'#':<4} {'Nome':<45} {'Tipo':<8} {'País':<12} {'Safra':<7} {'Custo':>9} {'Venda':>9}")
    print("-" * 100)
    for i, v in enumerate(filtrados, 1):
        nome = v.get("nome", "")[:44]
        tipo = v.get("tipo", "")[:7]
        pais = v.get("pais", "")[:11]
        safra = v.get("safra", "")[:6]
        custo = f"R${v['custo']:>8.2f}"
        venda = f"R${v['preco_venda']:>8.2f}"
        print(f"{i:<4} {nome:<45} {tipo:<8} {pais:<12} {safra:<7} {custo} {venda}")


if __name__ == "__main__":
    main()
