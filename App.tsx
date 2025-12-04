import React, { useState, useEffect } from 'react';
import { Bot, BookOpen, Settings, LayoutGrid, Home, Signal, Wifi, Battery, Zap, Sparkles } from 'lucide-react';
import { I18N, PRESET_THEMES } from './constants';
import { AppConfig, AssistantConfig, World, Theme } from './types';
import AssistantApp from './apps/AssistantApp';
import SettingsApp from './apps/SettingsApp';
import WorldBookApp from './apps/WorldBookApp';

// Default Data
const DEFAULT_WORLD: World = {
  id: 'default_world', 
  metadata: {
    name: 'Default World',
    author: 'System',
    tags: ['Assistant', 'Basic'],
    description: 'Factory default settings providing basic assistant services.',
    version: '1.0'
  },
  character: {
    name: 'No NPC',
    avatar: '',
    personality: '',
    greeting: ''
  },
  player: {
    name: 'User',
    avatar: '',
    bio: 'User' 
  },
  world: {
    lore: 'This is a virtual data space.',
    entries: [] 
  }
};

const DEFAULT_ASSISTANT: AssistantConfig = {
    name: 'Omni',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Omni',
    greeting: 'OmniTerminal initiated. I am your assistant "Omni".\n\nI can **analyze world views**, **roleplay**, or **assist with settings**. How may I help you?',
    systemPrompt: 'Your name is "Omni", an AI assistant built into the OmniTerminal. Your duty is to guide the user, answer questions, and assist in managing their WorldBooks. You are independent of any specific "WorldBook" story unless instructed otherwise. Use Markdown for formatting.'
};

const StatusBar = ({ theme }: { theme: Theme }) => (
  <div className={`flex justify-between items-center px-6 py-2 text-xs font-bold select-none z-20 ${theme.statusBarText}`}>
    <div className="flex items-center gap-2">
      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="opacity-70">| {theme.deviceType}</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase opacity-70">{theme.labels.signal}</span>
        <Signal size={14} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase opacity-70">{theme.labels.wifi}</span>
        <Wifi size={14} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase opacity-70">{theme.labels.battery}</span>
        {theme.id === 'dao' ? <Sparkles size={14} /> : 
         theme.id === 'night' ? <Zap size={14} /> : 
         <Battery size={14} />}
        <span>98%</span>
      </div>
    </div>
  </div>
);

const AppIcon = ({ icon: Icon, label, onClick, color, theme }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group transition-transform hover:scale-105 active:scale-95"
  >
    <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-white shadow-lg ${theme.appIconShape} ${color}`}>
      <Icon size={28} className="md:w-8 md:h-8" />
    </div>
    <span className={`text-[10px] md:text-xs font-medium ${theme.id === 'night' ? 'text-cyan-400' : theme.id === 'dao' ? 'text-[#1b5e20] font-bold' : 'text-gray-700'}`}>
      {label}
    </span>
  </button>
);

export default function App() {
  const [activeApp, setActiveApp] = useState<string | null>(null); 
  const [uiThemes, setUiThemes] = useState(PRESET_THEMES);
  
  const [config, setConfig] = useState<AppConfig>({
    language: 'zh',
    theme: 'simple',
    provider: 'openai',
    apiKey: '',
    apiEndpoint: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    useGlobalProfile: true,
    userProfile: { name: 'Admin', avatar: '', gender: '', age: '', likes: '' }
  });

  const [savedWorlds, setSavedWorlds] = useState<World[]>([DEFAULT_WORLD]);
  const [currentWorld, setCurrentWorld] = useState<World>(DEFAULT_WORLD);
  const [assistant, setAssistant] = useState<AssistantConfig>(DEFAULT_ASSISTANT);

  useEffect(() => {
    const savedConf = localStorage.getItem('omni_conf_v1');
    const savedThemes = localStorage.getItem('omni_themes_v1');
    const savedWorldsData = localStorage.getItem('omni_worlds_v1');
    const savedAssist = localStorage.getItem('omni_assist_v1');
    
    if (savedConf) setConfig(JSON.parse(savedConf));
    if (savedThemes) setUiThemes(prev => ({...prev, ...JSON.parse(savedThemes)}));
    if (savedAssist) setAssistant(JSON.parse(savedAssist));
    
    if (savedWorldsData) {
        const worlds = JSON.parse(savedWorldsData);
        setSavedWorlds(worlds);
        const lastId = localStorage.getItem('omni_last_world_id');
        if (lastId) {
            const last = worlds.find((w: World) => w.id === lastId);
            if (last) setCurrentWorld(last);
        }
    }
  }, []);

  useEffect(() => { localStorage.setItem('omni_conf_v1', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('omni_themes_v1', JSON.stringify(uiThemes)); }, [uiThemes]);
  useEffect(() => { localStorage.setItem('omni_assist_v1', JSON.stringify(assistant)); }, [assistant]);
  useEffect(() => {
      setSavedWorlds(prev => prev.map(w => w.id === currentWorld.id ? currentWorld : w));
  }, [currentWorld]);
  useEffect(() => {
      localStorage.setItem('omni_worlds_v1', JSON.stringify(savedWorlds));
      localStorage.setItem('omni_last_world_id', currentWorld.id);
  }, [savedWorlds, currentWorld.id]);

  const currentTheme = uiThemes[config.theme] || PRESET_THEMES.simple;
  const langText = I18N[config.language] || I18N.zh;

  const renderApp = () => {
    switch(activeApp) {
        case 'chat': return <AssistantApp config={config} assistant={assistant} setAssistant={setAssistant} theme={currentTheme} currentWorld={currentWorld} langText={langText}/>;
        case 'settings': return <SettingsApp config={config} setConfig={setConfig} assistant={assistant} setAssistant={setAssistant} theme={currentTheme} uiThemes={uiThemes} setUiThemes={setUiThemes} langText={langText}/>;
        case 'worldbook': return <WorldBookApp currentWorld={currentWorld} setCurrentWorld={setCurrentWorld} savedWorlds={savedWorlds} setSavedWorlds={setSavedWorlds} theme={currentTheme} langText={langText} config={config} />;
        case 'store': return <div className={`h-full flex items-center justify-center opacity-50 font-bold ${currentTheme.statusBarText}`}>{langText.store_offline}</div>;
        default: return null;
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-neutral-900 p-4 md:p-8 font-sans select-none overflow-hidden">
      <div className={`relative transition-all duration-500 ease-in-out w-full max-w-[960px] aspect-[9/16] md:aspect-[16/10] ${currentTheme.deviceBorder} rounded-[32px] md:rounded-[48px] shadow-2xl flex flex-col overflow-hidden ring-4 ring-black/10 ${currentTheme.font}`}>
        
        <div className={`flex-1 relative overflow-hidden flex flex-col ${currentTheme.wallpaper} bg-cover bg-center transition-all duration-500`}>
          <StatusBar theme={currentTheme} />

          <div className="flex-1 relative p-6 overflow-hidden">
            <div className={`absolute inset-0 p-12 grid grid-cols-2 md:grid-cols-6 grid-rows-4 gap-8 content-start transition-all duration-500 ${activeApp ? 'scale-110 opacity-0 pointer-events-none filter blur-sm' : 'scale-100 opacity-100'}`}>
                <AppIcon icon={Bot} label={langText.app_assistant} theme={currentTheme} color="bg-indigo-600" onClick={() => setActiveApp('chat')} />
                <AppIcon icon={BookOpen} label={langText.app_worldbook} theme={currentTheme} color="bg-amber-600" onClick={() => setActiveApp('worldbook')} />
                <AppIcon icon={Settings} label={langText.app_settings} theme={currentTheme} color="bg-slate-600" onClick={() => setActiveApp('settings')} />
                <AppIcon icon={LayoutGrid} label={langText.app_store} theme={currentTheme} color="bg-blue-500" onClick={() => setActiveApp('store')} />
            </div>

            <div className={`absolute inset-0 md:inset-8 transition-all duration-300 transform ${activeApp ? 'translate-y-0 opacity-100' : 'translate-y-[100%] opacity-0 pointer-events-none'} ${currentTheme.windowBg} md:rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
                {activeApp && renderApp()}
            </div>
          </div>

          <div className="h-12 w-full flex items-center justify-center z-20 pb-2">
            <button onClick={() => setActiveApp(null)} className={`p-2 rounded-full transition-transform active:scale-90 hover:bg-black/5 ${currentTheme.id === 'night' ? 'text-cyan-500 hover:bg-cyan-900/20' : 'text-black/50'}`}>
                {currentTheme.id === 'simple' ? <div className="w-32 h-1.5 bg-black/20 rounded-full" /> : <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center opacity-70"><Home size={20} /></div>}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
    </div>
  );
}
