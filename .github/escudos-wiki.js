/* Candidatos a escudo pela Wikipédia: para cada linha de .github/escudos-wiki.txt pega a imagem principal do artigo
   (em inglês e em português, 256 px) e grava em assets/img/escudos/cand/<time>-<wiki>.png, mais um índice
   assets/img/escudos/cand/indice.json. Não mexe no mapa de escudos: cada candidato é conferido à mão antes.
   Roda no GitHub (.github/workflows/escudos-wiki.yml) ou no PC: node .github/escudos-wiki.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'assets/img/escudos/cand');
const UA = { 'User-Agent': 'NaVeiaBot/1.0 (https://automobilismonaveia.com.br; automobilismonaveiacontato@gmail.com)' };
const espera = ms => new Promise(r => setTimeout(r, ms));
const arquivo = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function imagem(wiki, titulo) {
  const u = 'https://' + wiki + '.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=256&pilicense=any&titles=' + encodeURIComponent(titulo);
  try {
    const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(15000) });
    const j = await r.json();
    const p = Object.values((j.query || {}).pages || {})[0] || {};
    return p.thumbnail ? p.thumbnail.source : null;
  } catch (e) { return null; }
}
async function busca(wiki, q) {
  try {
    const r = await fetch('https://' + wiki + '.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=1&srsearch=' + encodeURIComponent(q), { headers: UA, signal: AbortSignal.timeout(15000) });
    const j = await r.json(); const h = ((j.query || {}).search || [])[0]; return h ? h.title : null;
  } catch (e) { return null; }
}
(async () => {
  fs.mkdirSync(PASTA, { recursive: true });
  const linhas = fs.readFileSync(path.join(__dirname, 'escudos-wiki.txt'), 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const indice = {};
  for (const l of linhas) {
    const [nome, en, pt] = l.split('|').map(s => s.trim());
    indice[nome] = [];
    for (const [wiki, titulo] of [['en', en], ['pt', pt], ['fr', en]]) {
      if (!titulo) continue;
      let src = await imagem(wiki, titulo); await espera(400);
      /* sem artigo com esse título: procura pelo nome e usa o primeiro resultado */
      if (!src) { const t = await busca(wiki, titulo); if (t) { src = await imagem(wiki, t); await espera(400); } }
      if (!src) { console.log('  sem imagem:', nome, wiki, titulo); continue; }
      try {
        const r = await fetch(src, { headers: UA, signal: AbortSignal.timeout(20000) });
        if (!r.ok) continue;
        const destino = 'assets/img/escudos/cand/' + arquivo(nome) + '-' + wiki + '.png';
        fs.writeFileSync(path.join(RAIZ, destino), Buffer.from(await r.arrayBuffer()));
        indice[nome].push(destino); console.log('  ok:', nome, wiki, src);
      } catch (e) { console.log('  falhou:', nome, wiki); }
      await espera(400);
    }
  }
  fs.writeFileSync(path.join(PASTA, 'indice.json'), JSON.stringify(indice, null, 1));
})();
