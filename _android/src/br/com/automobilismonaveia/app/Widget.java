package br.com.automobilismonaveia.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/* O widget da tela inicial: baixa os dados do site (assets/dados/widget.json), desenha e se atualiza sozinho a cada 15 minutos. */
public class Widget extends AppWidgetProvider {
  static final String SITE = "https://automobilismonaveia.com.br/";
  static final String DADOS = SITE + "assets/dados/widget.json";

  @Override public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) { atualizar(ctx, ids, goAsync()); }

  @Override public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager m, int id, Bundle opcoes) {
    atualizar(ctx, new int[] { id }, goAsync());
  }

  @Override public void onDeleted(Context ctx, int[] ids) {
    SharedPreferences.Editor e = prefs(ctx).edit();
    for (int id : ids) e.remove("tipo_" + id).remove("cat_" + id).remove("fav_" + id);
    e.apply();
  }

  static SharedPreferences prefs(Context ctx) { return ctx.getSharedPreferences("widgets", Context.MODE_PRIVATE); }

  static void atualizar(Context ctx, int[] ids, PendingResult pr) {
    final Context app = ctx.getApplicationContext();
    new Thread(() -> {
      try {
        JSONObject J = carregar(app);
        AppWidgetManager m = AppWidgetManager.getInstance(app);
        for (int id : ids) desenhar(app, m, id, J);
      } catch (Throwable t) {
        /* sem dados agora: tenta de novo na próxima atualização */
      } finally {
        agendar(app);
        if (pr != null) pr.finish();
      }
    }).start();
  }

  static void desenhar(Context app, AppWidgetManager m, int id, JSONObject J) {
    SharedPreferences p = prefs(app);
    Bundle o = m.getAppWidgetOptions(id);
    boolean deitado = app.getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE;
    int w = o.getInt(deitado ? AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH : AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
    int h = o.getInt(deitado ? AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT : AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0);
    if (w <= 0) w = 320;
    if (h <= 0) h = 160;
    float escala = Math.min(app.getResources().getDisplayMetrics().density, 2.5f);
    Bitmap b = Desenho.gerar(J, p.getString("tipo_" + id, "completo"), p.getString("cat_" + id, "formula-1"), p.getString("fav_" + id, ""), w, h, escala);
    RemoteViews v = new RemoteViews(app.getPackageName(), R.layout.widget);
    v.setImageViewBitmap(R.id.imagem, b);
    v.setViewVisibility(R.id.carregando, View.GONE);
    Intent abrir = new Intent(app, Principal.class);
    v.setOnClickPendingIntent(R.id.raiz, PendingIntent.getActivity(app, 0, abrir, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
    m.updateAppWidget(id, v);
  }

  /* dados do site; sem internet, usa a última cópia guardada */
  static JSONObject carregar(Context app) {
    File cache = new File(app.getFilesDir(), "widget.json");
    try {
      HttpURLConnection c = (HttpURLConnection) new URL(DADOS + "?t=" + System.currentTimeMillis()).openConnection();
      c.setConnectTimeout(8000);
      c.setReadTimeout(10000);
      c.setRequestProperty("User-Agent", "NaVeiaApp/1 Android");
      try (InputStream in = c.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
        byte[] buf = new byte[16384];
        int n;
        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        String txt = out.toString("UTF-8");
        JSONObject J = new JSONObject(txt);
        try (FileOutputStream f = new FileOutputStream(cache)) { f.write(txt.getBytes(StandardCharsets.UTF_8)); }
        return J;
      } finally { c.disconnect(); }
    } catch (Exception e) {
      try { return cache.exists() ? new JSONObject(new String(Files.readAllBytes(cache.toPath()), StandardCharsets.UTF_8)) : null; } catch (Exception e2) { return null; }
    }
  }

  /* próxima atualização em 15 minutos (a contagem regressiva fica certinha) */
  static void agendar(Context app) {
    int[] ids = AppWidgetManager.getInstance(app).getAppWidgetIds(new ComponentName(app, Widget.class));
    AlarmManager am = (AlarmManager) app.getSystemService(Context.ALARM_SERVICE);
    Intent i = new Intent(app, Widget.class).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE).putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
    PendingIntent pi = PendingIntent.getBroadcast(app, 1, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    if (am == null) return;
    if (ids.length == 0) { am.cancel(pi); return; }
    am.set(AlarmManager.RTC, System.currentTimeMillis() + 15 * 60 * 1000, pi);
  }
}
