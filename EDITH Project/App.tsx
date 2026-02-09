
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ProfileView from './components/ProfileView';
import VoiceView from './components/VoiceView';
import TrainingView from './components/TrainingView';
import { ViewState, UserProfile } from './types';
import { DEFAULT_PROFILE } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('chat');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ego_sync_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrations / Defaults
        if (!parsed.assistantName) parsed.assistantName = DEFAULT_PROFILE.assistantName;
        if (!parsed.voiceType) parsed.voiceType = DEFAULT_PROFILE.voiceType;
        if (!parsed.uiTheme) parsed.uiTheme = DEFAULT_PROFILE.uiTheme;
        if (parsed.occupation === undefined) parsed.occupation = DEFAULT_PROFILE.occupation;
        if (parsed.bio === undefined) parsed.bio = DEFAULT_PROFILE.bio;
        if (parsed.interests === undefined) parsed.interests = DEFAULT_PROFILE.interests;
        return parsed;
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const isStark = userProfile.uiTheme === 'stark';

  useEffect(() => {
    localStorage.setItem('ego_sync_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateProfile = (newData: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...newData,
      lastUpdated: new Date().toISOString()
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface profile={userProfile} />;
      case 'training':
        return <TrainingView onUpdateProfile={updateProfile} profile={userProfile} />;
      case 'voice':
        return <VoiceView profile={userProfile} />;
      case 'profile':
        return <ProfileView profile={userProfile} onUpdate={updateProfile} />;
      default:
        return <ChatInterface profile={userProfile} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-700 ${
      isStark ? 'bg-slate-950 text-slate-100 font-sans' : 'bg-slate-50 text-slate-900 font-sans'
    }`}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        uiTheme={userProfile.uiTheme}
        assistantName={userProfile.assistantName}
      />
      <main className={`flex-1 relative overflow-hidden transition-all duration-700 ${
        isStark ? 'bg-slate-950 grid-bg' : 'bg-white shadow-inner'
      }`}>
        {isStark && (
          <>
            <div className="absolute top-0 right-0 p-4 z-0 pointer-events-none opacity-20">
               <div className="w-64 h-64 border border-cyan-500/20 rounded-full animate-[rotate-slow_60s_linear_infinite] flex items-center justify-center">
                  <div className="w-48 h-48 border border-dashed border-cyan-500/10 rounded-full animate-[rotate-fast_40s_linear_infinite]"></div>
               </div>
            </div>
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-cyan-500/20 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-cyan-500/20 pointer-events-none"></div>
          </>
        )}
        
        <div className="h-full relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
