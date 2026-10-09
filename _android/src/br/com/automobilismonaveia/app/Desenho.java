package br.com.automobilismonaveia.app;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.text.TextUtils;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/* Desenha o widget numa imagem, com os mesmos modelos do widget do iPhone (assets/widget/na-veia-iphone.js).
   Tudo é medido em dp; a imagem é ampliada pela densidade da tela. */
final class Desenho {
  static final int VERMELHO = 0xffe3343c, BRANCO = 0xfff1f3f5, CINZA = 0xff8e979f, APAGADO = 0xff5c6268;
  static final String[] SEM = { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };
  static final Typeface PESADO = Typeface.create("sans-serif-black", Typeface.NORMAL);
  static final Typeface NEGRITO = Typeface.create("sans-serif", Typeface.BOLD);
  static final Typeface MEDIO = Typeface.create("sans-serif-medium", Typeface.NORMAL);

  static final String[][] MODELOS = {
    { "completo", "Completo (próxima etapa)" },
    { "sessoes", "Próximas sessões" },
    { "vencedores", "Últimos vencedores" },
    { "classificacao", "Campeonato de pilotos" },
    { "contagem", "Contagem regressiva" },
    { "favorito", "Seu piloto" },
    { "mapa", "Mapa da pista (F1)" }
  };
  static final String[][] CATEGORIAS = {
    { "formula-1", "Fórmula 1" }, { "motogp", "MotoGP" }, { "stock-car", "Stock Car" }, { "todas", "Todas as categorias" }
  };

  final Canvas c;
  final float W, H, x0 = 14, x1;
  final boolean pequeno, grande;
  final JSONObject J, C;
  final boolean f1;
  final String tipo, cat, fav, nomeCat;
  final long agora = System.currentTimeMillis();
  final TextPaint tp = new TextPaint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
  final Paint pp = new Paint(Paint.ANTI_ALIAS_FLAG);
  float y = 12;

  static Bitmap gerar(JSONObject J, String tipo, String cat, String fav, float wDp, float hDp, float escala) {
    wDp = Math.max(110, wDp); hDp = Math.max(110, hDp);
    Bitmap b = Bitmap.createBitmap(Math.round(wDp * escala), Math.round(hDp * escala), Bitmap.Config.ARGB_8888);
    Canvas cv = new Canvas(b);
    cv.scale(escala, escala);
    new Desenho(cv, wDp, hDp, J, tipo, cat, fav).tudo();
    return b;
  }

  Desenho(Canvas c, float W, float H, JSONObject J, String tipo, String cat, String fav) {
    this.c = c; this.W = W; this.H = H; this.J = J;
    this.x1 = W - 14;
    this.pequeno = W < 220;
    this.grande = H >= 250;
    this.tipo = tipo == null || tipo.isEmpty() ? "completo" : tipo;
    this.cat = cat == null || cat.isEmpty() ? "formula-1" : cat;
    this.fav = fav == null ? "" : fav.trim();
    JSONObject cats = J == null ? null : J.optJSONObject("categorias");
    JSONObject outra = cats != null && !this.cat.equals("formula-1") && !this.cat.equals("todas") ? cats.optJSONObject(this.cat) : null;
    this.C = outra != null ? outra : J;
    this.f1 = outra == null;
    String n = "";
    for (String[] x : CATEGORIAS) if (x[0].equals(this.cat)) n = x[1];
    this.nomeCat = n;
  }

  /* ---------- peças ---------- */
  void fundo() {
    RectF r = new RectF(0, 0, W, H);
    Path p = new Path();
    p.addRoundRect(r, 22, 22, Path.Direction.CW);
    c.clipPath(p);
    pp.setShader(new LinearGradient(0, 0, 0, H, 0xff1a0d10, 0xff0b0c0e, Shader.TileMode.CLAMP));
    c.drawRect(r, pp);
    pp.setShader(null);
  }

