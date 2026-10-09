// Widget do Automobilismo Na Veia para iPhone (app Scriptable, grátis).
// Instale uma vez. Para escolher o modelo, entre em automobilismonaveia.com.br/widget.html,
// toque em "Usar este widget" e cole no campo Parameter (toque e segure o widget > Editar widget).
// Exemplos de Parameter:  tipo=sessoes;cat=f1   tipo=vencedores;cat=todas   tipo=classificacao;cat=motogp   tipo=favorito;fav=Bortoleto
const DADOS = 'https://automobilismonaveia.com.br/assets/dados/widget.json';
const SITE = 'https://automobilismonaveia.com.br/';
const VERMELHO = new Color('#e3343c'), BRANCO = new Color('#f1f3f5'), CINZA = new Color('#8e979f'), APAGADO = new Color('#5c6268');

/* ---------- opções (campo Parameter) ---------- */
const bruto = String(args.widgetParameter || '');
const P_ = {};
bruto.split(/[;,]/).forEach(p => { const m = p.match(/^\s*(\w+)\s*=\s*(.+?)\s*$/); if (m) P_[m[1].toLowerCase()] = m[2]; });
let categoria = (P_.cat || '').toLowerCase();
if (!categoria) categoria = /motogp|moto/i.test(bruto) ? 'motogp' : /stock/i.test(bruto) ? 'stock-car' : 'formula-1';
if (categoria === 'f1') categoria = 'formula-1';
if (categoria === 'stock') categoria = 'stock-car';
const tipo = (P_.tipo || (P_.fav ? 'favorito' : 'completo')).toLowerCase();
const fav = P_.fav || '';
const tamanho = config.widgetFamily || 'large';
const grande = tamanho === 'large', pequeno = tamanho === 'small';

/* ---------- dados (cópia guardada para quando estiver sem internet) ---------- */
const fm = FileManager.local();
const arqCache = fm.joinPath(fm.documentsDirectory(), 'naveia-widget.json');
let J = null;
try {
  const r = new Request(DADOS + '?t=' + Date.now());
  r.timeoutInterval = 15;
  J = await r.loadJSON();
  fm.writeString(arqCache, JSON.stringify(J));
} catch (e) {
  if (fm.fileExists(arqCache)) J = JSON.parse(fm.readString(arqCache));
}

function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
function cor(hex) { try { return new Color(hex || '#8e979f'); } catch (e) { return CINZA; } }
function nomeCurto(n) { return String(n || '').replace(/^GP (de |do |da |dos |das )?/, ''); }
function hora(h) { return h ? h.replace(':', 'h') : '—'; }
function dataCurta(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : ''; }
const SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/* ---------- peças de desenho ---------- */
const w = new ListWidget();
const g = new LinearGradient();
g.colors = [new Color('#1a0d10'), new Color('#0b0c0e')];
g.locations = [0, 1];
w.backgroundGradient = g;
w.url = SITE;
w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
w.setPadding(12, 14, 12, 14);
function texto(alvo, t, tam, peso, c, linhas) {
  const x = alvo.addText(String(t));
  x.font = peso === 'pesado' ? Font.heavySystemFont(tam) : peso === 'negrito' ? Font.boldSystemFont(tam) : Font.mediumSystemFont(tam);
  x.textColor = c || BRANCO;
  x.lineLimit = linhas || 1;
  x.minimumScaleFactor = 0.6;
  return x;
}
function linhaH(alvo) { const s = alvo.addStack(); s.layoutHorizontally(); s.centerAlignContent(); return s; }
function colunaV(alvo) { const s = alvo.addStack(); s.layoutVertically(); return s; }
function marca(alvo, extra) {
  const s = linhaH(alvo);
  texto(s, 'AUTOMOBILISMO', 9, 'pesado', BRANCO);
  s.addSpacer(3);
  texto(s, 'NA VEIA', 9, 'pesado', VERMELHO);
  if (extra) { s.addSpacer(); texto(s, extra, 9, 'negrito', CINZA); }
}
function barra(alvo, c) { const b = alvo.addStack(); b.size = new Size(3, 12); b.backgroundColor = cor(c); return b; }
function contagem(alvo, iso, tam, c) { const d = alvo.addDate(new Date(iso)); d.applyRelativeStyle(); d.font = Font.boldSystemFont(tam); d.textColor = c || BRANCO; return d; }
function mapa(M, lado, curvas) {
  const dc = new DrawContext();
  dc.size = new Size(400, 400); dc.opaque = false; dc.respectScreenScale = true;
  const pontos = d => { const n = (String(d).match(/-?\d+(\.\d+)?/g) || []).map(Number), l = []; for (let i = 0; i + 1 < n.length; i += 2) l.push(new Point(n[i], n[i + 1])); return l; };
  const CORES = ['#e3343c', '#3fa9f5', '#f5c518'];
  (M.setores && M.setores.length ? M.setores : [M.d]).forEach((d, i) => {
    const p = new Path(); p.addLines(pontos(d)); dc.addPath(p);
    dc.setStrokeColor(new Color(M.setores ? CORES[i] : '#ffffff')); dc.setLineWidth(9); dc.strokePath();
  });
  if (M.largada) { dc.setFillColor(Color.white()); dc.fillEllipse(new Rect(M.largada.p[0] - 8, M.largada.p[1] - 8, 16, 16)); }
  if (curvas && M.curvas) {
    dc.setFont(Font.boldSystemFont(15)); dc.setTextAlignedCenter();
    M.curvas.forEach(c => {
      dc.setFillColor(new Color('#15171a')); dc.fillEllipse(new Rect(c.t[0] - 11, c.t[1] - 11, 22, 22));
      dc.setTextColor(Color.white()); dc.drawTextInRect(String(c.n), new Rect(c.t[0] - 11, c.t[1] - 9, 22, 20));
    });
  }
  return dc.getImage();
}

