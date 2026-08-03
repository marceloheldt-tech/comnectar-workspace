"""
Calculadora de fechamento mensal — comnéctar
Uso: python calculadora.py --mes 2026-07

Lê os relatórios exportados do Bling em financeiro/[AAAA-MM]/ e calcula:

- Resultado do mês: receita bruta das vendas (por competência) − CMV (custo × quantidade
  vendida de cada produto) − total pago no mês (contas-pagas.xlsx). A despesa aqui é por
  caixa (não existe data de vencimento separada da data de pagamento no Bling), então isso
  NÃO é um fechamento por competência puro — é um híbrido: receita de competência, despesa
  de caixa. Rotulado como "Resultado do mês", não "resultado por competência".
- Fluxo de caixa puro: total recebido − total pago no mês (contas-recebidas.xlsx e
  contas-pagas.xlsx). Esse sim é 100% caixa dos dois lados.

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
    # Indexado por código (mais confiável — nome de produto quebra em várias linhas
    # em exports de PDF) com fallback por nome normalizado.
    custos_por_codigo = {}
    custos_por_nome = {}
    headers, dados, erro = carregar_arquivo(pasta, "precos_custos")
    if erro:
        avisos.append(erro)
    else:
        ov = MAPA["precos_custos"]["colunas"]
        i_cod = achar_coluna(headers, ["codigo", "cod."], ov.get("codigo"))
        i_prod = achar_coluna(headers, ["produto", "descricao", "nome", "item"], ov.get("produto"))
        i_custo = achar_coluna(headers, ["custo"], ov.get("custo"))
        i_preco = achar_coluna(headers, ["preco", "valor"], ov.get("preco"))
        if i_prod is None or i_custo is None:
            avisos.append("precos-custos.xlsx: não identifiquei as colunas de produto/custo — configure em mapeamento.json")
        else:
            for row in dados:
                if i_prod >= len(row) or row[i_prod] is None:
                    continue
                info = {
                    "produto": row[i_prod],
                    "preco": parse_valor(row[i_preco]) if i_preco is not None and i_preco < len(row) else None,
                    "custo": parse_valor(row[i_custo]) if i_custo < len(row) else 0.0,
                }
                custos_por_nome[norm(row[i_prod])] = info
                if i_cod is not None and i_cod < len(row) and row[i_cod] is not None:
                    custos_por_codigo[str(row[i_cod]).strip()] = info

    # --- Vendas do mês ---
    receita_bruta = 0.0
    cmv = 0.0
    qtd_total = 0
    produtos_sem_custo = {}
    vendas_por_produto = {}
    headers, dados, erro = carregar_arquivo(pasta, "vendas")
    if erro:
        avisos.append(erro)
    else:
        ov = MAPA["vendas"]["colunas"]
        i_cod = achar_coluna(headers, ["codigo", "cod."], ov.get("codigo"))
        i_prod = achar_coluna(headers, ["produto", "descricao", "item"], ov.get("produto"))
        i_qtd = achar_coluna(headers, ["quantidade", "qtde", "qtd"], ov.get("quantidade"))
        i_valor_total = achar_coluna(headers, ["valor total", "total"], ov.get("valor_total"))
        i_preco_unit = achar_coluna(headers, ["valor unit", "preco unit", "preco venda", "valor venda", "preco", "valor"], ov.get("preco_venda"))
        if i_qtd is None or (i_valor_total is None and i_preco_unit is None) or (i_cod is None and i_prod is None):
            avisos.append("vendas.xlsx: não identifiquei código/produto, quantidade ou valor — configure em mapeamento.json")
        else:
            for row in dados:
                cod = str(row[i_cod]).strip() if i_cod is not None and i_cod < len(row) and row[i_cod] is not None else None
                nome_raw = row[i_prod] if i_prod is not None and i_prod < len(row) else None
                if cod is None and not nome_raw:
                    continue
                qtd = parse_valor(row[i_qtd]) if i_qtd < len(row) else 0

                if i_valor_total is not None and i_valor_total < len(row):
                    venda_total = parse_valor(row[i_valor_total])
                else:
                    venda_total = parse_valor(row[i_preco_unit]) * qtd if i_preco_unit < len(row) else 0

                receita_bruta += venda_total
                qtd_total += qtd

                info = custos_por_codigo.get(cod) if cod else None
                if info is None and nome_raw:
                    info = custos_por_nome.get(norm(nome_raw))
                custo_unit = info["custo"] if info and info["custo"] is not None else None
                nome_produto = info["produto"] if info else (nome_raw or f"Código {cod}")

                if custo_unit is not None:
                    cmv += custo_unit * qtd
                else:
                    chave_sem_custo = nome_produto if nome_raw else f"Código {cod}"
                    produtos_sem_custo[chave_sem_custo] = produtos_sem_custo.get(chave_sem_custo, 0) + qtd

                item = vendas_por_produto.setdefault(nome_produto, {
                    "quantidade": 0, "receita": 0.0, "custo": 0.0, "lucro": 0.0, "sem_custo": custo_unit is None
                })
                item["quantidade"] += qtd
                item["receita"] += venda_total
                if custo_unit is not None:
                    item["custo"] += custo_unit * qtd
                    item["lucro"] = item["receita"] - item["custo"]
        if produtos_sem_custo:
            avisos.append(f"{len(produtos_sem_custo)} produto(s) vendido(s) sem custo encontrado em precos-custos.xlsx — CMV pode estar subestimado")

    margem_bruta = receita_bruta - cmv

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

    # Categorias como "Compras de fornecedores" já estão embutidas no CMV (custo do
    # vinho vendido, vindo de precos-custos.xlsx). Incluí-las de novo aqui contaria o
    # custo do vinho duas vezes — uma via CMV, outra via contas pagas. Por isso ficam
    # de fora do total usado no "Resultado do mês", mas continuam no fluxo de caixa
    # (que é 100% movimentação de dinheiro, sem relação com CMV).
    categorias_ignoradas = {norm(c) for c in MAPA["contas_pagas"].get("categorias_ignoradas_no_resultado_do_mes", [])}
    total_ignorado_no_resultado = sum(v for k, v in pago_por_categoria.items() if norm(k) in categorias_ignoradas)
    total_pago_operacional = total_pago - total_ignorado_no_resultado

    resultado_do_mes = margem_bruta - total_pago_operacional
    resultado_caixa = total_recebido - total_pago

    resultado.update({
        "resultado_do_mes": {
            "receita_bruta": round(receita_bruta, 2),
            "cmv": round(cmv, 2),
            "margem_bruta": round(margem_bruta, 2),
            "quantidade_vendida": qtd_total,
            "total_pago_operacional": round(total_pago_operacional, 2),
            "categorias_ignoradas_no_resultado": {k: round(v, 2) for k, v in pago_por_categoria.items() if norm(k) in categorias_ignoradas},
            "pago_por_categoria": {k: round(v, 2) for k, v in pago_por_categoria.items()},
            "resultado": round(resultado_do_mes, 2),
            "produtos_sem_custo": produtos_sem_custo,
            "vendas_por_produto": {k: {**v, "quantidade": round(v["quantidade"], 2), "receita": round(v["receita"], 2), "custo": round(v["custo"], 2), "lucro": round(v["lucro"], 2)} for k, v in vendas_por_produto.items()},
        },
        "fluxo_de_caixa": {
            "total_recebido": round(total_recebido, 2),
            "total_pago": round(total_pago, 2),
            "resultado": round(resultado_caixa, 2),
            "recebido_por_categoria": {k: round(v, 2) for k, v in recebido_por_categoria.items()},
            "pago_por_categoria": {k: round(v, 2) for k, v in pago_por_categoria.items()},
        },
        "diferenca_resultado_vs_caixa": round(resultado_do_mes - resultado_caixa, 2),
        "avisos": avisos,
    })

    print(json.dumps(resultado, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