  /* um texto numa linha (diminui até 60% e corta com "…" se não couber); devolve a altura usada */
  float texto(float x, float yy, float maxW, String t, float tam, Typeface f, int cor) {
    t = t == null ? "" : t;
    tp.setTypeface(f); tp.setColor(cor); tp.setTextSize(tam);
    float largura = tp.measureText(t);
    if (largura > maxW && largura > 0) tp.setTextSize(tam * Math.max(0.6f, maxW / largura));
    String e = TextUtils.ellipsize(t, tp, Math.max(1, maxW), TextUtils.TruncateAt.END).toString();
    Paint.FontMetrics fm = tp.getFontMetrics();
    c.drawText(e, x, yy - fm.ascent, tp);
    tp.setTextSize(tam);
    return tam * 1.25f;
  }

  float textoLinhas(float x, float yy, float maxW, String t, float tam, Typeface f, int cor, int linhas) {
    tp.setTypeface(f); tp.setColor(cor); tp.setTextSize(tam);
    StaticLayout l = StaticLayout.Builder.obtain(t, 0, t.length(), tp, (int) Math.max(1, maxW))
        .setMaxLines(linhas).setEllipsize(TextUtils.TruncateAt.END).setAlignment(Layout.Alignment.ALIGN_NORMAL)
        .setLineSpacing(0, 1f).setIncludePad(false).build();
    c.save(); c.translate(x, yy); l.draw(c); c.restore();
    return l.getHeight() + tam * 0.15f;
  }

  float largura(String t, float tam, Typeface f) { tp.setTypeface(f); tp.setTextSize(tam); return tp.measureText(t); }

  /* texto colado na direita */
  void textoDir(float xd, float yy, String t, float tam, Typeface f, int cor) {
    texto(xd - largura(t, tam, f), yy, W, t, tam, f, cor);
  }

  /* linha com texto à esquerda e outro à direita */
  void linha(float xa, float xb, String esq, int corE, Typeface fE, String dir, int corD, Typeface fD, float tam) {
    float ld = dir == null || dir.isEmpty() ? 0 : largura(dir, tam, fD) + 6;
    texto(xa, y, xb - xa - ld, esq, tam, fE, corE);
    if (ld > 0) textoDir(xb, y, dir, tam, fD, corD);
    y += tam * 1.45f;
  }

  void rotulo(String t) { y += texto(x0, y, x1 - x0, t, 8.5f, NEGRITO, VERMELHO); }

  void marca(String extra) {
    float a = texto(x0, y, W, "AUTOMOBILISMO", 9, PESADO, BRANCO);
    texto(x0 + largura("AUTOMOBILISMO", 9, PESADO) + 3, y, W, "NA VEIA", 9, PESADO, VERMELHO);
    if (extra != null && !extra.isEmpty()) textoDir(x1, y, extra, 9, NEGRITO, CINZA);
    y += a;
  }

  void barra(float x, float yy, float tam, String cor) {
    pp.setColor(corDe(cor));
    c.drawRect(x, yy + tam * 0.18f, x + 3, yy + tam * 1.18f, pp);
  }

  void mapa(JSONObject M, float x, float yy, float lado, boolean curvas) {
    c.save();
    c.translate(x, yy);
    c.scale(lado / 400f, lado / 400f);
    Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
    p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(9); p.setStrokeJoin(Paint.Join.ROUND); p.setStrokeCap(Paint.Cap.ROUND);
    int[] cores = { 0xffe3343c, 0xff3fa9f5, 0xfff5c518 };
    JSONArray set = M.optJSONArray("setores");
    if (set != null && set.length() > 0) {
      for (int i = 0; i < set.length(); i++) { p.setColor(cores[i % 3]); c.drawPath(caminho(set.optString(i)), p); }
    } else { p.setColor(0xffffffff); c.drawPath(caminho(M.optString("d")), p); }
    JSONObject larg = M.optJSONObject("largada");
    if (larg != null && larg.optJSONArray("p") != null) {
      JSONArray lp = larg.optJSONArray("p");
      p.setStyle(Paint.Style.FILL); p.setColor(0xffffffff);
      c.drawCircle((float) lp.optDouble(0), (float) lp.optDouble(1), 8, p);
    }
    JSONArray cv = M.optJSONArray("curvas");
    if (curvas && cv != null) {
      TextPaint t = new TextPaint(Paint.ANTI_ALIAS_FLAG);
      t.setTypeface(NEGRITO); t.setTextSize(15); t.setColor(0xffffffff); t.setTextAlign(Paint.Align.CENTER);
      p.setStyle(Paint.Style.FILL);
      for (int i = 0; i < cv.length(); i++) {
        JSONObject k = cv.optJSONObject(i);
        JSONArray q = k == null ? null : k.optJSONArray("t");
        if (q == null) continue;
        float cx = (float) q.optDouble(0), cy = (float) q.optDouble(1);
        p.setColor(0xff15171a); c.drawCircle(cx, cy, 11, p);
        c.drawText(k.optString("n"), cx, cy + 5.5f, t);
      }
    }
    c.restore();
  }

