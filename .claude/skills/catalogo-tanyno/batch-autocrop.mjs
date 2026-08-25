import { execSync } from 'child_process';

const DIR = 'conteudo/catalogos/2026-08-25-espanhois-andre/imagens';

// perfil 'table' = La Horra, Mauro, Roda (tabela de dados colada perto da garrafa)
const tableProfileFiles = [
  '02-corimbo-i', '03-mauro', '04-roda-sela', '05-cirsion', '06-roda-reserva',
];

// perfil 'prose' (default) = os demais (Clos de l'Obac, Jose Gil, Miguel Merino, Veronica Ortega, Sastre)
const proseProfileFiles = [
  '07-clos-obac', '08-miserere', '09-usatges',
  '10-camino-de-ribas', '11-jose-gil-vinedos',
  '12-la-quinta-cruz', '13-miguel-merino-gran-reserva', '14-miguel-merino-la-loma',
  '15-miguel-merino-reserva', '16-vinas-jovenes', '17-vitola-reserva',
  '18-cobrana', '19-kinki', '20-quite', '21-roc', '22-vo-version-original',
  '23-crianza-sastre', '24-pago-de-santa-cruz', '25-regina-vides', '26-roble',
];

for (const f of tableProfileFiles) {
  execSync(`node ".claude/skills/catalogo-tanyno/autocrop-bottle.mjs" "${DIR}/${f}.png" "${DIR}/${f}.png" table`, { stdio: 'inherit' });
}
for (const f of proseProfileFiles) {
  execSync(`node ".claude/skills/catalogo-tanyno/autocrop-bottle.mjs" "${DIR}/${f}.png" "${DIR}/${f}.png" prose`, { stdio: 'inherit' });
}
console.log('\n✅ Todas as imagens recortadas.');
