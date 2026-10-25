package com.signaction.app;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        applySystemBarAppearance();

        final WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setDomStorageEnabled(true);
            String defaultUa = settings.getUserAgentString();
            if (defaultUa != null && !defaultUa.contains("SignActionAPK")) {
                settings.setUserAgentString(defaultUa + " SignActionAPK/1.0");
            }

            // Apply safe-area & IME insets on Android 15/16+ (targetSdk 36 mandatory edge-to-edge)
            View targetView = webView.getParent() instanceof View ? (View) webView.getParent() : webView;
            ViewCompat.setOnApplyWindowInsetsListener(targetView, (v, windowInsets) -> {
                Insets insets = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars()
                        | WindowInsetsCompat.Type.displayCutout()
                        | WindowInsetsCompat.Type.ime()
                );
                v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
                return WindowInsetsCompat.CONSUMED;
            });
            ViewCompat.requestApplyInsets(targetView);
        }

        // Navigate WebView history on Android system back gesture/button before exiting Activity
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView currentWebView = getBridge() != null ? getBridge().getWebView() : null;
                if (currentWebView != null && currentWebView.canGoBack()) {
                    currentWebView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                    setEnabled(true);
                }
            }
        });
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applySystemBarAppearance();
    }

    private void applySystemBarAppearance() {
        boolean isNightMode =
            (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
        int bgColor = isNightMode ? Color.parseColor("#050B14") : Color.parseColor("#FAF9F6");
        getWindow().getDecorView().setBackgroundColor(bgColor);

        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(!isNightMode);
            controller.setAppearanceLightNavigationBars(!isNightMode);
        }
    }
}
