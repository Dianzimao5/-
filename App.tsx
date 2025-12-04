import React, { useState, useEffect, useRef } from 'react';
import { Bot, BookOpen, Settings, LayoutGrid, Home, Signal, Wifi, Battery, Zap, Sparkles, MessageSquare, Radio, Smartphone, RotateCcw, XCircle, Loader2, Plane, Bluetooth, Lock, Unlock, ChevronDown } from 'lucide-react';
import { I18N, PRESET_THEMES, DEFAULT_APP_CONFIG, DEFAULT_WORLD, DEFAULT_ASSISTANT } from './constants';
import { AppConfig, AssistantConfig, World, Theme } from './types';
import AssistantApp from './apps/AssistantApp';
import OmniChatApp from './apps/OmniChatApp';
import SettingsApp from './apps/SettingsApp';
import WorldBookApp from './apps/WorldBookApp';
import OmniLiveApp from './apps/OmniLiveApp';
import StoreApp from './apps/StoreApp';

const StatusBar = ({ theme, onOpenControlCenter }: { theme: Theme, onOpenControlCenter: () => void }) => (
  <div 
    className={`absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-4 md:px-6 py-1 text-[10px] md:text-xs font-bold select-none z-50 cursor-pointer transition-colors duration-300 ${theme.statusBarText}`}
    onClick={onOpenControlCenter}
  >
    <div className="flex items-center gap-2">
      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="opacity-70 hidden md:inline">| {theme.deviceType}</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <span className="hidden md:inline uppercase opacity-70">{theme.labels.signal}</span>
        <Signal size={12} className="md:w-3.5 md:h-3.5" />
      </div>
      <div className="flex items-center gap-1">
        <span className="hidden md:inline uppercase opacity-70">{theme.labels.wifi}</span>
        <Wifi size={12} className="md:w-3.5 md:h-3.5" />
      </div>
      <div className="flex items-center gap-1">
        <span className="hidden md:inline uppercase opacity-70">{theme.labels.battery}</span>
        {theme.id === 'dao' ? <Sparkles size={12} className="md:w-3.5 md:h-3.5" /> : 
         theme.id === 'night' ? <Zap size={12} className="md:w-3.5 md:h-3.5" /> : 
         <Battery size={12} className="md:w-3.5 md:h-3.5" />}
        <span>98%</span>
      </div>
    </div>
  </div>
);

