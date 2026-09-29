package com.signaction.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            String defaultUa = settings.getUserAgentString();
            if (defaultUa != null && !defaultUa.contains("SignActionAPK")) {
                settings.setUserAgentString(defaultUa + " SignActionAPK/1.0");
            }
        }
    }
}
