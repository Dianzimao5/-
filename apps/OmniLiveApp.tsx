import React, { useState, useEffect, useRef } from 'react';
import { Video, Heart, Gift, MessageCircle, Share2, Send, X, Plus, User, Zap, Camera, Image as ImageIcon, Flame, Radio, BarChart2, Edit3, Settings, Lock, Unlock, Copy, MessageSquare, ArrowLeft, Search, Check } from 'lucide-react';
import { Theme, AppConfig, World, Contact } from '../types';

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  theme: Theme;
  currentWorld: World;
  langText: Record<string, string>;
  onNavigate: (app: string, params?: any) => void;
}

interface Comment {
  id: number;
  user: string;
  text: string;
  type: 'normal' | 'fan' | 'hater' | 'gift' | 'host';
  color?: string;
}

interface StreamStats {
  viewers: number;
  likes: number;
  coins: number;
  duration: number;
}

interface FeedItem {
    id: number;
    user: string;
    avatar: string;
    description: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    image: string;
}

const I18N_COMMENTS: any = {
  zh: {
    normal: ['???', '这是哪？', '好酷的背景', '真的假的？', '主播好', '有人吗', '第一！'],
    fan: ['太强了！！！', '爱你 ❤️', '送你一个火箭', '关注了', '主播好帅/美', '绝绝子 ✨', '审美在线'],
    hater: ['无语', '划走', '好无聊...', '谁在乎？', '取关了', '呵呵', '假的吧', '机器人？'],
    gift: ['送出了 火箭 🚀', '送出了 玫瑰 🌹', '送出了 钻石 💎', '送出了 跑车 🏎️']
  },
  en: {
    normal: ['???', 'Lol', 'What is this place?', 'Hi', 'Lag?', 'Cool background', 'Is this real?', 'Any mods?', 'First!'],
    fan: ['OMG!!!', 'Love you ❤️', 'Take my coins!', 'Notice me senpai', 'Best streamer ever', 'SLAY ✨', 'So aesthetic'],
    hater: ['Cringe', 'Skip', 'Boring...', 'Who cares?', 'Unsubbed', 'L', 'Fake', 'Bot?'],
    gift: ['sent a Rocket 🚀', 'sent a Rose 🌹', 'sent a Gem 💎', 'sent a Nuke ☢️']
  },
  ja: {
    normal: ['???', 'ここどこ？', '背景かっこいい', 'マジ？', 'こんにちは', 'ラグい？', '初見です'],
    fan: ['すごい！！！', '大好き ❤️', '投げ銭するわ', '先輩気づいて', '最高かよ', '尊い ✨', 'センスいい'],
    hater: ['微妙', 'スキップ', 'つまんない...', '誰得？', '解除した', '草', 'フェイク乙', 'BOT?'],
    gift: ['が ロケット 🚀 を送りました', 'が バラ 🌹 を送りました', 'が ダイヤ 💎 を送りました', 'が 核爆弾 ☢️ を送りました']
  }
};

// --- Sub Components ---

const EditProfileModal = ({ config, setConfig, theme, onClose, langText }: any) => {
    const [form, setForm] = useState(config.userProfile);
    const save = () => {
        setConfig((prev: AppConfig) => ({...prev, userProfile: {...prev.userProfile, ...form}}));
        onClose();
    };
    return (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in">
             <div className="p-4 flex items-center justify-between border-b border-white/10 mt-safe">
                 <button onClick={onClose}><X className="text-white"/></button>
                 <span className="font-bold text-white">{langText.live_profile_edit}</span>
                 <button onClick={save} className="text-pink-500 font-bold text-sm">{langText.save}</button>
             </div>
             <div className="p-6 space-y-4 text-white overflow-y-auto">
                 <div className="flex justify-center mb-4">
                     <img src={form.avatar} className="w-24 h-24 rounded-full border-2 border-white/20 object-cover shrink-0"/>
                 </div>
                 <div><label className="text-xs opacity-50 block mb-1">Name</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-white/10 p-2 rounded text-sm"/></div>
                 <div><label className="text-xs opacity-50 block mb-1">UID</label><input value={form.uid} onChange={e=>setForm({...form, uid:e.target.value})} className="w-full bg-white/10 p-2 rounded text-sm"/></div>
                 <div><label className="text-xs opacity-50 block mb-1">Avatar URL</label><input value={form.avatar} onChange={e=>setForm({...form, avatar:e.target.value})} className="w-full bg-white/10 p-2 rounded text-sm"/></div>
                 <div><label className="text-xs opacity-50 block mb-1">Bio</label><textarea value={form.likes} onChange={e=>setForm({...form, likes:e.target.value})} className="w-full bg-white/10 p-2 rounded text-sm resize-none" rows={3}/></div>
             </div>
        </div>
    );
};

