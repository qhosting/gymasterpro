import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymmaster.pro',
  appName: 'GymMaster Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
