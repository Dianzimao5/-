import React, { useState, useEffect, useRef } from 'react';
import { Settings, Trash2, ArrowLeft, RefreshCw, Plus, Image as ImageIcon, XCircle, Scroll, MessageCircle, MoreHorizontal, Send, Users, User, Hash, Edit3, LogOut, Shield, UserPlus, Languages, Share2, Upload, Download } from 'lucide-react';
import { Theme, AppConfig, AssistantConfig, World, Message, Contact, Group } from '../types';
import SimpleMarkdown from '../components/SimpleMarkdown';

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  assistant: AssistantConfig;
  setAssistant: React.Dispatch<React.SetStateAction<AssistantConfig>>;
  theme: Theme;
  currentWorld: World;
  langText: Record<string, string>;
  onNavigate: (app: string, params?: any) => void;
  launchParams?: any;
}

// Sub-components
const EditContact = ({ theme, langText, popRoute, params, contacts, setContacts, config, setConfig, handleCreateContact, handleDeleteContact }: any) => {
    // ... same content as previous ...
    const isMe = params.isMe;
    const isNew = params.isNew;
    const exist = isMe ? null : contacts.find((c: any) => c.id === params.id);
    const [form, setForm] = useState(exist || (isMe ? { ...config.userProfile, bio: config.userProfile.likes } : { language: 'auto' }) as any);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const save = () => {
          if (isMe) {
              setConfig((prev: AppConfig) => ({
                  ...prev,
                  userProfile: {
                      ...prev.userProfile,
                      name: form.name,
                      avatar: form.avatar,
                      uid: form.uid,
                      bgImage: form.bgImage,
                      likes: form.bio 
                  }
              }));
              popRoute();
          } else if (isNew) {
              handleCreateContact(form);
          } else {
              setContacts((prev: Contact[]) => prev.map(c => c.id === form.id ? {...c, ...form} : c));
              popRoute();
          }
    };

    const handleExportNpc = () => {
        const data = {
            type: 'omni_npc_v1',
            ...form
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(form.name || 'npc').replace(/\s+/g, '_')}.omni`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportNpc = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                if (data.name) {
                     const { type, id, ...cleanData } = data;
                     setForm((prev: any) => ({ ...prev, ...cleanData }));
                     alert(langText.import_success);
                } else {
                     alert(langText.import_error);
                }
            } catch (err) {
                alert('Format Error');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <button onClick={popRoute}><ArrowLeft size={20}/></button>
                <span className="font-bold">{isNew ? langText.oc_add_friend : langText.oc_btn_edit}</span>
                <button onClick={save} className="text-xs font-bold bg-green-600 text-white px-3 py-1 rounded">{langText.save}</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div className="flex justify-center mb-4">
                    <img src={form.avatar} className="w-24 h-24 rounded-full bg-gray-500 object-cover shrink-0" />
                </div>
                
                <div className={`flex justify-center gap-6 mb-6 pb-4 border-b border-dashed ${theme.id==='night'?'border-cyan-900/50':'border-gray-300'}`}>
                    <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 ${theme.id==='night'?'text-cyan-400':'text-blue-600'}`}>
                        <Upload size={14}/> {langText.import}
                    </button>
                    <button onClick={handleExportNpc} className={`flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 ${theme.id==='night'?'text-cyan-400':'text-blue-600'}`}>
                        <Download size={14}/> {langText.export}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImportNpc} accept=".omni" className="hidden" />
                </div>

                <div className="space-y-1">
                    <label className="text-xs opacity-50 font-bold">{langText.ph_name}</label>
                    <input value={form.name||''} onChange={e=>setForm({...form, name:e.target.value})} className={`w-full p-3 rounded-lg border bg-transparent ${theme.id==='night'?'border-cyan-900':'border-gray-300'}`}/>
                </div>
                {!isMe && (
                    <div className="space-y-1">
                        <label className="text-xs opacity-50 font-bold flex items-center gap-1"><Languages size={12}/> AI Output Language (Override)</label>
                        <select 
                            value={form.language || 'auto'} 
                            onChange={e=>setForm({...form, language:e.target.value})} 
                            className={`w-full p-3 rounded-lg border outline-none ${theme.id==='night'?'bg-gray-900 border-cyan-900 text-cyan-50':'bg-white border-gray-300'}`}
                        >
                            <option value="auto">System Default (Follow System)</option>
                            <option value="zh">Chinese (简体中文)</option>
                            <option value="en">English</option>
                            <option value="ja">Japanese (日本語)</option>
                        </select>
                    </div>
                )}
                <div className="space-y-1">
                    <label className="text-xs opacity-50 font-bold">{langText.ph_avatar}</label>
                    <input value={form.avatar||''} onChange={e=>setForm({...form, avatar:e.target.value})} className={`w-full p-3 rounded-lg border bg-transparent ${theme.id==='night'?'border-cyan-900':'border-gray-300'}`}/>
                </div>
                <div className="space-y-1">
                    <label className="text-xs opacity-50 font-bold">{langText.ph_bio}</label>
                    <textarea value={form.bio||''} onChange={e=>setForm({...form, bio:e.target.value})} rows={3} className={`w-full p-3 rounded-lg border bg-transparent resize-none ${theme.id==='night'?'border-cyan-900':'border-gray-300'}`}/>
                </div>
                {!isMe && (
                    <>
                    <div className="space-y-1">
                        <label className="text-xs opacity-50 font-bold">Personality / Prompt</label>
                        <textarea value={form.personality||''} onChange={e=>setForm({...form, personality:e.target.value})} rows={5} className={`w-full p-3 rounded-lg border bg-transparent resize-none ${theme.id==='night'?'border-cyan-900':'border-gray-300'}`}/>
                    </div>
                    {!isNew && <button onClick={()=>handleDeleteContact(form.id)} className="w-full py-3 mt-4 text-red-500 border border-red-500 rounded-lg opacity-60 hover:opacity-100 font-bold text-xs">{langText.oc_delete_contact}</button>}
                    </>
                )}
            </div>
        </div>
    );
};