  static Path caminho(String d) {
    Path p = new Path();
    Matcher m = Pattern.compile("-?\\d+(\\.\\d+)?").matcher(d == null ? "" : d);
    List<Float> n = new ArrayList<>();
    while (m.find()) n.add(Float.parseFloat(m.group()));
    for (int i = 0; i + 1 < n.size(); i += 2) {
      if (i == 0) p.moveTo(n.get(i), n.get(i + 1)); else p.lineTo(n.get(i), n.get(i + 1));
    }
    return p;
  }

  /* ---------- dados ---------- */
  static int corDe(String hex) {
    try { return android.graphics.Color.parseColor(hex == null || hex.isEmpty() ? "#8e979f" : hex); } catch (Exception e) { return CINZA; }
  }
  static String nomeCurto(String n) { return String.valueOf(n == null ? "" : n).replaceFirst("^GP (de |do |da |dos |das )?", ""); }
  static String hora(String h) { return h == null || h.isEmpty() || h.equals("null") ? "—" : h.replace(":", "h"); }
  static String dataCurta(String iso) { return iso == null || iso.length() < 10 ? "" : iso.substring(8, 10) + "/" + iso.substring(5, 7); }
  static String semana(String d) {
    try { return SEM[LocalDate.parse(d.substring(0, 10)).getDayOfWeek().getValue() % 7]; } catch (Exception e) { return ""; }
  }
  static long quando(String iso) {
    try { return OffsetDateTime.parse(iso).toInstant().toEpochMilli(); } catch (Exception e) { return 0; }
  }
  static String semAcento(String s) {
    return Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim();
  }
  /* "em 2 d 4 h", "em 3 h 20 min", "em 12 min" */
  String falta(String iso) {
    long t = quando(iso), dif = t - agora;
    if (t == 0) return "";
    if (dif <= 0) return "agora";
    long min = (dif + 59999) / 60000, d = min / 1440, h = (min % 1440) / 60, m = min % 60;
    if (d > 0) return "em " + d + " d" + (h > 0 ? " " + h + " h" : "");
    if (h > 0) return "em " + h + " h" + (m > 0 ? " " + m + " min" : "");
    return "em " + m + " min";
  }

  static final class Sessao { String rot = "", t, etapa, iso, d, h; }

  List<Sessao> proximasSessoes() {
    List<Sessao> l = new ArrayList<>();
    if (cat.equals("todas")) {
      JSONArray a = J.optJSONArray("agenda");
      for (int i = 0; a != null && i < a.length(); i++) {
        JSONObject x = a.optJSONObject(i);
        if (quando(x.optString("iso")) + 3600000 <= agora) continue;
        Sessao s = new Sessao(); s.rot = x.optString("cat"); s.t = x.optString("t"); s.etapa = x.optString("etapa");
        s.iso = x.optString("iso"); s.d = x.optString("d"); s.h = x.optString("h", ""); l.add(s);
      }
      return l;
    }
    JSONObject P = C.optJSONObject("proxima");
    JSONArray a = P == null ? null : P.optJSONArray("sessoes");
    for (int i = 0; a != null && i < a.length(); i++) {
      JSONObject x = a.optJSONObject(i);
      if (quando(x.optString("iso")) + 3600000 <= agora) continue;
      Sessao s = new Sessao(); s.t = x.optString("curto"); s.etapa = P.optString("n");
      s.iso = x.optString("iso"); s.d = x.optString("d"); s.h = x.optString("h", ""); l.add(s);
    }
    return l;
  }

