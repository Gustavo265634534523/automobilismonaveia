/* Escudos dos times de futebol e basquete: procura cada time de assets/js/esportes-dados.js no TheSportsDB (base aberta,
   chave gratuita), baixa o escudo em tamanho pequeno para assets/img/escudos/ e grava o mapa nome -> arquivo em
   assets/dados/escudos.js. Só procura os times que ainda não têm escudo; quem não for achado aparece com as iniciais.
   Roda no GitHub (.github/workflows/escudos.yml) ou no PC: node .github/escudos.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'assets/img/escudos');
const ARQ = path.join(RAIZ, 'assets/dados/escudos.js');
const CHAVES = ['123', '3'];
const espera = ms => new Promise(r => setTimeout(r, ms));

global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/esportes-dados.js'), 'utf8'));
let atual = {};
try { const w = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(w); atual = w.ESCUDOS || {}; } catch (e) { /* primeira vez */ }

/* país de cada liga nacional, para não pegar um homônimo de outro país */
const PAIS = { brasileirao: 'Brazil', 'premier-league': 'England', 'la-liga': 'Spain', bundesliga: 'Germany', 'serie-a': 'Italy', 'ligue-1': 'France', nbb: 'Brazil' };
/* nomes em português que o TheSportsDB conhece por outro nome */
const APELIDO = {
  'Bayern de Munique': 'Bayern Munich', 'Inter de Milão': 'Inter Milan', 'Inter': 'Inter Milan', 'Milan': 'AC Milan', 'Roma': 'AS Roma',
  'Atlético de Madrid': 'Atletico Madrid', 'Atlético-MG': 'Atletico Mineiro', 'Athletico-PR': 'Athletico Paranaense', 'Red Bull Bragantino': 'Bragantino',
  'Olympique de Marselha': 'Marseille', 'Olympique de Lyon': 'Lyon', 'Paris Saint-Germain': 'Paris SG', 'PSG': 'Paris SG', 'Sporting': 'Sporting CP',
  'Borussia Mönchengladbach': 'Borussia Monchengladbach', 'Colônia': 'FC Koln', 'Köln': 'FC Koln', 'Estrela Vermelha': 'Crvena Zvezda',
  'Bahia': 'EC Bahia', 'Vitória': 'EC Vitoria', 'Remo': 'Clube do Remo', 'Mirassol': 'Mirassol FC', 'Juventude': 'EC Juventude'
};
const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const arquivo = s => semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* todos os times, com o esporte e o país (quando a liga é nacional) */
const times = {};
for (const c of window.COMPETICOES) {
  const add = n => { if (n && !/^(a definir|vencedor|perdedor)/i.test(n) && !times[n]) times[n] = { esporte: c.esporte, pais: PAIS[c.slug] }; };
  (c.jogos || []).forEach(j => { add(j.casa); add(j.fora); });
  (c.confrontos || []).forEach(x => { add(x.a); add(x.b); });
  [c.tabela, c.tabela2].forEach(t => { if (!t) return; const i = t.colunas.indexOf('Time'); if (i > -1) t.linhas.forEach(l => add(l[i])); });
}

async function buscar(termo) {
  for (const k of CHAVES) {
    try {
      const r = await fetch('https://www.thesportsdb.com/api/v1/json/' + k + '/searchteams.php?t=' + encodeURIComponent(termo));
      if (r.status === 429) { await espera(20000); continue; }
      if (!r.ok) continue;
      const j = await r.json();
      return j.teams || [];
    } catch (e) { /* tenta a outra chave */ }
  }
  return [];
}
function escolher(lista, info) {
  const esporte = info.esporte === 'basquete' ? 'Basketball' : 'Soccer';
  const ok = lista.filter(t => t.strSport === esporte && t.strBadge && !/women|feminin|u-?\d\d|\bII\b|\bB$/i.test(t.strTeam));
  return (info.pais && ok.find(t => t.strCountry === info.pais)) || (!info.pais && ok[0]) || null;
}

(async () => {
  fs.mkdirSync(PASTA, { recursive: true });
  const faltam = Object.keys(times).filter(n => !atual[n] || !fs.existsSync(path.join(RAIZ, atual[n])));
  console.log('times:', Object.keys(times).length, '| sem escudo:', faltam.length);
  let novos = 0;
  for (const nome of faltam) {
    const info = times[nome];
    let achado = null;
    for (const termo of [...new Set([APELIDO[nome], nome, semAcento(nome)].filter(Boolean))]) {
      achado = escolher(await buscar(termo), info);
      await espera(2200); /* a chave gratuita aceita 30 pedidos por minuto */
      if (achado) break;
    }
    if (!achado) { console.log('  não achei:', nome); continue; }
    const destino = 'assets/img/escudos/' + arquivo(nome) + '.png';
    let img = null;
    for (const u of [achado.strBadge + '/small', achado.strBadge]) {
      try { const r = await fetch(u); if (r.ok && /image/.test(r.headers.get('content-type') || '')) { img = Buffer.from(await r.arrayBuffer()); break; } } catch (e) { /* tenta o tamanho original */ }
    }
    if (!img || img.length < 200) { console.log('  sem imagem:', nome); continue; }
    fs.writeFileSync(path.join(RAIZ, destino), img);
    atual[nome] = destino; novos++;
    console.log('  ok:', nome, '->', achado.strTeam, '(' + achado.strCountry + ')');
  }
  const ordenado = {}; Object.keys(atual).sort().forEach(k => { ordenado[k] = atual[k]; });
  fs.writeFileSync(ARQ, '/* Gerado por .github/escudos.js. Não editar à mão. Escudos: TheSportsDB (thesportsdb.com). */\nwindow.ESCUDOS = ' + JSON.stringify(ordenado, null, 0) + ';\n');
  console.log('escudos novos:', novos, '| total:', Object.keys(ordenado).length);
})();
