package es.regatas.cronometraje;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Los plugins propios se registran ANTES de super.onCreate
        registerPlugin(RegatasNativePlugin.class);
        super.onCreate(savedInstanceState);

        // Botón «atrás»: lo decide la web (cerrar análisis, doble pulsación en regata…)
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                final WebView webView = getBridge().getWebView();
                webView.evaluateJavascript(
                        "(window.__nativeBack ? window.__nativeBack() : 'exit')",
                        result -> {
                            if (result == null || result.contains("exit")) {
                                MainActivity.this.finish();
                            }
                        });
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        applySystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applySystemBars();
    }

    /** Oculta o muestra las barras del sistema según el estado pedido por la web. */
    void applySystemBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (RegatasNativePlugin.immersive) {
            c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            c.hide(WindowInsetsCompat.Type.systemBars());
        } else {
            c.show(WindowInsetsCompat.Type.systemBars());
        }
    }
}