  /* ---------- modelos ---------- */
  void tudo() {
    fundo();
    if (J == null) {
      marca(null); y += 8;
      y += texto(x0, y, x1 - x0, "Sem conexão agora.", 14, NEGRITO, BRANCO);
      textoLinhas(x0, y, x1 - x0, "O widget tenta de novo em alguns minutos.", 11, MEDIO, CINZA, 2);
      return;
    }
    switch (tipo) {
      case "sessoes": sessoes(); break;
      case "vencedores": vencedores(); break;
      case "classificacao": classificacao(); break;
      case "contagem": contagem(); break;
      case "favorito": favorito(); break;
      case "mapa": completo(true); break;
      default: completo(false);
    }
  }

  void sessoes() {
    List<Sessao> L = proximasSessoes();
    int n = pequeno ? 3 : grande ? 11 : 5;
    marca(pequeno ? "" : nomeCat);
    y += 6;
    rotulo("PRÓXIMAS SESSÕES");
    JSONObject P = C.optJSONObject("proxima");
    if (!cat.equals("todas") && P != null && !pequeno) y += texto(x0, y, x1 - x0, nomeCurto(P.optString("n")) + " · horário de Brasília", 10, NEGRITO, CINZA);
    y += 4;
    if (L.isEmpty()) { textoLinhas(x0, y, x1 - x0, "Sem sessões nos próximos dias.", 11, MEDIO, CINZA, 2); return; }
    float tam = pequeno ? 10 : 11;
    for (int i = 0; i < Math.min(n, L.size()); i++) {
      if (y + tam * 1.45f > H - (pequeno ? 10 : 24)) break;
      Sessao s = L.get(i);
      String quando = semana(s.d) + " " + hora(s.h);
      float lq = largura(quando, tam, PESADO);
      texto(x0, y, x1 - x0, quando, tam, PESADO, i == 0 ? VERMELHO : BRANCO);
      String o = (s.rot.isEmpty() ? "" : s.rot + " · ") + s.t + (cat.equals("todas") && !pequeno ? " · " + nomeCurto(s.etapa) : "");
      texto(x0 + lq + 6, y, x1 - x0 - lq - 6, o, tam, NEGRITO, i == 0 ? BRANCO : CINZA);
      y += tam * 1.45f;
    }
    if (!pequeno) { y += 4; texto(x0, y, x1 - x0, "Começa " + falta(L.get(0).iso), 9, NEGRITO, CINZA); }
  }

  void vencedores() {
    JSONArray L = cat.equals("todas") ? J.optJSONArray("vencedoresTodas") : C.optJSONArray("vencedores");
    int n = pequeno ? 3 : grande ? 8 : 3;
    marca(pequeno ? "" : nomeCat);
    y += 6;
    rotulo("ÚLTIMOS VENCEDORES");
    y += 4;
    for (int i = 0; L != null && i < Math.min(n, L.length()); i++) {
      if (y + 26 > H - 6) break;
      JSONObject v = L.optJSONObject(i);
      String top = (v.optString("cat").isEmpty() ? "" : v.optString("cat") + " · ") + nomeCurto(v.optString("n")) + " · " + dataCurta(v.optString("d"));
      y += texto(x0, y, x1 - x0, top, 9, NEGRITO, CINZA) - 1;
      y += texto(x0, y, x1 - x0, v.optString("venc").replaceFirst("\\s*\\(.+\\)$", ""), pequeno ? 11 : 12, PESADO, BRANCO) + 3;
    }
  }

