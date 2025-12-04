import React, { useState } from 'react';
import { LayoutGrid, Download, Check, Radio, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { Theme } from '../types';

interface Props {
  theme: Theme;
  langText: Record<string, string>;
  installedApps: string[];
  setInstalledApps: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenApp: (appId: string) => void;
  onUninstallApp?: (appId: string) => void;
}

const StoreApp: React.FC<Props> = ({ theme, langText, installedApps, setInstalledApps, onOpenApp, onUninstallApp }) => {
  const [installing, setInstalling] = useState<string | null>(null);

  const AVAILABLE_APPS = [
    {
      id: 'live',
      name: langText.app_live,
      icon: Radio,
      desc: langText.store_desc_live,
      color: 'bg-pink-600'
    },
    {
      id: 'chat', // Core app, but listed to show installed state
      name: langText.app_chat,
      icon: MessageSquare,
      desc: langText.store_desc_chat,
      color: 'bg-green-500'
    }
  ];

  const handleInstall = (id: string) => {
    if (!installedApps.includes(id)) {
        setInstalling(id);
        setTimeout(() => {
            setInstalledApps(prev => [...prev, id]);
            setInstalling(null);
        }, 1500); // Fake install delay
    }
  };

  const handleUninstall = (id: string) => {
      if (confirm(langText.os_uninstall_confirm) && onUninstallApp) {
          onUninstallApp(id);
      }
  };

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in">
      <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.statusBarText}`}>
        <LayoutGrid size={22}/> {langText.store_title}
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {AVAILABLE_APPS.map(app => {
          const isInstalled = installedApps.includes(app.id);
          const isInstalling = installing === app.id;

          return (
            <div key={app.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${theme.id==='night'?'bg-cyan-900/10 border-cyan-800':'bg-white/60 border-white shadow-sm'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${app.color}`}>
                   <app.icon size={28}/>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold">{app.name}</h3>
                    <p className="text-xs opacity-60 line-clamp-2">{app.desc}</p>
                </div>
                <div>
                   {isInstalling ? (
                        <div className="px-4 py-2 text-xs font-bold opacity-50 flex items-center gap-1 bg-black/5 rounded-full">
                             <Loader2 size={14} className="animate-spin"/> {langText.store_installing}
                        </div>
                   ) : isInstalled ? (
                     <div className="flex gap-2">
                         <button onClick={() => onOpenApp(app.id)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${theme.id==='night'?'border-cyan-500 text-cyan-400 bg-cyan-900/20':'border-gray-300 bg-white hover:bg-gray-50'}`}>
                            {langText.store_open}
                         </button>
                         <button onClick={() => handleUninstall(app.id)} className={`p-2 rounded-full border transition-all ${theme.id==='night'?'border-red-500/50 text-red-400 hover:bg-red-900/20':'border-red-200 text-red-500 hover:bg-red-50'}`}>
                            <Trash2 size={14}/>
                         </button>
                     </div>
                   ) : (
                     <button onClick={() => handleInstall(app.id)} className={`px-4 py-2 rounded-full text-xs font-bold bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 flex items-center gap-1 transition-all`}>
                        <Download size={12}/> {langText.store_get}
                     </button>
                   )}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoreApp;