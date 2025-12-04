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
  avatar: string;
  gender: string;
  age: string;
  likes: string;
}

export interface AppConfig {
  language: 'zh' | 'en';
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
