
import React, { useMemo } from 'react';

interface VoiceAvatarProps {
  isActive: boolean;
  isConnecting: boolean;
  isTalking?: boolean;
  assistantName: string;
}

const VoiceAvatar: React.FC<VoiceAvatarProps> = ({ isActive, isConnecting, isTalking, assistantName }) => {
  // Format name to have dots between letters like J.A.R.V.I.S.
  const formattedName = assistantName.toUpperCase().split('').join('.');
  const finalName = formattedName + (formattedName.length > 0 ? '.' : '');

  // Calculate dynamic size based on name length
  const sizeMultiplier = useMemo(() => {
    const charCount = finalName.length;
    // We want the circle to grow a bit to accommodate names, but stay tight
    if (charCount <= 6) return 1; 
    return 1 + (charCount - 6) * 0.045; 
  }, [finalName]);

  const baseWidth = 320; 
  const containerSize = baseWidth * sizeMultiplier;
  const coreSize = 210 * sizeMultiplier; 

  // Aggressive font sizing to make it "barely fit"
  const fontSize = useMemo(() => {
    const charCount = finalName.length;
    if (charCount <= 4) return '3rem';
    if (charCount <= 8) return '2.5rem';
    if (charCount <= 12) return '2rem';
    return '1.5rem';
  }, [finalName]);

  return (
    <div 
      className="relative flex items-center justify-center select-none transition-all duration-500"
      style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
    >
      {/* Outer Glow */}
      <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${
        isActive ? 'bg-cyan-500/30 scale-125 opacity-100' : 'bg-blue-900/10 scale-100 opacity-30'
      }`}></div>

      {/* Main Outer HUD Ring */}
      <div className="absolute w-[95%] h-[95%] border border-cyan-500/10 rounded-full"></div>

      {/* Rotating Ring 1 - Outer Tech segments */}
      <div 
        className={`absolute w-full h-full border-t-[3px] border-b-[3px] border-l-0 border-r-0 border-cyan-400/40 rounded-full`}
        style={{ animation: isActive ? 'rotate-slow 12s linear infinite' : 'none' }}
      ></div>

      {/* Rotating Ring 2 - Thick segmented ring */}
      <div 
        className={`absolute w-[82%] h-[82%] border-[12px] border-cyan-500/10 rounded-full border-t-cyan-400/60 border-l-cyan-400/20`}
        style={{ animation: isActive ? 'rotate-fast 8s linear infinite' : 'none' }}
      ></div>

      {/* Rotating Ring 3 - Dashed internal circle */}
      <div 
        className={`absolute w-[68%] h-[68%] border-2 border-dashed border-cyan-300/30 rounded-full`}
        style={{ animation: isActive ? 'rotate-slow 20s linear reverse infinite' : 'none' }}
      ></div>

      {/* Core Interface */}
      <div 
        className={`relative rounded-full flex flex-col items-center justify-center transition-all duration-700 ${
          isActive 
          ? 'bg-cyan-500/5 border border-cyan-400/40 shadow-[inset_0_0_40px_rgba(0,242,255,0.1)]' 
          : 'bg-slate-900/80 border border-slate-700'
        }`}
        style={{ width: `${coreSize}px`, height: `${coreSize}px` }}
      >
        
        {/* Pulsing Visualizer Core */}
        <div 
          className={`absolute rounded-full transition-all duration-500 ${
            isTalking ? 'scale-105 opacity-60' : 'scale-100 opacity-20'
          } ${isActive ? 'bg-radial-gradient from-cyan-500/40 via-blue-600/10 to-transparent' : 'bg-slate-800/20'}`}
          style={{ width: '92%', height: '92%' }}
        ></div>

        {/* Assistant Name Display - Barely fitting within the bounds */}
        <div className="z-20 text-center px-1 w-full overflow-hidden">
          <h1 className={`font-black font-heading tracking-[0.1em] transition-all duration-500 whitespace-nowrap ${
            isActive ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]' : 'text-slate-600'
          }`}
          style={{ fontSize, lineHeight: '1' }}
          >
            {finalName}
          </h1>
          
          {/* Subtext info */}
          <div className={`mt-1 text-[7px] font-bold tracking-[0.3em] uppercase transition-all duration-500 ${
            isActive ? 'text-cyan-400/80' : 'text-slate-700'
          }`}>
            {isActive ? 'Interface Active' : 'Standby Mode'}
          </div>
        </div>

        {/* Dynamic Visualizer Bars */}
        <div className="absolute bottom-[15%] flex items-end space-x-1 h-6">
          {[1,2,3,4,3,2,1].map((h, i) => (
            <div 
              key={i} 
              className={`w-[1.5px] transition-all duration-200 ${isActive ? 'bg-cyan-400' : 'bg-slate-800'}`}
              style={{ 
                height: isTalking ? `${h * 4}px` : isActive ? '3px' : '1px',
                animation: isTalking ? `pulse-glow ${0.4 + i*0.05}s infinite ease-in-out` : 'none',
                opacity: isActive ? 0.8 : 0.3
              }}
            ></div>
          ))}
        </div>
        
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-950/60 rounded-full">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-cyan-400"></i>
          </div>
        )}

        {/* Orange Accent Clip */}
        {isActive && (
           <div className="absolute -bottom-1 left-[15%] w-12 h-3 border-l-2 border-b-2 border-orange-500/60 rounded-bl-lg"></div>
        )}
      </div>

      {/* Side HUD Telemetry Tags */}
      {isActive && (
        <>
          <div className="absolute -top-4 -right-8 glass px-2 py-0.5 text-[8px] border-l-2 border-l-cyan-400 font-heading">
            <div className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-white">LINK_SYNC</span>
            </div>
          </div>
          
          <div className="absolute -bottom-4 -left-8 glass px-2 py-0.5 text-[8px] border-r-2 border-r-cyan-400 font-heading">
            <div className="text-cyan-400">LOAD</div>
          </div>
        </>
      )}

      <style>{`
        .bg-radial-gradient {
          background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
        }
      `}</style>
    </div>
  );
};

export default VoiceAvatar;
