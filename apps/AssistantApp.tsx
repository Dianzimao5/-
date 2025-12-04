import React, { useState, useEffect, useRef } from 'react';
import { Settings, Trash2, ArrowLeft, RefreshCw, Send, Bot, Zap, Book, MoreHorizontal } from 'lucide-react';
import { Theme, AppConfig, AssistantConfig, World, Message } from '../types';
import SimpleMarkdown from '../components/SimpleMarkdown';

interface Props {
  config: AppConfig;
  assistant: AssistantConfig;
  setAssistant: React.Dispatch<React.SetStateAction<AssistantConfig>>;
  savedWorlds: World[];
  theme: Theme;
  currentWorld: World;
  langText: Record<string, string>;
}

const AssistantApp: React.FC<Props> = ({ config, assistant, setAssistant, savedWorlds, theme, currentWorld, langText }) => {
  const [view, setView] = useState<'chat' | 'config'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState(''); 
  const [fullResponse, setFullResponse] = useState(''); 
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load/Save System Messages
  useEffect(() => {
    const saved = localStorage.getItem('omni_msgs_system');
    if (saved) {
        try { setMessages(JSON.parse(saved)); } catch(e) { setMessages([]); }
    } else {
        setMessages([{ role: 'assistant', content: assistant.greeting, id: 1 }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('omni_msgs_system', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (view === 'chat' && !isTyping) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view, isTyping]);

  // Typewriter Effect
  useEffect(() => {
    if (isTyping && streamingContent.length < fullResponse.length) {
      const timeout = setTimeout(() => {
        setStreamingContent(fullResponse.slice(0, streamingContent.length + 1));
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 15);
      return () => clearTimeout(timeout);
    } else if (isTyping && streamingContent.length === fullResponse.length) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: fullResponse, id: Date.now() }]);
      setStreamingContent('');
    }
  }, [isTyping, streamingContent, fullResponse]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading || isTyping) return;
    if (!config.apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: langText.sys_tip_key, id: Date.now() }]);
        return;
    }

    const userMsg: Message = { role: 'user', content: textToSend, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowCommands(false);
    setIsLoading(true);

    try {
        // Enforce Language
        const langName = config.language === 'zh' ? 'Simplified Chinese (简体中文)' : config.language === 'ja' ? 'Japanese (日本語)' : 'English';
        const langInstruction = `\n[System]: You MUST reply in ${langName} regardless of user input language, unless explicitly asked to translate.`;

        let systemPromptText = `[System Assistant]: ${assistant.name}\n${assistant.systemPrompt}${langInstruction}`;
        if (config.useGlobalProfile) {
            systemPromptText += `\n[User]: ${config.userProfile.name} (UID: ${config.userProfile.uid || 'Unknown'}) (${config.userProfile.likes})`;
        }
        
        const msgsToSend = [...messages, userMsg].slice(-10); // Context window

        let aiText = "";
        if (config.provider === 'gemini') {
             const contents = msgsToSend.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
             const url = `${config.apiEndpoint}/${config.model}:generateContent?key=${config.apiKey}`;
             const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPromptText }] },
                    contents: contents
                })
             });
             const data = await res.json();
             aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || langText.no_signal;
        } else {
            const apiMessages = [{ role: "system", content: systemPromptText }, ...msgsToSend.map(m => ({ role: m.role, content: m.content }))];
            const res = await fetch(`${config.apiEndpoint}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                body: JSON.stringify({ model: config.model, messages: apiMessages })
            });
            const data = await res.json();
            aiText = data.choices?.[0]?.message?.content || langText.no_signal;
        }

        setFullResponse(aiText);
        setIsLoading(false);
        setIsTyping(true);
        setStreamingContent(aiText.charAt(0));
    } catch (err: any) {
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}`, id: Date.now() }]);
    }
  };

  const handleSwitchAssistant = (world: World | null) => {
      if (!world) {
          // Reset to default
          setAssistant({
              name: 'Omni',
              avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Omni',
              greeting: 'OmniTerminal initiated.',
              systemPrompt: 'Your name is Omni, a helpful AI assistant.'
          });
      } else {
          setAssistant({
              name: world.character.name,
              avatar: world.character.avatar,
              greeting: world.character.greeting || `Hello, I am ${world.character.name}.`,
              systemPrompt: world.character.personality
          });
      }
      setMessages([]);
      alert(langText.ast_save_tip);
  };

  const renderConfig = () => (
     <div className="h-full flex flex-col animate-in slide-in-from-right">
        <div className={`p-4 border-b flex items-center gap-2 ${theme.id === 'night' ? 'border-cyan-800' : 'border-gray-200'}`}>
            <button onClick={() => setView('chat')} className={`p-2 rounded-full hover:bg-black/5`}><ArrowLeft size={20} className={theme.statusBarText}/></button>
            <span className={`font-bold ${theme.statusBarText}`}>{langText.ast_config_title}</span>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
            {/* Assistant Switcher */}
            <div>
                <h3 className={`text-xs font-bold opacity-60 mb-2 uppercase ${theme.statusBarText}`}>{langText.ast_switch_title}</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button onClick={() => handleSwitchAssistant(null)} className={`flex-shrink-0 w-24 p-2 rounded-xl border flex flex-col items-center gap-2 ${theme.id==='night'?'border-cyan-800 bg-cyan-900/20':'border-gray-200 bg-gray-50'}`}>
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Bot size={20}/></div>
                        <span className="text-[10px] truncate w-full text-center font-bold">{langText.ast_lib_default}</span>
                    </button>
                    {savedWorlds.map(w => (
                        <button key={w.id} onClick={() => handleSwitchAssistant(w)} className={`flex-shrink-0 w-24 p-2 rounded-xl border flex flex-col items-center gap-2 ${theme.id==='night'?'border-cyan-800 hover:bg-cyan-900/20':'border-gray-200 hover:bg-gray-50'}`}>
                            <img src={w.character.avatar} className="w-10 h-10 rounded-full object-cover"/>
                            <span className="text-[10px] truncate w-full text-center font-bold">{w.character.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editable Fields */}
            <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                    <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_name}</label><input value={assistant.name} onChange={e=>setAssistant(p=>({...p,name:e.target.value}))} className={`w-full p-2 rounded border text-sm outline-none ${theme.inputBg}`}/></div>
                    <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_avatar}</label><input value={assistant.avatar} onChange={e=>setAssistant(p=>({...p,avatar:e.target.value}))} className={`w-full p-2 rounded border text-sm outline-none ${theme.inputBg}`}/></div>
                </div>
                <img src={assistant.avatar} className="w-24 h-24 rounded-xl object-cover bg-gray-300 shadow-md" alt="Avatar"/>
            </div>
            <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_prompt}</label><textarea value={assistant.systemPrompt} onChange={e=>setAssistant(p=>({...p,systemPrompt:e.target.value}))} rows={6} className={`w-full p-2 rounded border text-sm outline-none resize-none ${theme.inputBg}`}/></div>
            <div><label className={`text-xs font-bold opacity-60 mb-1 block ${theme.statusBarText}`}>{langText.ast_greeting}</label><textarea value={assistant.greeting} onChange={e=>setAssistant(p=>({...p,greeting:e.target.value}))} rows={2} className={`w-full p-2 rounded border text-sm outline-none resize-none ${theme.inputBg}`}/></div>
        </div>
     </div>
  );

  if (view === 'config') return renderConfig();

  return (
    <div className="h-full flex flex-col relative animate-in fade-in">
        {/* Header */}
        <div className={`p-3 px-4 border-b flex items-center justify-between z-10 ${theme.id==='night'?'bg-gray-900/80 border-cyan-900':'bg-white/80 border-gray-100'} backdrop-blur-md`}>
            <div className="flex items-center gap-2">
                <Bot size={20} className={theme.statusBarText} />
                <span className={`font-bold text-sm ${theme.statusBarText}`}>{assistant.name}</span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setMessages([])} className="opacity-50 hover:opacity-100 hover:text-red-500 p-1"><Trash2 size={18}/></button>
                <button onClick={() => setView('config')} className="opacity-50 hover:opacity-100 p-1"><Settings size={18} className={theme.statusBarText}/></button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'assistant' && <img src={assistant.avatar} className="w-8 h-8 rounded-full border border-black/5" alt="Bot"/>}
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? (theme.id==='night'?'bg-cyan-700 text-white':'bg-blue-600 text-white') : (theme.id==='night'?'bg-gray-800 text-cyan-50':'bg-white border text-gray-800 shadow-sm')}`}>
                        <SimpleMarkdown text={msg.content} theme={theme} />
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex gap-3">
                    <img src={assistant.avatar} className="w-8 h-8 rounded-full border border-black/5" alt="Bot"/>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${theme.id==='night'?'bg-gray-800 text-cyan-50':'bg-white border text-gray-800 shadow-sm'}`}>
                         {streamingContent ? <SimpleMarkdown text={streamingContent} theme={theme} /> : <span className="animate-pulse">...</span>}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Command Menu */}
        {showCommands && (
            <div className={`absolute bottom-16 left-4 right-4 rounded-xl shadow-xl z-20 p-2 grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-2 ${theme.windowBg} border ${theme.id==='night'?'border-cyan-800':'border-gray-200'}`}>
                {[
                    { label: langText.cmd_analyze, cmd: "Analyze the current world setting and logic based on my WorldBook." },
                    { label: langText.cmd_status, cmd: "Perform a system check and report status." },
                    { label: langText.cmd_help, cmd: "How do I use this terminal?" },
                    { label: langText.cmd_story, cmd: "Summarize the recent story events." }
                ].map((c, i) => (
                    <button key={i} onClick={() => handleSendMessage(c.cmd)} className={`p-3 text-left text-xs font-bold rounded-lg hover:bg-black/5 flex items-center gap-2 border ${theme.id==='night'?'border-cyan-900/50':'border-gray-100'}`}>
                        <Zap size={14} className="opacity-50"/> {c.label}
                    </button>
                ))}
            </div>
        )}

        {/* Input */}
        <div className={`p-3 border-t ${theme.id==='night'?'bg-gray-900 border-cyan-900':'bg-white border-gray-100'}`}>
            <div className="flex gap-2">
                <button onClick={() => setShowCommands(!showCommands)} className={`p-2 rounded-full ${showCommands ? (theme.id==='night'?'bg-cyan-600 text-white':'bg-gray-200 text-black') : 'opacity-50 hover:bg-black/5'}`}>
                    <Zap size={20}/>
                </button>
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder={langText.msg_placeholder}
                    className={`flex-1 px-4 py-2 rounded-full outline-none text-sm ${theme.inputBg}`}
                />
                <button 
                    onClick={() => handleSendMessage()} 
                    disabled={!input.trim() || isLoading}
                    className={`p-2 rounded-full ${!input.trim() ? 'opacity-50' : ''} ${theme.id==='night'?'bg-cyan-600 text-white':'bg-blue-600 text-white'}`}
                >
                    {isLoading ? <RefreshCw className="animate-spin" size={20}/> : <Send size={20}/>}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AssistantApp;