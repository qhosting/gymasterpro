import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aurumfit.app',
  appName: 'AurumFit',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
