/* Fotos dos craques do "Monte seu time": para cada nome de assets/dados/jogadores-craques.js, procura na Wikipédia
   em inglês a página do jogador ("<nome> footballer") e pega a foto principal dela (Wikimedia Commons, licença livre).
   Baixa uma miniatura, recorta quadrada (rosto em cima) e grava em assets/img/jogadores/<nome>.webp; a lista com os
   arquivos e o crédito (nome do arquivo no Commons) vai para assets/dados/fotos-jogadores.js. Junta tudo num mosaico
   (assets/img/jogadores-mosaico.webp), que é o que o site carrega.
   Só busca quem ainda não tem foto. Roda no GitHub (.github/workflows/fotos-jogadores.yml). */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'assets/img/jogadores');
const ARQ = path.join(RAIZ, 'assets/dados/fotos-jogadores.js');
const UA = 'ArenaSportsBot/1.0 (https://automobilismonaveia.com.br; automobilismonaveiacontato@gmail.com)';

const w = {};
new Function('window', fs.readFileSync(path.join(RAIZ, 'assets/dados/jogadores-craques.js'), 'utf8'))(w);
let antes = {};
try { const x = {}; new Function('window', fs.readFileSync(ARQ, 'utf8'))(x); antes = x.FOTOS_JOGADORES || {}; } catch (e) { /* primeira vez */ }
fs.mkdirSync(PASTA, { recursive: true });

const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const espera = ms => new Promise(ok => setTimeout(ok, ms));
async function json(u) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) }); if (r.ok) return await r.json(); } catch (e) { /* tenta de novo */ }
    await espera(1500);
  }
  return null;
}
/* nomes que sozinhos dão outra pessoa: busca mais certeira */
const BUSCA = { 'Marcos': 'Marcos Roberto Silveira Reis', 'Rossi': 'Agustín Rossi goalkeeper', 'John': 'John Victor goalkeeper Botafogo', 'Fábio': 'Fábio Deivson goalkeeper',
  'Juan': 'Juan Silveira dos Santos', 'Alex': 'Alex de Souza footballer', 'Diego': 'Diego Ribas da Cunha', 'Pedro': 'Pedro Guilherme Abreu footballer',
  'Allan': 'Allan Marques Loureiro', 'André': 'André Trindade da Costa Neto', 'Fred': 'Fred footballer born 1983', 'Jô': 'Jô footballer born 1987',
  'Marcelo': 'Marcelo Vieira footballer', 'Ronaldo': 'Ronaldo Nazário', 'Rodri': 'Rodri footballer born 1996', 'Raúl': 'Raúl González footballer',
  'Bento': 'Bento Matheus Krepski', 'Wesley': 'Wesley França footballer', 'Danilo': 'Danilo Luiz da Silva', 'Júnior': 'Leovegildo Lins da Gama Júnior',
  'Leonardo': 'Leonardo Araújo footballer', 'Branco': 'Branco footballer', 'Jorginho': 'Jorginho footballer born 1964 Brazil right-back',
  'Mariano': 'Mariano Ferreira Filho', 'Varela': 'Guillermo Varela footballer', 'Murilo': 'Murilo Cerqueira footballer', 'Paulinho': 'Paulinho footballer born 1988',
  'Hulk': 'Hulk footballer', 'Oscar': 'Oscar footballer born 1991', 'Arthur': 'Arthur Melo', 'Antony': 'Antony footballer', 'Savinho': 'Savinho footballer',
  'Willian': 'Willian footballer', 'Estêvão': 'Estêvão Willian footballer', 'Pedri': 'Pedri footballer', 'Gavi': 'Gavi footballer', 'Dida': 'Dida goalkeeper',
  'Gilmar': 'Gilmar dos Santos Neves', 'Didi': 'Didi footballer', 'Vavá': 'Vavá footballer', 'Ademir': 'Ademir de Menezes', 'Careca': 'Careca footballer',
  'Reinaldo': 'José Reinaldo de Lima', 'Adriano': 'Adriano footballer born 1982', 'Romário': 'Romário', 'Ganso': 'Paulo Henrique Ganso', 'Gerson': 'Gérson footballer',
  'Gérson': 'Gérson de Oliveira Nunes', 'Zico': 'Zico', 'Taffarel': 'Cláudio Taffarel', 'Washington': 'Washington Stecanela Cerqueira', 'Vitinho': 'Vitinho footballer born 1993',
  'Endrick': 'Endrick footballer', 'Richarlison': 'Richarlison', 'Firmino': 'Roberto Firmino', 'Ederson': 'Ederson goalkeeper', 'Fabinho': 'Fabinho footballer',
  'Casemiro': 'Casemiro', 'Marquinhos': 'Marquinhos footballer born 1994', 'Miranda': 'Miranda footballer', 'Lúcio': 'Lúcio footballer', 'Aldair': 'Aldair footballer',
  'Cafu': 'Cafu', 'Kaká': 'Kaká', 'Rivaldo': 'Rivaldo', 'Denílson': 'Denílson de Oliveira Araújo', 'Edmundo': 'Edmundo Alves de Souza Neto', 'Bebeto': 'Bebeto',
  'Zagallo': 'Mário Zagallo', 'Rivelino': 'Roberto Rivellino', 'Tostão': 'Tostão', 'Sócrates': 'Sócrates', 'Falcão': 'Paulo Roberto Falcão', 'Cerezo': 'Toninho Cerezo',
  'Clodoaldo': 'Clodoaldo footballer', 'Dunga': 'Dunga', 'Neymar': 'Neymar', 'Pelé': 'Pelé', 'Garrincha': 'Garrincha', 'Xavi': 'Xavi footballer', 'Raphinha': 'Raphinha',
  'Rodrygo': 'Rodrygo', 'Jairzinho': 'Jairzinho', 'Friedenreich': 'Arthur Friedenreich', 'Djalminha': 'Djalminha', 'Eusébio': 'Eusébio', 'Hugo Souza': 'Hugo Souza goalkeeper' };

