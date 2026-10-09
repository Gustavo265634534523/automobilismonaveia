/* Vídeo da capa da página inicial: o vídeo oficial mais recente do canal FORMULA 1 no YouTube depois de uma classificação
   ou corrida (volta da pole, melhores momentos). Lê o feed público do canal e grava assets/dados/video-capa.js.
   O vídeo fica na capa por 3 dias; depois a capa volta a mostrar a manchete. Roda no GitHub (f1-pos-corrida.yml) ou no PC. */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/video-capa.js');
global.window = {};
eval(fs.readFileSync(path.join(RAIZ, 'assets/js/dados.js'), 'utf8'));
const CANAL = 'UCB_qr75-ydFVKSF9Dmo6izg'; /* canal oficial FORMULA 1 */

const html = s => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/* nome do GP em português: a etapa da F1 mais perto da data do vídeo */
function gp(publicado) {
  const f1 = window.CATEGORIAS.find(c => c.slug === 'formula-1');
  const t = Date.parse(publicado);
  const e = f1.calendario.filter(x => x.d).sort((a, b) => Math.abs(Date.parse(a.d + 'T12:00:00Z') - t) - Math.abs(Date.parse(b.d + 'T12:00:00Z') - t))[0];
  return e && Math.abs(Date.parse(e.d + 'T12:00:00Z') - t) < 5 * 864e5 ? e.n : '';
}

/* só os vídeos de classificação e corrida, com o título em português */
function traduz(t) {
  let m;
  if ((m = t.match(/^(.+?)'s? Sprint Pole Lap/i))) return { titulo: m[1] + ' crava a pole da sprint', texto: 'A volta da pole, no canal oficial da Fórmula 1.' };
  if ((m = t.match(/^(.+?)'s? Pole Lap/i))) return { titulo: m[1] + ' crava a pole', texto: 'A volta da pole, no canal oficial da Fórmula 1.' };
  if (/^Race Highlights/i.test(t)) return { titulo: 'Os melhores momentos da corrida', texto: 'Tudo o que aconteceu na corrida, no canal oficial da Fórmula 1.' };
  if (/^Sprint Highlights/i.test(t)) return { titulo: 'Os melhores momentos da sprint', texto: 'Tudo o que aconteceu na sprint, no canal oficial da Fórmula 1.' };
  if (/^Sprint Qualifying Highlights/i.test(t)) return { titulo: 'Os melhores momentos da classificação sprint', texto: 'A briga pela pole da sprint, no canal oficial da Fórmula 1.' };
  if (/^Qualifying Highlights/i.test(t)) return { titulo: 'Os melhores momentos da classificação', texto: 'A briga pela pole, no canal oficial da Fórmula 1.' };
  return null;
}

(async () => {
  const r = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + CANAL, { headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)' } }).catch(() => null);
  if (!r || !r.ok) { console.log('video-capa: feed indisponível'); return; }
  const xml = await r.text();
  const videos = xml.split('<entry>').slice(1).map(e => ({
    id: (e.match(/<yt:videoId>([^<]+)/) || [])[1],
    original: html((e.match(/<title>([^<]+)/) || [])[1] || ''),
    publicado: (e.match(/<published>([^<]+)/) || [])[1]
  })).filter(v => v.id && v.publicado && Date.now() - Date.parse(v.publicado) < 3 * 864e5);
  const v = videos.map(x => Object.assign(x, traduz(x.original) || {})).filter(x => x.titulo)
    .sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado))[0];
  const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
  if (!v) {
    if (antes.indexOf('"id"') > -1 || !antes) { fs.writeFileSync(ARQ, '/* Gerado por .github/video-capa.js. Não editar à mão. */\nwindow.VIDEO_CAPA = null;\n'); console.log('video-capa: nenhum vídeo de classificação ou corrida nos últimos 3 dias'); }
    return;
  }
  const nome = gp(v.publicado);
  const dados = { id: v.id, titulo: v.titulo + (nome ? ' · ' + nome : ''), texto: v.texto, original: v.original, publicado: v.publicado };
  const novo = '/* Gerado por .github/video-capa.js. Não editar à mão. */\nwindow.VIDEO_CAPA = ' + JSON.stringify(dados) + ';\n';
  if (novo === antes) { console.log('video-capa: sem novidade'); return; }
  fs.writeFileSync(ARQ, novo);
  console.log('video-capa:', dados.titulo, '(' + v.original + ')');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
