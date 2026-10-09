// Widget do Automobilismo Na Veia para iPhone (app Scriptable, grátis).
// Mostra a próxima etapa com os horários de Brasília, o mapa da pista (F1), o pódio e a classificação.
// Os dados vêm de automobilismonaveia.com.br e se atualizam sozinhos.
//
// Opções (toque e segure o widget > Editar widget > Parameter), separadas por ";":
//   motogp          -> MotoGP em vez da Fórmula 1 (ou: stock)
//   fav=Bortoleto   -> mostra o seu piloto favorito (widget grande)
//   Exemplo: f1;fav=Bortoleto
const DADOS = 'https://automobilismonaveia.com.br/assets/dados/widget.json';
const SITE = 'https://automobilismonaveia.com.br/';
const VERMELHO = new Color('#e3343c'), BRANCO = new Color('#f1f3f5'), CINZA = new Color('#8e979f'), APAGADO = new Color('#5c6268');

/* ---------- opções ---------- */
const param = String(args.widgetParameter || '').toLowerCase();
let categoria = 'formula-1';
if (/motogp|moto/.test(param)) categoria = 'motogp';
if (/stock/.test(param)) categoria = 'stock-car';
const fav = (String(args.widgetParameter || '').match(/fav\s*=\s*([^;,]+)/i) || [])[1] || '';
const tamanho = config.widgetFamily || 'large';

/* ---------- dados (guarda uma cópia para quando estiver sem internet) ---------- */
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
function cor(hex, padrao) { try { return new Color(hex || padrao || '#8e979f'); } catch (e) { return CINZA; } }
function nomeCurto(n) { return String(n || '').replace(/^GP (de |do |da |dos |das )?/, ''); }
function hora(h) { return h ? h.replace(':', 'h') : '—'; }

/* ---------- desenho ---------- */
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
function marca(alvo) {
  const s = linhaH(alvo);
  texto(s, 'AUTOMOBILISMO', 9, 'pesado', BRANCO);
  s.addSpacer(3);
  texto(s, 'NA VEIA', 9, 'pesado', VERMELHO);
}

/* mapa da pista (F1): os 3 setores em cores, a largada e as curvas (só no grande) */
function mapa(M, lado, curvas) {
  const dc = new DrawContext();
  dc.size = new Size(400, 400);
  dc.opaque = false;
  dc.respectScreenScale = true;
  const pontos = d => { const n = (String(d).match(/-?\d+(\.\d+)?/g) || []).map(Number), l = []; for (let i = 0; i + 1 < n.length; i += 2) l.push(new Point(n[i], n[i + 1])); return l; };
  const CORES = ['#e3343c', '#3fa9f5', '#f5c518'];
  const trechos = M.setores && M.setores.length ? M.setores : [M.d];
  trechos.forEach((d, i) => {
    const p = new Path();
    p.addLines(pontos(d));
    dc.addPath(p);
    dc.setStrokeColor(new Color(M.setores ? CORES[i] : '#ffffff'));
    dc.setLineWidth(9);
    dc.strokePath();
  });
  if (M.largada) { dc.setFillColor(Color.white()); dc.fillEllipse(new Rect(M.largada.p[0] - 8, M.largada.p[1] - 8, 16, 16)); }
  if (curvas && M.curvas) {
    dc.setFont(Font.boldSystemFont(15));
    dc.setTextAlignedCenter();
    M.curvas.forEach(c => {
      dc.setFillColor(new Color('#15171a'));
      dc.fillEllipse(new Rect(c.t[0] - 11, c.t[1] - 11, 22, 22));
      dc.setTextColor(Color.white());
      dc.drawTextInRect(String(c.n), new Rect(c.t[0] - 11, c.t[1] - 9, 22, 20));
    });
  }
  const img = dc.getImage();
  return { img, lado };
}

function semDados() {
  marca(w);
  w.addSpacer(8);
  texto(w, 'Sem conexão agora.', 14, 'negrito');
  texto(w, 'Abra o widget de novo em alguns minutos.', 11, 'medio', CINZA, 2);
}

