import React, { useState, useRef } from 'react';
import { BookOpen, Globe, Upload, Download, Layers, Info, User, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { Theme, World, AppConfig } from '../types';

interface Props {
  currentWorld: World;
  setCurrentWorld: React.Dispatch<React.SetStateAction<World>>;
  savedWorlds: World[];
  setSavedWorlds: React.Dispatch<React.SetStateAction<World[]>>;
  theme: Theme;
  langText: Record<string, string>;
  config: AppConfig;
}

const WorldBookApp: React.FC<Props> = ({ currentWorld, setCurrentWorld, savedWorlds, setSavedWorlds, theme, langText, config }) => {
  const [view, setView] = useState('home'); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const inputClass = `w-full p-3 rounded-lg text-sm outline-none border ${theme.id === 'night' ? 'bg-gray-900 border-cyan-800 text-cyan-50 focus:border-cyan-500' : 'bg-transparent border-gray-300 focus:border-blue-500'}`;

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const Input = ({ label, val, k, section, isArea }: { label: string, val: any, k: string, section: keyof World, isArea?: boolean }) => (
    <div className="mb-4">
        <label className={`block text-xs font-bold mb-1 opacity-60 ${theme.statusBarText}`}>{label}</label>
        {isArea ? (
            <textarea value={val || ''} onChange={e => {
                    const newVal = e.target.value;
                    setCurrentWorld((prev: any) => ({ ...prev, [section]: { ...prev[section], [k]: newVal } }));
                }} rows={6} className={`resize-none ${inputClass}`} />
        ) : (
            <input value={val || ''} onChange={e => {
                    const newVal = e.target.value;
                    setCurrentWorld((prev: any) => ({ ...prev, [section]: { ...prev[section], [k]: newVal } }));
                }} className={inputClass} />
        )}
    </div>
  );

  const handleCreate = () => {
      const newWorld: World = {
          id: `world_${Date.now()}`,
          metadata: { name: 'New World', author: 'User', tags: [], description: 'A new adventure begins...', version: '1.0' },
          character: { name: 'NPC', avatar: '', personality: 'New NPC', greeting: 'Hello.' },
          player: { name: 'Player', avatar: '', bio: 'Adventurer' },
          world: { lore: 'New Lore', entries: [] }
      };
      setSavedWorlds(prev => [...prev, newWorld]);
      setCurrentWorld(newWorld);
      setView('home');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm(langText.wb_del_confirm)) {
          const filtered = savedWorlds.filter(w => w.id !== id);
          setSavedWorlds(filtered);
          if (currentWorld.id === id && filtered.length > 0) {
              setCurrentWorld(filtered[0]);
          } else if (filtered.length === 0) {
              handleCreate(); 
          }
      }
  };

  const handleImportWorld = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target?.result as string);
            if (data.metadata && data.character && data.world) {
                data.id = `world_import_${Date.now()}`;
                setSavedWorlds(prev => [...prev, data]);
                setCurrentWorld(data);
                alert(langText.import_success);
            } else { 
                alert(langText.import_error); 
            }
        } catch (err) { alert('JSON Error'); }
    };
    reader.readAsText(file);
  };

  const renderHome = () => (
    <div className="h-full flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4">
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.statusBarText}`}>
            <BookOpen size={22}/> {langText.app_worldbook}
        </h2>

        <div className={`flex-1 rounded-2xl p-6 mb-6 shadow-sm border overflow-hidden relative ${theme.id === 'night' ? 'bg-cyan-900/10 border-cyan-800 text-cyan-100' : 'bg-white/60 border-white text-gray-800'}`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10`}><Globe size={120} /></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex-1">
                    <div className="text-xs font-bold opacity-50 mb-1 uppercase tracking-wider">{langText.wb_home_desc}</div>
                    <h1 className="text-2xl font-bold mb-2">{currentWorld.metadata.name}</h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {currentWorld.metadata.tags.map((t,i) => (
                            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${theme.id==='night'?'border-cyan-700 bg-cyan-900/40':'border-gray-300 bg-white/50'}`}>{t}</span>
                        ))}
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed line-clamp-6">{currentWorld.metadata.description}</p>
                </div>
                <div className="self-end flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${theme.id==='night'?'border-cyan-600 text-cyan-400 hover:bg-cyan-900/50':'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                        <Upload size={14}/> {langText.wb_import_world}
                    </button>
                    <button onClick={() => downloadJson(currentWorld, `${currentWorld.metadata.name}_export.json`)} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${theme.id==='night'?'border-cyan-600 text-cyan-400 hover:bg-cyan-900/50':'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                        <Download size={14}/> {langText.wb_export_world}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImportWorld} accept=".json" className="hidden" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-4 gap-3 h-20">
            {[
                { id: 'switch', icon: Layers, label: langText.wb_btn_switch },
                { id: 'meta', icon: Info, label: langText.wb_btn_meta },
                { id: 'char', icon: User, label: langText.wb_btn_char },
                { id: 'world', icon: Globe, label: langText.wb_btn_world },
            ].map(btn => (
                <button key={btn.id} onClick={() => setView(btn.id)} className={`flex flex-col items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${theme.id==='night'?'bg-cyan-900/20 border-cyan-800 hover:bg-cyan-900/40 text-cyan-100':'bg-white/80 border-white hover:bg-white shadow-sm'}`}>
                    <btn.icon size={20} className="mb-1"/>
                    <span className="text-[10px] font-bold">{btn.label}</span>
                </button>
            ))}
        </div>
    </div>
  );

  if (view === 'switch') return (
    <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 border-current/10">
            <button onClick={() => setView('home')} className={`p-2 rounded-full hover:bg-black/5`}><ArrowLeft size={20} className={theme.statusBarText}/></button>
            <span className={`font-bold ${theme.statusBarText}`}>{langText.wb_switch_title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedWorlds.map(w => (
                <div key={w.id} onClick={() => { setCurrentWorld(w); setView('home'); }} className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${currentWorld.id === w.id ? (theme.id==='night'?'bg-cyan-900/30 border-cyan-500':'bg-blue-50 border-blue-400') : (theme.id==='night'?'border-cyan-900/50 hover:bg-cyan-900/10 text-cyan-100':'border-gray-200 hover:bg-white')}`}>
                    <div>
                        <div className={`font-bold text-sm ${theme.id==='night'?'text-cyan-50':''}`}>{w.metadata.name}</div>
                        <div className="text-[10px] opacity-50">{w.metadata.tags.slice(0,3).join(', ')}</div>
                    </div>
                    {savedWorlds.length > 1 && (
                        <button onClick={(e) => handleDelete(w.id, e)} className="p-2 opacity-50 hover:text-red-500 hover:opacity-100"><Trash2 size={16}/></button>
                    )}
                </div>
            ))}
            <button onClick={handleCreate} className={`w-full p-4 rounded-xl border-2 border-dashed flex justify-center items-center gap-2 opacity-60 hover:opacity-100 ${theme.id==='night'?'border-cyan-800 text-cyan-400':'border-gray-300 text-gray-500'}`}>
                <Plus size={18} /> {langText.wb_new_world}
            </button>
        </div>
    </div>
  );

  if (view !== 'home') return (
    <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 border-current/10">
            <button onClick={() => setView('home')} className={`p-2 rounded-full hover:bg-black/5`}><ArrowLeft size={20} className={theme.statusBarText}/></button>
            <span className={`font-bold ${theme.statusBarText}`}>{view === 'meta' ? langText.wb_btn_meta : view === 'char' ? langText.wb_btn_char : langText.wb_btn_world}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 animate-in slide-in-from-right-4">
            {view === 'meta' && (
                <>
                    <Input section="metadata" k="name" val={currentWorld.metadata.name} label={langText.wb_meta_name} />
                    <Input section="metadata" k="description" val={currentWorld.metadata.description} label={langText.wb_meta_desc} isArea />
                    <div className="mb-4">
                         <label className={`block text-xs font-bold mb-1 opacity-60 ${theme.statusBarText}`}>{langText.wb_meta_tags}</label>
                         <input value={currentWorld.metadata.tags.join(', ')} onChange={e => {
                                const arr = e.target.value.split(',').map(s=>s.trim());
                                setCurrentWorld((prev: any) => ({ ...prev, metadata: { ...prev.metadata, tags: arr } }));
                            }} className={inputClass} />
                    </div>
                </>
            )}
            {view === 'char' && (
                <>
                    <div className="p-3 mb-4 rounded bg-orange-50 border border-orange-100 text-xs text-orange-800 opacity-80">
                        *注意：此处设置的AI角色仅作为世界书的记录，当前【万象助手】主要由全局助手设定驱动。
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 opacity-50 ${theme.statusBarText}`}>{langText.wb_char_ai_title}</h3>
                    <div className="flex gap-4">
                        <div className="flex-1"><Input section="character" k="name" val={currentWorld.character.name} label={langText.ph_name} /></div>
                        <div className="w-1/3"><Input section="character" k="avatar" val={currentWorld.character.avatar} label="URL" /></div>
                    </div>
                    <Input section="character" k="personality" val={currentWorld.character.personality} label="System Prompt (Ref)" isArea />

                    <div className={`mt-8 pt-4 border-t ${theme.id==='night'?'border-cyan-900':'border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xs font-bold uppercase tracking-wider opacity-50 ${theme.statusBarText}`}>{langText.wb_char_pl_title}</h3>
                            <span className={`text-[10px] px-2 py-1 rounded border ${config.useGlobalProfile ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                {config.useGlobalProfile ? langText.wb_char_use_global : langText.wb_char_use_local}
                            </span>
                        </div>
                        {config.useGlobalProfile ? (
                            <div className="p-4 rounded-lg bg-gray-100/50 text-center text-xs opacity-50 italic">
                                {langText.wb_char_use_global}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1"><Input section="player" k="name" val={currentWorld.player?.name} label={langText.ph_name} /></div>
                                    <div className="w-1/3"><Input section="player" k="avatar" val={currentWorld.player?.avatar} label="URL" /></div>
                                </div>
                                <Input section="player" k="bio" val={currentWorld.player?.bio} label={langText.ph_bio} isArea />
                            </div>
                        )}
                    </div>
                </>
            )}
            {view === 'world' && (
                <>
                   <Input section="world" k="lore" val={currentWorld.world.lore} label="World Lore / Global Context" isArea />
                </>
            )}
        </div>
    </div>
  );

  return renderHome();
};

export default WorldBookApp;
