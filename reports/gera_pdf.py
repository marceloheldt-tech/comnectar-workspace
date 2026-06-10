import urllib.parse, subprocess, os, sys

reports = r'c:/Users/marce/Desktop/claude comnéctar/reports'
chrome  = r'C:/Program Files/Google/Chrome/Application/chrome.exe'

files = [
    ('relatorio-comnectar-2026-06-10.html', 'relatorio-comnectar-2026-06-10.pdf'),
    ('auditoria-comnectar-2026-06-10.html',  'auditoria-comnectar-2026-06-10.pdf'),
]

for html_name, pdf_name in files:
    html_abs = os.path.abspath(os.path.join(reports, html_name))
    pdf_abs  = os.path.abspath(os.path.join(reports, pdf_name))

    fwd = html_abs.replace('\\', '/')
    url = 'file:///' + urllib.parse.quote(fwd, safe='/():')

    cmd = [
        chrome,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--print-to-pdf-no-header',
        '--no-margins',
        f'--print-to-pdf={pdf_abs}',
        url,
    ]

    print(f'Gerando: {pdf_name}')
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

    if os.path.exists(pdf_abs):
        size = os.path.getsize(pdf_abs)
        print(f'OK — {size:,} bytes')
    else:
        print(f'ERRO stdout: {result.stdout[:300]}')
        print(f'ERRO stderr: {result.stderr[:300]}')