const PrivacySettingsModal = ({ theme, onClose, langText }: any) => {
    const [isPublic, setIsPublic] = useState(true);
    const [allowSearch, setAllowSearch] = useState(true);
    return (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in">
             <div className="p-4 flex items-center gap-3 border-b border-white/10 mt-safe">
                 <button onClick={onClose}><ArrowLeft className="text-white"/></button>
                 <span className="font-bold text-white">{langText.live_privacy_title}</span>
             </div>
             <div className="p-6 space-y-6 text-white">
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                     <span className="font-bold text-sm">{langText.live_privacy_public}</span>
                     <button onClick={()=>setIsPublic(!isPublic)} className="transition-transform active:scale-95">
                         {isPublic ? <Unlock className="text-green-500" size={24}/> : <Lock className="text-red-500" size={24}/>}
                     </button>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                     <span className="font-bold text-sm">{langText.live_privacy_search}</span>
                     <button onClick={()=>setAllowSearch(!allowSearch)} className="transition-transform active:scale-95">
                         {allowSearch ? <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black font-bold"><Check size={16}/></div> : <X className="text-red-500" size={24}/>}
                     </button>
                 </div>
             </div>
        </div>
    );
};

const CommentsDrawer = ({ theme, onClose, langText, feedItem }: any) => {
    const [localComments, setLocalComments] = useState<any[]>([
        { id: 1, user: 'Fan_01', text: 'Awesome content! 🔥' },
        { id: 2, user: 'User_X', text: 'Where is this?' },
        { id: 3, user: 'Bot_99', text: 'Hello!' },
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (!input.trim()) return;
        setLocalComments(prev => [...prev, { id: Date.now(), user: 'Me', text: input }]);
        setInput('');
        setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 50);
    };

    return (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in" onClick={onClose}>
            <div className="bg-[#1a1a1a] h-3/4 rounded-t-3xl flex flex-col animate-in slide-in-from-bottom shadow-2xl border-t border-white/10" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center text-white">
                    <span className="font-bold text-sm">{langText.live_comments_title}</span>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                    {localComments.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-600 shrink-0"/>
                            <div>
                                <div className="text-xs font-bold text-white/70">{c.user}</div>
                                <div className="text-sm text-white">{c.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-white/10 flex gap-2 pb-safe">
                    <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={langText.live_comment_ph} 
                        className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-white outline-none focus:bg-white/20 transition-colors"
                        autoFocus
                    />
                    <button onClick={handleSend} className="p-2 bg-pink-600 rounded-full text-white hover:bg-pink-500 active:scale-90 transition-all"><Send size={18}/></button>
                </div>
            </div>
        </div>
    );
};

const ShareSheet = ({ theme, onClose, langText, onNavigate, activeStream }: any) => {
    const [showToast, setShowToast] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://omniterminal.ai/live/${activeStream?.topic || '123'}`);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            onClose();
        }, 1500);
    };

    const handleShareToChat = () => {
        onNavigate('chat', { shareText: `Check out this stream: ${activeStream?.topic || 'Live Stream'} \nhttps://omniterminal.ai/live/123` });
    };

    return (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in" onClick={onClose}>
            <div className="bg-[#1a1a1a] rounded-t-3xl p-6 animate-in slide-in-from-bottom text-white shadow-2xl border-t border-white/10 pb-safe" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-center mb-6 opacity-80">{langText.live_share_title}</h3>
                <div className="flex justify-around mb-8">
                    <button className="flex flex-col items-center gap-2 group" onClick={handleCopy}>
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"><Copy size={24}/></div>
                        <span className="text-xs opacity-70">{langText.live_share_copy}</span>
                    </button>
                     <button className="flex flex-col items-center gap-2 group" onClick={handleShareToChat}>
                        <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center group-hover:bg-green-500 transition-colors"><MessageSquare size={24}/></div>
                        <span className="text-xs opacity-70">{langText.live_share_chat}</span>
                    </button>
                </div>
                <button onClick={onClose} className="w-full py-3 rounded-xl bg-white/5 font-bold text-sm hover:bg-white/10 active:scale-95 transition-all">Cancel</button>
                
                {showToast && (
                    <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in zoom-in">
                        {langText.live_copied}
                    </div>
                )}
            </div>
        </div>
    );
};


