"""
Calculadora de fechamento mensal — comnéctar
Uso: python calculadora.py --mes 2026-07

Lê os relatórios exportados do Bling em financeiro/[AAAA-MM]/ e calcula:
- Fechamento por competência (receita, CMV, margem bruta, despesas por categoria, resultado)
- Fechamento de caixa (total recebido, total pago, resultado de caixa)

Detecta colunas automaticamente pelo cabeçalho. Se não conseguir identificar uma coluna,
usa o valor configurado em mapeamento.json (colunas.<campo>) como override manual.

Saída: JSON no stdout com todos os números, avisos e o detalhe por categoria/produto.
"""
import argparse
import json
import os
import unicodedata

BASE = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.abspath(os.path.join(BASE, "..", "..", ".."))

with open(os.path.join(BASE, "mapeamento.json"), encoding="utf-8") as f:
    MAPA = json.load(f)


def norm(s):
    s = str(s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s


def parse_valor(val):
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip()
    if not s:
        return 0.0
    s = s.replace("R$", "").replace(" ", "")
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0


def achar_coluna(headers, candidatos, override=None):
    if override:
        for i, h in enumerate(headers):
            if norm(h) == norm(override):
                return i
    headers_norm = [norm(h) for h in headers]
    for c in candidatos:
        for i, hn in enumerate(headers_norm):
            if c in hn:
                return i
    return None


def ler_planilha(caminho):
    import openpyxl
    wb = openpyxl.load_workbook(caminho, read_only=True, data_only=True)
    ws = wb.active
    linhas = [row for row in ws.iter_rows(values_only=True) if any(c is not None for c in row)]
    if not linhas:
        return [], []
    headers = list(linhas[0])
    dados = linhas[1:]
    return headers, dados


def carregar_arquivo(pasta, tipo):
    cfg = MAPA[tipo]
    caminho = os.path.join(pasta, cfg["arquivo"])
    if not os.path.exists(caminho):
        return None, None, f"Arquivo não encontrado: {cfg['arquivo']}"
    headers, dados = ler_planilha(caminho)
    if not headers:
        return None, None, f"Arquivo vazio: {cfg['arquivo']}"
    return headers, dados, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mes", required=True, help="Mês no formato AAAA-MM, ex: 2026-07")
    args = ap.parse_args()

    pasta = os.path.join(WORKSPACE, "financeiro", args.mes)
    avisos = []
    resultado = {"mes": args.mes, "pasta": pasta}

    # --- Preços e custos por produto ---
    tabela_custos = {}
    headers, dados, erro = carregar_arquivo(pasta, "precos_custos")
    if erro:
        avisos.append(erro)
    else:
        ov = MAPA["precos_custos"]["colunas"]
        i_prod = achar_coluna(headers, ["produto", "descricao", "nome", "item"], ov.get("produto"))
        i_custo = achar_coluna(headers, ["custo"], ov.get("custo"))
        i_preco = achar_coluna(headers, ["preco", "valor"], ov.get("preco"))
        if i_prod is None or i_custo is None:
            avisos.append("precos-custos.xlsx: não identifiquei as colunas de produto/custo — configure em mapeamento.json")
        else:
            for row in dados:
                if i_prod >= len(row) or row[i_prod] is None:
                    continue
                nome = norm(row[i_prod])
                tabela_custos[nome] = {
                    "produto": row[i_prod],
                    "preco": parse_valor(row[i_preco]) if i_preco is not None and i_preco < len(row) else None,
                    "custo": parse_valor(row[i_custo]) if i_custo < len(row) else 0.0,
                }

    # --- Vendas do mês ---
    receita_bruta = 0.0
    cmv = 0.0
    qtd_total = 0
    produtos_sem_custo = {}
    headers, dados, erro = carregar_arquivo(pasta, "vendas")
    if erro:
        avisos.append(erro)
    else:
        ov = MAPA["vendas"]["colunas"]
        i_prod = achar_coluna(headers, ["produto", "descricao", "item"], ov.get("produto"))
        i_qtd = achar_coluna(headers, ["quantidade", "qtde", "qtd"], ov.get("quantidade"))
        i_preco = achar_coluna(headers, ["valor unit", "preco unit", "preco venda", "valor venda", "preco", "valor"], ov.get("preco_venda"))
        if i_prod is None or i_qtd is None or i_preco is None:
            avisos.append("vendas.xlsx: não identifiquei produto/quantidade/preço — configure em mapeamento.json")
        else:
            for row in dados:
                if i_prod >= len(row) or row[i_prod] is None:
                    continue
                nome_raw = row[i_prod]
                nome = norm(nome_raw)
                qtd = parse_valor(row[i_qtd]) if i_qtd < len(row) else 0
                preco_venda = parse_valor(row[i_preco]) if i_preco < len(row) else 0
                receita_bruta += preco_venda * qtd
                qtd_total += qtd
                info = tabela_custos.get(nome)
                if info and info["custo"] is not None:
                    cmv += info["custo"] * qtd
                else:
                    produtos_sem_custo[nome_raw] = produtos_sem_custo.get(nome_raw, 0) + qtd
        if produtos_sem_custo:
            avisos.append(f"{len(produtos_sem_custo)} produto(s) vendido(s) sem custo encontrado em precos-custos.xlsx — CMV pode estar subestimado")

    margem_bruta = receita_bruta - cmv

    # --- Despesas por competência ---
    despesas_por_categoria = {}
    total_despesas = 0.0
    headers, dados, erro = carregar_arquivo(pasta, "despesas_competencia")
    if erro:
        avisos.append(erro)
    else:
        ov = MAPA["despesas_competencia"]["colunas"]
        i_cat = achar_coluna(headers, ["categoria", "centro de custo", "grupo"], ov.get("categoria"))
        i_valor = achar_coluna(headers, ["valor", "total"], ov.get("valor"))
        if i_valor is None:
            avisos.append("despesas-competencia.xlsx: não identifiquei a coluna de valor — configure em mapeamento.json")
        else:
            for row in dados:
                if i_valor >= len(row):
                    continue
                valor = parse_valor(row[i_valor])
                cat = row[i_cat] if i_cat is not None and i_cat < len(row) and row[i_cat] else "Sem categoria"
                despesas_por_categoria[cat] = despesas_por_categoria.get(cat, 0.0) + valor
                total_despesas += valor

    resultado_competencia = margem_bruta - total_despesas

    # --- Caixa: pagas e recebidas ---
    def somar_caixa(tipo):
        total = 0.0
        por_categoria = {}
        headers, dados, erro = carregar_arquivo(pasta, tipo)
        if erro:
            avisos.append(erro)
            return total, por_categoria
        ov = MAPA[tipo]["colunas"]
        i_cat = achar_coluna(headers, ["categoria", "centro de custo", "grupo"], ov.get("categoria"))
        i_valor = achar_coluna(headers, ["valor", "total"], ov.get("valor"))
        if i_valor is None:
            avisos.append(f"{MAPA[tipo]['arquivo']}: não identifiquei a coluna de valor — configure em mapeamento.json")
            return total, por_categoria
        for row in dados:
            if i_valor >= len(row):
                continue
            valor = parse_valor(row[i_valor])
            total += valor
            if i_cat is not None and i_cat < len(row) and row[i_cat]:
                por_categoria[row[i_cat]] = por_categoria.get(row[i_cat], 0.0) + valor
        return total, por_categoria

    total_pago, pago_por_categoria = somar_caixa("contas_pagas")
    total_recebido, recebido_por_categoria = somar_caixa("contas_recebidas")
    resultado_caixa = total_recebido - total_pago

    resultado.update({
        "competencia": {
            "receita_bruta": round(receita_bruta, 2),
            "cmv": round(cmv, 2),
            "margem_bruta": round(margem_bruta, 2),
            "quantidade_vendida": qtd_total,
            "despesas_por_categoria": {k: round(v, 2) for k, v in despesas_por_categoria.items()},
            "total_despesas": round(total_despesas, 2),
            "resultado": round(resultado_competencia, 2),
            "produtos_sem_custo": produtos_sem_custo,
        },
        "caixa": {
            "total_recebido": round(total_recebido, 2),
            "total_pago": round(total_pago, 2),
            "resultado": round(resultado_caixa, 2),
            "recebido_por_categoria": {k: round(v, 2) for k, v in recebido_por_categoria.items()},
            "pago_por_categoria": {k: round(v, 2) for k, v in pago_por_categoria.items()},
        },
        "diferenca_competencia_vs_caixa": round(resultado_competencia - resultado_caixa, 2),
        "avisos": avisos,
    })

    print(json.dumps(resultado, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
