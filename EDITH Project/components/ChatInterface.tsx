
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TaskComplexity, UserProfile } from '../types';
import { generateEgoResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  profile: UserProfile;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [complexity, setComplexity] = useState<TaskComplexity>(TaskComplexity.SIMPLE);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isStark = profile.uiTheme === 'stark';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      complexity
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateEgoResponse(input, messages, profile, complexity);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || (isStark ? 'SYNC_ERROR: RE-LINKING REQUIRED.' : 'Sorry, I encountered an error. Please try again.'),
        timestamp: new Date(),
        complexity
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col h-full relative ${!isStark ? 'bg-white font-sans text-slate-900' : ''}`}>
      <div className={`p-6 border-b flex justify-between items-center glass sticky top-0 z-20 transition-all ${
        isStark ? 'border-cyan-500/20' : 'border-slate-100 bg-white/80 backdrop-blur-xl'
      }`}>
        <div className="flex items-center space-x-4">
          {isStark && <div className="w-2 h-8 bg-cyan-500"></div>}
          <div>
            <h2 className={`text-xl font-bold ${isStark ? 'font-heading text-white' : 'text-slate-800'}`}>
              {isStark ? 'Tactical Analysis' : profile.assistantName}
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${isStark ? 'text-cyan-400/70' : 'text-slate-400'}`}>
              <span className={`mr-2 w-1.5 h-1.5 rounded-full animate-pulse ${isStark ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
              {isStark ? `Linked to ${profile.assistantName} Core` : 'Assistant Active'}
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 p-1 rounded transition-all ${
          isStark ? 'bg-slate-950/80 border border-cyan-500/30' : 'bg-slate-100'
        }`}>
          <button
            onClick={() => setComplexity(TaskComplexity.SIMPLE)}
            className={`px-3 py-1 text-[10px] font-black tracking-widest transition-all rounded ${
              complexity === TaskComplexity.SIMPLE 
              ? (isStark ? 'bg-cyan-500 text-slate-950' : 'bg-white text-slate-800 shadow-sm') 
              : (isStark ? 'text-cyan-500/50 hover:text-cyan-400' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            {isStark ? 'QUICK_CALC' : 'SIMPLE'}
          </button>
          <button
            onClick={() => setComplexity(TaskComplexity.ADVANCED)}
            className={`px-3 py-1 text-[10px] font-black tracking-widest transition-all rounded ${
              complexity === TaskComplexity.ADVANCED 
              ? (isStark ? 'bg-red-600 text-white' : 'bg-slate-800 text-white') 
              : (isStark ? 'text-red-600/50 hover:text-red-400' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            {isStark ? 'DEEP_REASONING' : 'ADVANCED'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-30">
            {isStark ? (
              <div className="w-24 h-24 border-2 border-dashed border-cyan-500/40 rounded-full flex items-center justify-center mb-6 animate-[rotate-slow_20s_linear_infinite]">
                <i className="fa-solid fa-microchip text-4xl text-cyan-400"></i>
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-comment-dots text-3xl text-slate-400"></i>
              </div>
            )}
            <h3 className={`text-lg font-bold mb-2 ${isStark ? 'text-cyan-400 font-heading' : 'text-slate-800'}`}>
              {isStark ? 'Awaiting Input' : `How can I help you today?`}
            </h3>
            <p className="text-sm uppercase tracking-tighter">
              {isStark ? 'Enter tactical query or deployment instructions.' : 'I am synced to your communication style and ready to assist.'}
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] transition-all p-5 ${
              msg.role === 'user' 
              ? (isStark ? 'bg-cyan-900/20 border-cyan-500/30 text-white clip-path-stark-right border' : 'bg-slate-100 text-slate-800 rounded-2xl rounded-tr-none') 
              : (isStark ? 'bg-slate-900/40 border-slate-700 text-cyan-50 clip-path-stark-left border' : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-2xl rounded-tl-none')
            }`}>
              {msg.role === 'assistant' && msg.complexity === TaskComplexity.ADVANCED && (
                 <div className={`flex items-center space-x-2 mb-3 pb-2 border-b ${isStark ? 'border-red-500/30' : 'border-slate-100'}`}>
                    <i className={`fa-solid fa-atom text-[10px] animate-spin ${isStark ? 'text-red-500' : 'text-blue-500'}`}></i>
                    <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${isStark ? 'text-red-500' : 'text-slate-400'}`}>
                      {isStark ? 'Priority Reasoning Engine Active' : 'Step-by-step Thinking...'}
                    </span>
                 </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium tracking-wide">{msg.content}</div>
              <div className={`text-[9px] mt-3 font-bold opacity-30 flex items-center ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${isStark ? 'font-heading' : ''}`}>
                <span className="mx-2">{isStark ? `TIMESTAMP_${msg.timestamp.getTime()}` : msg.timestamp.toLocaleTimeString()}</span>
                {isStark && <i className="fa-solid fa-caret-right"></i>}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`px-4 py-2 flex items-center space-x-2 ${isStark ? 'glass border-l-4 border-l-cyan-400' : 'bg-slate-50 rounded-xl'}`}>
               <span className={`text-[10px] font-bold animate-pulse tracking-widest uppercase ${isStark ? 'text-cyan-400' : 'text-slate-400'}`}>
                 {isStark ? 'Analyzing_Probabilities...' : 'Typing...'}
               </span>
            </div>
          </div>
        )}
      </div>

      <div className={`p-6 border-t transition-all ${
        isStark ? 'bg-slate-950/80 border-cyan-500/20' : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-4xl mx-auto relative group">
          {isStark && <div className="absolute -top-3 left-6 px-2 bg-slate-950 text-[9px] font-bold text-cyan-500/60 z-10">USER_COMMAND_INPUT</div>}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={complexity === TaskComplexity.ADVANCED 
              ? (isStark ? "INITIATE DEEP ANALYTICS..." : "Describe your complex request...") 
              : (isStark ? "SEND COMMAND..." : "How can I help?")}
            className={`w-full text-sm font-medium pl-6 pr-14 py-4 outline-none resize-none min-h-[60px] max-h-40 transition-all border ${
              isStark 
              ? 'glass bg-slate-900/40 text-cyan-50 rounded-none border-cyan-500/30 focus:border-cyan-400 placeholder-cyan-900' 
              : 'bg-slate-50 text-slate-900 rounded-2xl border-slate-100 focus:bg-white focus:border-blue-200 placeholder-slate-400'
            }`}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center transition-all rounded-xl ${
              input.trim() && !isTyping 
              ? (isStark ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.5)]' : 'bg-slate-900 text-white') 
              : (isStark ? 'bg-slate-900 text-slate-700' : 'bg-slate-100 text-slate-300')
            }`}
          >
            <i className={`fa-solid ${isStark ? 'fa-chevron-up' : 'fa-paper-plane'}`}></i>
          </button>
        </div>
      </div>
      
      {isStark && (
        <style>{`
          .clip-path-stark-right {
            clip-path: polygon(0% 0%, 95% 0%, 100% 15%, 100% 100%, 5% 100%, 0% 85%);
          }
          .clip-path-stark-left {
            clip-path: polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%);
          }
          @keyframes flicker-text {
            0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; }
            20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.4; }
          }
          .flicker-text { animation: flicker-text 2s infinite; }
        `}</style>
      )}
    </div>
  );
};

export default ChatInterface;
