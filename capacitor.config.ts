import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.projectrebirth.app',
  appName: 'PROJECT REBIRTH',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#09090B',
    allowMixedContent: false,
  },
};

export default config;
