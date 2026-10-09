package br.com.automobilismonaveia.app;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;

import org.json.JSONObject;

/* Tela que abre ao colocar o widget (ou em "Configurar"): escolhe o modelo, a categoria e o piloto, com prévia. */
public class Configurar extends Activity {
  int id = AppWidgetManager.INVALID_APPWIDGET_ID;
  Spinner modelo, categoria;
  EditText piloto;
  TextView rotPiloto;
  ImageView previa;
  JSONObject dados;
  int wDp = 320, hDp = 160;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    setResult(RESULT_CANCELED);
    Bundle ex = getIntent().getExtras();
    if (ex != null) id = ex.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
    if (id == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return; }

    Bundle o = AppWidgetManager.getInstance(this).getAppWidgetOptions(id);
    if (o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0) > 0) wDp = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
    if (o.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) > 0) hDp = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT);

    LinearLayout col = new LinearLayout(this);
    col.setOrientation(LinearLayout.VERTICAL);
    int p = dp(20);
    col.setPadding(p, p, p, p);

    TextView t = texto("Escolha o seu widget", 24, Color.WHITE, true);
    col.addView(t);
    col.addView(texto("Grátis, do Automobilismo Na Veia. Para trocar depois: toque e segure o widget e depois em Configurar.", 15, 0xffaab0b6, false));

    previa = new ImageView(this);
    previa.setAdjustViewBounds(true);
    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(200));
    lp.topMargin = dp(16);
    previa.setLayoutParams(lp);
    previa.setScaleType(ImageView.ScaleType.FIT_CENTER);
    GradientDrawable palco = new GradientDrawable();
    palco.setColor(0xff22262c);
    palco.setCornerRadius(dp(14));
    previa.setBackground(palco);
    previa.setPadding(dp(12), dp(12), dp(12), dp(12));
    col.addView(previa);

    col.addView(rotulo("Modelo"));
    String[] nomesM = new String[Desenho.MODELOS.length];
    for (int i = 0; i < nomesM.length; i++) nomesM[i] = Desenho.MODELOS[i][1];
    modelo = lista(nomesM);
    col.addView(modelo);

    col.addView(rotulo("Categoria"));
    String[] nomesC = new String[Desenho.CATEGORIAS.length];
    for (int i = 0; i < nomesC.length; i++) nomesC[i] = Desenho.CATEGORIAS[i][1];
    categoria = lista(nomesC);
    col.addView(categoria);

    rotPiloto = rotulo("Seu piloto (nome ou sobrenome)");
    col.addView(rotPiloto);
    piloto = new EditText(this);
    piloto.setSingleLine(true);
    piloto.setHint("Ex.: Bortoleto");
    piloto.setTextColor(Color.WHITE);
    piloto.setHintTextColor(0xff5c6268);
    col.addView(piloto);

    Button pronto = new Button(this);
    pronto.setText("Pronto");
    pronto.setTextColor(Color.WHITE);
    pronto.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
    GradientDrawable fb = new GradientDrawable();
    fb.setColor(0xffb0121b);
    fb.setCornerRadius(dp(8));
    pronto.setBackground(fb);
    LinearLayout.LayoutParams lb = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(54));
    lb.topMargin = dp(22);
    pronto.setLayoutParams(lb);
    pronto.setOnClickListener(v -> salvar());
    col.addView(pronto);

    /* o que já estava escolhido (quando é para trocar) */
    android.content.SharedPreferences pr = Widget.prefs(this);
    selecionar(modelo, Desenho.MODELOS, pr.getString("tipo_" + id, "completo"));
    selecionar(categoria, Desenho.CATEGORIAS, pr.getString("cat_" + id, "formula-1"));
    piloto.setText(pr.getString("fav_" + id, ""));

    AdapterView.OnItemSelectedListener mudou = new AdapterView.OnItemSelectedListener() {
      @Override public void onItemSelected(AdapterView<?> a, View v, int pos, long i) { mostrarPrevia(); }
      @Override public void onNothingSelected(AdapterView<?> a) { }
    };
    modelo.setOnItemSelectedListener(mudou);
    categoria.setOnItemSelectedListener(mudou);
    piloto.addTextChangedListener(new TextWatcher() {
      @Override public void beforeTextChanged(CharSequence s, int a, int b2, int c) { }
      @Override public void onTextChanged(CharSequence s, int a, int b2, int c) { }
      @Override public void afterTextChanged(Editable s) { mostrarPrevia(); }
    });

    ScrollView sv = new ScrollView(this);
    sv.setBackgroundColor(0xff141619);
    sv.setFitsSystemWindows(true);
    sv.addView(col);
    setContentView(sv);
    mostrarPrevia();

    new Thread(() -> {
      JSONObject J = Widget.carregar(getApplicationContext());
      runOnUiThread(() -> { dados = J; mostrarPrevia(); });
    }).start();
  }

  String tipo() { return Desenho.MODELOS[modelo.getSelectedItemPosition()][0]; }
  String cat() { return Desenho.CATEGORIAS[categoria.getSelectedItemPosition()][0]; }

  void mostrarPrevia() {
    boolean fav = tipo().equals("favorito");
    rotPiloto.setVisibility(fav ? View.VISIBLE : View.GONE);
    piloto.setVisibility(fav ? View.VISIBLE : View.GONE);
    if (dados == null) return;
    float esc = getResources().getDisplayMetrics().density;
    previa.setImageBitmap(Desenho.gerar(dados, tipo(), cat(), piloto.getText().toString(), wDp, hDp, Math.min(esc, 2.5f)));
  }

  void salvar() {
    Widget.prefs(this).edit()
        .putString("tipo_" + id, tipo())
        .putString("cat_" + id, cat())
        .putString("fav_" + id, piloto.getText().toString().trim())
        .apply();
    Widget.atualizar(this, new int[] { id }, null);
    setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id));
    finish();
  }

  void selecionar(Spinner s, String[][] op, String valor) {
    for (int i = 0; i < op.length; i++) if (op[i][0].equals(valor)) s.setSelection(i);
  }

  Spinner lista(String[] itens) {
    Spinner s = new Spinner(this);
    ArrayAdapter<String> a = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, itens);
    a.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
    s.setAdapter(a);
    s.setMinimumHeight(dp(48));
    return s;
  }

  TextView rotulo(String t) {
    TextView v = texto(t.toUpperCase(), 12, 0xffe3343c, true);
    v.setLetterSpacing(0.1f);
    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    lp.topMargin = dp(18);
    v.setLayoutParams(lp);
    return v;
  }

  TextView texto(String t, float sp, int cor, boolean negrito) {
    TextView v = new TextView(this);
    v.setText(t);
    v.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
    v.setTextColor(cor);
    v.setGravity(Gravity.START);
    if (negrito) v.setTypeface(Desenho.PESADO);
    v.setPadding(0, dp(4), 0, dp(4));
    return v;
  }

  int dp(float v) { return Math.round(v * getResources().getDisplayMetrics().density); }
}
