import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gcss.inventory',
  appName: 'Inventory',
  webDir: 'dist',
  server: { androidScheme: 'https' }
};

export default config;
