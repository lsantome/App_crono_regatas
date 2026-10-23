package es.regatas.cronometraje;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.WindowManager;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Funciones nativas que el WebView no ofrece por sí solo:
 *  - print:      abre el diálogo de impresión del sistema (permite «Guardar como PDF»).
 *  - keepAwake:  mantiene la pantalla encendida mientras la app está en primer plano.
 *  - immersive:  oculta/muestra las barras del sistema (pantalla completa).
 */
@CapacitorPlugin(name = "RegatasNative")
public class RegatasNativePlugin extends Plugin {

    /** Estado deseado de la pantalla completa; MainActivity lo reaplica al recuperar el foco. */
    static volatile boolean immersive = true;

    @PluginMethod
    public void print(final PluginCall call) {
        final String name = call.getString("name", "Regata");
        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
                PrintAttributes attrs = new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4.asLandscape())
                        .build();
                pm.print(name, adapter, attrs);
                call.resolve();
            } catch (Exception e) {
                call.reject("No se pudo abrir la impresión: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void keepAwake(final PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", true));
        getActivity().runOnUiThread(() -> {
            if (on) {
                getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } else {
                getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void immersive(final PluginCall call) {
        immersive = Boolean.TRUE.equals(call.getBoolean("on", true));
        getActivity().runOnUiThread(() -> {
            ((MainActivity) getActivity()).applySystemBars();
            call.resolve();
        });
    }
}
