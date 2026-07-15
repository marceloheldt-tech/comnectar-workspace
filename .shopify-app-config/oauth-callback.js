const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 8787;
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/callback') {
    const { code, shop, state } = parsed.query;
    if (code) {
      fs.writeFileSync('oauth-code.json', JSON.stringify({ code, shop, state }, null, 2));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>Autorizado! Pode fechar essa aba.</h2>');
      console.log('CODE_CAPTURED:', code, shop);
      setTimeout(() => process.exit(0), 500);
    } else {
      res.writeHead(400);
      res.end('Sem code na URL');
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(PORT, () => console.log('Listening on', PORT));
