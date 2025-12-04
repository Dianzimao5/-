import React, { useState, useRef } from 'react';
import { Settings, ArrowLeft, Link, Palette, User, Info, Globe, Upload, Download, ToggleLeft, ToggleRight, Zap, Database, Trash2, AlertTriangle, RefreshCcw, Package } from 'lucide-react';
import { Theme, AppConfig, AssistantConfig } from '../types';
import { PRESET_THEMES, DEFAULT_APP_CONFIG } from '../constants';

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  assistant: AssistantConfig;
  setAssistant: React.Dispatch<React.SetStateAction<AssistantConfig>>;
  theme: Theme;
  uiThemes: Record<string, Theme>;
  setUiThemes: React.Dispatch<React.SetStateAction<Record<string, Theme>>>;
  langText: Record<string, string>;
  onReset?: () => void;
  installedApps?: string[];
  onUninstallApp?: (id: string) => void;
}

const SettingsApp: React.FC<Props> = ({ config, setConfig, theme, uiThemes, setUiThemes, langText, onReset, installedApps = [], onUninstallApp }) => {
  const [subView, setSubView] = useState('main'); 
  const themeInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const cardClass = `p-4 rounded-xl border ${theme.id === 'night' ? 'border-cyan-900 bg-cyan-950/30 text-cyan-50' : 'border-gray-200 bg-white/60 text-gray-700'} h-full overflow-y-auto`;
  const inputClass = `w-full p-2 rounded border text-sm outline-none ${theme.id === 'night' ? 'bg-gray-900 border-cyan-800 text-cyan-50 placeholder-cyan-800' : 'bg-transparent border-gray-300'}`;
  const btnClass = `flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all hover:scale-[1.05] active:scale-95 text-center aspect-square ${theme.id === 'night' ? 'border-cyan-800 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-100' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`;
  const actionBtnClass = `p-2 rounded border text-xs font-bold flex items-center justify-center gap-1 transition-all ${theme.id === 'night' ? 'border-cyan-700 hover:bg-cyan-900/50 text-cyan-300 opacity-90 hover:opacity-100 bg-cyan-950/30' : 'border-gray-300 hover:bg-gray-50 text-gray-700 opacity-70 hover:opacity-100 bg-white'}`;

  const handleConfig = (k: keyof AppConfig, v: any) => setConfig(prev => ({ ...prev, [k]: v }));
  const handleProfile = (k: string, v: string) => setConfig(prev => ({ ...prev, userProfile: { ...prev.userProfile, [k]: v } }));
  const toggleGlobalProfile = () => setConfig(prev => ({ ...prev, useGlobalProfile: !prev.useGlobalProfile }));
  
  const handleProviderChange = (provider: 'openai' | 'gemini') => {
    setConfig(prev => ({
        ...prev,
        provider: provider,
        apiEndpoint: provider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta/models' : 'https://api.openai.com/v1',
        model: provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-3.5-turbo'
    }));
  };

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleThemeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target?.result as string);
            if (data.type?.includes('smallpad_theme') || data.id) {
                setUiThemes(prev => ({ ...prev, [data.id]: data }));
                handleConfig('theme', data.id);
                alert(langText.import_success);
            } else { alert(langText.import_error); }
        } catch (err) { alert('JSON Error'); }
    };
    reader.readAsText(file);
  };

  // --- System Management ---

  const handleExportAll = () => {
    const keys = ['omni_conf_v1', 'omni_themes_v1', 'omni_worlds_v1', 'omni_assist_v1', 'omni_contacts', 'omni_groups', 'omni_chats', 'omni_msgs_system', 'omni_installed_apps'];
    const payload: Record<string, any> = {};
    keys.forEach(k => {
        const v = localStorage.getItem(k);
        if (v) payload[k] = JSON.parse(v);
    });
    
    // Wrapped standard format
    const backup = {
        type: 'omni_backup_v1',
        timestamp: new Date().toISOString(),
        version: '0.5.0',
        payload: payload
    };

    downloadJson(backup, `OmniTerminal_Backup_${new Date().toISOString().slice(0,10)}.omni`);
  };

  const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const fileContent = JSON.parse(ev.target?.result as string);
            
            // Handle new standard .omni backup
            if (fileContent.type === 'omni_backup_v1' && fileContent.payload) {
                const data = fileContent.payload;
                Object.keys(data).forEach(k => {
                   localStorage.setItem(k, JSON.stringify(data[k]));
                });
            } 
            // Handle legacy/raw format
            else if (fileContent['omni_conf_v1']) {
                 Object.keys(fileContent).forEach(k => {
                    if (k !== 'timestamp' && k !== 'type') localStorage.setItem(k, JSON.stringify(fileContent[k]));
                });
            } else {
                throw new Error("Invalid Format");
            }
            
            window.location.reload();
        } catch (err) { alert('Backup Error or Invalid .omni file'); }
    };
    reader.readAsText(file);
  };

  const handleResetSettings = () => {
      if (resetConfirm) {
        // Trigger full reset via parent prop
        if (onReset) onReset();
      } else {
        setResetConfirm(true);
        setTimeout(() => setResetConfirm(false), 3000);
      }
  };

  // --- Render Sections ---

  const renderConn = () => (
    <div className={cardClass}>
        <h3 className="font-bold mb-4 opacity-70 flex items-center gap-2"><Link size={18}/> {langText.conn_title}</h3>
        <div className="space-y-5">
            <div className={`p-3 rounded-lg border ${theme.id==='night'?'bg-black/40 border-cyan-800':'bg-white/50 border-gray-200'}`}>
                <label className="text-xs font-bold opacity-50 block mb-3">{langText.conn_provider}</label>
                <div className="flex gap-2">
                    <button onClick={() => handleProviderChange('openai')} className={`flex-1 p-2 rounded text-xs font-bold border transition-colors ${config.provider !== 'gemini' ? 'bg-green-600 text-white border-green-600' : 'opacity-50 border-gray-500'}`}>OpenAI / Custom</button>
                    <button onClick={() => handleProviderChange('gemini')} className={`flex-1 p-2 rounded text-xs font-bold border transition-colors ${config.provider === 'gemini' ? 'bg-blue-600 text-white border-blue-600' : 'opacity-50 border-gray-500'}`}>Gemini ✨</button>
                </div>
                {config.provider !== 'gemini' && <div className="text-[10px] opacity-50 mt-2 text-center">{langText.conn_openai_desc}</div>}
            </div>
            <div><label className="text-xs font-bold opacity-50 block mb-1">{langText.conn_endpoint}</label><input value={config.apiEndpoint} onChange={e => handleConfig('apiEndpoint', e.target.value)} className={inputClass}/></div>
            <div><label className="text-xs font-bold opacity-50 block mb-1">{langText.conn_key}</label><input type="password" value={config.apiKey} onChange={e => handleConfig('apiKey', e.target.value)} className={inputClass}/></div>
            <div><label className="text-xs font-bold opacity-50 block mb-1">{langText.conn_model}</label><input value={config.model} onChange={e => handleConfig('model', e.target.value)} className={inputClass}/>
            {config.provider === 'gemini' && <div className="text-[10px] opacity-50 mt-1">{langText.conn_gemini_rec}</div>}</div>
        </div>
    </div>
  );

  const renderTheme = () => (
    <div className={cardClass}>
        <h3 className="font-bold mb-4 opacity-70 flex items-center gap-2"><Palette size={18}/> {langText.set_theme}</h3>
        <div className="mb-6 p-3 rounded-lg border bg-black/5 border-transparent flex items-center justify-between">
            <span className="text-xs font-bold opacity-70">{langText.theme_lang_switch}</span>
            <select 
                value={config.language} 
                onChange={(e) => handleConfig('language', e.target.value)}
                className={`p-1 rounded text-xs font-bold border outline-none ${theme.id==='night'?'bg-gray-800 border-cyan-800 text-cyan-100':'bg-white border-gray-300 text-black'}`}
            >
                <option value="zh">中文 (简体)</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
            </select>
        </div>
        <label className="text-xs font-bold opacity-50 block mb-2">{langText.theme_installed}</label>
        <div className="grid grid-cols-3 gap-2 mb-6">
            {Object.values(uiThemes).map((t: Theme) => (
                <button key={t.id} onClick={() => handleConfig('theme', t.id)} className={`p-2 rounded border-2 text-xs font-bold truncate ${config.theme === t.id ? 'border-current opacity-100 ring-1' : 'border-transparent opacity-60'} ${t.bg} ${t.statusBarText}`}>
                    {t.name}
                </button>
            ))}
        </div>
        <div className="grid grid-cols-2 gap-3 border-t pt-4 border-current/10">
             <button onClick={() => themeInputRef.current?.click()} className={actionBtnClass}><Upload size={14}/> {langText.theme_import}</button>
             <button onClick={() => downloadJson(PRESET_THEMES.simple, 'theme_template.omni')} className={actionBtnClass}><Download size={14}/> {langText.theme_tpl}</button>
        </div>
        <input type="file" ref={themeInputRef} onChange={handleThemeImport} accept=".omni" className="hidden" />
    </div>
  );

  const renderProfile = () => (
    <div className={cardClass}>
        <h3 className="font-bold mb-4 opacity-70">{langText.set_profile}</h3>
        <div className={`mb-6 p-3 rounded-lg border ${config.useGlobalProfile ? (theme.id === 'night' ? 'bg-cyan-900/40 border-cyan-500' : 'bg-blue-50 border-blue-200') : 'bg-transparent border-gray-300 opacity-70'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold flex items-center gap-2"><User size={16}/> {langText.profile_lock_title}</span>
                <button onClick={toggleGlobalProfile}>
                    {config.useGlobalProfile ? <ToggleRight size={28} className={theme.id==='night'?'text-cyan-400':'text-blue-600'}/> : <ToggleLeft size={28} className="opacity-50"/>}
                </button>
            </div>
            <p className="text-[10px] opacity-70 leading-relaxed">{langText.profile_lock_desc}</p>
        </div>
        <div className={`space-y-3 transition-opacity ${config.useGlobalProfile ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <input value={config.userProfile.name} onChange={e=>handleProfile('name',e.target.value)} placeholder={langText.ph_name} className={inputClass}/>
            <div className="flex gap-2">
                 <input value={config.userProfile.uid || ''} onChange={e=>handleProfile('uid',e.target.value)} placeholder={langText.ph_uid} className={inputClass}/>
                 <input value={config.userProfile.avatar} onChange={e=>handleProfile('avatar',e.target.value)} placeholder={langText.ph_avatar} className={inputClass}/>
            </div>
            <div className="flex gap-2">
                <input value={config.userProfile.gender} onChange={e=>handleProfile('gender',e.target.value)} placeholder={langText.ph_gender} className={inputClass}/>
                <input value={config.userProfile.age} onChange={e=>handleProfile('age',e.target.value)} placeholder={langText.ph_age} className={inputClass}/>
            </div>
            <textarea value={config.userProfile.likes} onChange={e=>handleProfile('likes',e.target.value)} placeholder={langText.ph_bio} rows={3} className={`resize-none ${inputClass}`}/>
        </div>
    </div>
  );

  const renderSystem = () => (
      <div className={cardClass}>
           <h3 className="font-bold mb-4 opacity-70 flex items-center gap-2"><Database size={18}/> {langText.sys_manage}</h3>
           
           <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex flex-col gap-2 ${theme.id==='night'?'border-cyan-800 bg-cyan-900/10':'border-gray-200 bg-white'}`}>
                    <h4 className="font-bold text-sm">{langText.sys_export_all}</h4>
                    <button onClick={handleExportAll} className={actionBtnClass}><Download size={14}/> {langText.export}</button>
                </div>

                <div className={`p-4 rounded-xl border flex flex-col gap-2 ${theme.id==='night'?'border-cyan-800 bg-cyan-900/10':'border-gray-200 bg-white'}`}>
                    <h4 className="font-bold text-sm">{langText.sys_import_all}</h4>
                    <button onClick={() => backupInputRef.current?.click()} className={actionBtnClass}><Upload size={14}/> {langText.import}</button>
                    <input type="file" ref={backupInputRef} onChange={handleImportAll} accept=".omni" className="hidden" />
                </div>

                {/* App Management Section */}
                <div className={`p-4 rounded-xl border flex flex-col gap-2 ${theme.id==='night'?'border-cyan-800 bg-cyan-900/10':'border-gray-200 bg-white'}`}>
                    <h4 className="font-bold text-sm">{langText.sys_app_manage}</h4>
                    {installedApps.filter(app => !['assistant', 'settings', 'store'].includes(app)).map(app => (
                        <div key={app} className="flex justify-between items-center text-xs font-bold p-2 bg-black/5 rounded">
                            <span className="capitalize">{app}</span>
                            <button 
                                onClick={() => onUninstallApp && onUninstallApp(app)} 
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    ))}
                    {installedApps.filter(app => !['assistant', 'settings', 'store'].includes(app)).length === 0 && (
                        <div className="text-[10px] opacity-50 italic text-center">No removable apps installed</div>
                    )}
                </div>

                <div className="pt-6 border-t border-red-500/10 space-y-3">
                     {/* Unified Reset */}
                     <div>
                        <button onClick={handleResetSettings} className={`w-full p-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-xs transition-all duration-200 ${resetConfirm ? 'bg-red-600 text-white border-red-600' : 'text-red-500 hover:bg-red-500/10 border-red-500/50'}`}>
                            {resetConfirm ? <AlertTriangle size={16} className="animate-pulse"/> : <RefreshCcw size={16}/>}
                            {resetConfirm ? langText.sys_reset_confirm : langText.sys_reset}
                        </button>
                        <p className="text-[10px] opacity-50 text-center mt-1 text-red-500/70">{langText.sys_reset_desc}</p>
                     </div>
                </div>
           </div>
      </div>
  );

  if (subView === 'main') {
    return (
        <div className="h-full p-6 overflow-y-auto">
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.statusBarText}`}>
                <Settings size={22}/> {langText.app_settings}
            </h2>
            <div className="grid grid-cols-4 gap-3">
                <button onClick={() => setSubView('conn')} className={btnClass}><Globe size={20} className="opacity-70"/><span className="text-[10px] font-bold">{langText.set_conn}</span></button>
                <button onClick={() => setSubView('theme')} className={btnClass}><Palette size={20} className="opacity-70"/><span className="text-[10px] font-bold">{langText.set_theme}</span></button>
                <button onClick={() => setSubView('profile')} className={btnClass}><User size={20} className="opacity-70"/><span className="text-[10px] font-bold">{langText.set_profile}</span></button>
                <button onClick={() => setSubView('system')} className={btnClass}><Database size={20} className="opacity-70"/><span className="text-[10px] font-bold">{langText.set_system}</span></button>
                <button onClick={() => setSubView('about')} className={btnClass}><Info size={20} className="opacity-70"/><span className="text-[10px] font-bold">{langText.set_about}</span></button>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 border-current/10">
            <button onClick={() => setSubView('main')} className={`p-2 rounded-full hover:bg-black/5`}>
                <ArrowLeft size={20} className={theme.statusBarText}/>
            </button>
            <span className={`font-bold ${theme.statusBarText}`}>{langText.app_settings} / {subView.toUpperCase()}</span>
        </div>
        <div className="flex-1 overflow-hidden p-4">
            {subView === 'conn' && renderConn()}
            {subView === 'theme' && renderTheme()}
            {subView === 'profile' && renderProfile()}
            {subView === 'system' && renderSystem()}
            {subView === 'about' && (
                <div className={`p-8 text-center flex flex-col items-center justify-center h-full opacity-60 ${theme.statusBarText}`}>
                    <Zap size={48} className="mb-4"/>
                    <h1 className="text-xl font-bold">{langText.about_title}</h1>
                    <p className="text-sm font-mono mt-1">{langText.about_ver}</p>
                    <p className="text-xs mt-4 opacity-50">{langText.about_date}</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default SettingsApp;