import fs from 'fs';

const DIR = 'conteudo/catalogos/2026-09-03-mariangela-recomendacoes';

const FLAGS = {
  FR: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2VkMjkzOSIvPjwvc3ZnPg==',
  IT: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDkyNDYiLz48cmVjdCB4PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iI2NlMmIzNyIvPjwvc3ZnPg==',
  ES: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjAuNSIgZmlsbD0iI2M2MGIxZSIvPjxyZWN0IHk9IjAuNSIgd2lkdGg9IjMiIGhlaWdodD0iMSIgZmlsbD0iI2ZmYzQwMCIvPjxyZWN0IHk9IjEuNSIgd2lkdGg9IjMiIGhlaWdodD0iMC41IiBmaWxsPSIjYzYwYjFlIi8+PC9zdmc+',
  UY: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIwLjIyMiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIwLjY2NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjExMSIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48cmVjdCB5PSIxLjU1NiIgd2lkdGg9IjMiIGhlaWdodD0iMC4yMjIiIGZpbGw9IiMwMDM4QTgiLz48L3N2Zz4=',
};

function flagImg(code) {
  return `<img class="flag-img" src="data:image/svg+xml;base64,${FLAGS[code]}" alt="${code}">`;
}

const wines = [
  {
    img: '01-la-dame-de-montrose.jpg',
    name: 'La Dame de Montrose 2013',
    producer: 'Chateau Montrose',
    flag: 'FR',
    location: 'França · Saint-Estèphe · Bordeaux',
    grape: 'Merlot · Cabernet Sauvignon · Cabernet Franc',
    reason: 'Você já provou o Chateau Ormes de Pez Saint-Estèphe 2018 e o Tronquoy-Lalande 2013 — este é da mesma região, um Second Growth de Bordeaux com mais Merlot no corte, mais macio e pronto pra beber agora.',
    cardPrice: 899,
  },
  {
    img: '02-aromes-de-pavie.jpg',
    name: 'Aromes de Pavie 2021',
    producer: 'Chateau Pavie',
    flag: 'FR',
    location: 'França · Saint-Émilion · Bordeaux',
    grape: 'Merlot · Cabernet Franc',
    reason: 'Você já provou o Esprit de Pavie 2018 — este é da mesma casa, Château Pavie, Premier Grand Cru Classé A de Saint-Émilion. Perfil mais floral e elegante, com o mesmo pedigree.',
    cardPrice: 1959,
  },
  {
    img: '03-delon-medoc.jpg',
    name: 'Delon Médoc 2014',
    producer: 'Chateau Potensac',
    flag: 'FR',
    location: 'França · Médoc · Bordeaux',
    grape: 'Merlot · Cabernet Sauvignon · Cabernet Franc · Petit Verdot',
    reason: 'Seu paladar já passou pelo estilo Médoc com o Ormes de Pez e o Tronquoy-Lalande — este é da família Delon, dona do lendário Léoville Las Cases, com o mesmo rigor a um preço mais acessível.',
    cardPrice: 499,
  },
  {
    img: '04-barolo-elio-altare.jpg',
    name: 'Barolo 2020',
    producer: 'Elio Altare',
    flag: 'IT',
    location: 'Itália · La Morra · Piemonte',
    grape: 'Nebbiolo',
    reason: 'Você já provou Nebbiolo com o Domenico Clerico e o Fontanafredda — este é o topo da pirâmide dessa uva: Barolo, de um dos produtores mais respeitados do Piemonte.',
    cardPrice: 1059,
  },
  {
    img: '05-barbaresco-cortese.jpg',
    name: 'Barbaresco 2021',
    producer: 'Giuseppe Cortese',
    flag: 'IT',
    location: 'Itália · Barbaresco (Rabajà) · Piemonte',
    grape: 'Nebbiolo',
    reason: 'Seguindo sua paixão por Nebbiolo (Clerico e Fontanafredda), este é um Barbaresco do cru mais prestigiado da região — elegância e potência da mesma uva.',
    cardPrice: 589,
  },
  {
    img: '06-pommard-bichot.jpg',
    name: 'Pommard 2022',
    producer: 'Albert Bichot',
    flag: 'FR',
    location: 'França · Pommard · Côte de Beaune, Borgonha',
    grape: 'Pinot Noir',
    reason: 'Você já levou o Chablis da Albert Bichot — esta é a versão tinta da mesma casa, um Pinot Noir estruturado de Pommard, na Côte de Beaune.',
    cardPrice: 899,
  },
  {
    img: '07-chablis-jadot.jpg',
    name: 'Chablis 2023',
    producer: 'Louis Jadot',
    flag: 'FR',
    location: 'França · Chablis · Borgonha',
    grape: 'Chardonnay',
    reason: 'Você já provou o Pinot Noir da Louis Jadot — esta é a versão branca da mesma vinícola, no estilo Chablis que você já ama pelo Fourchaume da Albert Bichot.',
    cardPrice: 449,
  },
  {
    img: '08-concerto-fonterutoli.jpg',
    name: 'Concerto Di Fonterutoli 2020',
    producer: 'Mazzei',
    flag: 'IT',
    location: 'Itália · Castellina in Chianti · Toscana',
    grape: 'Sangiovese · Cabernet Sauvignon',
    reason: 'Você já provou o Poggio Badiola, também da Mazzei — este é o supertoscano mais premium da casa, com mais Cabernet Sauvignon no corte e mais tempo de barrica.',
    cardPrice: 1399,
  },
  {
    img: '09-chianti-classico-perano.jpg',
    name: 'Chianti Classico 2021',
    producer: 'Perano (Frescobaldi)',
    flag: 'IT',
    location: 'Itália · Gaiole in Chianti · Toscana',
    grape: 'Sangiovese',
    reason: 'Seu paladar já passou pelo Sangiovese toscano com o Col Di Bacche e o Poggio Badiola — este é um Chianti Classico clássico, da histórica Frescobaldi.',
    cardPrice: 369,
  },
  {
    img: '10-protos-reserva.jpg',
    name: 'Protos Reserva 5º Año Tempranillo 2018',
    producer: 'Protos',
    flag: 'ES',
    location: 'Espanha · Ribera del Duero',
    grape: 'Tempranillo',
    reason: 'Você já provou o Bodegas Mauro, de Castilla y León — este é um Tempranillo de Ribera del Duero, região vizinha e com o mesmo DNA da uva.',
    cardPrice: 619,
  },
  {
    img: '11-garzon-tannat.jpg',
    name: 'Garzón Reserva Tannat 2022',
    producer: 'Bodega Garzón',
    flag: 'UY',
    location: 'Uruguai · Garzón, Maldonado',
    grape: 'Tannat',
    reason: 'Você já provou o Tannat da Familia Deicas — este é da Bodega Garzón, outra referência do Uruguai na mesma uva.',
    cardPrice: 184,
  },
  {
    img: '12-sofi-muller-thurgau.jpg',
    name: 'Sofi Müller Thurgau 2024',
    producer: 'Franz Haas',
    flag: 'IT',
    location: 'Itália · Trentino-Alto Ádige',
    grape: 'Müller Thurgau',
    reason: 'Você já provou os Pinot Grigio (Fasano e Di Lenardo) — este é outro branco italiano leve e aromático, no mesmo estilo fácil de beber.',
    cardPrice: 189,
  },
];