  void classificacao() {
    JSONArray L = C.optJSONArray("pilotos");
    int n = pequeno ? 4 : grande ? 10 : 5;
    marca(pequeno ? "" : nomeCat);
    y += 6;
    rotulo("CAMPEONATO DE PILOTOS");
    y += 4;
    float tam = 11;
    for (int i = 0; L != null && i < Math.min(n, L.length()); i++) {
      if (y + tam * 1.45f > H - 8) break;
      JSONObject x = L.optJSONObject(i);
      String pos = String.valueOf(x.optInt("pos"));
      texto(x0, y, 30, pos, tam, PESADO, CINZA);
      float xb = x0 + Math.max(14, largura(pos, tam, PESADO)) + 5;
      barra(xb, y, tam, x.optString("cor"));
      String nome = pequeno ? x.optString("sigla") : x.optString("nome").split(" e ")[0];
      float xn = xb + 8;
      y -= 0;
      linha(xn, x1, nome, BRANCO, NEGRITO, String.valueOf(x.optInt("pts")), CINZA, NEGRITO, tam);
    }
    JSONArray E = C.optJSONArray("equipes");
    if (grande && E != null && E.length() > 0 && y + 50 < H) {
      y += 6;
      rotulo("EQUIPES");
      for (int i = 0; i < Math.min(3, E.length()); i++) {
        JSONObject x = E.optJSONObject(i);
        String pos = x.optInt("pos") + ".";
        texto(x0, y, 30, pos, tam, PESADO, CINZA);
        float xb = x0 + Math.max(14, largura(pos, tam, PESADO)) + 5;
        barra(xb, y, tam, x.optString("cor"));
        linha(xb + 8, x1, x.optString("nome"), BRANCO, NEGRITO, String.valueOf(x.optInt("pts")), CINZA, NEGRITO, tam);
      }
    }
  }

  void contagem() {
    JSONObject P = C.optJSONObject("proxima");
    List<Sessao> L = proximasSessoes();
    Sessao s = L.isEmpty() ? null : L.get(0);
    marca(null);
    float tamT = pequeno ? 18 : 22;
    /* o bloco fica embaixo, como no iPhone */
    float bloco = s != null ? 9 * 1.25f * 2 + tamT * 1.25f * 2 + 11 * 1.25f + 4 + (pequeno ? 14 : 18) * 1.25f
        : 9 * 1.25f * 2 + 20 * 1.25f * 2 + 10 * 1.25f * 2;
    y = Math.max(y + 6, H - 12 - bloco);
    String rot = P != null ? (P.optString("categoria") + " · " + nomeCurto(P.optString("n"))).toUpperCase(Locale.ROOT) : nomeCat.toUpperCase(Locale.ROOT);
    y += textoLinhas(x0, y, x1 - x0, rot, 9, NEGRITO, VERMELHO, 2);
    if (s != null) {
      y += textoLinhas(x0, y, x1 - x0, s.t, tamT, PESADO, BRANCO, 2);
      y += texto(x0, y, x1 - x0, semana(s.d) + " · " + hora(s.h) + " (Brasília)", 11, NEGRITO, CINZA) + 4;
      texto(x0, y, x1 - x0, falta(s.iso), pequeno ? 14 : 18, NEGRITO, BRANCO);
    } else if (P != null) {
      y += textoLinhas(x0, y, x1 - x0, nomeCurto(P.optString("n")), pequeno ? 16 : 20, PESADO, BRANCO, 2);
      String ini = P.optString("inicio"), fim = P.optString("fim");
      textoLinhas(x0, y, x1 - x0, dataCurta(ini) + (!fim.isEmpty() && !fim.equals(ini) ? " a " + dataCurta(fim) : "") + " · horários a confirmar", 10, MEDIO, CINZA, 2);
    } else textoLinhas(x0, y, x1 - x0, "Temporada encerrada", 16, PESADO, BRANCO, 2);
  }