async function foto(nome) {
  const q = BUSCA[nome] || nome + ' footballer';
  const u = 'https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=3&gsrnamespace=0&prop=pageimages|description&piprop=thumbnail|name&pithumbsize=320&gsrsearch=' + encodeURIComponent(q);
  const r = await json(u);
  const pags = r && r.query && r.query.pages ? Object.values(r.query.pages).sort((a, b) => a.index - b.index) : [];
  const p = pags.find(x => x.thumbnail && /football|soccer|goalkeeper|futebol/i.test(x.description || '')) || null;
  if (!p) return null;
  const img = await fetch(p.thumbnail.source, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) }).then(x => x.ok ? x.arrayBuffer() : null).catch(() => null);
  if (!img) return null;
  const tmp = path.join(PASTA, '_tmp');
  fs.writeFileSync(tmp, Buffer.from(img));
  const destino = 'assets/img/jogadores/' + slug(nome) + '.webp';
  try {
    execFileSync('convert', [tmp, '-resize', '160x160^', '-gravity', 'north', '-extent', '160x160', '-quality', '78', path.join(RAIZ, destino)]);
  } catch (e) { fs.unlinkSync(tmp); return null; }
  fs.unlinkSync(tmp);
  return { src: destino, arq: p.pageimage || '', pagina: p.title };
}

(async () => {
  const nomes = w.JOGADORES_CRAQUES.map(x => x.split('|')[0]);
  const fotos = {}, falta = [];
  for (const n of nomes) {
    const k = slug(n);
    if (antes[k] && fs.existsSync(path.join(RAIZ, antes[k].src))) { fotos[k] = antes[k]; continue; }
    const f = await foto(n);
    if (f) { fotos[k] = f; console.log('foto:', n, '<-', f.pagina); } else falta.push(n);
    await espera(250);
  }
  /* mosaico: todas as fotos numa imagem só (1 download no site); cada jogador guarda a posição dele (i) */
  const COLS = 20, TAM = 80, chaves = Object.keys(fotos).sort();
  chaves.forEach((k, i) => { fotos[k].i = i; });
  execFileSync('montage', chaves.map(k => path.join(RAIZ, fotos[k].src)).concat(['-tile', COLS + 'x', '-geometry', TAM + 'x' + TAM + '+0+0', '-background', '#0b1220', '-quality', '74', path.join(RAIZ, 'assets/img/jogadores-mosaico.webp')]));
  const mosaico = { src: 'assets/img/jogadores-mosaico.webp', colunas: COLS, linhas: Math.ceil(chaves.length / COLS) };
  fs.writeFileSync(ARQ, '/* Fotos dos craques do Monte seu time (Wikimedia Commons, licenças livres). Gerado por .github/fotos-jogadores.js.\n' +
    '   As fotos ficam todas em assets/img/jogadores-mosaico.webp; "i" é a posição de cada uma (linha a linha, ' + COLS + ' por linha). */\n' +
    'window.FOTOS_MOSAICO = ' + JSON.stringify(mosaico) + ';\nwindow.FOTOS_JOGADORES = ' + JSON.stringify(fotos) + ';\n');
  console.log('com foto:', Object.keys(fotos).length, '| sem foto:', falta.length, falta.join(', '));
})();