const ControlCenter = ({ isOpen, onClose, theme, langText, isOffline, setIsOffline, isPortraitLocked, setIsPortraitLocked }: any) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in slide-in-from-top duration-300 flex justify-center items-start pt-4" onClick={onClose}>
            <div className={`w-[90%] md:w-[60%] p-6 rounded-3xl ${theme.windowBg} shadow-2xl`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg">{langText.cc_title}</h2>
                    <button onClick={onClose}><ChevronDown/></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setIsOffline(!isOffline)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${isOffline ? 'bg-orange-500 text-white' : 'bg-gray-200/50 text-gray-500'}`}>
                        <Plane size={28}/>
                        <span className="text-xs font-bold">{langText.cc_airplane}</span>
                    </button>
                    <button className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${!isOffline ? 'bg-blue-500 text-white' : 'bg-gray-200/50 text-gray-500'}`}>
                        <Wifi size={28}/>
                        <span className="text-xs font-bold">{langText.cc_wifi}</span>
                    </button>
                    <button className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${!isOffline ? 'bg-blue-500 text-white' : 'bg-gray-200/50 text-gray-500'}`}>
                        <Bluetooth size={28}/>
                        <span className="text-xs font-bold">{langText.cc_bluetooth}</span>
                    </button>
                    <button onClick={() => setIsPortraitLocked(!isPortraitLocked)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${isPortraitLocked ? 'bg-red-500 text-white' : 'bg-gray-200/50 text-gray-500'}`}>
                        {isPortraitLocked ? <Lock size={28}/> : <Unlock size={28}/>}
                        <span className="text-xs font-bold">{langText.cc_rotate_lock}</span>
                    </button>
                </div>
                
                <div className="mt-6 space-y-4">
                    <div className="h-12 bg-gray-200/50 rounded-2xl overflow-hidden relative border border-white/20">
                        <div className="absolute inset-y-0 left-0 w-3/4 bg-white/80"></div>
                        <Zap className="absolute left-4 top-3.5 text-black/50" size={20}/>
                    </div>
                    <div className="h-12 bg-gray-200/50 rounded-2xl overflow-hidden relative border border-white/20">
                        <div className="absolute inset-y-0 left-0 w-1/2 bg-white/80"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AppIcon = ({ icon: Icon, label, onClick, onLongPress, color, theme, size = 'md', isEditing, onDelete, isSystem, isSelected, isUninstalling, onDragStart, onDragOver, onDrop }: any) => {
  const timerRef = useRef<any>(null);

  const handleStart = () => {
    timerRef.current = setTimeout(() => {
      if (onLongPress) onLongPress();
    }, 800);
  };

  const handleEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  if (isUninstalling) {
      return (
          <div className="flex flex-col items-center justify-center opacity-50 scale-75 transition-all">
              <Loader2 className="animate-spin text-gray-500"/>
          </div>
      );
  }

  return (
    <div 
        className="relative group touch-none select-none"
        draggable={isEditing}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
    >
      <div 
        onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
        onTouchStart={handleStart} onTouchEnd={handleEnd}
        onClick={onClick}
        className={`flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer ${isEditing ? 'animate-shake' : 'hover:scale-105'} ${isSelected ? 'scale-110 opacity-80' : ''}`}
      >
        <div className={`relative ${size === 'lg' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-14 h-14 md:w-16 md:h-16'} flex items-center justify-center text-white shadow-lg ${theme.appIconShape} ${color} ${isSelected ? 'ring-4 ring-white/50' : ''}`}>
          <Icon size={size === 'lg' ? 36 : 28} className={size === 'lg' ? 'md:w-10 md:h-10' : 'md:w-8 md:h-8'} />
        </div>
        {size !== 'lg' && (
            <span className={`text-[10px] md:text-xs font-medium text-center leading-tight line-clamp-1 ${theme.id === 'night' ? 'text-cyan-400' : theme.id === 'dao' ? 'text-[#1b5e20] font-bold' : 'text-gray-800 drop-shadow-sm'}`}>
            {label}
            </span>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activeApp, setActiveApp] = useState<string | null>(null); 
  const [appParams, setAppParams] = useState<any>(null); // For passing params like 'share'
  const [uiThemes, setUiThemes] = useState(PRESET_THEMES);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isPortraitLocked, setIsPortraitLocked] = useState(false);
  
  const [config, setConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);

  const [savedWorlds, setSavedWorlds] = useState<World[]>([DEFAULT_WORLD]);
  const [currentWorld, setCurrentWorld] = useState<World>(DEFAULT_WORLD);
  const [assistant, setAssistant] = useState<AssistantConfig>(DEFAULT_ASSISTANT);

  // App Installation State
  const [installedApps, setInstalledApps] = useState<string[]>(['assistant', 'chat', 'worldbook', 'settings', 'store']);
  
  // App Swap Logic
  const [swapSource, setSwapSource] = useState<string | null>(null);
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);

  // Auto Orientation
  useEffect(() => {
      const checkOrientation = () => {
          if (!isPortraitLocked) {
              setIsLandscape(window.innerWidth > window.innerHeight);
          }
      };
      checkOrientation();
      window.addEventListener('resize', checkOrientation);
      return () => window.removeEventListener('resize', checkOrientation);
  }, [isPortraitLocked]);

  useEffect(() => {
    const savedConf = localStorage.getItem('omni_conf_v1');
    const savedThemes = localStorage.getItem('omni_themes_v1');
    const savedWorldsData = localStorage.getItem('omni_worlds_v1');
    const savedAssist = localStorage.getItem('omni_assist_v1');
    const savedApps = localStorage.getItem('omni_installed_apps');
    
    if (savedConf) setConfig(JSON.parse(savedConf));
    if (savedThemes) setUiThemes(prev => ({...prev, ...JSON.parse(savedThemes)}));
    if (savedAssist) setAssistant(JSON.parse(savedAssist));
    if (savedApps) setInstalledApps(JSON.parse(savedApps));
    
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
  useEffect(() => { localStorage.setItem('omni_installed_apps', JSON.stringify(installedApps)); }, [installedApps]);
  
  useEffect(() => {
      setSavedWorlds(prev => prev.map(w => w.id === currentWorld.id ? currentWorld : w));
  }, [currentWorld]);
  useEffect(() => {
      localStorage.setItem('omni_worlds_v1', JSON.stringify(savedWorlds));
      localStorage.setItem('omni_last_world_id', currentWorld.id);
  }, [savedWorlds, currentWorld.id]);

  const resetSystem = () => {
    // 1. Preserve API settings
    const currentConf = JSON.parse(localStorage.getItem('omni_conf_v1') || '{}');
    const apiSettings = {
        apiKey: currentConf.apiKey || '',
        apiEndpoint: currentConf.apiEndpoint || DEFAULT_APP_CONFIG.apiEndpoint,
        provider: currentConf.provider || DEFAULT_APP_CONFIG.provider,
        model: currentConf.model || DEFAULT_APP_CONFIG.model
    };

    // 2. Clear all data
    localStorage.clear();

    // 3. Restore API settings to default config
    const restoredConfig = {
        ...DEFAULT_APP_CONFIG,
        ...apiSettings
    };
    localStorage.setItem('omni_conf_v1', JSON.stringify(restoredConfig));

    // 4. Reload to apply cleanly
    window.location.reload();
  };

  const currentTheme = uiThemes[config.theme] || PRESET_THEMES.simple;
  const langText = I18N[config.language] || I18N.zh;

  // --- App Management ---

  const handleAppNavigation = (appId: string, params?: any) => {
      setActiveApp(appId);
      setAppParams(params);
  };

  const handleAppClick = (id: string) => {
    if (isEditMode) {
        // Swap logic for click-based interaction
        if (!swapSource) {
            setSwapSource(id); 
        } else {
            if (swapSource === id) {
                setSwapSource(null); 
                return;
            }
            const idx1 = installedApps.indexOf(swapSource);
            const idx2 = installedApps.indexOf(id);
            if (idx1 !== -1 && idx2 !== -1) {
                const newApps = [...installedApps];
                [newApps[idx1], newApps[idx2]] = [newApps[idx2], newApps[idx1]];
                setInstalledApps(newApps);
            }
            setSwapSource(null);
        }
    } else {
        handleAppNavigation(id);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
      if (!isEditMode) {
          e.preventDefault();
          return;
      }
      e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
      if (isEditMode) e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
      if (!isEditMode) return;
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain');
      if (sourceId && sourceId !== targetId) {
          const idx1 = installedApps.indexOf(sourceId);
          const idx2 = installedApps.indexOf(targetId);
          if (idx1 !== -1 && idx2 !== -1) {
              const newApps = [...installedApps];
              const [moved] = newApps.splice(idx1, 1);
              newApps.splice(idx2, 0, moved);
              setInstalledApps(newApps);
          }
      }
  };

  const handleUninstall = (id: string) => {
      setUninstallingId(id);
      setTimeout(() => {
          setInstalledApps(prev => prev.filter(app => app !== id));
          setUninstallingId(null);
      }, 1000);
  };

  // App Metadata Registry
  const APP_REGISTRY: Record<string, any> = {
      'assistant': { icon: Bot, label: langText.app_assistant, color: 'bg-indigo-600', isSystem: true },
      'chat': { icon: MessageSquare, label: langText.app_chat, color: 'bg-green-500', isSystem: true },
      'worldbook': { icon: BookOpen, label: langText.app_worldbook, color: 'bg-amber-600', isSystem: true },
      'settings': { icon: Settings, label: langText.app_settings, color: 'bg-slate-600', isSystem: true },
      'store': { icon: LayoutGrid, label: langText.app_store, color: 'bg-blue-500', isSystem: true },
      'live': { icon: Radio, label: langText.app_live, color: 'bg-pink-600', isSystem: false }
  };

  const renderApp = () => {
    const commonProps = { 
        config: isOffline ? {...config, apiKey: ''} : config, // Disconnect API if offline
        setConfig, 
        theme: currentTheme, 
        langText, 
        onNavigate: handleAppNavigation,
        launchParams: appParams 
    };

    switch(activeApp) {
        case 'chat': return <OmniChatApp {...commonProps} assistant={assistant} setAssistant={setAssistant} currentWorld={currentWorld} />;
        case 'assistant': return <AssistantApp {...commonProps} assistant={assistant} setAssistant={setAssistant} savedWorlds={savedWorlds} currentWorld={currentWorld} />;
        case 'settings': return <SettingsApp {...commonProps} assistant={assistant} setAssistant={setAssistant} uiThemes={uiThemes} setUiThemes={setUiThemes} onReset={resetSystem} installedApps={installedApps} onUninstallApp={handleUninstall} />;
        case 'worldbook': return <WorldBookApp {...commonProps} currentWorld={currentWorld} setCurrentWorld={setCurrentWorld} savedWorlds={savedWorlds} setSavedWorlds={setSavedWorlds} />;
        case 'live': return <OmniLiveApp {...commonProps} currentWorld={currentWorld} />;
        case 'store': return <StoreApp {...commonProps} installedApps={installedApps} setInstalledApps={setInstalledApps} onOpenApp={handleAppNavigation} onUninstallApp={handleUninstall} />;
        default: return null;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-neutral-900 p-4 md:p-8 font-sans select-none overflow-hidden relative">
      
      {/* Control Center */}
      <ControlCenter 
        isOpen={showControlCenter} 
        onClose={() => setShowControlCenter(false)} 
        theme={currentTheme} 
        langText={langText}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        isPortraitLocked={isPortraitLocked}
        setIsPortraitLocked={setIsPortraitLocked}
      />

      {/* Device Frame - Tablet Aspect Ratio 3:4 or 4:3 */}
      <div className={`relative transition-all duration-500 ease-in-out w-full max-w-[960px] ${isLandscape ? 'aspect-[4/3] max-h-[85vh]' : 'aspect-[3/4] max-h-[90vh] max-w-[600px]'} ${currentTheme.deviceBorder} rounded-[32px] md:rounded-[48px] shadow-2xl flex flex-col overflow-hidden ring-4 ring-black/10 ${currentTheme.font}`}>
        
        <div className={`flex-1 relative overflow-hidden flex flex-col ${currentTheme.wallpaper} bg-cover bg-center transition-all duration-500`}>
          <StatusBar theme={currentTheme} onOpenControlCenter={() => setShowControlCenter(true)} />

          {/* Main Workspace */}
          <div className="flex-1 relative pt-10 pb-6 px-6 overflow-hidden flex flex-col" onClick={() => isEditMode && setIsEditMode(false)}>
            
            {/* App Grid */}
            <div className={`flex-1 grid ${isLandscape ? 'grid-cols-6 grid-rows-4' : 'grid-cols-4 grid-rows-6'} gap-6 content-start transition-all duration-500 ${activeApp ? 'scale-110 opacity-0 pointer-events-none filter blur-sm' : 'scale-100 opacity-100'}`}>
                {installedApps.map(appId => {
                    const meta = APP_REGISTRY[appId] || { icon: Bot, label: 'Unknown', color: 'bg-gray-500' };
                    return (
                        <div key={appId}>
                            <AppIcon 
                                icon={meta.icon} 
                                label={meta.label} 
                                theme={currentTheme} 
                                color={meta.color} 
                                onClick={() => handleAppClick(appId)} 
                                onLongPress={() => setIsEditMode(true)}
                                isEditing={isEditMode}
                                onDelete={() => handleUninstall(appId)}
                                isSystem={meta.isSystem}
                                isSelected={swapSource === appId}
                                isUninstalling={uninstallingId === appId}
                                onDragStart={(e: any) => handleDragStart(e, appId)}
                                onDragOver={handleDragOver}
                                onDrop={(e: any) => handleDrop(e, appId)}
                            />
                        </div>
                    );
                })}
            </div>
            
            {isEditMode && <div className="absolute bottom-4 left-0 right-0 text-center text-xs font-bold opacity-70 animate-pulse pointer-events-none drop-shadow-md text-white mix-blend-difference">{langText.os_edit_mode_tip}</div>}

            {/* Active App View */}
            <div className={`absolute inset-0 md:inset-6 transition-all duration-300 transform ${activeApp ? 'translate-y-0 opacity-100' : 'translate-y-[100%] opacity-0 pointer-events-none'} ${currentTheme.windowBg} md:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-30`}>
                {activeApp && renderApp()}
            </div>

          </div>

          {/* Home Bar */}
          <div className="h-10 w-full flex items-center justify-center z-30 pb-2 cursor-pointer" onClick={() => { setActiveApp(null); setIsEditMode(false); }}>
            <div className={`p-2 rounded-full transition-transform active:scale-90 hover:bg-black/5 ${currentTheme.id === 'night' ? 'text-cyan-500 hover:bg-cyan-900/20' : 'text-black/50'}`}>
                {currentTheme.id === 'simple' ? <div className="w-32 h-1.5 bg-black/20 rounded-full" /> : <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center opacity-70"><Home size={20} /></div>}
            </div>
          </div>
        </div>
      </div>
      {/* Reflection */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
    </div>
  );
}