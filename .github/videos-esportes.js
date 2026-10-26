/* Melhores momentos de futebol e basquete: os vídeos mais recentes dos canais oficiais de cada campeonato no YouTube.
   Lê o feed público de cada canal (sem chave de API) e grava assets/dados/videos-esportes.js.
   Cada campeonato tem uma lista de canais candidatos (pelo @ do YouTube): usa o primeiro que responder.
   "tem" filtra canais que misturam campeonatos (UEFA, Conmebol, CazéTV). Roda no GitHub (f1-pos-corrida.yml) ou no PC. */
const fs = require('fs');
const path = require('path');
const ARQ = path.join(__dirname, '..', 'assets/dados/videos-esportes.js');
const UA = { headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)', 'Accept-Language': 'pt-BR,pt;q=0.9' } };

/* vídeos tirados à mão (.github/videos-bloqueados.txt): não voltam */
const BLOQ = new Set((() => { try { return require('fs').readFileSync(require('path').join(__dirname, 'videos-bloqueados.txt'), 'utf8'); } catch (e) { return ''; } })()
  .split('\n').map(l => l.trim().split(/\s+/)[0]).filter(x => x && x[0] !== '#'));
const COMPS = [
  { comp: 'brasileirao', esporte: 'futebol', nome: 'Brasileirão', canais: ['@CazeTV', '@Brasileirao'], tem: /brasileir/i },
  { comp: 'libertadores', esporte: 'futebol', nome: 'Libertadores', canais: ['@CONMEBOLLibertadores', '@CazeTV', '@CONMEBOL'], tem: /libertadores/i },
  { comp: 'sul-americana', esporte: 'futebol', nome: 'Sul-Americana', canais: ['@CONMEBOLSudamericana', '@CazeTV', '@CONMEBOL'], tem: /sul-?americana|sudamericana/i },
  { comp: 'champions-league', esporte: 'futebol', nome: 'Champions League', canais: ['@ChampionsLeague', '@UEFA'], tem: /champions|ucl/i },
  { comp: 'premier-league', esporte: 'futebol', nome: 'Premier League', canais: ['@premierleague'], tem: /./ },
  { comp: 'la-liga', esporte: 'futebol', nome: 'La Liga', canais: ['@LaLiga'], tem: /./ },
  { comp: 'bundesliga', esporte: 'futebol', nome: 'Bundesliga', canais: ['@bundesliga'], tem: /./ },
  { comp: 'serie-a', esporte: 'futebol', nome: 'Serie A', canais: ['@seriea'], tem: /./ },
  { comp: 'ligue-1', esporte: 'futebol', nome: 'Ligue 1', canais: ['@Ligue1', '@Ligue1UberEats', '@ligue1mcdonalds'], tem: /./ },
  { comp: 'nba', esporte: 'basquete', nome: 'NBA', canais: ['@NBA'], tem: /./ },
  { comp: 'euroleague', esporte: 'basquete', nome: 'Euroleague', canais: ['@EuroLeague', '@euroleaguebasketball'], tem: /./ },
  { comp: 'nbb', esporte: 'basquete', nome: 'NBB', canais: ['@NBB', '@nbbcaixa', '@LNBBrasil'], tem: /./ }
];
/* só melhores momentos e gols; entrevistas, coletivas, prévias e transmissões ao vivo ficam de fora */
const LANCE = /highlights|melhores momentos|resumen|resumo|r[ée]sum[ée]|sintesi|zusammenfassung|\bgols\b|\bgoles\b|\bgoals\b|full game/i;
const NAO = /\bU1[6-9]\b|\bU2[01]\b|#shorts|\bshorts?\b|press|interview|entrevista|coletiva|podcast|trailer|preview|pr[eé]via|ao vivo|en vivo|\blive\b|reaction|react|behind|bastidores|draw|sorteio|mic'?d|top \d+|best of/i;