/* ---------- modelos ---------- */
const agora = Date.now();
const C = J && categoria !== 'formula-1' && categoria !== 'todas' && J.categorias && J.categorias[categoria] ? J.categorias[categoria] : J;
const f1 = C === J;
const NOME_CAT = { 'formula-1': 'Fórmula 1', 'motogp': 'MotoGP', 'stock-car': 'Stock Car', 'todas': 'Todas as categorias' }[categoria] || '';

function proximasSessoes() {
  if (categoria === 'todas') return (J.agenda || []).filter(x => Date.parse(x.iso) + 3600000 > agora).map(x => ({ rot: x.cat, t: x.t, etapa: x.etapa, iso: x.iso, d: x.d, h: x.h }));
  const P = C.proxima; if (!P) return [];
  return (P.sessoes || []).filter(s => Date.parse(s.iso) + 3600000 > agora).map(s => ({ rot: '', t: s.curto, etapa: P.n, iso: s.iso, d: s.d, h: s.h }));
}

function modeloSessoes() {
  const L = proximasSessoes(), n = pequeno ? 3 : grande ? 11 : 5;
  marca(w, pequeno ? '' : NOME_CAT);
  w.addSpacer(6);
  texto(w, 'PRÓXIMAS SESSÕES', 8, 'negrito', VERMELHO);
  if (categoria !== 'todas' && C.proxima && !pequeno) texto(w, nomeCurto(C.proxima.n) + ' · horário de Brasília', 10, 'negrito', CINZA);
  w.addSpacer(4);
  if (!L.length) texto(w, 'Sem sessões nos próximos dias.', 11, 'medio', CINZA, 2);
  L.slice(0, n).forEach((s, i) => {
    const l = linhaH(w);
    const c = i === 0 ? VERMELHO : BRANCO;
    texto(l, SEM[new Date(s.d + 'T12:00:00Z').getUTCDay()] + ' ' + hora(s.h), pequeno ? 10 : 11, 'pesado', c);
    l.addSpacer(6);
    texto(l, (s.rot ? s.rot + ' · ' : '') + s.t + (categoria === 'todas' && !pequeno ? ' · ' + nomeCurto(s.etapa) : ''), pequeno ? 10 : 11, 'negrito', i === 0 ? BRANCO : CINZA);
    l.addSpacer();
  });
  if (L[0] && !pequeno) { w.addSpacer(4); const l = linhaH(w); texto(l, 'Começa ', 9, 'medio', CINZA); contagem(l, L[0].iso, 9); }
  w.addSpacer();
}

function modeloVencedores() {
  const L = categoria === 'todas' ? (J.vencedoresTodas || []) : (C.vencedores || []), n = pequeno ? 3 : grande ? 8 : 3;
  marca(w, pequeno ? '' : NOME_CAT);
  w.addSpacer(6);
  texto(w, 'ÚLTIMOS VENCEDORES', 8, 'negrito', VERMELHO);
  w.addSpacer(4);
  L.slice(0, n).forEach((v, i) => {
    const col = colunaV(w);
    texto(col, (v.cat ? v.cat + ' · ' : '') + nomeCurto(v.n) + ' · ' + dataCurta(v.d), 9, 'negrito', CINZA);
    texto(col, String(v.venc).replace(/\s*\(.+\)$/, ''), pequeno ? 11 : 12, 'pesado', i === 0 ? BRANCO : BRANCO);
    w.addSpacer(3);
  });
  w.addSpacer();
}

