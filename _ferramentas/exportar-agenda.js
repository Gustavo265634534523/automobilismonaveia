// Gera assets/dados/agenda.json a partir de assets/js/dados.js, para o PHP (alertas e vencedores).
// Rodar depois de qualquer mudança em dados.js: node _ferramentas/exportar-agenda.js
const fs = require('fs'), path = require('path');
global.window = {};
require(path.join(__dirname, '../assets/js/dados.js'));
const saida = {
  atualizado: window.ATUALIZADO,
  categorias: window.CATEGORIAS.map(c => ({
    slug: c.slug, nome: c.nome,
    calendario: c.calendario.map(e => ({ e: e.e, n: e.n, l: e.l, d: e.d || null, venc: e.venc || null, parcial: e.parcial || null, s: e.s || [] }))
  }))
};
fs.writeFileSync(path.join(__dirname, '../assets/dados/agenda.json'), JSON.stringify(saida));
console.log('agenda.json atualizado: ' + saida.categorias.length + ' categorias');

// Agenda do celular (.ics de cada categoria) sai junto
console.log(require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'exportar-ics.js')], { encoding: 'utf8' }).trim());
