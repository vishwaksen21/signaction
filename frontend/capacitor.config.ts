import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.signaction.app',
  appName: 'SignAction',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff',
    webContentsDebuggingEnabled: false,
  },
};

export default config;
