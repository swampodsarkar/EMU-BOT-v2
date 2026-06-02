export interface Game {
  id: string;
  title: string;
  core: string; // e.g., 'nes', 'snes', 'psx', 'custom'
  price: number;
  coverImage: string;
  romUrl?: string; // Optional predefined ROM
}

export type AppId = 'library' | 'wallet' | 'ads' | 'store' | 'settings' | 'emulator' | 'leaderboard' | 'profile' | 'rewards';

export interface AppConfig {
  id: AppId;
  name: string;
  icon: string;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  props?: any;
}

export interface OSNotification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  timestamp: number;
}
