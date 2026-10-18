/* Fotos reais de futebol e basquete para as notícias, os campeonatos e os jogadores em destaque.
   Busca no Wikimedia Commons só fotos com licença livre (CC BY, CC BY-SA, CC0 ou domínio público), em paisagem e boa resolução,
   baixa duas versões (assets/img/real/esp-<chave>.jpg e -g.jpg) e grava autor, licença e link em assets/dados/fotos-esportes.js.
   "exige": o nome do arquivo no Commons precisa ter essa palavra, para não vir foto de outra coisa.
   Foto já baixada não é buscada de novo. Para trocar uma foto: apague a chave em fotos-esportes.js e rode de novo.
   Roda no GitHub (fotos-esportes.yml) ou no PC: node .github/fotos-esportes.js */
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARQ = path.join(RAIZ, 'assets/dados/fotos-esportes.js');
const UA = { headers: { 'User-Agent': 'NaVeiaFotos/1.0 (https://automobilismonaveia.com.br; automobilismonaveiacontato@gmail.com)' } };

const FOTOS = [
  /* campeonatos (topo da página do campeonato e notícia sem foto própria) */
  { chave: 'brasileirao', nome: 'Brasileirão', buscas: ['Maracanã stadium match crowd', 'Estádio do Maracanã jogo'], exige: /maracan/i },
  { chave: 'libertadores', nome: 'Libertadores', buscas: ['Copa Libertadores match', 'Copa Libertadores final'], exige: /libertadores/i },
  { chave: 'sul-americana', nome: 'Sul-Americana', buscas: ['Copa Sudamericana match', 'Copa Sul-Americana'], exige: /sudamericana|sul-americana|sulamericana/i },
  { chave: 'champions-league', nome: 'Champions League', buscas: ['UEFA Champions League match', 'Champions League match stadium'], exige: /champions/i },
  { chave: 'premier-league', nome: 'Premier League', buscas: ['Premier League match stadium', 'Etihad Stadium match'], exige: /premier league|etihad|anfield|emirates stadium/i },
  { chave: 'la-liga', nome: 'La Liga', buscas: ['La Liga match Barcelona', 'Camp Nou match'], exige: /la liga|laliga|camp nou|barcelona|bernab/i },
  { chave: 'bundesliga', nome: 'Bundesliga', buscas: ['Allianz Arena Bundesliga match', 'Bundesliga match stadium'], exige: /allianz arena|bundesliga|signal iduna/i },
  { chave: 'serie-a', nome: 'Serie A', buscas: ['San Siro stadium match', 'Serie A match stadium'], exige: /san siro|meazza|serie a|olimpico/i },
  { chave: 'ligue-1', nome: 'Ligue 1', buscas: ['Parc des Princes match', 'Ligue 1 match'], exige: /parc des princes|ligue 1/i },
  { chave: 'nba', nome: 'NBA', buscas: ['NBA game arena', 'Madison Square Garden basketball game'], exige: /nba|basketball|garden/i },
  { chave: 'euroleague', nome: 'Euroleague', buscas: ['EuroLeague basketball game', 'Euroleague match'], exige: /euroleague|euroliga/i },
  { chave: 'nbb', nome: 'NBB', buscas: ['Novo Basquete Brasil', 'NBB basquete jogo'], exige: /nbb|basquete|basketball/i },
  /* times, estádios e jogadores das notícias */
  { chave: 'santos', nome: 'Santos', buscas: ['Santos FC Vila Belmiro', 'Philippe Coutinho'], exige: /santos|vila belmiro|coutinho/i },
  { chave: 'palmeiras', nome: 'Palmeiras', buscas: ['Allianz Parque Palmeiras', 'Palmeiras jogo'], exige: /palmeiras|allianz parque/i },
  { chave: 'flamengo', nome: 'Flamengo', buscas: ['Flamengo torcida Maracanã', 'Clube de Regatas do Flamengo jogo'], exige: /flamengo/i },
  { chave: 'botafogo', nome: 'Botafogo', buscas: ['Estádio Nilton Santos Botafogo', 'Botafogo jogo'], exige: /botafogo|nilton santos/i },
  { chave: 'atletico-mg', nome: 'Atlético-MG', buscas: ['Arena MRV', 'Clube Atlético Mineiro jogo'], exige: /arena mrv|atl[eé]tico mineiro/i },
  { chave: 'vasco', nome: 'Vasco', buscas: ['São Januário estádio Vasco', 'Vasco da Gama jogo'], exige: /vasco|s[aã]o janu[aá]rio/i },
  { chave: 'barcelona', nome: 'Barcelona', buscas: ['Lamine Yamal', 'FC Barcelona match'], exige: /yamal|barcelona/i },
  { chave: 'arsenal', nome: 'Arsenal', buscas: ['Emirates Stadium Arsenal match', 'Arsenal F.C. match'], exige: /arsenal|emirates stadium/i },
  { chave: 'man-city', nome: 'Manchester City', buscas: ['Etihad Stadium Manchester City', 'Manchester City match'], exige: /manchester city|etihad/i },
  { chave: 'inter', nome: 'Inter de Milão', buscas: ['Inter Milan San Siro', 'Marcus Thuram Inter'], exige: /inter|thuram|san siro/i },
  { chave: 'psg', nome: 'Paris Saint-Germain', buscas: ['Parc des Princes Paris Saint-Germain', 'Paris Saint-Germain match'], exige: /paris saint|psg|parc des princes/i },
  { chave: 'lebron', nome: 'LeBron James', buscas: ['LeBron James'], exige: /lebron/i },
  { chave: 'giannis', nome: 'Giannis Antetokounmpo', buscas: ['Giannis Antetokounmpo'], exige: /giannis|antetokounmpo/i },
  { chave: 'knicks', nome: 'New York Knicks', buscas: ['New York Knicks Madison Square Garden', 'New York Knicks game'], exige: /knicks/i },
  { chave: 'sixers', nome: 'Philadelphia 76ers', buscas: ['Philadelphia 76ers game', 'Wells Fargo Center 76ers'], exige: /76ers|sixers/i },
  { chave: 'celtics', nome: 'Boston Celtics', buscas: ['Boston Celtics TD Garden', 'Boston Celtics game'], exige: /celtics/i },
  { chave: 'tacko', nome: 'Tacko Fall', buscas: ['Tacko Fall'], exige: /tacko/i },
  { chave: 'panathinaikos', nome: 'Panathinaikos', buscas: ['Panathinaikos basketball', 'Panathinaikos BC'], exige: /panathinaikos/i },
  { chave: 'mogi', nome: 'Mogi Basquete', buscas: ['Mogi das Cruzes basquete', 'Mogi Basquete'], exige: /mogi/i },
  { chave: 'franca', nome: 'Franca Basquete', buscas: ['Franca Basquete', 'Franca basketball'], exige: /franca/i }
];

