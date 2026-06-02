export interface Game {
  id: string;
  title: string;
  core: string;
  price: number;
  coverImage: string;
  romUrl?: string;
}

export type AppId = 'library' | 'wallet' | 'ads' | 'store' | 'settings' | 'emulator' | 'leaderboard' | 'profile' | 'rewards' | 'social' | 'voice' | 'premium';

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

export interface FriendProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  status: 'online' | 'offline' | 'in-game';
  currentGame?: string;
  lastSeen?: number;
  isPremium?: boolean;
}

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: number;
}

export interface VoiceRoomMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  micOn: boolean;
  isSpeaking: boolean;
  currentGame?: string;
}
