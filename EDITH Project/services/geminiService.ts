
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, ChatMessage, TaskComplexity } from "../types";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";

// Always initialize GoogleGenAI with the API key from process.env.API_KEY using named parameters
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEgoResponse = async (
  message: string, 
  history: ChatMessage[], 
  profile: UserProfile,
  complexity: TaskComplexity
) => {
  const modelName = complexity === TaskComplexity.ADVANCED ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
  
  contents.push({ role: 'user', parts: [{ text: message }] });

  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION_BASE(profile),
    temperature: 0.7,
  };

  // Enable thinking budget for complex tasks on Gemini 3 models
  if (complexity === TaskComplexity.ADVANCED) {
    config.thinkingConfig = { thinkingBudget: 4000 };
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config
  });

  // Extract text property from response
  return response.text;
};

export const analyzeProfileFromTraining = async (trainingHistory: ChatMessage[]) => {
  const historyText = trainingHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this conversation, summarize the user's profile in JSON format.
    
    CONVERSATION:
    ${historyText}
    
    REQUIRED JSON FORMAT:
    {
      "communicationStyle": "string",
      "decisionFramework": "string",
      "preferences": ["string", "string"],
      "toneIntensity": number (1-10)
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          communicationStyle: { type: Type.STRING },
          decisionFramework: { type: Type.STRING },
          preferences: { type: Type.ARRAY, items: { type: Type.STRING } },
          toneIntensity: { type: Type.NUMBER }
        },
        required: ["communicationStyle", "decisionFramework", "preferences", "toneIntensity"]
      }
    }
  });

  try {
    // response.text directly returns the extracted string output
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse profile analysis", e);
    return null;
  }
};