function modeloClassificacao() {
  const L = C.pilotos || [], n = pequeno ? 4 : grande ? 10 : 5;
  marca(w, pequeno ? '' : NOME_CAT);
  w.addSpacer(6);
  texto(w, 'CAMPEONATO DE PILOTOS', 8, 'negrito', VERMELHO);
  w.addSpacer(4);
  L.slice(0, n).forEach(x => {
    const l = linhaH(w);
    texto(l, String(x.pos), 11, 'pesado', CINZA); l.addSpacer(5);
    barra(l, x.cor); l.addSpacer(5);
    texto(l, pequeno ? x.sigla : String(x.nome).split(' e ')[0], 11, 'negrito', BRANCO);
    l.addSpacer();
    texto(l, String(x.pts), 11, 'negrito', CINZA);
  });
  if (grande && C.equipes && C.equipes.length) {
    w.addSpacer(6);
    texto(w, 'EQUIPES', 8, 'negrito', VERMELHO);
    C.equipes.slice(0, 3).forEach(x => { const l = linhaH(w); texto(l, x.pos + '. ', 11, 'pesado', CINZA); barra(l, x.cor); l.addSpacer(5); texto(l, x.nome, 11, 'negrito', BRANCO); l.addSpacer(); texto(l, String(x.pts), 11, 'negrito', CINZA); });
  }
  w.addSpacer();
}

function modeloContagem() {
  const P = C.proxima, L = proximasSessoes(), s = L[0];
  marca(w);
  w.addSpacer();
  texto(w, P ? (P.categoria + ' · ' + nomeCurto(P.n)).toUpperCase() : NOME_CAT.toUpperCase(), 9, 'negrito', VERMELHO, 2);
  if (s) {
    texto(w, s.t, pequeno ? 18 : 22, 'pesado', BRANCO, 2);
    texto(w, SEM[new Date(s.d + 'T12:00:00Z').getUTCDay()] + ' · ' + hora(s.h) + ' (Brasília)', 11, 'negrito', CINZA);
    w.addSpacer(4);
    contagem(w, s.iso, pequeno ? 14 : 18, BRANCO);
  } else if (P) {
    texto(w, nomeCurto(P.n), pequeno ? 16 : 20, 'pesado', BRANCO, 2);
    texto(w, dataCurta(P.inicio) + (P.fim && P.fim !== P.inicio ? ' a ' + dataCurta(P.fim) : '') + ' · horários a confirmar', 10, 'medio', CINZA, 2);
  } else texto(w, 'Temporada encerrada', 16, 'pesado', BRANCO, 2);
  w.addSpacer();
}

function modeloFavorito() {
  const F = fav ? (C.pilotos || []).find(x => semAcento(x.nome).indexOf(semAcento(fav)) > -1 || semAcento(x.sigla) === semAcento(fav)) : null;
  marca(w, pequeno ? '' : NOME_CAT);
  w.addSpacer(6);
  texto(w, 'SEU PILOTO', 8, 'negrito', VERMELHO);
  if (!F) { texto(w, fav ? 'Não achei "' + fav + '".' : 'Escolha o piloto no site.', 12, 'negrito', BRANCO, 2); texto(w, 'automobilismonaveia.com.br/widget', 9, 'medio', CINZA, 2); w.addSpacer(); return; }
  const l = linhaH(w); barra(l, F.cor); l.addSpacer(6);
  const c = colunaV(l);
  texto(c, F.nome, pequeno ? 15 : 18, 'pesado', BRANCO);
  if (F.equipe) texto(c, F.equipe, 10, 'medio', CINZA);
  w.addSpacer(6);
  const nums = pequeno ? colunaV(w) : linhaH(w);
  function n(t, r) { const x = colunaV(nums); texto(x, t, pequeno ? 14 : 18, 'pesado', BRANCO); texto(x, r, 9, 'medio', CINZA); if (!pequeno) nums.addSpacer(); }
  n('P' + F.pos, 'no campeonato');
  n(String(F.pts), F.dif ? 'pts · a ' + F.dif + ' do líder' : 'pts · líder');
  if (!pequeno && F.ult) n(F.ult.res, F.ult.gp);
  if (grande && C.proxima) {
    w.addSpacer(10);
    texto(w, 'PRÓXIMA ETAPA', 8, 'negrito', VERMELHO);
    texto(w, nomeCurto(C.proxima.n), 14, 'pesado', BRANCO);
    const s = proximasSessoes()[0];
    if (s) { const l2 = linhaH(w); texto(l2, s.t + ' · ' + SEM[new Date(s.d + 'T12:00:00Z').getUTCDay()] + ' ' + hora(s.h) + ' · ', 11, 'negrito', CINZA); contagem(l2, s.iso, 11); }
  }
  w.addSpacer();
}