  void favorito() {
    JSONObject F = null;
    JSONArray L = C.optJSONArray("pilotos");
    if (!fav.isEmpty() && L != null) for (int i = 0; i < L.length(); i++) {
      JSONObject x = L.optJSONObject(i);
      if (semAcento(x.optString("nome")).contains(semAcento(fav)) || semAcento(x.optString("sigla")).equals(semAcento(fav))) { F = x; break; }
    }
    marca(pequeno ? "" : nomeCat);
    y += 6;
    rotulo("SEU PILOTO");
    if (F == null) {
      y += textoLinhas(x0, y, x1 - x0, fav.isEmpty() ? "Escolha o piloto: toque e segure o widget e depois em Configurar." : "Não achei \"" + fav + "\".", 12, NEGRITO, BRANCO, 3);
      return;
    }
    float tamN = pequeno ? 15 : 18;
    float topo = y;
    barra(x0, y, tamN, F.optString("cor"));
    y += texto(x0 + 9, y, x1 - x0 - 9, F.optString("nome"), tamN, PESADO, BRANCO);
    if (!F.optString("equipe").isEmpty()) y += texto(x0 + 9, y, x1 - x0 - 9, F.optString("equipe"), 10, MEDIO, CINZA);
    if (!F.optString("equipe").isEmpty()) { pp.setColor(corDe(F.optString("cor"))); c.drawRect(x0, topo + tamN * 0.18f, x0 + 3, y - 2, pp); }
    y += 6;
    List<String[]> nums = new ArrayList<>();
    nums.add(new String[] { "P" + F.optInt("pos"), "no campeonato" });
    String dif = F.optString("dif");
    nums.add(new String[] { String.valueOf(F.optInt("pts")), !dif.isEmpty() && !dif.equals("0") && !dif.equals("null") ? "pts · a " + dif + " do líder" : "pts · líder" });
    JSONObject ult = F.optJSONObject("ult");
    if (!pequeno && ult != null) nums.add(new String[] { ult.optString("res"), ult.optString("gp") });
    float tam = pequeno ? 14 : 18;
    if (pequeno) {
      for (String[] n : nums) {
        if (y + tam * 1.25f + 11 > H - 6) break;
        y += texto(x0, y, x1 - x0, n[0], tam, PESADO, BRANCO) - 2;
        y += texto(x0, y, x1 - x0, n[1], 9, MEDIO, CINZA);
      }
    } else {
      float col = (x1 - x0) / nums.size();
      for (int i = 0; i < nums.size(); i++) {
        texto(x0 + col * i, y, col - 6, nums.get(i)[0], tam, PESADO, BRANCO);
        texto(x0 + col * i, y + tam * 1.2f, col - 6, nums.get(i)[1], 9, MEDIO, CINZA);
      }
      y += tam * 1.2f + 9 * 1.3f;
    }
    JSONObject P = C.optJSONObject("proxima");
    if (grande && P != null && y + 60 < H) {
      y += 10;
      rotulo("PRÓXIMA ETAPA");
      y += texto(x0, y, x1 - x0, nomeCurto(P.optString("n")), 14, PESADO, BRANCO);
      List<Sessao> L2 = proximasSessoes();
      if (!L2.isEmpty()) {
        Sessao s = L2.get(0);
        texto(x0, y, x1 - x0, s.t + " · " + semana(s.d) + " " + hora(s.h) + " · " + falta(s.iso), 11, NEGRITO, CINZA);
      }
    }
  }

