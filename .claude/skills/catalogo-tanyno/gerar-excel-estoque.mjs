import ExcelJS from 'exceljs';
import { readFileSync } from 'fs';

const OUT = 'C:/Users/marce/AppData/Local/Temp/claude/c--Users-marce-Desktop-claude-comn-ctar/061757e4-902f-4d79-95ae-3d2a61930cc0/scratchpad';
const all = JSON.parse(readFileSync(`${OUT}/tanyno-estoque-completo.json`, 'utf-8'));

const wb = new ExcelJS.Workbook();

function buildSheet(linha, titulo) {
  const rows = all.filter(r => r.linha === linha)
    .sort((a, b) => a.pais.localeCompare(b.pais) || a.produtor.localeCompare(b.produtor) || a.nome.localeCompare(b.nome));

  const ws = wb.addWorksheet(titulo);
  ws.columns = [
    { header: 'Vinho', key: 'nome', width: 42 },
    { header: 'Produtor', key: 'produtor', width: 28 },
    { header: 'Safra', key: 'safra', width: 10 },
    { header: 'Tipo', key: 'tipo', width: 12 },
    { header: 'País', key: 'pais', width: 14 },
    { header: 'Região', key: 'regiao', width: 20 },
    { header: 'Preço (A37)', key: 'preco', width: 14 },
    { header: 'Estoque', key: 'estoque', width: 10 },
  ];
  ws.getRow(1).font = { bold: true };
  for (const r of rows) {
    const row = ws.addRow({
      nome: r.nome,
      produtor: r.produtor,
      safra: r.safra,
      tipo: r.tipo,
      pais: r.pais,
      regiao: r.regiao,
      preco: r.preco,
      estoque: r.estoque,
    });
    if (r.estoque === 0) {
      row.getCell('estoque').font = { color: { argb: 'FFCC0000' }, bold: true };
    }
  }
  ws.getColumn('preco').numFmt = '"R$" #,##0.00';
  return rows;
}

const rowsA = buildSheet('Tanyno Autoral', 'Autoral');
const rowsB = buildSheet('Tanyno Signature', 'Signature');

const outPath = 'C:/Users/marce/Desktop/claude comnéctar/analises/vinhos/tanyno-estoque-setembro-2026.xlsx';
await wb.xlsx.writeFile(outPath);
console.log('Excel salvo em:', outPath);
console.log('Autoral:', rowsA.length, '| Signature:', rowsB.length);
