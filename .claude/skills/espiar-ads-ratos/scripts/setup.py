#!/usr/bin/env python3
"""
Setup da skill espiar-ads-ratos.

  python3 scripts/setup.py --check          # testa a chave ja configurada
  python3 scripts/setup.py <SUA_API_KEY>    # valida e salva a chave no .env

A validacao faz UMA chamada real (search/companies) pra garantir que a chave
funciona antes de gravar. Mostra os creditos restantes.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(SKILL_DIR, ".env")


def validar(key):
    cands = lib.resolve_company("nike", key=key)
    return cands, lib.credits_remaining()


def main():
    args = [a for a in sys.argv[1:]]
    if not args:
        print(__doc__)
        sys.exit(1)

    if args[0] == "--check":
        key = lib.load_key()
        cands, credits = validar(key)
        print(f"OK: chave valida. Teste retornou {len(cands)} paginas. "
              f"Creditos restantes: {credits if credits is not None else '?'}")
        return

    key = args[0].strip()
    print("Validando a chave com uma chamada de teste...")
    cands, credits = validar(key)
    with open(ENV_PATH, "w") as f:
        f.write("# espiar-ads-ratos - chave da ScrapeCreators (nao commitar)\n")
        f.write(f"SCRAPECREATORS_API_KEY={key}\n")
    os.chmod(ENV_PATH, 0o600)
    print(f"OK: chave valida e salva em {ENV_PATH}")
    print(f"Creditos restantes: {credits if credits is not None else '?'}")
    print("Pronto. Agora e so pedir pra espiar um concorrente.")


if __name__ == "__main__":
    main()