const LIVRE = /^(cc[ -]by(-sa)?[ -][\d.]+|cc0|public domain|domínio público|pd)/i;
const NAO = /logo|map|mapa|diagram|kit|jersey|camisa|badge|escudo|crest|svg|chart|graph|signature|assinatura|ticket|ingresso|trophy only|stamp|selo/i;
const limpa = h => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function busca(q, exige) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=30&gsrsearch=' +
    encodeURIComponent(q + ' filetype:bitmap') + '&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1280';
  const r = await fetch(u, UA).catch(() => null);
  if (!r || !r.ok) return null;
  const d = await r.json().catch(() => null);
  const ps = Object.values((d && d.query && d.query.pages) || {}).sort((a, b) => a.index - b.index);
  for (const p of ps) {
    const ii = (p.imageinfo || [])[0]; if (!ii) continue;
    const m = ii.extmetadata || {}, lic = limpa(m.LicenseShortName && m.LicenseShortName.value);
    if (ii.mime !== 'image/jpeg' || ii.width < 1200 || ii.width < ii.height * 1.2) continue;
    if (!LIVRE.test(lic) || NAO.test(p.title) || !exige.test(p.title)) continue;
    return {
      thumb: ii.thumburl, pagina: ii.descriptionurl, lic,
      licUrl: limpa(m.LicenseUrl && m.LicenseUrl.value), autor: limpa(m.Artist && m.Artist.value).slice(0, 120) || 'Autor no Commons',
      titulo: p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '')
    };
  }
  return null;
}
async function baixa(url, destino) {
  const r = await fetch(url, UA).catch(() => null);
  if (!r || !r.ok) return false;
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  return true;
}

(async () => {
  let antes = {};
  try { const w = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(w); antes = w.FOTOS_ESPORTES || {}; } catch (e) {}
  const res = Object.assign({}, antes);
  for (const f of FOTOS) {
    if (res[f.chave] && fs.existsSync(path.join(RAIZ, res[f.chave].src))) continue;
    let achou = null;
    for (const q of f.buscas) { achou = await busca(q, f.exige); if (achou) break; }
    if (!achou) { console.log('fotos-esportes:', f.chave, '- nenhuma foto livre encontrada'); continue; }
    const src = 'assets/img/real/esp-' + f.chave + '.jpg', grande = 'assets/img/real/esp-' + f.chave + '-g.jpg';
    const ok1 = await baixa(achou.thumb, path.join(RAIZ, grande));
    const ok2 = await baixa(achou.thumb.replace(/\/1280px-/, '/480px-'), path.join(RAIZ, src));
    if (!ok1 || !ok2) { console.log('fotos-esportes:', f.chave, '- falhou o download'); continue; }
    res[f.chave] = { nome: f.nome, src, grande, autor: achou.autor, lic: achou.lic, licUrl: achou.licUrl, pagina: achou.pagina, titulo: achou.titulo };
    console.log('fotos-esportes:', f.chave, '->', achou.titulo, '(' + achou.lic + ')');
  }
  const novo = '/* Gerado por .github/fotos-esportes.js. Fotos do Wikimedia Commons com licença livre. Não editar à mão. */\nwindow.FOTOS_ESPORTES = ' + JSON.stringify(res, null, 1) + ';\n';
  fs.writeFileSync(ARQ, novo);
  console.log('fotos-esportes:', Object.keys(res).length, 'fotos');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