function modeloCompleto(comMapa) {
  const P = C.proxima, sessoes = P ? P.sessoes || [] : [], prox = sessoes.find(s => Date.parse(s.iso) > agora);
  if (pequeno) { modeloContagem(); return; }
  marca(w);
  w.addSpacer(6);
  const topo = linhaH(w), esq = colunaV(topo);
  texto(esq, P ? (P.categoria + ' · etapa ' + P.etapa + ' de ' + P.total).toUpperCase() : 'TEMPORADA ENCERRADA', 8, 'negrito', VERMELHO);
  if (P) {
    texto(esq, nomeCurto(P.n), grande ? 22 : 18, 'pesado', BRANCO);
    texto(esq, P.local + ' · horário de Brasília', 9, 'medio', CINZA);
    esq.addSpacer(5);
    const lista = sessoes.slice(-(grande ? 7 : 4));
    lista.forEach(s => {
      const l = linhaH(esq), feita = Date.parse(s.iso) + 3600000 < agora, eProx = prox && s.iso === prox.iso;
      const c = feita ? APAGADO : eProx ? VERMELHO : BRANCO;
      texto(l, s.curto, 11, 'negrito', c); l.addSpacer(); texto(l, s.dia + ' ' + hora(s.h), 11, 'negrito', c);
    });
    if (!lista.length) texto(esq, 'Horários na semana da etapa.', 10, 'medio', CINZA, 2);
    if (prox) { esq.addSpacer(4); const l = linhaH(esq); texto(l, prox.t + ' ', 9, 'medio', CINZA); contagem(l, prox.iso, 9); }
  }
  topo.addSpacer(10);
  const dir = colunaV(topo), M = f1 && P && P.mapa;
  if (M) { const im = dir.addImage(mapa(M, 0, grande)); const lado = comMapa && grande ? 165 : grande ? 150 : 118; im.imageSize = new Size(lado, lado); }
  else if (C.ultima) {
    texto(dir, 'ÚLTIMA ETAPA', 8, 'negrito', VERMELHO); texto(dir, nomeCurto(C.ultima.n), 11, 'negrito', BRANCO); dir.addSpacer(3);
    (C.ultima.podio || []).forEach(x => { const l = linhaH(dir); texto(l, 'P' + x.pos + ' ', 11, 'pesado', CINZA); texto(l, x.sigla, 11, 'pesado', cor(x.cor)); });
    if (!(C.ultima.podio || []).length && C.ultima.vencedor) texto(dir, C.ultima.vencedor, 10, 'medio', BRANCO, 3);
  }
  if (grande) {
    w.addSpacer(8);
    const baixo = linhaH(w), cl = colunaV(baixo);
    texto(cl, 'CAMPEONATO', 8, 'negrito', VERMELHO); cl.addSpacer(2);
    (C.pilotos || []).slice(0, 3).forEach(x => { const l = linhaH(cl); barra(l, x.cor); l.addSpacer(5); texto(l, x.pos + '. ' + String(x.nome).split(' e ')[0].split(' ').slice(-1)[0], 11, 'negrito', BRANCO); l.addSpacer(); texto(l, String(x.pts), 11, 'medio', CINZA); });
    baixo.addSpacer(14);
    const lado = colunaV(baixo);
    if (f1 && C.ultima && C.ultima.podio) {
      texto(lado, nomeCurto(C.ultima.n).toUpperCase(), 8, 'negrito', VERMELHO); lado.addSpacer(2);
      C.ultima.podio.forEach(x => { const l = linhaH(lado); texto(l, 'P' + x.pos + '  ', 11, 'pesado', CINZA); texto(l, x.sigla, 11, 'pesado', BRANCO); });
    }
  }
  w.addSpacer();
}

if (!J) {
  marca(w); w.addSpacer(8);
  texto(w, 'Sem conexão agora.', 14, 'negrito');
  texto(w, 'Abra o widget de novo em alguns minutos.', 11, 'medio', CINZA, 2);
} else if (tipo === 'sessoes') modeloSessoes();
else if (tipo === 'vencedores') modeloVencedores();
else if (tipo === 'classificacao') modeloClassificacao();
else if (tipo === 'contagem') modeloContagem();
else if (tipo === 'favorito') modeloFavorito();
else if (tipo === 'mapa') modeloCompleto(true);
else modeloCompleto(false);

if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
