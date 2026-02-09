
export enum TaskComplexity {
  SIMPLE = 'SIMPLE',
  ADVANCED = 'ADVANCED'
}

export interface UserProfile {
  name: string;
  assistantName: string;
  occupation: string;
  bio: string;
  interests: string[];
  communicationStyle: string;
  decisionFramework: string;
  preferences: string[];
  toneIntensity: number; // 1 to 10
  voiceType: 'male' | 'female';
  uiTheme: 'simple' | 'stark';
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  complexity?: TaskComplexity;
}

export type ViewState = 'chat' | 'training' | 'voice' | 'profile';
