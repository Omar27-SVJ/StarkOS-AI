
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";
import { TRAINING_PROMPT } from '../constants';
import { analyzeProfileFromTraining } from '../services/geminiService';

interface TrainingViewProps {
  onUpdateProfile: (newProfile: Partial<UserProfile>) => void;
  profile: UserProfile;
}

const TrainingView: React.FC<TrainingViewProps> = ({ onUpdateProfile, profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isStark = profile.uiTheme === 'stark';

  useEffect(() => {
    if (messages.length === 0) {
      startTraining();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const startTraining = async () => {
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: TRAINING_PROMPT }] }]
      });

      setMessages([{
        id: 'init',
        role: 'assistant',
        content: response.text || "I'm ready to learn. How would you describe your typical communication style?",
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config: { systemInstruction: TRAINING_PROMPT }
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "Fascinating. Tell me more.",
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSyncProfile = async () => {
    setIsAnalyzing(true);
    const updatedData = await analyzeProfileFromTraining(messages);
    if (updatedData) {
      onUpdateProfile(updatedData);
      // Play a success sound
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0, now + i * 0.1);
        g.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
        g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.2);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className={`flex flex-col h-full ${!isStark ? 'bg-white' : ''}`}>
      <div className={`p-6 border-b flex justify-between items-center transition-all ${
        isStark ? 'glass border-cyan-500/20' : 'bg-white border-slate-100'
      }`}>
        <div>
          <h2 className={`text-xl font-bold ${isStark ? 'font-heading text-white' : 'text-slate-800'}`}>
            {isStark ? 'Neural Training' : 'Profile Learning'}
          </h2>
          <p className={`text-sm ${isStark ? 'text-cyan-400/60' : 'text-slate-400'}`}>
            Share your thoughts to refine your digital shadow.
          </p>
        </div>
        <button 
          onClick={handleSyncProfile}
          disabled={messages.length < 3 || isAnalyzing}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-bold transition-all ${
            messages.length >= 3 && !isAnalyzing
            ? (isStark ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'bg-emerald-500 hover:bg-emerald-400 text-white') 
            : (isStark ? 'bg-slate-900 text-slate-700 border border-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
          }`}
        >
          {isAnalyzing ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            <i className="fa-solid fa-sync"></i>
          )}
          <span className="uppercase text-[10px] tracking-widest">{isAnalyzing ? "Analyzing..." : "Sync Personality"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        <div className={`border rounded-2xl p-4 text-sm flex items-start space-x-3 mb-4 transition-all ${
          isStark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200' : 'bg-blue-50 border-blue-100 text-blue-700'
        }`}>
          <i className="fa-solid fa-circle-info mt-1"></i>
          <p>This session is used to build your behavioral model. Be as honest and expressive as possible. Once you've chatted enough, click "Sync Personality".</p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 shadow-sm transition-all ${
              msg.role === 'user' 
              ? (isStark ? 'bg-cyan-900/30 text-white rounded-none border border-cyan-500/30 clip-path-stark-right' : 'bg-slate-700 text-white rounded-2xl rounded-tr-none') 
              : (isStark ? 'glass text-cyan-100 rounded-none border border-cyan-500/20 clip-path-stark-left' : 'bg-slate-50 text-slate-800 rounded-2xl rounded-tl-none border border-slate-100')
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className={`px-6 py-4 flex items-center space-x-2 ${isStark ? 'glass' : 'bg-slate-50 rounded-2xl'}`}>
               <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isStark ? 'bg-cyan-400' : 'bg-slate-400'}`} style={{ animationDelay: '0ms' }}></div>
               <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isStark ? 'bg-cyan-400' : 'bg-slate-400'}`} style={{ animationDelay: '150ms' }}></div>
               <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isStark ? 'bg-cyan-400' : 'bg-slate-400'}`} style={{ animationDelay: '300ms' }}></div>
             </div>
           </div>
        )}
      </div>

      <div className={`p-6 border-t transition-all ${
        isStark ? 'bg-slate-950/80 border-cyan-500/20' : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-4xl mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isStark ? "COMMUNICATE TO SYSTEM..." : "Respond to learning prompt..."}
            className={`w-full pl-6 pr-14 py-4 outline-none transition-all border ${
              isStark 
              ? 'glass bg-slate-900/40 text-cyan-50 rounded-none border-cyan-500/30 focus:border-cyan-400' 
              : 'bg-slate-50 text-slate-900 rounded-2xl border-slate-100 focus:bg-white'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all ${
              input.trim() && !isTyping 
              ? (isStark ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-white shadow-lg') 
              : (isStark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400')
            }`}
          >
            <i className={`fa-solid ${isStark ? 'fa-chevron-up' : 'fa-paper-plane'}`}></i>
          </button>
        </div>
      </div>
      
      {isStark && (
        <style>{`
          .clip-path-stark-right { clip-path: polygon(0% 0%, 95% 0%, 100% 15%, 100% 100%, 5% 100%, 0% 85%); }
          .clip-path-stark-left { clip-path: polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%); }
        `}</style>
      )}
    </div>
  );
};

export default TrainingView;
