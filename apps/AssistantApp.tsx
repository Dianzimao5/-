import React, { useState, useEffect, useRef } from 'react';
import { Settings, Trash2, ArrowLeft, RefreshCw, List, ImageIcon, XCircle, Scroll } from 'lucide-react';
import { Theme, AppConfig, AssistantConfig, World, Message } from '../types';
import SimpleMarkdown from '../components/SimpleMarkdown';

interface Props {
  config: AppConfig;
  assistant: AssistantConfig;
  setAssistant: React.Dispatch<React.SetStateAction<AssistantConfig>>;
  theme: Theme;
  currentWorld: World;
  langText: Record<string, string>;
}

const AssistantApp: React.FC<Props> = ({ config, assistant, setAssistant, theme, currentWorld, langText }) => {
  const [view, setView] = useState<'chat' | 'config'>('chat');
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: assistant.greeting, id: 1 }]);
  const [historySummary, setHistorySummary] = useState(''); 
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState(''); 
  const [fullResponse, setFullResponse] = useState(''); 
  const [imageAttachment, setImageAttachment] = useState<string | null>(null); 
  const [showMenu, setShowMenu] = useState(false); 
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingSpeed = 15; 

  const inputClass = `w-full p-2 rounded border text-sm outline-none transition-all ${theme.id === 'night' ? 'bg-gray-900 border-cyan-800 text-cyan-50 placeholder-cyan-800 focus:border-cyan-500' : 'bg-transparent border-gray-300 focus:bg-white focus:border-indigo-400'}`;

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem('omni_messages_v1');
    const savedSum = localStorage.getItem('omni_summary_v1');
    if (saved) setMessages(JSON.parse(saved));
    if (savedSum) setHistorySummary(savedSum);
  }, []);

  // Save History
  useEffect(() => {
    localStorage.setItem('omni_messages_v1', JSON.stringify(messages));
    localStorage.setItem('omni_summary_v1', historySummary);
    if (view === 'chat' && !isTyping) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view, isTyping, historySummary]);

  // Typewriter Effect
  useEffect(() => {
    if (isTyping && streamingContent.length < fullResponse.length) {
      const timeout = setTimeout(() => {
        setStreamingContent(fullResponse.slice(0, streamingContent.length + 1));
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isTyping && streamingContent.length === fullResponse.length) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: fullResponse, id: Date.now() }]);
      setStreamingContent('');
    }
  }, [isTyping, streamingContent, fullResponse]);

  const summarizeHistory = async (msgsToSummarize: Message[]) => {
    if (!config.apiKey) return;
    try {
        const prompt = "Please summarize the following conversation history into a concise paragraph to be used as context memory for future interactions. Keep important facts, names, and current status.";
        const content = JSON.stringify(msgsToSummarize.map(m => `${m.role}: ${m.content}`));
        
        let summaryText = "";
        
        const body = config.provider === 'gemini' 
            ? { contents: [{ parts: [{ text: prompt + "\n\n" + content }] }] }
            : { model: config.model, messages: [{ role: "system", content: "You are a summarizer." }, { role: "user", content: prompt + "\n" + content }] };
        
        const url = config.provider === 'gemini' 
            ? `${config.apiEndpoint}/${config.model}:generateContent?key=${config.apiKey}`
            : `${config.apiEndpoint}/chat/completions`;

        const res = await fetch(url, {
             method: 'POST',
             headers: config.provider === 'gemini' ? {'Content-Type': 'application/json'} : {'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}`},
             body: JSON.stringify(body)
        });
        const data = await res.json();
        
        if (config.provider === 'gemini') {
            summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        } else {
            summaryText = data.choices?.[0]?.message?.content;
        }

        if (summaryText) {
            setHistorySummary(prev => prev ? prev + "\n[Update]: " + summaryText : summaryText);
        }
    } catch (e) {
        console.error("Summary failed", e);
    }
  };

  const handleSendMessage = async (textOverride: string | null = null) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !imageAttachment) || isLoading || isTyping) return;

    if (!config.apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: langText.sys_tip_key, id: Date.now() }]);
        return;
    }

    const userMsg: Message = { role: 'user', content: textToSend, image: imageAttachment, id: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setImageAttachment(null);
    setShowMenu(false);
    setIsLoading(true);

    const MAX_CONTEXT_MSG = 15;
    const TRIGGER_SUMMARY_COUNT = 25;
    
    let messagesToSend = [];
    
    let playerPrompt = config.useGlobalProfile 
        ? `[User Profile]: Name:${config.userProfile.name}, Gender:${config.userProfile.gender}, Bio:${config.userProfile.likes}`
        : `[User Profile]: Name:${currentWorld.player?.name || 'User'}, Bio:${currentWorld.player?.bio || 'Unknown'}`;

    let coreSystem = `
[AI Assistant Persona]:
Name: ${assistant.name}
Instructions: ${assistant.systemPrompt}

[Current World Context]:
World Name: ${currentWorld.metadata.name}
Lore: ${currentWorld.world.lore}

${playerPrompt}
    `.trim();

    if (historySummary) {
        coreSystem += `\n\n[Previous Conversation Summary]:\n${historySummary}`;
    }

    if (newHistory.length > MAX_CONTEXT_MSG) {
        messagesToSend = newHistory.slice(-MAX_CONTEXT_MSG);
    } else {
        messagesToSend = newHistory;
    }

    if (newHistory.length > TRIGGER_SUMMARY_COUNT && newHistory.length % 5 === 0) {
        const msgsToArchive = newHistory.slice(0, newHistory.length - MAX_CONTEXT_MSG);
        summarizeHistory(msgsToArchive.slice(-10)); 
    }

    try {
      let aiText = "";

      if (config.provider === 'gemini') {
        const geminiHistory = messagesToSend.map(m => {
            const parts: any[] = [{ text: m.content || " " }];
            if (m.image) {
                const base64Data = m.image.split(',')[1];
                const mimeType = m.image.split(';')[0].split(':')[1];
                parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
            }
            return { role: m.role === 'user' ? 'user' : 'model', parts: parts };
        });

        const url = `${config.apiEndpoint}/${config.model}:generateContent?key=${config.apiKey}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: coreSystem }] },
                contents: geminiHistory,
                generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
            })
        });

        if (!res.ok) throw new Error((await res.json()).error?.message || "Gemini Error");
        const data = await res.json();
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || langText.no_signal;

      } else {
        const apiMessages = [
            { role: "system", content: coreSystem },
            ...messagesToSend.map(m => ({ 
                role: m.role, 
                content: m.image ? `[Image Uploaded] ${m.content}` : m.content
            }))
        ];

        const res = await fetch(`${config.apiEndpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
            body: JSON.stringify({ model: config.model, messages: apiMessages, temperature: 0.7 })
        });
        
        if (!res.ok) throw new Error("API Error");
        const data = await res.json();
        aiText = data.choices?.[0]?.message?.content || langText.no_signal;
      }

      setFullResponse(aiText);
      setIsLoading(false);
      setIsTyping(true);
      setStreamingContent(aiText.charAt(0));

    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}`, id: Date.now() + 1 }]);
      setIsLoading(false);
    }
  };

  const bubbleUser = theme.id === 'simple' 
    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md' 
    : theme.id === 'dao' 
        ? 'bg-[#2e7d32] text-[#f1f8e9] border border-[#a5d6a7] shadow-sm' 
        : 'bg-cyan-900/80 text-cyan-100 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,188,212,0.2)]';
  
  const bubbleAi = theme.id === 'simple' 
    ? 'bg-white/90 backdrop-blur-sm text-slate-800 border border-white/50 shadow-sm' 
    : theme.id === 'dao' 
        ? 'bg-[#f1f8e9] text-[#1b5e20] border border-[#c8e6c9] shadow-sm' 
        : 'bg-black/60 backdrop-blur-md text-cyan-100 border border-cyan-800/50';

  if (view === 'config') return (
    <div className="h-full flex flex-col animate-in slide-in-from-right">
        <div className={`p-4 border-b flex items-center justify-between ${theme.id === 'night' ? 'border-cyan-800' : 'border-gray-200/50'}`}>
            <div className="flex items-center gap-2">
                <button onClick={() => setView('chat')} className={`p-2 rounded-full hover:bg-black/5`}><ArrowLeft size={20} className={theme.statusBarText}/></button>
                <span className={`font-bold ${theme.statusBarText}`}>{langText.ast_config_title}</span>
            </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
             <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                    <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_name}</label><input value={assistant.name} onChange={e=>setAssistant(p=>({...p,name:e.target.value}))} className={inputClass}/></div>
                    <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_avatar}</label><input value={assistant.avatar} onChange={e=>setAssistant(p=>({...p,avatar:e.target.value}))} className={inputClass}/></div>
                </div>
                <img src={assistant.avatar} className="w-24 h-24 rounded-xl object-cover bg-gray-300 shadow-md" alt="Avatar"/>
            </div>
            <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_prompt}</label><textarea value={assistant.systemPrompt} onChange={e=>setAssistant(p=>({...p,systemPrompt:e.target.value}))} rows={6} className={`resize-none ${inputClass}`}/></div>
            <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_greeting}</label><textarea value={assistant.greeting} onChange={e=>setAssistant(p=>({...p,greeting:e.target.value}))} rows={2} className={`resize-none ${inputClass}`}/></div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative">
      <div className={`p-4 border-b flex justify-between items-center ${theme.id === 'night' ? 'border-cyan-800' : 'border-gray-200/50'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
             <img src={assistant.avatar} className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm" alt="Bot" />
             <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className={`font-bold ${theme.statusBarText}`}>{assistant.name}</div>
            <div className="text-[10px] opacity-60 flex items-center gap-1">
                {isLoading ? langText.typing : isTyping ? 'Typing...' : langText.online}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => {setMessages([]); setHistorySummary('');}} className="opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"><Trash2 size={18} className={theme.statusBarText}/></button>
            <button onClick={() => setView('config')} className="opacity-50 hover:opacity-100 transition-colors"><Settings size={18} className={theme.statusBarText}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth">
        {historySummary && (
            <div className={`text-[10px] p-3 rounded-lg mx-auto max-w-[90%] text-center border-dashed border ${theme.id==='night'?'border-cyan-900 text-cyan-600':'border-gray-300 text-gray-400'}`}>
                <div className="font-bold mb-1 opacity-70 flex items-center justify-center gap-1"><Scroll size={12}/> {langText.summary_label}</div>
                <div className="line-clamp-2 opacity-60 italic">{historySummary}</div>
            </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}>
            {msg.role === 'assistant' && (
                <img src={assistant.avatar} className="w-8 h-8 rounded-full object-cover mt-1 self-start shadow-sm border border-white/10" alt="Bot" />
            )}
            <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image && <img src={msg.image} className="max-w-full h-32 rounded-lg border border-white/20 mb-1 object-cover shadow-md" alt="Attachment" />}
                <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? bubbleUser + ' rounded-tr-sm' : bubbleAi + ' rounded-tl-sm'}`}>
                   <SimpleMarkdown text={msg.content} theme={theme} />
                </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex gap-3 animate-in fade-in">
              <img src={assistant.avatar} className="w-8 h-8 rounded-full object-cover mt-1 self-start shadow-sm border border-white/10" alt="Bot" />
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm ${bubbleAi}`}>
                  <SimpleMarkdown text={streamingContent + ' ▍'} theme={theme} />
              </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 relative z-10">
        {showMenu && (
            <div className={`absolute bottom-16 left-3 w-56 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 border ${theme.id==='night'?'bg-gray-900/95 border-cyan-700 backdrop-blur-xl':'bg-white/95 border-white/50 backdrop-blur-xl'}`}>
                <div className={`px-4 py-2 text-[10px] font-bold uppercase opacity-50 ${theme.statusBarText}`}>{langText.cmd_menu_title}</div>
                {[
                    { l: langText.cmd_analyze, cmd: '请分析当前世界书的世界观设定，并给出简要报告。' },
                    { l: langText.cmd_status, cmd: '请检查终端系统状态，并确认当前连接的模型。' },
                    { l: langText.cmd_help, cmd: '请告诉我如何使用万象终端。' },
                    { l: langText.cmd_story, cmd: '请回顾一下我们之前的经历。' },
                ].map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleSendMessage(item.cmd)}
                        className={`w-full text-left px-4 py-3 text-xs border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors ${theme.statusBarText}`}
                    >
                        {item.l}
                    </button>
                ))}
            </div>
        )}

        {imageAttachment && (
            <div className={`mx-2 mb-2 p-2 rounded-lg flex items-center justify-between border ${theme.id === 'night' ? 'bg-cyan-900/30 border-cyan-800' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-center gap-2">
                    <img src={imageAttachment} className="w-8 h-8 rounded object-cover border border-white/20" alt="Preview" />
                    <span className={`text-xs ${theme.statusBarText} opacity-70`}>{langText.img_attached}</span>
                </div>
                <button onClick={() => setImageAttachment(null)} className="opacity-50 hover:opacity-100"><XCircle size={16} className={theme.statusBarText} /></button>
            </div>
        )}

        <div className={`flex items-end gap-2 p-1.5 rounded-[24px] border shadow-sm transition-all ${theme.inputBg}`}>
            <button 
                onClick={() => setShowMenu(!showMenu)} 
                className={`p-2.5 rounded-full transition-colors ${theme.id === 'night' ? 'hover:bg-cyan-900/50 text-cyan-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
                <List size={20}/>
            </button>
            
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className={`p-2.5 rounded-full transition-colors ${theme.id === 'night' ? 'hover:bg-cyan-900/50 text-cyan-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title={langText.img_upload_title}
            >
                <ImageIcon size={20}/>
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setImageAttachment(ev.target?.result as string);
                    reader.readAsDataURL(file);
                }
            }} accept="image/*" className="hidden" />

            <textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                placeholder={langText.msg_placeholder}
                rows={1}
                className={`flex-1 bg-transparent px-2 py-2.5 outline-none text-sm placeholder-current opacity-80 resize-none max-h-24`}
                style={{minHeight: '44px'}}
            />
            <button 
                onClick={() => handleSendMessage()} 
                disabled={isLoading || isTyping}
                className={`p-2.5 rounded-full text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 ${theme.accentColor}`}
            >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowLeft className="rotate-180" size={20} />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantApp;
