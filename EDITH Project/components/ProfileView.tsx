
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate }) => {
  const isStark = profile.uiTheme === 'stark';
  const [newInterest, setNewInterest] = useState('');

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      onUpdate({ interests: [...profile.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    onUpdate({ interests: profile.interests.filter(i => i !== interest) });
  };

  return (
    <div className={`h-full overflow-y-auto p-8 max-w-4xl mx-auto ${!isStark ? 'font-sans text-slate-900 bg-white' : ''}`}>
      <div className="mb-12 text-center">
        <div className={`w-24 h-24 rounded-full p-1 mx-auto mb-6 shadow-2xl transition-all duration-700 ${
          isStark ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 shadow-cyan-500/20' : 'bg-slate-200 shadow-slate-200/20'
        }`}>
          <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${isStark ? 'bg-slate-900' : 'bg-white'}`}>
             <i className={`fa-solid fa-user-astronaut text-4xl ${isStark ? 'text-white' : 'text-slate-800'}`}></i>
          </div>
        </div>
        <h1 className={`text-4xl font-bold mb-2 ${isStark ? 'font-heading text-white' : 'text-slate-800'}`}>System Configuration</h1>
        <p className="text-slate-400 uppercase text-[10px] tracking-[0.3em]">Neural Link Status: <span className="text-emerald-500">OPTIMIZED</span></p>
      </div>

      <div className="space-y-8 pb-12">
        {/* User Identity Section */}
        <div className={`glass p-8 rounded-3xl border transition-all ${
          isStark ? 'border-cyan-500/30' : 'border-slate-100 bg-white shadow-sm'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-[0.4em] mb-8 flex items-center ${isStark ? 'text-cyan-400' : 'text-slate-500'}`}>
            <i className="fa-solid fa-id-card mr-3"></i>
            User Biometric Data
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</label>
              <input 
                type="text"
                value={profile.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                  isStark ? 'bg-slate-900/50 border-slate-700 text-slate-100 focus:border-cyan-500' : 'bg-slate-50 border-slate-100 focus:bg-white'
                }`}
                placeholder="User identification..."
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>Occupation</label>
              <input 
                type="text"
                value={profile.occupation}
                onChange={(e) => onUpdate({ occupation: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                  isStark ? 'bg-slate-900/50 border-slate-700 text-slate-100 focus:border-cyan-500' : 'bg-slate-50 border-slate-100 focus:bg-white'
                }`}
                placeholder="Core function..."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>Cognitive Bio / Background</label>
              <textarea 
                value={profile.bio}
                onChange={(e) => onUpdate({ bio: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl outline-none border transition-all min-h-[100px] resize-none ${
                  isStark ? 'bg-slate-900/50 border-slate-700 text-slate-100 focus:border-cyan-500' : 'bg-slate-50 border-slate-100 focus:bg-white'
                }`}
                placeholder="Detailed user background for assistant personalization..."
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>Interests & Expertise</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.interests.map((interest, i) => (
                  <span key={i} className={`px-3 py-1 text-xs rounded-full flex items-center space-x-2 ${
                    isStark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span>{interest}</span>
                    <button onClick={() => removeInterest(interest)} className="hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input 
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                  className={`flex-1 px-4 py-2 rounded-xl outline-none border transition-all text-sm ${
                    isStark ? 'bg-slate-900/50 border-slate-700 text-slate-100 focus:border-cyan-500' : 'bg-slate-50 border-slate-100 focus:bg-white'
                  }`}
                  placeholder="Add interest/skill..."
                />
                <button 
                  onClick={addInterest}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${
                    isStark ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-white'
                  }`}
                >Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Assistant Identity Section */}
        <div className={`glass p-8 rounded-3xl border transition-all ${
          isStark ? 'border-cyan-500/20' : 'border-slate-100 bg-white shadow-sm'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-[0.4em] mb-8 flex items-center ${isStark ? 'text-cyan-400' : 'text-slate-500'}`}>
            <i className="fa-solid fa-robot mr-3"></i>
            Assistant Personality
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>Assistant Call-sign</label>
              <input 
                type="text"
                value={profile.assistantName}
                onChange={(e) => onUpdate({ assistantName: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl outline-none border transition-all text-lg font-bold ${
                  isStark ? 'bg-slate-900/50 border-slate-700 text-cyan-400 font-heading' : 'bg-slate-50 border-slate-100 text-slate-900'
                }`}
                placeholder="Assistant name..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <label className={`text-[10px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>Interface Protocol</label>
                 <div className="flex space-x-2">
                    <button
                      onClick={() => onUpdate({ uiTheme: 'simple' })}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all text-[10px] ${
                        profile.uiTheme === 'simple'
                        ? 'bg-slate-900 text-white border-slate-800'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >MINIMALIST</button>
                    <button
                      onClick={() => onUpdate({ uiTheme: 'stark' })}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all text-[10px] ${
                        profile.uiTheme === 'stark'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                        : 'bg-slate-900/50 text-slate-600 border-slate-700'
                      }`}
                    >STARK HUD</button>
                 </div>
               </div>

               <div className="space-y-4">
                 <label className={`text-[10px] font-bold uppercase tracking-widest ${isStark ? 'text-slate-500' : 'text-slate-400'}`}>Vocal Matrix</label>
                 <div className="flex space-x-2">
                    <button
                      onClick={() => onUpdate({ voiceType: 'female' })}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all text-[10px] flex items-center justify-center space-x-2 ${
                        profile.voiceType === 'female'
                        ? (isStark ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-white border-slate-700')
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      <i className="fa-solid fa-venus"></i>
                      <span>FEMALE</span>
                    </button>
                    <button
                      onClick={() => onUpdate({ voiceType: 'male' })}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all text-[10px] flex items-center justify-center space-x-2 ${
                        profile.voiceType === 'male'
                        ? (isStark ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-white border-slate-700')
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      <i className="fa-solid fa-mars"></i>
                      <span>MALE</span>
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div className="text-center text-slate-500 text-[10px] uppercase tracking-widest pt-8 border-t border-slate-800/20">
          Last synchronization: {new Date(profile.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
