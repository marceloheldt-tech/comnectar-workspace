import { readFileSync, writeFileSync } from 'fs';

const MARKUP = 1.55;
const COUNTRY_CODES = new Set(['PRT', 'ITA', 'FRA', 'ESP', 'DEU', 'USA', 'CHL']);

function parsePrice(str) {
  return parseFloat(str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
}

function parseFile(filename, linha) {
  const rawLines = readFileSync(filename, 'utf8').split('\n');
  const wines = [];
  
  const SKIP = new Set(['EXCLUSIVO', 'OUTROS VOLUMES', 'Carta Autoral', 'Carta Signature',
    'País', 'Todos', 'Região', 'Todas', 'Produtor', 'Buscar vinho / safra',
    'QTD', '0', 'TOTAL PREVISÃO', 'R$ 0,00', 'Carrinho', 'Vinhos', 'Águas', 'Taças', 'PAÍSES:']);

  let region = '', country = '', producer = '';
  let pendingWine = null;
  let pendingSafra = null, pendingVol = 0.75, pendingStock = null;
  let afterHeader = false;
  
  // Helper: look ahead from line i for next significant non-tab non-skip line
  const nextSignificant = (i) => {
    for (let j = i + 1; j < Math.min(i + 8, rawLines.length); j++) {
      const nxt = rawLines[j].trim();
      if (nxt && !rawLines[j].startsWith('\t') && !SKIP.has(nxt) && !nxt.startsWith('TIPO\t')) {
        return nxt;
      }
    }
    return '';
  };

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    
    if (raw.startsWith('\t')) {
      const parts = raw.split('\t').filter(p => p.trim());
      if (parts.length === 0) continue;
      
      const hasYear = parts.some(p => /^\d{4}$/.test(p.trim()) || p.trim() === 'N.V.' || p.trim() === '-');
      const hasPrice = parts.some(p => p.trim().startsWith('R$'));
      const hasVol = parts.some(p => /^[0-9]+\.[0-9]+$/.test(p.trim()) && parseFloat(p.trim()) < 20);
      
      if (hasPrice) {
        let safra = pendingSafra || '';
        let vol = pendingVol;
        let stock = pendingStock;
        let price = null;
        
        for (const p of parts) {
          const t = p.trim();
          if (/^\d{4}$/.test(t) || t === 'N.V.' || t === '-') safra = t;
          else if (/^[0-9]+\.[0-9]+$/.test(t) && parseFloat(t) < 20) vol = parseFloat(t);
          else if (/^\d{1,3}$/.test(t) && parseInt(t) < 200) stock = parseInt(t);
          else if (t.startsWith('R$')) price = parsePrice(t);
        }
        
        if (pendingWine && pendingWine.nome && price) {
          wines.push({
            linha, regiao: region, pais: country, produtor: producer,
            nome: pendingWine.nome, apelacao: pendingWine.apelacao || '',
            safra, volume: vol, estoque: stock,
            preco_a37: price, preco_venda: Math.round(price * MARKUP),
          });
        }
        pendingWine = null;
        pendingSafra = null; pendingVol = 0.75; pendingStock = null;
        
      } else if (hasYear || hasVol) {
        pendingSafra = null; pendingVol = 0.75; pendingStock = null;
        for (const p of parts) {
          const t = p.trim();
          if (/^\d{4}$/.test(t) || t === 'N.V.' || t === '-') pendingSafra = t;
          else if (/^[0-9]+\.[0-9]+$/.test(t) && parseFloat(t) < 20) pendingVol = parseFloat(t);
          else if (/^\d{1,3}$/.test(t) && parseInt(t) < 200) pendingStock = parseInt(t);
        }
      } else {
        // Appellation or sub-region
        if (afterHeader) {
          const apelacaoText = parts.join(' ').trim();
          if (!pendingWine || pendingWine.nome === null) {
            pendingWine = { nome: null, apelacao: apelacaoText };
          }
        }
      }
      continue;
    }
    
    const line = raw.trim();
    if (!line) continue;
    if (SKIP.has(line)) continue;
    if (line.startsWith('TIPO\t')) {
      afterHeader = true;
      pendingWine = null;
      continue;
    }
    
    // Country code — always resets producer + afterHeader
    if (COUNTRY_CODES.has(line)) {
      country = line;
      afterHeader = false;
      pendingWine = null;
      continue;
    }
    
    // Check if this line is a region or producer/wine
    // A line is a REGION if next significant line is a country code
    const ns = nextSignificant(i);
    const isRegion = COUNTRY_CODES.has(ns);
    
    if (isRegion) {
      region = line;
      country = '';
      producer = '';
      afterHeader = false;
      pendingWine = null;
      continue;
    }
    
    if (afterHeader) {
      // Wine name
      const apelacao = (pendingWine && pendingWine.nome === null) ? pendingWine.apelacao : '';
      pendingWine = { nome: line, apelacao };
      pendingSafra = null; pendingVol = 0.75; pendingStock = null;
      continue;
    }
    
    // Not in header mode: either producer or region
    if (country && !producer) {
      producer = line;
    } else {
      region = line;
    }
  }
  
  return wines;
}

const autoral = parseFile('tanyno-autoral-raw.txt', 'Tanyno Autoral');
const signature = parseFile('tanyno-signature-raw.txt', 'Tanyno Signature');
const all = [...autoral, ...signature];

console.log(`Autoral: ${autoral.length} | Signature: ${signature.length} | Total: ${all.length}`);

console.log('\nAmostra Autoral (10):');
autoral.slice(0, 10).forEach(w => 
  console.log(`  [${w.regiao}/${w.pais}] ${w.produtor} | ${w.nome} | ${w.safra} | Vol:${w.volume} | A37:${w.preco_a37} → Venda:R$${w.preco_venda}`)
);

console.log('\nAmostra Signature (10):');
signature.slice(0, 10).forEach(w => 
  console.log(`  [${w.regiao}/${w.pais}] ${w.produtor} | ${w.nome} | ${w.safra} | Vol:${w.volume} | A37:${w.preco_a37} → Venda:R$${w.preco_venda}`)
);

// Verify Bordeaux appellations
const bordeaux = signature.filter(w => w.regiao === 'BORDEAUX').slice(0, 5);
console.log('\nBordeaux (com apelação):');
bordeaux.forEach(w => 
  console.log(`  ${w.produtor} | ${w.apelacao} | ${w.nome} | A37:${w.preco_a37}`)
);

const semNome = all.filter(w => !w.nome);
const semPreco = all.filter(w => !w.preco_a37);
console.log(`\nProblemas: sem nome: ${semNome.length} | sem preço: ${semPreco.length}`);
if (semNome.length > 0) console.log('Sem nome:', semNome.slice(0,3));

writeFileSync('dados/tanyno-catalogo.json', JSON.stringify(all, null, 2), 'utf8');
console.log('✓ Salvo em dados/tanyno-catalogo.json');