// ... other components (CreateGroup, GroupInvite, GroupInfo, ProfileView) remain same ...

// --- Extracted ChatRoom Component ---
const ChatRoom = ({ theme, langText, popRoute, params, groups, contacts, chats, setChats, pushRoute, config, getContact, getGroup, getTargetAvatar }: any) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [streamingContent, setStreamingContent] = useState(''); 
    const [fullResponse, setFullResponse] = useState(''); 
    const [imageAttachment, setImageAttachment] = useState<string | null>(null); 
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const targetId = params.id;
    const isGroup = params.isGroup;
    const target = isGroup ? getGroup(targetId) : getContact(targetId);
    const msgs = chats[targetId] || [];

    useEffect(() => {
        if (!isTyping) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, isTyping]);

    const handleSendMessage = async () => {
        if ((!input.trim() && !imageAttachment) || isLoading || isTyping) return;
        
        const textToSend = input;
        
        if (!config.apiKey) {
             const userMsg: Message = { role: 'user', content: textToSend, image: imageAttachment, id: Date.now(), senderId: 'player' };
             setChats((prev: any) => ({...prev, [targetId]: [...(prev[targetId]||[]), userMsg]}));
             setInput('');
             setTimeout(() => {
                 setChats((prev: any) => ({...prev, [targetId]: [...(prev[targetId]||[]), {role: 'assistant', content: langText.sys_tip_key, id: Date.now()}]}));
             }, 500);
             return;
        }
    
        const userMsg: Message = { role: 'user', content: textToSend, image: imageAttachment, id: Date.now(), senderId: 'player' };
        setChats((prev: any) => ({...prev, [targetId]: [...(prev[targetId]||[]), userMsg]}));
    
        setInput('');
        setImageAttachment(null);
        setIsLoading(true);
    
        try {
            // --- Prompt & Language Logic ---
            let systemPrompt = "";
            let contextMsgs = (chats[targetId] || []).slice(-10);
            
            // Determine Target Language
            let targetLangCode = config.language;
            if (!isGroup) {
                 const c = getContact(targetId);
                 if (c && c.language && c.language !== 'auto') {
                     targetLangCode = c.language;
                 }
            }
            const langName = targetLangCode === 'zh' ? 'Simplified Chinese (简体中文)' : targetLangCode === 'ja' ? 'Japanese (日本語)' : 'English';
            const langInstruction = `\n[PROTOCOL] Output Language: ${langName}. You MUST reply in ${langName}.`;
    
            if (isGroup) {
                const group = getGroup(targetId);
                const memberNames = group?.members.map((mid: string) => getContact(mid)?.name).join(', ');
                systemPrompt = `You are playing roles of group members in "${group?.name}". 
                Members: ${memberNames}. Notice: ${group?.notice}.
                Rule: When user speaks, ONE appropriate member replies.
                Style: Casual group chat. Short messages.
                ${langInstruction}`;
            } else {
                const contact = getContact(targetId);
                systemPrompt = `Roleplay as ${contact?.name}. 
                Description: ${contact?.bio}.
                Personality: ${contact?.personality}.
                Level: ${contact?.level}.
                
                Instructions:
                1. Stay in character at all times.
                2. Keep responses concise and engaging.
                3. Do not output internal monologue unless asked.
                ${langInstruction}`;
            }
    
            const apiMessages = [
                { role: "system", content: systemPrompt },
                ...contextMsgs.map((m: Message) => ({ role: m.role, content: m.content }))
            ];
            apiMessages.push({ role: 'user', content: textToSend });
    
            let aiText = "";
            const cleanEndpoint = config.apiEndpoint.replace(/\/$/, '');
            
            if (config.provider === 'gemini') {
                 const url = `${cleanEndpoint}/${config.model}:generateContent?key=${config.apiKey}`;
                 const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        contents: apiMessages.filter((m: any)=>m.role!=='system').map((m: any) => ({ role: m.role==='user'?'user':'model', parts: [{ text: m.content || ' ' }] }))
                    })
                 });
                 const text = await res.text();
                 if (text.startsWith('<')) throw new Error("Endpoint returned HTML. Check URL.");
                 
                 let data;
                 try { data = JSON.parse(text); } catch(e) { throw new Error(`Invalid JSON: ${text.substring(0,50)}`); }
                 if (!res.ok) throw new Error(data.error?.message || `Gemini Error ${res.status}`);
                 
                 aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '...';
            } else {
                 const res = await fetch(`${cleanEndpoint}/chat/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                    body: JSON.stringify({ model: config.model, messages: apiMessages })
                 });
                 
                 const text = await res.text();
                 if (text.trim().startsWith('<')) throw new Error("Endpoint returned HTML. Check URL.");
                 
                 let data;
                 try { data = JSON.parse(text); } catch(e) { throw new Error(`Invalid Response: ${text.substring(0,50)}`); }
                 if (!res.ok) throw new Error(data.error?.message || `API Error ${res.status}`);
                 
                 aiText = data.choices?.[0]?.message?.content || '...';
            }
    
            setFullResponse(aiText);
            setIsLoading(false);
            setIsTyping(true);
            setStreamingContent(aiText.charAt(0));
    
        } catch (err: any) {
            setIsLoading(false);
            const errorMsg: Message = { 
                role: 'assistant', 
                content: `Error: ${err.message || 'Connection failed'}`, 
                id: Date.now(),
                senderId: 'system',
                senderName: 'System'
            };
            setChats((prev: any) => ({...prev, [targetId]: [...(prev[targetId]||[]), errorMsg]}));
        }
    };

    // ... useEffects and Render ...
    
    useEffect(() => {
        if (isTyping && streamingContent.length < fullResponse.length) {
          const timeout = setTimeout(() => {
            setStreamingContent(fullResponse.slice(0, streamingContent.length + 1));
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 15);
          return () => clearTimeout(timeout);
        } else if (isTyping && streamingContent.length === fullResponse.length) {
          setIsTyping(false);
          const sender = isGroup ? getContact(groups.find((g: Group)=>g.id===targetId)?.members[0] || '') : getContact(targetId);
          const newMsg: Message = { 
              role: 'assistant', 
              content: fullResponse, 
              id: Date.now(),
              senderId: sender?.id,
              senderName: sender?.name
          };
          setChats((prev: any) => ({...prev, [targetId]: [...(prev[targetId]||[]), newMsg]}));
          setStreamingContent('');
        }
    }, [isTyping, streamingContent, fullResponse]);

    if (!target) return null;

    return (
        <div className="flex flex-col h-full">
            <div className={`p-3 px-4 border-b flex items-center justify-between z-10 backdrop-blur-md ${theme.id==='night'?'bg-gray-900/80 border-cyan-900':'bg-white/80 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                    <button onClick={popRoute}><ArrowLeft size={24}/></button>
                    <div>
                        <span className="font-bold text-sm block">{target.name}</span>
                        {isGroup && <span className="text-[10px] opacity-50 flex gap-1 items-center"><Users size={10}/> {(target as Group).members.length} members</span>}
                    </div>
                </div>
                <button onClick={() => pushRoute(isGroup ? 'group_info' : 'profile_view', { id: targetId })}><MoreHorizontal size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {msgs.map((msg: Message) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                        {msg.role !== 'user' && (
                            <img src={isGroup ? getTargetAvatar(msg.senderId || '') : target.avatar} className="w-8 h-8 rounded-full border border-black/5 object-cover shrink-0" />
                        )}
                        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                            {isGroup && msg.role !== 'user' && <span className="text-[9px] opacity-50 mb-0.5 ml-1">{msg.senderName}</span>}
                            <div className={`px-3 py-2 rounded-2xl text-sm ${msg.role === 'user' ? (theme.id==='simple'?'bg-[#06c755] text-white':'bg-blue-600 text-white') : (theme.id==='night'?'bg-gray-800':'bg-white border shadow-sm')}`}>
                                <SimpleMarkdown text={msg.content} theme={theme} />
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-2 items-end">
                         <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"/>
                         <div className={`px-4 py-2 rounded-2xl text-sm ${theme.id==='night'?'bg-gray-800':'bg-white border'}`}>
                            {streamingContent || '...'}
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={`p-3 border-t ${theme.id==='night'?'bg-gray-900 border-cyan-900':'bg-white border-gray-100'}`}>
                <div className="flex gap-2">
                    <input 
                        value={input} 
                        onChange={e=>setInput(e.target.value)} 
                        onKeyDown={e=>e.key==='Enter' && handleSendMessage()}
                        placeholder={langText.msg_placeholder} 
                        className={`flex-1 px-4 py-2 rounded-full outline-none text-sm ${theme.inputBg}`}
                    />
                    <button onClick={handleSendMessage} disabled={!input.trim() && !imageAttachment} className={`p-2 rounded-full ${theme.id==='simple'?'bg-[#06c755] text-white':'bg-blue-600 text-white'}`}><Send size={20}/></button>
                </div>
            </div>
        </div>
    );
};

// ... Rest of OmniChatApp ... (Main App, etc. - no changes needed there, just providing structure to close file)
const CreateGroup = ({ theme, langText, popRoute, contacts, handleCreateGroup }: any) => {
    // ... code from previous ...
    const [name, setName] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
                <button onClick={popRoute}><ArrowLeft size={20}/></button>
                <span className="font-bold flex-1">{langText.oc_create_group}</span>
                <button onClick={() => name && selected.length>0 && handleCreateGroup(name, selected)} disabled={!name || selected.length===0} className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50">Done</button>
            </div>
            <div className="p-4 border-b">
                <input placeholder={langText.oc_group_name} value={name} onChange={e=>setName(e.target.value)} className={`w-full p-3 rounded-lg bg-transparent border ${theme.id==='night'?'border-cyan-900':'border-gray-300'}`}/>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {contacts.map((c: Contact) => (
                    <div key={c.id} onClick={() => setSelected(prev => prev.includes(c.id) ? prev.filter(i=>i!==c.id) : [...prev, c.id])} className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer ${selected.includes(c.id) ? (theme.id==='night'?'bg-cyan-900/40 border border-cyan-500':'bg-blue-50 border border-blue-200') : 'opacity-70'}`}>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected.includes(c.id) ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                            {selected.includes(c.id) && <div className="w-2 h-2 bg-white rounded-full"/>}
                            </div>
                            <img src={c.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div className="font-bold text-sm">{c.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const GroupInvite = ({ theme, langText, popRoute, params, groups, setGroups, contacts }: any) => {
    const [selected, setSelected] = useState<string[]>([]);
    const g = groups.find((gr: Group) => gr.id === params.id);
    if (!g) return null;
    const candidates = contacts.filter((c: Contact) => !g.members.includes(c.id));
    const handleInvite = () => {
        setGroups((prev: Group[]) => prev.map(gr => gr.id === g.id ? {...gr, members: [...gr.members, ...selected]} : gr));
        popRoute();
    };
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
                <button onClick={popRoute}><ArrowLeft size={20}/></button>
                <span className="font-bold flex-1">{langText.oc_invite_member}</span>
                <button onClick={handleInvite} disabled={selected.length===0} className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50">Done</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {candidates.length === 0 && <div className="text-center opacity-50 p-4">No contacts to invite.</div>}
                {candidates.map((c: Contact) => (
                    <div key={c.id} onClick={() => setSelected(prev => prev.includes(c.id) ? prev.filter(i=>i!==c.id) : [...prev, c.id])} className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer ${selected.includes(c.id) ? (theme.id==='night'?'bg-cyan-900/40 border border-cyan-500':'bg-blue-50 border border-blue-200') : 'opacity-70'}`}>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected.includes(c.id) ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                            {selected.includes(c.id) && <div className="w-2 h-2 bg-white rounded-full"/>}
                            </div>
                            <img src={c.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div className="font-bold text-sm">{c.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const GroupInfo = ({ theme, langText, popRoute, params, groups, setGroups, getContact, pushRoute }: any) => {
    const g = groups.find((gr: Group) => gr.id === params.id);
    const [isTransferring, setIsTransferring] = useState(false);
    if (!g) return null;
    const updateGroup = (k: string, v: any) => setGroups((prev: Group[]) => prev.map(gr => gr.id === g.id ? {...gr, [k]: v} : gr));
    const leaveGroup = () => {
        setGroups((prev: Group[]) => prev.filter(gr => gr.id !== g.id));
        popRoute(); 
    };
    const removeMember = (mid: string) => {
        if(confirm(`Remove member?`)) {
             setGroups((prev: Group[]) => prev.map(gr => gr.id === g.id ? {...gr, members: gr.members.filter(m => m !== mid)} : gr));
        }
    };
    return (
        <div className="h-full flex flex-col bg-neutral-50/5">
            <div className="p-4 border-b flex items-center gap-3">
                <button onClick={popRoute}><ArrowLeft size={20}/></button>
                <span className="font-bold flex-1">{langText.oc_group_setting}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="text-center">
                    <img src={g.avatar} className="w-20 h-20 rounded-full mx-auto mb-2 bg-gray-200 object-cover shrink-0" />
                    <h2 className="text-xl font-bold">{g.name}</h2>
                    <p className="text-xs opacity-50">ID: {g.id}</p>
                </div>
                <div className={`p-4 rounded-xl border ${theme.id==='night'?'bg-cyan-900/10 border-cyan-800':'bg-white border-gray-200'}`}>
                    <h3 className="text-xs font-bold opacity-50 uppercase mb-2">{langText.oc_group_notice}</h3>
                    <textarea value={g.notice} onChange={e=>updateGroup('notice', e.target.value)} className="w-full bg-transparent resize-none text-sm outline-none"/>
                </div>
                <div>
                    <h3 className="text-xs font-bold opacity-50 uppercase mb-2 flex justify-between items-center">
                        <span>{langText.oc_group_members} ({g.members.length})</span>
                        <button onClick={() => pushRoute('group_invite', { id: g.id })} className="text-blue-500 flex items-center gap-1 text-[10px] bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20"><UserPlus size={12}/> {langText.oc_invite_member}</button>
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                        {g.members.map((mid: string) => {
                            const m = getContact(mid);
                            if (!m) return null;
                            return (
                                <div key={mid} className="relative group">
                                    <div onClick={() => isTransferring && updateGroup('ownerId', mid)} className="flex flex-col items-center gap-1 cursor-pointer">
                                        <img src={m.avatar} className={`w-10 h-10 rounded-full object-cover shrink-0 ${g.ownerId === mid ? 'border-2 border-yellow-500' : ''}`} />
                                        <span className="text-[9px] truncate w-full text-center">{m.name}</span>
                                    </div>
                                    {g.ownerId === 'player' && mid !== 'player' && !isTransferring && (
                                        <button onClick={() => removeMember(mid)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <XCircle size={12}/>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="space-y-2">
                    {g.ownerId === 'player' && (
                        <button onClick={() => setIsTransferring(!isTransferring)} className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold ${isTransferring ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500' : 'opacity-60 border-current'}`}>
                            <Shield size={14}/> {isTransferring ? 'Select New Owner above' : langText.oc_group_transfer}
                        </button>
                    )}
                    <button onClick={leaveGroup} className="w-full py-3 rounded-xl border border-red-500 text-red-500 bg-red-500/10 flex items-center justify-center gap-2 text-xs font-bold">
                        <LogOut size={14}/> {g.ownerId === 'player' ? langText.oc_disband_group : langText.oc_leave_group}
                    </button>
                </div>
            </div>
        </div>
    );
};
const ProfileView = ({ theme, langText, popRoute, params, getContact, pushRoute }: any) => {
    const c = getContact(params.id);
    if (!c) return <div onClick={popRoute}>Error</div>;
    return (
        <div className="h-full flex flex-col bg-neutral-900/5">
            <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${c.bgImage})` }}>
                    <button onClick={popRoute} className="absolute top-4 left-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"><ArrowLeft size={20}/></button>
            </div>
            <div className={`flex-1 -mt-6 rounded-t-3xl relative px-6 pt-16 overflow-y-auto ${theme.windowBg}`}>
                <img src={c.avatar} className={`absolute -top-12 left-6 w-24 h-24 rounded-full border-4 object-cover shrink-0 ${theme.id==='night'?'border-gray-900':'border-white'}`} alt="Av"/>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {c.name} 
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${theme.id==='night'?'bg-yellow-900 text-yellow-500 border-yellow-700':'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>Lv.{c.level}</span>
                        </h1>
                        <p className="text-xs opacity-50">UID: {c.uid || c.id.split('_')[1]}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { popRoute(); pushRoute('chat_room', { id: c.id, isGroup: false })}} className={`p-3 rounded-full ${theme.id==='night'?'bg-cyan-600 text-white':'bg-blue-600 text-white'} shadow-lg active:scale-95`}><MessageCircle size={20}/></button>
                        <button onClick={() => pushRoute('edit_contact', { id: c.id })} className={`p-3 rounded-full border ${theme.id==='night'?'border-cyan-700 text-cyan-400':'border-gray-300 text-gray-600'} hover:bg-black/5`}><Edit3 size={20}/></button>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold opacity-50 uppercase mb-2">{langText.oc_label_bio}</h3>
                        <div className={`p-4 rounded-xl text-sm leading-relaxed ${theme.id==='night'?'bg-black/20':'bg-gray-50'}`}>{c.bio || 'No signature.'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OmniChatApp: React.FC<Props> = ({ config, setConfig, assistant, theme, currentWorld, langText, onNavigate, launchParams }) => {
  const [routeStack, setRouteStack] = useState<any>([{ name: 'tab_main' }]);
  const [activeTab, setActiveTab] = useState<'msg' | 'contact' | 'me'>('msg');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chats, setChats] = useState<Record<string, Message[]>>({}); 
  const [showMenu, setShowMenu] = useState(false);

  const currentRoute = routeStack[routeStack.length - 1];
  const pushRoute = (name: string, params?: any) => setRouteStack((prev: any) => [...prev, { name, params }]);
  const popRoute = () => setRouteStack((prev: any) => prev.length > 1 ? prev.slice(0, -1) : prev);

  useEffect(() => {
    const savedContacts = localStorage.getItem('omni_contacts');
    const savedGroups = localStorage.getItem('omni_groups');
    const savedChats = localStorage.getItem('omni_chats');

    if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
    } else {
        const defaultNpc: Contact = {
            id: 'npc_' + currentWorld.id,
            name: currentWorld.character.name,
            avatar: currentWorld.character.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=NPC',
            bio: 'A resident of ' + currentWorld.metadata.name,
            personality: currentWorld.character.personality,
            level: 1,
            tags: ['NPC', currentWorld.metadata.name],
            language: 'auto'
        };
        setContacts([defaultNpc]);
    }

    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedChats) setChats(JSON.parse(savedChats));
  }, []);

  useEffect(() => { localStorage.setItem('omni_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('omni_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('omni_chats', JSON.stringify(chats)); }, [chats]);

  useEffect(() => {
      if (launchParams && launchParams.shareText) {
          pushRoute('share_target', { shareText: launchParams.shareText });
      }
  }, [launchParams]);

  const getContact = (id: string) => contacts.find(c => c.id === id);
  const getGroup = (id: string) => groups.find(g => g.id === id);
  const getTargetAvatar = (id: string) => getContact(id)?.avatar || getGroup(id)?.avatar || '';

  const handleCreateContact = (data: Partial<Contact>) => {
      const newContact: Contact = {
          id: `npc_${Date.now()}`,
          name: data.name || 'New NPC',
          uid: data.uid,
          avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`,
          bio: data.bio || '',
          personality: data.personality || 'Friendly assistant',
          level: data.level || 1,
          tags: ['Custom'],
          bgImage: data.bgImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=900&q=80',
          language: data.language || 'auto'
      };
      setContacts(prev => [...prev, newContact]);
      popRoute();
  };

  const handleDeleteContact = (id: string) => {
      setContacts(prev => prev.filter(c => c.id !== id));
      setGroups(prev => prev.map(g => ({...g, members: g.members.filter(m => m !== id)})));
      setRouteStack([{name: 'tab_main'}]);
  };

  const handleCreateGroup = (name: string, members: string[]) => {
      const newGroup: Group = {
          id: `group_${Date.now()}`,
          name: name || 'New Group',
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
          notice: 'Welcome to the group!',
          ownerId: 'player',
          members: members
      };
      setGroups(prev => [...prev, newGroup]);
      popRoute();
  };

  const renderMsgTab = () => {
      const recentIds = Object.keys(chats).sort((a,b) => {
          const lastA = chats[a][chats[a].length-1]?.id || 0;
          const lastB = chats[b][chats[b].length-1]?.id || 0;
          return lastB - lastA;
      });

      return (
          <div className="flex-1 overflow-y-auto">
             <div className="p-4 flex justify-between items-center">
                 <h2 className="text-xl font-bold">{langText.oc_tab_msg}</h2>
                 <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-black/5"><Plus size={24}/></button>
             </div>
             {showMenu && (
                 <div className={`absolute top-16 right-4 w-40 rounded-xl shadow-xl z-50 p-2 flex flex-col gap-1 ${theme.windowBg}`}>
                     <button onClick={() => {setShowMenu(false); pushRoute('edit_contact', { isNew: true })}} className="p-2 text-left text-xs font-bold rounded hover:bg-black/5 flex gap-2 items-center"><User size={14}/> {langText.oc_add_friend}</button>
                     <button onClick={() => {setShowMenu(false); pushRoute('create_group')}} className="p-2 text-left text-xs font-bold rounded hover:bg-black/5 flex gap-2 items-center"><Users size={14}/> {langText.oc_create_group}</button>
                 </div>
             )}
             <div className="px-2">
                 {recentIds.length === 0 && <div className="text-center opacity-40 mt-10 text-xs">{langText.chat_no_msg}</div>}
                 {recentIds.map(id => {
                     const isGroup = !!getGroup(id);
                     const target = isGroup ? getGroup(id) : getContact(id);
                     if (!target) return null;
                     const lastMsg = chats[id][chats[id].length-1];
                     return (
                         <div key={id} onClick={() => pushRoute('chat_room', { id, isGroup })} className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer ${theme.id==='night'?'hover:bg-cyan-900/20':'hover:bg-white/60'}`}>
                             <div className="relative">
                                <img src={target.avatar} className={`w-12 h-12 rounded-full object-cover shrink-0 border ${theme.id==='night'?'border-cyan-800':'border-gray-200'}`} alt="Av" />
                                {isGroup && <div className="absolute -bottom-1 -right-1 bg-gray-500 text-[8px] text-white px-1 rounded-full border border-white">G</div>}
                             </div>
                             <div className="flex-1 min-w-0">
                                 <div className="flex justify-between">
                                     <h3 className="font-bold text-sm truncate">{target.name}</h3>
                                     <span className="text-[10px] opacity-40">{new Date(lastMsg.id).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                                 </div>
                                 <p className="text-xs opacity-60 truncate">{lastMsg.content}</p>
                             </div>
                         </div>
                     );
                 })}
             </div>
          </div>
      );
  };

  const renderContactTab = () => (
      <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-bold mb-4">{langText.oc_tab_contact}</h2>
          
          <div className="mb-2 text-xs font-bold opacity-50 uppercase">{langText.oc_section_group}</div>
          {groups.map(g => (
              <div key={g.id} onClick={() => pushRoute('chat_room', { id: g.id, isGroup: true })} className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer ${theme.id==='night'?'bg-cyan-900/10':'bg-white/40'}`}>
                  <img src={g.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="G"/>
                  <span className="font-bold text-sm">{g.name}</span>
              </div>
          ))}
          <button onClick={() => pushRoute('create_group')} className="w-full py-2 mb-6 border border-dashed rounded-lg opacity-50 hover:opacity-100 text-xs flex items-center justify-center gap-2"><Plus size={14}/> {langText.oc_create_group}</button>

          <div className="mb-2 text-xs font-bold opacity-50 uppercase">{langText.oc_section_friend}</div>
          {contacts.map(c => (
              <div key={c.id} onClick={() => pushRoute('profile_view', { id: c.id })} className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer ${theme.id==='night'?'bg-cyan-900/10':'bg-white/40'}`}>
                  <img src={c.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="C"/>
                  <div className="flex-1">
                      <div className="font-bold text-sm">{c.name}</div>
                      <div className="text-[10px] opacity-50">{c.bio}</div>
                  </div>
              </div>
          ))}
          <button onClick={() => pushRoute('edit_contact', { isNew: true })} className="w-full py-2 border border-dashed rounded-lg opacity-50 hover:opacity-100 text-xs flex items-center justify-center gap-2"><Plus size={14}/> {langText.oc_add_friend}</button>
      </div>
  );

  const renderMeTab = () => {
      const p = config.userProfile;
      return (
          <div className="flex-1 overflow-y-auto">
              <div className="h-40 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${p.bgImage || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853'})` }}>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="px-6 -mt-10 relative mb-4">
                  <div className="flex justify-between items-end">
                      <img src={p.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'} className={`w-24 h-24 rounded-full border-4 object-cover shrink-0 ${theme.id==='night'?'border-black':'border-white'}`} alt="Me"/>
                      <button onClick={() => pushRoute('edit_contact', { isMe: true })} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${theme.id==='night'?'bg-cyan-600 text-white border-cyan-600':'bg-white text-gray-800 border-gray-300'}`}>{langText.oc_btn_edit}</button>
                  </div>
                  <div className="mt-3">
                      <h1 className="text-2xl font-bold">{p.name || 'User'}</h1>
                      <p className="text-xs opacity-60">UID: {p.uid || '1000001'}</p>
                  </div>
              </div>
              <div className="px-6 space-y-6">
                  <div>
                      <h3 className="text-xs font-bold opacity-50 uppercase mb-1">{langText.oc_label_bio}</h3>
                      <p className="text-sm">{p.signature || p.likes || 'Hello World.'}</p>
                  </div>
              </div>
          </div>
      );
  };

  const renderShareTarget = () => {
      const shareText = currentRoute.params.shareText;
      return (
          <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center gap-3">
                  <button onClick={() => { setRouteStack([{name: 'tab_main'}]); }}><XCircle size={20}/></button>
                  <span className="font-bold flex-1">{langText.oc_share_target}</span>
              </div>
              <div className="p-4 bg-blue-50 text-xs border-b border-blue-100 text-blue-800">
                  Sharing: {shareText}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {[...contacts, ...groups].map((item: any) => (
                      <div key={item.id} 
                           onClick={() => {
                               const targetId = item.id;
                               const userMsg: Message = { role: 'user', content: shareText, id: Date.now(), senderId: 'player' };
                               setChats((prev: any) => ({...prev, [targetId]: [...(prev[targetId]||[]), userMsg]}));
                               
                               // Replace current route with chat room
                               setRouteStack([{ name: 'tab_main' }, { name: 'chat_room', params: { id: targetId, isGroup: !!item.members } }]);
                           }}
                           className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${theme.id==='night'?'bg-cyan-900/10':'bg-white/40'}`}
                      >
                          <img src={item.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" />
                          <div className="font-bold text-sm">{item.name}</div>
                          <Share2 size={16} className="ml-auto opacity-50"/>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderTabBar = () => (
      <div className={`flex border-t h-16 ${theme.id==='night'?'bg-black/40 border-cyan-900':'bg-white/80 border-gray-200'}`}>
          {[
              { id: 'msg', icon: MessageCircle, label: langText.oc_tab_msg },
              { id: 'contact', icon: Users, label: langText.oc_tab_contact },
              { id: 'me', icon: User, label: langText.oc_tab_me },
          ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === tab.id ? (theme.id==='night'?'text-cyan-400':'text-green-600') : 'opacity-50'}`}>
                  <tab.icon size={24} />
                  <span className="text-[10px] font-bold">{tab.label}</span>
              </button>
          ))}
      </div>
  );

  if (currentRoute.name === 'edit_contact') {
      return <EditContact theme={theme} langText={langText} popRoute={popRoute} params={currentRoute.params} contacts={contacts} setContacts={setContacts} config={config} setConfig={setConfig} handleCreateContact={handleCreateContact} handleDeleteContact={handleDeleteContact} />;
  }
  if (currentRoute.name === 'create_group') {
      return <CreateGroup theme={theme} langText={langText} popRoute={popRoute} contacts={contacts} handleCreateGroup={handleCreateGroup} />;
  }
  if (currentRoute.name === 'group_info') {
      return <GroupInfo theme={theme} langText={langText} popRoute={popRoute} params={currentRoute.params} groups={groups} setGroups={setGroups} contacts={contacts} getContact={getContact} pushRoute={pushRoute} />;
  }
  if (currentRoute.name === 'group_invite') {
      return <GroupInvite theme={theme} langText={langText} popRoute={popRoute} params={currentRoute.params} groups={groups} setGroups={setGroups} contacts={contacts} />;
  }
  if (currentRoute.name === 'profile_view') {
      return <ProfileView theme={theme} langText={langText} popRoute={popRoute} params={currentRoute.params} getContact={getContact} pushRoute={pushRoute} />;
  }
  
  // Use ChatRoom component for the chat room view
  if (currentRoute.name === 'chat_room') {
      return (
          <ChatRoom 
              theme={theme} 
              langText={langText} 
              popRoute={popRoute} 
              params={currentRoute.params} 
              groups={groups} 
              contacts={contacts} 
              chats={chats} 
              setChats={setChats} 
              pushRoute={pushRoute}
              config={config}
              getContact={getContact}
              getGroup={getGroup}
              getTargetAvatar={getTargetAvatar}
          />
      );
  }
  
  if (currentRoute.name === 'share_target') return renderShareTarget();

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden animate-in fade-in">
        {activeTab === 'msg' && renderMsgTab()}
        {activeTab === 'contact' && renderContactTab()}
        {activeTab === 'me' && renderMeTab()}
        {renderTabBar()}
    </div>
  );
};

export default OmniChatApp;