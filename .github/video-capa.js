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

/* Outras categorias: canal oficial de cada campeonato no YouTube. "ok" diz quais vídeos contam (corrida, classificação,
   melhores momentos); "fora" tira os de outras classes do mesmo canal. Fica o mais recente de cada uma, dos últimos 7 dias. */
const OUTROS = [
  { cat: 'motogp', nome: 'MotoGP', canal: 'UC8pYaQzbBBXg9GIOHRvTmDQ', ok: /(Race|Sprint|Qualifying|Q2) Highlights|Full Race/i, fora: /Moto2|Moto3|MotoE/i },
  { cat: 'endurance', nome: 'WEC', art: 'do', canal: 'UCwU7U7PiarcJKLjDJTnANjw', ok: /Highlights|Full Race/i, fora: /^$/ },
  { cat: 'nascar', nome: 'NASCAR', canal: 'UCuN9hYw2RpoAW8rZ3VK3isA', ok: /Cup Series.*Highlights|Highlights.*Cup Series/i, fora: /Truck|Xfinity|O'Reilly/i },
  { cat: 'formula-e', nome: 'Fórmula E', canal: 'UC-DuRqsBQOEk_5o1q4Ze-Fg', ok: /(Race|Qualifying) Highlights|Full Race/i, fora: /^$/ },
  { cat: 'rally', nome: 'WRC', art: 'do', canal: 'UC5G6kTnHXDz0WIBC2VGBOqg', ok: /Highlights \| WRC/i, fora: /WRC2|WRC3|Junior/i },
  { cat: 'porsche-cup', nome: 'Porsche Cup', canal: 'UCwiRFcstDPKaCiOTXuoFhrQ', ok: /^ET\.\d+ \|.*\| (CORRIDA|QUALI)/i, fora: /ENGLISH/i }
];
function tituloOutro(t) {
  let evento = (t.split('|').map(s => s.trim()).filter(s => /\d{4}|GP|Rally|Hours|ET\./i.test(s) && !/^ET\.\d+$/i.test(s)).pop() || '').replace(/#\w+|[^\w\s.,'&À-ÿ-]/g, '').trim();
  let evento2 = evento, m;
  if ((m = t.match(/^ET\.\d+ \| ([^|]+)/i))) evento2 = m[1].trim().toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase());
  else if ((m = t.match(/DTM ([A-Z][\w-]*[a-z][\w-]*)/))) evento2 = m[1];
  else if ((m = t.match(/#(\w+?)WorldSBK/))) evento2 = m[1];
  evento = evento2;
  let o = 'Melhores momentos';
  if (/Full Race|CORRIDA|LIVE:.*Race/i.test(t)) o = 'Corrida completa';
  else if (/LIVE:/.test(t) && /Qualifying/i.test(t)) o = 'Classificação completa';
  else if (/QUALI|Pole/i.test(t)) o = /Highlights/i.test(t) ? 'Melhores momentos da classificação' : /QUALI/.test(t) && !/Highlights/i.test(t) ? 'Classificação completa' : 'A briga pela pole';
  else if (/crash|hit|incident|clash|contact|collision|spin|lock-?up|avoids|chaos|mayhem|drama|tough one|heavy/i.test(t)) o = 'Batida e confusão na pista';
  else if (/overtake|move|pass(es)?\b|bump drafting/i.test(t)) o = 'Ultrapassagem';
  else if (/battle|fight|duel/i.test(t)) o = 'Disputa na pista';
  else if (/race start|\bstart\b|lap 1|turn 1/i.test(t)) o = 'A largada';
  else if (/onboard/i.test(t)) o = 'Câmera a bordo';
  else if (/wins?\b|victory|champion|title/i.test(t)) o = 'A vitória';
  else if (/Sprint/i.test(t)) o = 'Melhores momentos da sprint';
  else if (/Final Day/i.test(t)) o = 'Melhores momentos do último dia';
  else if (/Day (\d)/i.test(t)) o = 'Melhores momentos do dia ' + t.match(/Day (\d)/i)[1];
  else if (/Race (\d)/i.test(t)) o = 'Melhores momentos da corrida ' + t.match(/Race (\d)/i)[1];
  else if (/Race/i.test(t)) o = 'Melhores momentos da corrida';
  return o + (evento ? ' · ' + evento : '');
}
/* além de corrida e classificação, valem lances da pista (batida, ultrapassagem, largada...); bastidores e entrevistas não */
const LANCE = /Highlights|Full Race|Qualifying|QUALI|CORRIDA|Pole|crash|hit|incident|clash|contact|spin|lock-?up|chaos|mayhem|drama|overtake|move|battle|fight|duel|race start|\bstart\b|lap 1|turn 1|onboard|wins?\b|victory|Race \d|Sprint/i;
const NAO = /Press|Practice|Behind|Interview|Podcast|Workout|Kids|Answer|Celebration of Life|Build ?Up|Teaser|reveals|Inside|Film Room|Sounds|Memories|Reacts?|Reaction|drummer|photoshop|Merch|Trailer|Preview|Live Stream|ENGLISH|Season(?! Finale)/i;
async function outros() {
  const res = [];
  for (const c of OUTROS) {
    const r = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + c.canal, { headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)' } }).catch(() => null);
    if (!r || !r.ok) continue;
    const xml = await r.text();
    /* até 2 por categoria: os mais recentes, com os de corrida e classificação na frente */
    const vs = xml.split('<entry>').slice(1).map(e => ({
      id: (e.match(/<yt:videoId>([^<]+)/) || [])[1],
      original: html((e.match(/<title>([^<]+)/) || [])[1] || ''),
      publicado: (e.match(/<published>([^<]+)/) || [])[1]
    })).filter(x => x.id && x.publicado && (c.ok.test(x.original) || LANCE.test(x.original)) && !c.fora.test(x.original) && !NAO.test(x.original) && Date.now() - Date.parse(x.publicado) < 7 * 864e5)
      .sort((a, b) => (c.ok.test(b.original) - c.ok.test(a.original)) || Date.parse(b.publicado) - Date.parse(a.publicado)).slice(0, 2);
    vs.forEach(v => res.push({ cat: c.cat, nome: c.nome, id: v.id, titulo: tituloOutro(v.original), texto: 'No canal oficial ' + (c.art || 'da') + ' ' + c.nome + '.', original: v.original, publicado: v.publicado }));
  }
  return res.sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado));
}

(async () => {
  const r = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + CANAL, { headers: { 'User-Agent': 'NaVeia/1.0 (automobilismonaveia.com.br)' } }).catch(() => null);
  if (!r || !r.ok) { console.log('video-capa: feed indisponível'); return; }
  const xml = await r.text();
  const videos = xml.split('<entry>').slice(1).map(e => ({
    id: (e.match(/<yt:videoId>([^<]+)/) || [])[1],
    original: html((e.match(/<title>([^<]+)/) || [])[1] || ''),
    publicado: (e.match(/<published>([^<]+)/) || [])[1]
  })).filter(v => v.id && v.publicado).map(x => Object.assign(x, traduz(x.original) || {})).filter(x => x.titulo);
  /* lista dos últimos vídeos de classificação e corrida (Central da F1 na página inicial): junta com os que já estavam salvos */
  let antigos = [];
  try { const w = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(w); antigos = w.VIDEOS_F1 || []; } catch (e) {}
  const vistos = new Set(), lista = videos.map(x => ({ id: x.id, titulo: x.titulo + (gp(x.publicado) ? ' · ' + gp(x.publicado) : ''), texto: x.texto, publicado: x.publicado })).concat(antigos)
    .filter(x => !vistos.has(x.id) && vistos.add(x.id)).sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado)).slice(0, 6);
  /* capa: o mais recente dos últimos 3 dias */
  const v = videos.filter(x => Date.now() - Date.parse(x.publicado) < 3 * 864e5).sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado))[0];
  const antes = fs.existsSync(ARQ) ? fs.readFileSync(ARQ, 'utf8') : '';
  const nome = v ? gp(v.publicado) : '';
  const capa = v ? { id: v.id, titulo: v.titulo + (nome ? ' · ' + nome : ''), texto: v.texto, original: v.original, publicado: v.publicado } : null;
  const cats = await outros();
  const novo = '/* Gerado por .github/video-capa.js. Não editar à mão. */\nwindow.VIDEO_CAPA = ' + JSON.stringify(capa) + ';\nwindow.VIDEOS_F1 = ' + JSON.stringify(lista) + ';\nwindow.VIDEOS_CATS = ' + JSON.stringify(cats) + ';\n';
  if (novo === antes) { console.log('video-capa: sem novidade'); return; }
  fs.writeFileSync(ARQ, novo);
  console.log('video-capa:', capa ? capa.titulo : '(sem vídeo na capa)', '| lista:', lista.length, 'vídeos');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
