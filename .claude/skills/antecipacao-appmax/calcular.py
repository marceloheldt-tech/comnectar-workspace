"""Calcula a baixa no Bling de um saque antecipado da AppMax.

Uso:
  python calcular.py --saque 3540.71 --pedido "Maigregor Baruffi;001437;2499.00;88.21" \
      --pedido "Michele Querino;001448;239.00;14.11" --pedido "Alexandre Marques;001449;1460.00;95.74"

Cada --pedido = "cliente;NF;valor cheio;total de taxas do gateway (parcelamento + processamento + gateway)".
--retencao padrão 0.10 (10% do valor cheio fica retido).
"""
import argparse
from decimal import Decimal, ROUND_HALF_UP

C = Decimal("0.01")


def brl(v):
    s = f"{v:,.2f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--saque", required=True, type=Decimal)
    p.add_argument("--retencao", default=Decimal("0.10"), type=Decimal)
    p.add_argument("--pedido", action="append", required=True)
    a = p.parse_args()

    pedidos = []
    for raw in a.pedido:
        cliente, nf, bruto, taxas = [x.strip() for x in raw.split(";")]
        bruto, taxas = Decimal(bruto.replace(",", ".")), Decimal(taxas.replace(",", "."))
        retido = (bruto * a.retencao).quantize(C, ROUND_HALF_UP)
        liberado = bruto - taxas - retido
        pedidos.append(dict(cliente=cliente, nf=nf, bruto=bruto, taxas=taxas, retido=retido, liberado=liberado))

    total_liberado = sum(x["liberado"] for x in pedidos)
    antecipacao = total_liberado - a.saque

    # rateio proporcional ao liberado; centavos de arredondamento vão pro maior pedido
    for x in pedidos:
        x["antecip"] = (antecipacao * x["liberado"] / total_liberado).quantize(C, ROUND_HALF_UP)
    sobra = antecipacao - sum(x["antecip"] for x in pedidos)
    max(pedidos, key=lambda x: x["liberado"])["antecip"] += sobra

    for x in pedidos:
        x["tarifa"] = x["taxas"] + x["antecip"]
        x["recebido"] = x["liberado"] - x["antecip"]

    print(f"Liberado (líquido - retenção): R$ {brl(total_liberado)}")
    print(f"Saque: R$ {brl(a.saque)}")
    print(f"Custo da antecipação: R$ {brl(antecipacao)} ({antecipacao / total_liberado * 100:.2f}% do liberado)\n")
    print("| Cliente | NF | Valor cheio | Tarifa (gateway + antecip.) | Valor recebido | Fica em aberto |")
    print("|---|---|---|---|---|---|")
    for x in pedidos:
        print(f"| {x['cliente']} | {x['nf']} | {brl(x['bruto'])} | {brl(x['tarifa'])} ({brl(x['taxas'])} + {brl(x['antecip'])}) "
              f"| {brl(x['recebido'])} | {brl(x['retido'])} |")
    tot = lambda k: brl(sum(x[k] for x in pedidos))
    print(f"| **Total** | | {tot('bruto')} | {tot('tarifa')} | {tot('recebido')} | {tot('retido')} |")

    ok = sum(x["recebido"] for x in pedidos) == a.saque
    print(f"\nConferência: soma do valor recebido = saque? {'OK' if ok else 'NÃO BATE'}")
    if antecipacao < 0:
        print("ATENÇÃO: saque maior que o liberado — revisar taxas ou retenção.")


if __name__ == "__main__":
    main()
