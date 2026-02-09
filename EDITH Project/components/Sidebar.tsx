
import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  uiTheme?: 'simple' | 'stark';
  assistantName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, uiTheme = 'stark', assistantName }) => {
  const isStark = uiTheme === 'stark';

  const navItems = [
    { id: 'chat', label: isStark ? 'Tactical' : 'Chat', icon: isStark ? 'fa-microchip' : 'fa-message' },
    { id: 'training', label: isStark ? 'Cognitive Sync' : 'Profile AI', icon: isStark ? 'fa-brain' : 'fa-dna' },
    { id: 'voice', label: isStark ? assistantName.toUpperCase() : 'Voice', icon: isStark ? 'fa-wave-square' : 'fa-microphone' },
    { id: 'profile', label: isStark ? 'System Config' : 'Settings', icon: isStark ? 'fa-terminal' : 'fa-gear' },
  ];

  return (
    <aside className={`w-20 md:w-64 border-r h-screen flex flex-col transition-all duration-300 z-50 ${
      isStark ? 'glass border-cyan-500/20' : 'bg-white border-slate-100'
    }`}>
      <div className={`p-6 ${isStark ? 'border-b border-cyan-500/20' : ''}`}>
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative">
            <div className={`w-10 h-10 border flex items-center justify-center transition-all ${
              isStark 
              ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_10px_rgba(0,242,255,0.3)] animate-pulse' 
              : 'bg-slate-900 border-slate-800 rounded-xl'
            }`}>
              <i className={`fa-solid ${isStark ? 'fa-shield-halved text-cyan-400' : 'fa-ghost text-white'} text-xl`}></i>
            </div>
            {isStark && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
          </div>
          <div className="hidden md:block">
            <span className={`text-xl tracking-tighter transition-all ${isStark ? 'font-heading font-black text-white' : 'font-sans font-bold text-slate-800'}`}>
              {isStark ? 'STARK' : 'Ego'}<span className={isStark ? 'text-cyan-400' : 'text-slate-400'}>{isStark ? 'OS' : 'Sync'}</span>
            </span>
            {isStark && <div className="text-[8px] text-cyan-500/50 font-bold tracking-[0.3em]">INDUSTRIES</div>}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-8">
        {!isStark && <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main</div>}
        {isStark && <div className="px-3 mb-4 text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Subsystems</div>}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewState)}
            className={`w-full flex items-center p-3 transition-all duration-200 group relative rounded-xl ${
              currentView === item.id 
              ? (isStark ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 rounded-none' : 'bg-slate-100 text-slate-900') 
              : (isStark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600')
            }`}
          >
            {isStark && currentView === item.id && (
               <div className="absolute right-0 w-1 h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,1)]"></div>
            )}
            <i className={`fa-solid ${item.icon} w-6 text-lg transition-transform group-hover:scale-110`}></i>
            <span className={`hidden md:block ml-4 text-xs font-black uppercase tracking-widest ${!isStark ? 'font-sans' : ''}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={`p-4 mt-auto ${isStark ? 'border-t border-cyan-500/10' : ''}`}>
        <div className={`hidden md:block p-3 border transition-all ${
          isStark ? 'bg-slate-950/50 border-cyan-500/10' : 'bg-slate-50 border-slate-100 rounded-2xl'
        }`}>
          <div className="flex justify-between items-center mb-2">
             <span className={`text-[9px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>
               {isStark ? 'Power Core' : 'Status'}
             </span>
             <span className={`text-[9px] font-bold ${isStark ? 'text-cyan-400' : 'text-emerald-500'}`}>
               {isStark ? '98%' : 'ONLINE'}
             </span>
          </div>
          <div className={`h-1 w-full rounded-full overflow-hidden ${isStark ? 'bg-slate-800' : 'bg-slate-200'}`}>
             <div className={`h-full transition-all duration-1000 ${
               isStark ? 'bg-cyan-500 w-[98%] shadow-[0_0_5px_rgba(0,242,255,0.8)]' : 'bg-emerald-500 w-full'
             }`}></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