if (!J) semDados();
else {
  const C = categoria !== 'formula-1' && J.categorias && J.categorias[categoria] ? J.categorias[categoria] : J;
  const f1 = C === J;
  const P = C.proxima;
  const agora = Date.now();
  const sessoes = P ? P.sessoes || [] : [];
  const prox = sessoes.find(s => Date.parse(s.iso) > agora);

  if (tamanho === 'small') {
    /* pequeno: próxima sessão e contagem regressiva */
    marca(w);
    w.addSpacer(6);
    texto(w, P ? (P.categoria + ' · ' + nomeCurto(P.n)) : 'Temporada encerrada', 10, 'negrito', VERMELHO);
    w.addSpacer(4);
    if (prox) {
      texto(w, prox.t, 17, 'pesado', BRANCO, 2);
      texto(w, prox.dia + ' · ' + hora(prox.h), 13, 'negrito', BRANCO);
      w.addSpacer(4);
      const d = w.addDate(new Date(prox.iso));
      d.applyRelativeStyle();
      d.font = Font.mediumSystemFont(11);
      d.textColor = CINZA;
    } else if (C.ultima) {
      texto(w, 'Última: ' + nomeCurto(C.ultima.n), 12, 'negrito', BRANCO, 2);
      texto(w, (C.ultima.podio && C.ultima.podio[0] ? C.ultima.podio[0].nome : C.ultima.vencedor || ''), 12, 'medio', CINZA, 2);
    }
    w.addSpacer();
    texto(w, 'horário de Brasília', 8, 'medio', APAGADO);
  } else {
    /* médio e grande: horários + mapa (F1) ou pódio */
    marca(w);
    w.addSpacer(6);
    const topo = linhaH(w);
    const esq = colunaV(topo);
    texto(esq, P ? (P.categoria + ' · etapa ' + P.etapa + ' de ' + P.total).toUpperCase() : 'TEMPORADA ENCERRADA', 8, 'negrito', VERMELHO);
    if (P) {
      texto(esq, nomeCurto(P.n), tamanho === 'large' ? 22 : 18, 'pesado', BRANCO);
      texto(esq, P.local + ' · horário de Brasília', 9, 'medio', CINZA);
      esq.addSpacer(5);
      const lista = sessoes.slice(-(tamanho === 'large' ? 7 : 4));
      lista.forEach(s => {
        const l = linhaH(esq);
        const feita = Date.parse(s.iso) + 3600 * 1000 < agora, eProx = prox && s.iso === prox.iso;
        const c = feita ? APAGADO : eProx ? VERMELHO : BRANCO;
        const a = texto(l, s.curto, 11, 'negrito', c); a.lineLimit = 1;
        l.addSpacer();
        texto(l, s.dia + ' ' + hora(s.h), 11, 'negrito', c);
      });
      if (!lista.length) texto(esq, 'Horários na semana da etapa.', 10, 'medio', CINZA, 2);
      if (prox) {
        esq.addSpacer(4);
        const l = linhaH(esq);
        texto(l, prox.t + ' ', 9, 'medio', CINZA);
        const d = l.addDate(new Date(prox.iso));
        d.applyRelativeStyle();
        d.font = Font.boldSystemFont(9);
        d.textColor = BRANCO;
      }
    }
    topo.addSpacer(10);
    const dir = colunaV(topo);
    const M = f1 && P && P.mapa;
    if (M) {
      const m = mapa(M, tamanho === 'large' ? 150 : 118, tamanho === 'large');
      const im = dir.addImage(m.img);
      im.imageSize = new Size(m.lado, m.lado);
    } else if (C.ultima) {
      texto(dir, 'ÚLTIMA ETAPA', 8, 'negrito', VERMELHO);
      texto(dir, nomeCurto(C.ultima.n), 11, 'negrito', BRANCO);
      dir.addSpacer(3);
      (C.ultima.podio || []).forEach(x => {
        const l = linhaH(dir);
        texto(l, 'P' + x.pos + ' ', 11, 'pesado', CINZA);
        texto(l, x.sigla, 11, 'pesado', cor(x.cor));
      });
      if (!(C.ultima.podio || []).length && C.ultima.vencedor) texto(dir, C.ultima.vencedor, 10, 'medio', BRANCO, 3);
    }

    if (tamanho === 'large') {
      w.addSpacer(8);
      const baixo = linhaH(w);
      /* classificação */
      const cl = colunaV(baixo);
      texto(cl, 'CAMPEONATO', 8, 'negrito', VERMELHO);
      cl.addSpacer(2);
      (C.pilotos || []).slice(0, 3).forEach(x => {
        const l = linhaH(cl);
        const b = l.addStack(); b.size = new Size(3, 11); b.backgroundColor = cor(x.cor);
        l.addSpacer(5);
        texto(l, x.pos + '. ' + String(x.nome).split(' e ')[0].split(' ').slice(-1)[0], 11, 'negrito', BRANCO);
        l.addSpacer();
        texto(l, String(x.pts), 11, 'medio', CINZA);
      });
      baixo.addSpacer(14);
      /* pódio da última corrida (F1) ou o piloto favorito */
      const lado = colunaV(baixo);
      let F = null;
      if (fav) F = (C.pilotos || []).find(x => semAcento(x.nome).indexOf(semAcento(fav)) > -1 || semAcento(x.sigla) === semAcento(fav));
      if (F) {
        texto(lado, 'SEU PILOTO', 8, 'negrito', VERMELHO);
        texto(lado, F.nome, 12, 'pesado', BRANCO);
        texto(lado, 'P' + F.pos + ' · ' + F.pts + ' pts' + (F.dif ? ' · a ' + F.dif + ' do líder' : ' · líder'), 10, 'medio', CINZA);
        if (F.ult) texto(lado, 'Último: ' + F.ult.res + ' (' + F.ult.gp + ')', 10, 'medio', CINZA);
      } else if (f1 && C.ultima && C.ultima.podio) {
        texto(lado, nomeCurto(C.ultima.n).toUpperCase(), 8, 'negrito', VERMELHO);
        lado.addSpacer(2);
        C.ultima.podio.forEach(x => {
          const l = linhaH(lado);
          texto(l, 'P' + x.pos + '  ', 11, 'pesado', CINZA);
          texto(l, x.sigla, 11, 'pesado', BRANCO);
        });
      }
      w.addSpacer();
      const rod = linhaH(w);
      texto(rod, 'automobilismonaveia.com.br', 8, 'medio', APAGADO);
      rod.addSpacer();
      const df = new DateFormatter(); df.locale = 'pt_BR'; df.dateFormat = "HH'h'mm";
      texto(rod, 'atualizado ' + df.string(new Date()), 8, 'medio', APAGADO);
    } else w.addSpacer();
  }
}

if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