export default function OmniLiveApp({ config, setConfig, theme, currentWorld, langText, onNavigate }: Props) {
  const [view, setView] = useState<'feed' | 'setup' | 'room' | 'summary' | 'dashboard' | 'profile'>('feed');
  const [activeStream, setActiveStream] = useState<any>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
      { id: 1, user: 'Neo_Runner', avatar: '', description: 'Night city vibes 🌃 #Cyberpunk', likes: 1240, comments: 45, shares: 12, isLiked: false, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
      { id: 2, user: 'Sarah_Connor', avatar: '', description: 'Training day. Stay safe out there. 🦾', likes: 856, comments: 23, shares: 5, isLiked: false, image: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=800&q=80' },
      { id: 3, user: 'Glitch_01', avatar: '', description: 'System update complete. Hello World.', likes: 3200, comments: 120, shares: 400, isLiked: false, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' }
  ]);
  
  const [topic, setTopic] = useState('');
  const [streamerMode, setStreamerMode] = useState<'me' | 'npc'>('me');
  const [npcId, setNpcId] = useState('');
  const [allowHaters, setAllowHaters] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [streamContentLog, setStreamContentLog] = useState<string[]>([]);
  const [stats, setStats] = useState<StreamStats>({ viewers: 0, likes: 0, coins: 0, duration: 0 });
  const [chatInput, setChatInput] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<{id: number, left: number}[]>([]);
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number|null>(null);
  const [showShare, setShowShare] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const streamTimer = useRef<any>(null);
  const commentTimer = useRef<any>(null);
  const npcActionTimer = useRef<any>(null);
  const isGeneratingRef = useRef(false);

  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const savedContacts = localStorage.getItem('omni_contacts');
    if (savedContacts) setContacts(JSON.parse(savedContacts));
  }, []);

  const toggleFeedLike = (id: number) => {
      setFeedItems(prev => prev.map(item => item.id === id ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 } : item));
  };

  const startStream = () => {
    if (!topic) return;
    const streamerName = streamerMode === 'me' ? config.userProfile.name : contacts.find(c => c.id === npcId)?.name || 'NPC';
    const streamerAvatar = streamerMode === 'me' ? config.userProfile.avatar : contacts.find(c => c.id === npcId)?.avatar;
    setActiveStream({ topic, streamer: streamerName, avatar: streamerAvatar, isMe: streamerMode === 'me', npcId: streamerMode === 'npc' ? npcId : null });
    setComments([]); setStreamContentLog([]); setStats({ viewers: 100, likes: 0, coins: 0, duration: 0 }); setView('room');
  };

  const endStream = () => { setView('summary'); clearInterval(streamTimer.current); clearInterval(commentTimer.current); clearInterval(npcActionTimer.current); };

  const addComment = (user: string, text: string, type: 'normal' | 'fan' | 'hater' | 'gift' | 'host' = 'normal') => {
    setComments(prev => {
        const newComment: Comment = {
            id: Date.now() + Math.random(),
            user,
            text,
            type,
            color: type === 'host' ? 'text-yellow-400' : type === 'gift' ? 'text-pink-400' : type === 'fan' ? 'text-blue-400' : 'text-white'
        };
        return [...prev.slice(-49), newComment];
    });
  };

  const triggerHeart = () => {
      const id = Date.now() + Math.random();
      setFloatingHearts(prev => [...prev, { id, left: Math.random() * 80 + 10 }]);
      setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 2500);
  };

  const callAiHost = async () => {
      if (isGeneratingRef.current || !config.apiKey || !activeStream || !activeStream.npcId) return;
      isGeneratingRef.current = true;

      try {
          const character = contacts.find(c => c.id === activeStream.npcId);
          if (!character) return;

          const recentContext = comments.slice(-3).map(c => `${c.user}: ${c.text}`).join('\n');
          const langInstruction = `Output Language: ${config.language === 'zh' ? 'Chinese' : config.language === 'ja' ? 'Japanese' : 'English'}`;
          
          const systemPrompt = `You are playing the role of a live streamer.
          Character: ${character.name}.
          Personality: ${character.personality}.
          Stream Topic: ${activeStream.topic}.
          Current Stats: ${stats.viewers} viewers.
          
          Task: React to the recent comments or continue discussing the topic.
          Rules:
          1. Keep response very short (max 20 words).
          2. Act naturally as a streamer talking to chat.
          3. ${langInstruction}.
          
          Recent Comments:
          ${recentContext || '(No comments yet)'}`;

          let responseText = "";
          
          if (config.provider === 'gemini') {
             const url = `${config.apiEndpoint}/${config.model}:generateContent?key=${config.apiKey}`;
             const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
                })
             });
             const data = await res.json();
             responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          } else {
             const res = await fetch(`${config.apiEndpoint}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'system', content: systemPrompt }]
                })
             });
             const data = await res.json();
             responseText = data.choices?.[0]?.message?.content;
          }

          if (responseText) {
              setStreamContentLog(prev => [...prev.slice(-4), responseText]);
              addComment(character.name, responseText, 'host');
          }

      } catch (e) {
          console.error("AI Host Error:", e);
      } finally {
          isGeneratingRef.current = false;
      }
  };

  useEffect(() => {
    if (view === 'room') {
        streamTimer.current = setInterval(() => setStats(prev => ({...prev, duration: prev.duration + 1, viewers: prev.viewers + Math.floor(Math.random() * 10 - 3)})), 1000);
        commentTimer.current = setInterval(() => {
            if (Math.random() > 0.4) return;
            let type: any = 'normal';
            if (allowHaters && Math.random() < 0.15) type = 'hater'; else if (Math.random() < 0.2) type = 'fan';
            if (type === 'fan' && Math.random() < 0.3) type = 'gift';
            const langCode = (config.language === 'zh' || config.language === 'ja') ? config.language : 'en';
            const pool = I18N_COMMENTS[langCode][type];
            addComment(`User_${Math.floor(Math.random()*9999)}`, pool[Math.floor(Math.random() * pool.length)], type);
            if (type === 'gift') { setStats(p => ({ ...p, coins: p.coins + 10 })); triggerHeart(); }
            if (type === 'fan') { setStats(p => ({ ...p, likes: p.likes + 1 })); triggerHeart(); }
        }, 1500);
        
        // AI Host Loop (10s interval)
        if (streamerMode === 'npc') {
            npcActionTimer.current = setInterval(callAiHost, 10000);
        }

    } else {
        clearInterval(streamTimer.current);
        clearInterval(commentTimer.current);
        clearInterval(npcActionTimer.current);
    }
    return () => {
        clearInterval(streamTimer.current);
        clearInterval(commentTimer.current);
        clearInterval(npcActionTimer.current);
    };
  }, [view, allowHaters, streamerMode, config.language, activeStream, comments]); // Added deps for AI access

  const handleSendChat = () => {
      if (!chatInput.trim()) return;
      addComment('Me', chatInput, 'normal');
      setChatInput('');
  };

  const handleSendAction = () => {
      if (!actionInput.trim()) return;
      setStreamContentLog(prev => [...prev, `[Host]: ${actionInput}`]);
      addComment(activeStream?.streamer || 'Host', actionInput, 'host');
      setActionInput('');
  };

  const renderFeed = () => (
      <div className="h-full bg-black text-white flex flex-col relative">
          <div className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
              {feedItems.map(item => (
                  <div key={item.id} className="h-full w-full snap-start relative bg-gray-900">
                      <img src={item.image} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute bottom-20 left-4 right-16 space-y-2">
                          <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item.user}`} className="w-full h-full object-cover"/>
                              </div>
                              <span className="font-bold">@{item.user}</span>
                              <button className="bg-pink-600 px-2 py-0.5 rounded text-[10px] font-bold">{langText.live_follow}</button>
                          </div>
                          <p className="text-sm shadow-black drop-shadow-md">{item.description}</p>
                      </div>
                      <div className="absolute bottom-20 right-2 flex flex-col gap-4 items-center">
                           <button onClick={()=>toggleFeedLike(item.id)} className="flex flex-col items-center gap-1">
                               <Heart size={32} className={item.isLiked ? "fill-pink-500 text-pink-500" : "text-white"}/>
                               <span className="text-xs font-bold">{item.likes}</span>
                           </button>
                           <button onClick={() => setActiveCommentId(item.id)} className="flex flex-col items-center gap-1">
                               <MessageCircle size={32} className="text-white"/>
                               <span className="text-xs font-bold">{item.comments}</span>
                           </button>
                           <button onClick={()=>setShowShare(true)} className="flex flex-col items-center gap-1">
                               <Share2 size={32} className="text-white"/>
                               <span className="text-xs font-bold">{item.shares}</span>
                           </button>
                      </div>
                      {activeCommentId === item.id && <CommentsDrawer theme={theme} onClose={() => setActiveCommentId(null)} langText={langText} feedItem={item} />}
                  </div>
              ))}
          </div>
          {/* Moved + button to top right to avoid overlap */}
          <button onClick={() => setView('setup')} className="absolute top-16 right-4 w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-white shadow-lg border-2 border-white z-20 hover:scale-110 transition-transform">
              <Plus size={24}/>
          </button>
          
          <div className="absolute bottom-0 w-full h-16 bg-black flex border-t border-white/10 z-30">
              {['feed', 'dashboard', 'profile'].map(v => (
                  <button key={v} onClick={() => setView(v as any)} className={`flex-1 flex flex-col items-center justify-center ${view === v ? 'text-white' : 'text-gray-500'}`}>
                      {v === 'feed' ? <Video size={24}/> : v === 'dashboard' ? <BarChart2 size={24}/> : <User size={24}/>}
                      <span className="text-[10px] capitalize">{v==='feed'?langText.live_tab_feed:v==='dashboard'?langText.live_tab_dashboard:langText.live_tab_profile}</span>
                  </button>
              ))}
          </div>
          {showShare && <ShareSheet theme={theme} onClose={()=>setShowShare(false)} langText={langText} onNavigate={onNavigate} activeStream={feedItems[0]} />}
      </div>
  );

  const renderSetup = () => (
      <div className="h-full bg-black text-white p-6 flex flex-col animate-in slide-in-from-right">
          <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setView('feed')}><X size={24}/></button>
              <h2 className="text-xl font-bold">{langText.live_setup_title}</h2>
          </div>
          <div className="flex-1 space-y-8">
               <div className="aspect-video bg-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                   {streamerMode === 'me' ? (
                       <img src={config.userProfile.avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=user"} className="w-full h-full object-cover opacity-50"/>
                   ) : (
                       <img src={contacts.find(c=>c.id===npcId)?.avatar || ""} className="w-full h-full object-cover opacity-50"/>
                   )}
                   <Camera size={48} className="absolute opacity-50"/>
                   <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] font-bold uppercase text-red-500 flex items-center gap-1"><Radio size={12}/> {langText.live_off_air}</div>
               </div>
               
               <div className="space-y-4">
                   <div>
                       <label className="text-xs font-bold text-gray-500 mb-1 block">{langText.live_topic}</label>
                       <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Enter stream title..." className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-pink-600 transition-colors"/>
                   </div>
                   
                   <div className="flex gap-4">
                        <button onClick={() => setStreamerMode('me')} className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${streamerMode==='me'?'bg-pink-600/20 border-pink-600 text-pink-500':'bg-gray-900 border-gray-800 text-gray-500'}`}>
                            <User size={24}/> <span className="text-xs font-bold">{langText.live_mode_me}</span>
                        </button>
                        <button onClick={() => setStreamerMode('npc')} className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${streamerMode==='npc'?'bg-purple-600/20 border-purple-600 text-purple-500':'bg-gray-900 border-gray-800 text-gray-500'}`}>
                            <Zap size={24}/> <span className="text-xs font-bold">{langText.live_mode_npc}</span>
                        </button>
                   </div>
                   
                   {streamerMode === 'npc' && (
                       <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                           <label className="text-xs font-bold text-gray-500 mb-2 block">Select NPC</label>
                           <div className="flex gap-2 overflow-x-auto pb-2">
                               {contacts.filter(c => c.id.startsWith('npc')).map(c => (
                                   <button key={c.id} onClick={() => setNpcId(c.id)} className={`flex-shrink-0 w-16 flex flex-col items-center gap-1 opacity-60 hover:opacity-100 ${npcId === c.id ? 'opacity-100 scale-110' : ''} transition-all`}>
                                       <img src={c.avatar} className={`w-12 h-12 rounded-full object-cover shrink-0 border-2 ${npcId === c.id ? 'border-purple-500' : 'border-transparent'}`} />
                                       <span className="text-[10px] truncate w-full text-center">{c.name}</span>
                                   </button>
                               ))}
                           </div>
                       </div>
                   )}

                   <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                       <span className="text-sm font-bold">{langText.live_haters}</span>
                       <button onClick={() => setAllowHaters(!allowHaters)} className={`w-12 h-6 rounded-full transition-colors relative ${allowHaters ? 'bg-red-500' : 'bg-gray-700'}`}>
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowHaters ? 'left-7' : 'left-1'}`}/>
                       </button>
                   </div>
               </div>
          </div>
          <button onClick={startStream} disabled={!topic || (streamerMode==='npc' && !npcId)} className="w-full py-4 bg-pink-600 text-white font-bold rounded-2xl disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-pink-900/50">
              {langText.live_btn_start}
          </button>
      </div>
  );

  const renderRoom = () => (
      <div className="h-full bg-black relative flex flex-col">
          {/* Video Layer */}
          <div className="absolute inset-0 bg-gray-900">
               {activeStream?.avatar && <img src={activeStream.avatar} className="w-full h-full object-cover opacity-60" />}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
          </div>

          {/* HUD Layer */}
          <div className="relative z-10 flex-1 flex flex-col p-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                  <div className="flex gap-2 bg-black/40 rounded-full p-1 pr-4 backdrop-blur-md items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/20">
                        <img src={activeStream?.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div>
                          <div className="text-xs font-bold text-white max-w-[80px] truncate">{activeStream?.streamer}</div>
                          <div className="text-[10px] text-pink-500 flex items-center gap-1"><User size={8}/> {stats.viewers}</div>
                      </div>
                      <button className="ml-2 bg-pink-600 text-white text-[10px] px-2 rounded-full font-bold">{langText.live_follow}</button>
                  </div>
                  <div className="flex gap-2">
                      <div className="bg-black/40 px-3 py-1 rounded-full text-xs font-bold text-yellow-400 backdrop-blur-md flex items-center gap-1"><Gift size={12}/> {stats.coins}</div>
                      <button onClick={endStream} className="bg-red-600/80 p-2 rounded-full text-white"><X size={16}/></button>
                  </div>
              </div>

              {/* Stats / Time */}
              <div className="mt-2 flex gap-2">
                   <div className="bg-black/20 text-[10px] text-white/50 px-2 rounded backdrop-blur">
                       {Math.floor(stats.duration / 60)}:{(stats.duration % 60).toString().padStart(2, '0')}
                   </div>
              </div>

              {/* AI/Stream Log */}
              <div className="mt-4 w-2/3 space-y-1 opacity-80">
                  {streamContentLog.map((log, i) => (
                      <div key={i} className="text-[10px] bg-black/40 text-purple-200 px-2 py-1 rounded-r-lg backdrop-blur-sm animate-in slide-in-from-left">
                          {log}
                      </div>
                  ))}
              </div>

              {/* Floating Hearts */}
              {floatingHearts.map(h => (
                  <div key={h.id} className="absolute bottom-20 text-4xl animate-float-up pointer-events-none" style={{ left: `${h.left}%` }}>
                      <Heart className="fill-pink-500 text-pink-500 drop-shadow-lg" />
                  </div>
              ))}

              <div className="flex-1"></div>

              {/* Comments */}
              <div className="h-1/3 overflow-y-auto mask-image-linear-t space-y-1 mb-4 scrollbar-hide" ref={chatRef}>
                  {comments.map(c => (
                      <div key={c.id} className="text-sm px-2 py-0.5 rounded animate-in slide-in-from-bottom-2">
                          <span className={`font-bold opacity-70 mr-2 ${c.color || 'text-white'}`}>{c.user}:</span>
                          <span className="text-white drop-shadow-md">{c.text}</span>
                      </div>
                  ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 rounded-full flex items-center px-4 backdrop-blur-md border border-white/10">
                      <input 
                          value={activeStream?.isMe ? actionInput : chatInput} 
                          onChange={e => activeStream?.isMe ? setActionInput(e.target.value) : setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (activeStream?.isMe ? handleSendAction() : handleSendChat())}
                          placeholder={activeStream?.isMe ? langText.live_action_ph : langText.live_chat_ph}
                          className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30"
                      />
                      <button onClick={activeStream?.isMe ? handleSendAction : handleSendChat} className="text-pink-500"><Send size={20}/></button>
                  </div>
                  <button onClick={triggerHeart} className="w-10 h-10 rounded-full bg-pink-600/80 flex items-center justify-center text-white active:scale-90 transition-transform">
                      <Heart size={20} className="fill-white"/>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <Gift size={20}/>
                  </button>
              </div>
          </div>
      </div>
  );

  const renderSummary = () => (
      <div className="h-full bg-gray-900 text-white p-8 flex flex-col items-center justify-center animate-in zoom-in">
          <h2 className="text-2xl font-bold mb-8">{langText.live_summary_title}</h2>
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center">
                  <User size={24} className="text-blue-500 mb-2"/>
                  <span className="text-2xl font-bold">{stats.viewers}</span>
                  <span className="text-xs opacity-50">{langText.live_stat_viewers}</span>
              </div>
              <div className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center">
                  <Heart size={24} className="text-pink-500 mb-2"/>
                  <span className="text-2xl font-bold">{stats.likes}</span>
                  <span className="text-xs opacity-50">{langText.live_likes}</span>
              </div>
              <div className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center">
                  <Gift size={24} className="text-yellow-500 mb-2"/>
                  <span className="text-2xl font-bold">{stats.coins}</span>
                  <span className="text-xs opacity-50">{langText.live_stat_coins}</span>
              </div>
              <div className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center">
                  <Radio size={24} className="text-purple-500 mb-2"/>
                  <span className="text-xl font-bold">{Math.floor(stats.duration / 60)}m {stats.duration % 60}s</span>
                  <span className="text-xs opacity-50">{langText.live_duration}</span>
              </div>
          </div>
          <button onClick={() => setView('feed')} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
              Return to Feed
          </button>
      </div>
  );

  const renderDashboard = () => (
      <div className="h-full bg-black text-white p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">{langText.live_studio}</h2>
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-2xl mb-6">
              <div className="text-xs opacity-70 mb-1">{langText.live_dashboard_income}</div>
              <div className="text-3xl font-bold flex items-center gap-2">
                  <Gift size={24} className="text-yellow-400"/> 12,450
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 p-4 rounded-xl">
                  <div className="text-xs opacity-50 mb-2">{langText.live_dashboard_fans}</div>
                  <div className="text-xl font-bold">1.2k</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl">
                  <div className="text-xs opacity-50 mb-2">{langText.live_streams}</div>
                  <div className="text-xl font-bold">42</div>
              </div>
          </div>
          <div className="mb-4 font-bold opacity-50 text-xs uppercase">{langText.live_dashboard_history}</div>
          <div className="space-y-3">
              {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between items-center bg-gray-900 p-4 rounded-xl">
                      <div>
                          <div className="font-bold text-sm">Stream #{100-i}</div>
                          <div className="text-xs opacity-50">2 days ago</div>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-sm text-yellow-500">+450</div>
                          <div className="text-xs opacity-50">{langText.live_stat_coins}</div>
                      </div>
                  </div>
              ))}
          </div>
          {/* Nav */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-black flex border-t border-white/10">
              {['feed', 'dashboard', 'profile'].map(v => (
                  <button key={v} onClick={() => setView(v as any)} className={`flex-1 flex flex-col items-center justify-center ${view === v ? 'text-white' : 'text-gray-500'}`}>
                      {v === 'feed' ? <Video size={24}/> : v === 'dashboard' ? <BarChart2 size={24}/> : <User size={24}/>}
                      <span className="text-[10px] capitalize">{v==='feed'?langText.live_tab_feed:v==='dashboard'?langText.live_tab_dashboard:langText.live_tab_profile}</span>
                  </button>
              ))}
          </div>
      </div>
  );

  const renderProfile = () => (
      <div className="h-full bg-black text-white relative">
          <div className="h-40 bg-gradient-to-b from-gray-800 to-black"></div>
          <div className="px-6 relative -mt-12 text-center">
              <div className="inline-block p-1 bg-black rounded-full">
                  <img src={config.userProfile.avatar} className="w-24 h-24 rounded-full border-2 border-white/20 object-cover shrink-0"/>
              </div>
              <h2 className="text-xl font-bold mt-2">{config.userProfile.name}</h2>
              <div className="text-xs opacity-50 mb-4">UID: {config.userProfile.uid || '10001'}</div>
              
              <div className="flex justify-center gap-8 mb-6 border-b border-white/10 pb-6">
                  <div className="text-center">
                      <div className="font-bold text-lg">142</div>
                      <div className="text-[10px] opacity-50">{langText.live_following}</div>
                  </div>
                  <div className="text-center">
                      <div className="font-bold text-lg">8.5k</div>
                      <div className="text-[10px] opacity-50">{langText.live_profile_followers}</div>
                  </div>
                  <div className="text-center">
                      <div className="font-bold text-lg">24k</div>
                      <div className="text-[10px] opacity-50">{langText.live_likes}</div>
                  </div>
              </div>

              <div className="space-y-2">
                  <button onClick={() => setShowEditProfile(true)} className="w-full py-3 bg-gray-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <Edit3 size={16}/> {langText.live_profile_edit}
                  </button>
                  <button onClick={() => setShowPrivacy(true)} className="w-full py-3 bg-gray-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <Settings size={16}/> {langText.live_privacy_title}
                  </button>
              </div>
          </div>
          
          {/* Nav */}
          <div className="absolute bottom-0 w-full h-16 bg-black flex border-t border-white/10">
              {['feed', 'dashboard', 'profile'].map(v => (
                  <button key={v} onClick={() => setView(v as any)} className={`flex-1 flex flex-col items-center justify-center ${view === v ? 'text-white' : 'text-gray-500'}`}>
                      {v === 'feed' ? <Video size={24}/> : v === 'dashboard' ? <BarChart2 size={24}/> : <User size={24}/>}
                      <span className="text-[10px] capitalize">{v==='feed'?langText.live_tab_feed:v==='dashboard'?langText.live_tab_dashboard:langText.live_tab_profile}</span>
                  </button>
              ))}
          </div>
          {showEditProfile && <EditProfileModal config={config} setConfig={setConfig} theme={theme} onClose={() => setShowEditProfile(false)} langText={langText} />}
          {showPrivacy && <PrivacySettingsModal theme={theme} onClose={() => setShowPrivacy(false)} langText={langText} />}
      </div>
  );

  switch(view) {
      case 'setup': return renderSetup();
      case 'room': return renderRoom();
      case 'summary': return renderSummary();
      case 'dashboard': return renderDashboard();
      case 'profile': return renderProfile();
      default: return renderFeed();
  }
}