function fmt(n) {
  return n.toLocaleString('pt-BR');
}

function cardHtml(w) {
  const pix = Math.round(w.cardPrice * 0.9);
  return `
    <div class="card">
      <div class="card-photo"><img src="./imagens/${w.img}" alt=""></div>
      <div class="card-info">
        <p class="wine-name">${w.name} — ${w.producer}</p>
        <p class="wine-location">${flagImg(w.flag)} ${w.location}</p>
        <p class="wine-grape">${w.grape}</p>
        <p class="reason-label">Por que indicamos</p>
        <p class="reason-text">${w.reason}</p>
        <div class="price-block">
          <p class="price-pix">R$ ${fmt(pix)} <span>no Pix</span></p>
          <p class="price-card">ou R$ ${fmt(w.cardPrice)} em até 5x no cartão</p>
        </div>
      </div>
    </div>`;
}

function pageHtml(pair, pageNum, totalPages) {
  const cards = pair.map(cardHtml).join('\n');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./_shared.css">
</head>
<body>
<div class="page">
  <div class="header">
    <span class="header-label">Seleção comnéctar · ${pageNum}/${totalPages}</span>
    <span class="header-name">Pra Mariangela</span>
  </div>
  <div class="stack">
    ${cards}
  </div>
  <div class="footer"><img src="../../../dados/gota-transparente.png" alt=""></div>
</div>
</body>
</html>`;
}

// pair up wines, 2 per page
const pages = [];
for (let i = 0; i < wines.length; i += 2) {
  pages.push(wines.slice(i, i + 2));
}

pages.forEach((pair, idx) => {
  const html = pageHtml(pair, idx + 1, pages.length);
  fs.writeFileSync(`${DIR}/page-${String(idx + 1).padStart(2, '0')}.html`, html);
});

console.log(`Geradas ${pages.length} páginas de produto.`);

const coverHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1350px; overflow: hidden; background: #fff; font-family: 'Rubik', sans-serif; position: relative; }
</style>
</head>
<body>
  <div style="position:absolute; left:52px; top:200px; bottom:120px; width:1.5px; background:#bbb;"></div>
  <div style="position:absolute; right:52px; top:200px; bottom:120px; width:1.5px; background:#bbb;"></div>
  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-52%); text-align:center; width:720px;">
    <img src="../../../dados/comnectar-transparente.png" alt="comnéctar" style="width:540px; display:block; margin:0 auto 44px;">
    <div style="width:52px; height:1.5px; background:#991356; margin:0 auto 40px;"></div>
    <h1 style="font-family:'Geotipe','Palatino Linotype',Georgia,serif; font-size:46px; color:#000; font-weight:400; letter-spacing:4px; text-transform:uppercase; margin-bottom:20px; line-height:1.3;">Uma seleção pra você,<br>Mariangela</h1>
    <p style="font-size:13px; color:#991356; font-weight:500; letter-spacing:6px; text-transform:uppercase; margin-bottom:36px;">Baseada no que você já provou e gostou</p>
    <p style="font-size:12px; color:#666; font-weight:500; letter-spacing:4px; text-transform:uppercase;">Setembro 2026</p>
  </div>
  <div style="position:absolute; bottom:28px; right:44px;">
    <img src="../../../dados/gota-transparente.png" alt="" style="width:88px; opacity:0.75;">
  </div>
</body>
</html>`;

fs.writeFileSync(`${DIR}/cover.html`, coverHtml);
console.log('Capa gerada.');