const html = s => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
/* "REAL MADRID" -> "Real Madrid" (nomes que vêm todos em maiúsculas) */
function nomeTime(s) {
  s = s.replace(/[#@]\S+/g, '').replace(/[^\w\s.'&À-ÿ-]/g, '').trim();
  return s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s-])\S/g, x => x.toUpperCase()) : s;
}
/* tira o confronto do título: "Real Madrid 4-3 Roma", "Barcelona vs Real Madrid (2-1)", "CELTICS at PISTONS" */
function confronto(t) {
  const partes = t.split(/\s[|•–—]\s|\s\|\s|\|/).map(x => x.replace(/\bmaxi\b|highlights|melhores momentos|resumen|resumo|r[ée]sum[ée]|sintesi|zusammenfassung|full game|extended/ig, '').replace(/[:\-–]\s*$/, '').trim()).filter(Boolean);
  for (let p of partes) {
    p = p.replace(/(\d{1,3})\s*\(\d{1,2}\)/g, '$1'); /* pênaltis: "2(2) X 2(3)" vira "2 X 2" */
    let m;
    if ((m = p.match(/^(.+?)\s+(\d{1,3})\s*[-–x:]\s*(\d{1,3})\s+(.+)$/i))) return nomeTime(m[1]) + ' ' + m[2] + ' x ' + m[3] + ' ' + nomeTime(m[4]);
    if ((m = p.match(/^(.+?)\s+(?:vs\.?|v\.?|x)\s+(.+?)(?:\s*\(?(\d{1,3})\s*[-–]\s*(\d{1,3})\)?)?$/i)))
      return m[3] ? nomeTime(m[1]) + ' ' + m[3] + ' x ' + m[4] + ' ' + nomeTime(m[2]) : nomeTime(m[1]) + ' x ' + nomeTime(m[2]);
    if ((m = p.match(/^(.+?)\s+at\s+(.+)$/i))) return nomeTime(m[2]) + ' x ' + nomeTime(m[1]); /* NBA: visitante "at" mandante */
    /* "Bayern - Leipzig 6-1", "Inter-Roma 2-1", "Panathinaikos-Real Madrid" (hífen sem espaço só quando há um hífen só) */
    const sep = / - /.test(p) ? / - / : (p.replace(/\s+\d{1,3}\s*[-–:]\s*\d{1,3}$/, '').match(/-/g) || []).length === 1 ? /-/ : null;
    if (sep) {
      const placar = p.match(/\s+(\d{1,3})\s*[-–:]\s*(\d{1,3})$/), sem = placar ? p.slice(0, placar.index) : p, ab = sem.split(sep);
      if (ab.length === 2 && ab[0].trim() && ab[1].trim() && !/\d{4}/.test(sem))
        return nomeTime(ab[0]) + (placar ? ' ' + placar[1] + ' x ' + placar[2] + ' ' : ' x ') + nomeTime(ab[1]);
    }
  }
  return '';
}
async function canalId(handle) {
  const r = await fetch('https://www.youtube.com/' + handle, UA).catch(() => null);
  if (!r || !r.ok) return null;
  const pg = await r.text();
  const m = pg.match(/"externalId":"(UC[\w-]{22})"/) || pg.match(/<meta itemprop="identifier" content="(UC[\w-]{22})"/) || pg.match(/channel\/(UC[\w-]{22})/);
  return m ? m[1] : null;
}
async function feed(id) {
  const r = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + id, UA).catch(() => null);
  if (!r || !r.ok) return null;
  return (await r.text()).split('<entry>').slice(1).map(e => ({
    id: (e.match(/<yt:videoId>([^<]+)/) || [])[1],
    original: html((e.match(/<title>([^<]+)/) || [])[1] || ''),
    publicado: (e.match(/<published>([^<]+)/) || [])[1]
  })).filter(x => x.id && x.publicado);
}

(async () => {
  /* o @ de cada canal só é procurado uma vez: o número do canal fica guardado no próprio arquivo */
  let antes = '', ids = {}, antigos = [];
  try { antes = fs.readFileSync(ARQ, 'utf8'); const w = {}; new Function('window', antes)(w); ids = w.VIDEOS_ESPORTES_CANAIS || {}; antigos = w.VIDEOS_ESPORTES || []; } catch (e) {}
  const cache = {}, res = [];
  for (const c of COMPS) {
    let achou = false;
    for (const h of c.canais) {
      const id = ids[h] || (ids[h] = await canalId(h));
      if (!id) { delete ids[h]; continue; }
      const vs = cache[id] || (cache[id] = await feed(id));
      if (!vs) continue;
      const bons = vs.filter(v => LANCE.test(v.original) && !NAO.test(v.original) && c.tem.test(v.original) && Date.now() - Date.parse(v.publicado) < 10 * 864e5)
        .sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado)).slice(0, 4);
      if (!bons.length) continue;
      bons.forEach(v => {
        const jogo = confronto(v.original);
        if (!jogo) return; /* sem confronto no título (ex.: vídeo de um jogador só) não é melhores momentos de jogo */
        const tit = 'Melhores momentos: ' + jogo;
        if (res.some(x => x.titulo === tit)) return; /* o mesmo jogo em duas versões (curta e longa): fica a primeira */
        res.push({ comp: c.comp, esporte: c.esporte, nome: c.nome, id: v.id, titulo: jogo ? 'Melhores momentos: ' + jogo : v.original.replace(/#\S+/g, '').trim(), original: v.original, publicado: v.publicado });
      });
      achou = true;
      break;
    }
    if (!achou) {
      /* canal fora do ar ou sem vídeo novo: mantém os que já estavam, se ainda forem dos últimos 10 dias */
      antigos.filter(v => v.comp === c.comp && Date.now() - Date.parse(v.publicado) < 10 * 864e5).forEach(v => res.push(v));
      console.log('videos-esportes:', c.nome, '- nenhum vídeo novo');
    }
  }
  for (let i = res.length - 1; i >= 0; i--) if (BLOQ.has(res[i].id)) res.splice(i, 1);
  res.sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado));
  const novo = '/* Gerado por .github/videos-esportes.js. Não editar à mão. */\nwindow.VIDEOS_ESPORTES = ' + JSON.stringify(res) + ';\nwindow.VIDEOS_ESPORTES_CANAIS = ' + JSON.stringify(ids) + ';\n';
  if (novo === antes) { console.log('videos-esportes: sem novidade'); return; }
  fs.writeFileSync(ARQ, novo);
  console.log('videos-esportes:', res.length, 'vídeos');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
