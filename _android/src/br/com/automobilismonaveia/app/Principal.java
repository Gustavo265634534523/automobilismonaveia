package br.com.automobilismonaveia.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/* Abre o site dentro do app. Links de fora (YouTube, agenda, etc.) vão para o app certo do celular. */
public class Principal extends Activity {
  static final String HOST = "automobilismonaveia.com.br";
  WebView web;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    web = new WebView(this);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setUserAgentString(s.getUserAgentString() + " NaVeiaApp/1");
    web.setBackgroundColor(0xff141619);
    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
        Uri u = r.getUrl();
        if ("https".equals(u.getScheme()) && u.getHost() != null && u.getHost().endsWith(HOST)) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException e) { /* nenhum app abre esse link */ }
        return true;
      }
    });
    setContentView(web);
    if (b != null) web.restoreState(b);
    else web.loadUrl(Widget.SITE);
  }

  @Override protected void onSaveInstanceState(Bundle b) { super.onSaveInstanceState(b); web.saveState(b); }

  @Override public void onBackPressed() {
    if (web.canGoBack()) web.goBack();
    else super.onBackPressed();
  }
}
