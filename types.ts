export interface Theme {
  id: string;
  name: string;
  deviceType: string;
  bg: string;
  deviceBorder: string;
  wallpaper: string;
  appIconShape: string;
  statusBarText: string;
  windowBg: string;
  inputBg: string;
  accentColor: string;
  font: string;
  codeBg: string;
  labels: {
    battery: string;
    signal: string;
    wifi: string;
  };
  type?: string;
}

export interface UserProfile {
  name: string;
  uid?: string; // Added UID
  avatar: string;
  gender: string;
  age: string;
  likes: string; // Bio/Signature
  level?: number;
  signature?: string;
  bgImage?: string;
}

export interface AppConfig {
  language: 'zh' | 'en' | 'ja'; // Added ja
  theme: string;
  provider: 'openai' | 'gemini';
  apiKey: string;
  apiEndpoint: string;
  model: string;
  useGlobalProfile: boolean;
  userProfile: UserProfile;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: number;
  image?: string | null;
  senderId?: string; // For group chats
  senderName?: string;
}

export interface Contact {
  id: string;
  uid?: string; // Added Display UID
  name: string;
  avatar: string;
  bio: string;
  personality: string;
  level: number;
  isPlayer?: boolean;
  bgImage?: string;
  tags?: string[];
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  notice: string;
  ownerId: string;
  members: string[]; // List of Contact IDs
}

export interface AssistantConfig {
  name: string;
  avatar: string;
  greeting: string;
  systemPrompt: string;
}

export interface WorldMetadata {
  name: string;
  author: string;
  tags: string[];
  description: string;
  version: string;
}

export interface WorldCharacter {
  name: string;
  avatar: string;
  personality: string;
  greeting: string;
}

export interface WorldPlayer {
  name: string;
  avatar: string;
  bio: string;
}

export interface WorldData {
  lore: string;
  entries: any[];
}

export interface World {
  id: string;
  metadata: WorldMetadata;
  character: WorldCharacter;
  player: WorldPlayer;
  world: WorldData;
}

export type LangDict = Record<string, string>;