  void completo(boolean comMapa) {
    if (pequeno) { contagem(); return; }
    JSONObject P = C.optJSONObject("proxima");
    JSONArray sess = P == null ? null : P.optJSONArray("sessoes");
    JSONObject prox = null;
    for (int i = 0; sess != null && i < sess.length(); i++) {
      JSONObject s = sess.optJSONObject(i);
      if (quando(s.optString("iso")) > agora) { prox = s; break; }
    }
    marca(null);
    y += 6;
    float topoY = y;
    JSONObject M = f1 && P != null ? P.optJSONObject("mapa") : null;
    /* coluna da direita: mapa da pista (F1) ou última etapa */
    float disp = (grande ? H * 0.52f : H - 12) - topoY;
    float lado = M != null ? Math.min(comMapa && grande ? 165 : grande ? 150 : 118, Math.min(disp, (x1 - x0) * 0.48f)) : 108;
    float xd = x1 - lado;
    if (M != null) mapa(M, xd, topoY, lado, grande);
    else if (C.optJSONObject("ultima") != null) {
      JSONObject U = C.optJSONObject("ultima");
      float yy = topoY;
      yy += texto(xd, yy, lado, "ÚLTIMA ETAPA", 8.5f, NEGRITO, VERMELHO);
      yy += texto(xd, yy, lado, nomeCurto(U.optString("n")), 11, NEGRITO, BRANCO) + 3;
      JSONArray pod = U.optJSONArray("podio");
      for (int i = 0; pod != null && i < pod.length(); i++) {
        JSONObject x = pod.optJSONObject(i);
        String pp2 = "P" + x.optInt("pos") + " ";
        texto(xd, yy, lado, pp2, 11, PESADO, CINZA);
        yy += texto(xd + largura(pp2, 11, PESADO), yy, lado, x.optString("sigla"), 11, PESADO, corDe(x.optString("cor")));
      }
      if ((pod == null || pod.length() == 0) && !U.optString("vencedor").isEmpty()) textoLinhas(xd, yy, lado, U.optString("vencedor"), 10, MEDIO, BRANCO, 3);
    }
    /* coluna da esquerda */
    float xe = xd - 10;
    if (P == null) { y += texto(x0, y, xe - x0, "TEMPORADA ENCERRADA", 8.5f, NEGRITO, VERMELHO); }
    else {
      y += texto(x0, y, xe - x0, (P.optString("categoria") + " · etapa " + P.optInt("etapa") + " de " + P.optInt("total")).toUpperCase(Locale.ROOT), 8.5f, NEGRITO, VERMELHO);
      y += texto(x0, y, xe - x0, nomeCurto(P.optString("n")), grande ? 22 : 18, PESADO, BRANCO);
      y += texto(x0, y, xe - x0, P.optString("local") + " · horário de Brasília", 9, MEDIO, CINZA) + 5;
      int qtd = grande ? 7 : 4, total = sess == null ? 0 : sess.length();
      float limite = grande ? H * 0.6f : H - 22;
      for (int i = Math.max(0, total - qtd); i < total; i++) {
        if (y + 11 * 1.45f > limite) break;
        JSONObject s = sess.optJSONObject(i);
        boolean feita = quando(s.optString("iso")) + 3600000 < agora, eProx = prox != null && s.optString("iso").equals(prox.optString("iso"));
        int cor = feita ? APAGADO : eProx ? VERMELHO : BRANCO;
        linha(x0, xe, s.optString("curto"), cor, NEGRITO, s.optString("dia") + " " + hora(s.optString("h", "")), cor, NEGRITO, 11);
      }
      if (total == 0) y += textoLinhas(x0, y, xe - x0, "Horários na semana da etapa.", 10, MEDIO, CINZA, 2);
      if (prox != null && y + 14 < H) { y += 2; y += texto(x0, y, xe - x0, prox.optString("t") + " " + falta(prox.optString("iso")), 9, MEDIO, CINZA); }
    }
    if (grande) {
      y = Math.max(y, M != null ? topoY + lado : y) + 10;
      if (y + 60 > H) return;
      float meio = x0 + (x1 - x0) * 0.56f;
      float yb = y;
      y += texto(x0, y, meio - x0, "CAMPEONATO", 8.5f, NEGRITO, VERMELHO) + 2;
      JSONArray pil = C.optJSONArray("pilotos");
      for (int i = 0; pil != null && i < Math.min(3, pil.length()); i++) {
        JSONObject x = pil.optJSONObject(i);
        String[] partes = x.optString("nome").split(" e ")[0].split(" ");
        barra(x0, y, 11, x.optString("cor"));
        linha(x0 + 8, meio - 12, x.optInt("pos") + ". " + partes[partes.length - 1], BRANCO, NEGRITO, String.valueOf(x.optInt("pts")), CINZA, MEDIO, 11);
      }
      JSONObject U = C.optJSONObject("ultima");
      JSONArray pod = U == null ? null : U.optJSONArray("podio");
      if (f1 && pod != null && pod.length() > 0) {
        float yy = yb;
        yy += texto(meio, yy, x1 - meio, nomeCurto(U.optString("n")).toUpperCase(Locale.ROOT), 8.5f, NEGRITO, VERMELHO) + 2;
        for (int i = 0; i < pod.length(); i++) {
          JSONObject x = pod.optJSONObject(i);
          String pp2 = "P" + x.optInt("pos") + "  ";
          texto(meio, yy, x1 - meio, pp2, 11, PESADO, CINZA);
          texto(meio + largura(pp2, 11, PESADO), yy, x1 - meio, x.optString("sigla"), 11, PESADO, BRANCO);
          yy += 11 * 1.45f;
        }
      }
    }
  }
}
