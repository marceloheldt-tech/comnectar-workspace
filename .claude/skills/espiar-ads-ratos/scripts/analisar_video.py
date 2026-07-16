#!/usr/bin/env python3
"""
Extrai frames de um video de anuncio pra IA analisar o hook e a estrutura.
Foca nos primeiros segundos (onde mora o hook) + alguns pontos ao longo.

  python3 scripts/analisar_video.py <video.mp4> [prefixo_saida]

Salva os frames em <pasta_do_video>/frames_<prefixo>/ e imprime os caminhos.
Precisa de ffmpeg instalado. Depois, o Claude le esses frames (visao) e escreve
a analise no sintese.json.
"""
import os, sys, subprocess, shutil

# hook mora nos primeiros segundos; depois amostra o corpo
TIMESTAMPS = [0, 1, 2, 3, 5, 8, 15, 30, 60]


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    video = sys.argv[1]
    prefixo = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(os.path.basename(video))[0]
    if not shutil.which("ffmpeg"):
        sys.exit("ERRO: ffmpeg nao encontrado. Instala com: brew install ffmpeg")
    if not os.path.exists(video):
        sys.exit(f"ERRO: video nao existe: {video}")

    outdir = os.path.join(os.path.dirname(os.path.abspath(video)), f"frames_{prefixo}")
    os.makedirs(outdir, exist_ok=True)

    # duracao pra nao pedir frame alem do fim
    try:
        dur = float(subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip())
    except Exception:
        dur = 9999

    paths = []
    for t in TIMESTAMPS:
        if t > dur:
            break
        p = os.path.join(outdir, f"{t:03d}s.jpg")
        subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", video,
                        "-frames:v", "1", "-q:v", "3", p, "-y"],
                       capture_output=True)
        if os.path.exists(p):
            paths.append(p)

    print(f"duracao={dur:.0f}s frames={len(paths)}")
    for p in paths:
        print(p)


if __name__ == "__main__":
    main()
