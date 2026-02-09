
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { UserProfile } from '../types';
import { SYSTEM_INSTRUCTION_BASE } from '../constants';
import VoiceAvatar from './VoiceAvatar';

interface VoiceViewProps { profile: UserProfile; }

const VoiceView: React.FC<VoiceViewProps> = ({ profile }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Tech Sound Effects Generator - Cinematic 3-second sequence
  const playTechSound = (type: 'start' | 'stop') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    if (type === 'start') {
      // 1. Initial Power-up Drone (3 seconds)
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      drone.type = 'sawtooth';
      drone.frequency.setValueAtTime(40, now);
      drone.frequency.exponentialRampToValueAtTime(110, now + 3);
      
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(100, now);
      droneFilter.frequency.exponentialRampToValueAtTime(800, now + 3);
      droneFilter.Q.setValueAtTime(10, now);

      droneGain.gain.setValueAtTime(0, now);
      droneGain.gain.linearRampToValueAtTime(0.04, now + 0.5);
      droneGain.gain.linearRampToValueAtTime(0.04, now + 2.5);
      droneGain.gain.exponentialRampToValueAtTime(0.001, now + 3.1);

      drone.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(ctx.destination);
      drone.start(now);
      drone.stop(now + 3.1);

      // 2. Data Processing "Chirps" (Staggered over 2.5 seconds)
      for (let i = 0; i < 12; i++) {
        const chirpTime = now + (i * 0.2) + (Math.random() * 0.1);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + (Math.random() * 2000), chirpTime);
        osc.frequency.exponentialRampToValueAtTime(100, chirpTime + 0.1);
        
        g.gain.setValueAtTime(0, chirpTime);
        g.gain.linearRampToValueAtTime(0.03, chirpTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, chirpTime + 0.1);
        
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(chirpTime);
        osc.stop(chirpTime + 0.11);
      }

      // 3. Final Link Established Chime (At 2.7 seconds)
      const chimeFreqs = [523.25, 659.25, 783.99, 1046.50];
      chimeFreqs.forEach((freq, i) => {
        const chime = ctx.createOscillator();
        const cGain = ctx.createGain();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(freq, now + 2.7 + (i * 0.08));
        
        cGain.gain.setValueAtTime(0, now + 2.7 + (i * 0.08));
        cGain.gain.linearRampToValueAtTime(0.1, now + 2.7 + (i * 0.08) + 0.02);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 2.7 + (i * 0.08) + 0.5);
        
        chime.connect(cGain);
        cGain.connect(ctx.destination);
        chime.start(now + 2.7 + (i * 0.08));
        chime.stop(now + 2.7 + (i * 0.08) + 0.5);
      });

      // 4. Harmonic Swell
      const swell = ctx.createOscillator();
      const sGain = ctx.createGain();
      swell.type = 'sine';
      swell.frequency.setValueAtTime(220, now + 2);
      swell.frequency.exponentialRampToValueAtTime(440, now + 2.7);
      sGain.gain.setValueAtTime(0, now + 2);
      sGain.gain.linearRampToValueAtTime(0.08, now + 2.7);
      sGain.gain.linearRampToValueAtTime(0, now + 3);
      swell.connect(sGain);
      sGain.connect(ctx.destination);
      swell.start(now + 2);
      swell.stop(now + 3);
      
    } else {
      // HUD Shutdown: Descending digital crunch with resonance (Quick 0.4s)
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      g.gain.setValueAtTime(0.05, now);
      g.gain.linearRampToValueAtTime(0, now + 0.4);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1000, now);
      lp.frequency.exponentialRampToValueAtTime(100, now + 0.4);
      osc.connect(lp);
      lp.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  };

  // Base64 Helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      playTechSound('start');
      setIsConnecting(true);
      
      // Delay the actual session start slightly to align with the 3s sound sequence
      // establishing link during the sound for better UX
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const voiceName = profile.voiceType === 'male' ? 'Puck' : 'Zephyr';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-4), `${profile.assistantName}: ${message.serverContent!.outputTranscription!.text}`]);
            } else if (message.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev.slice(-4), `You: ${message.serverContent!.inputTranscription!.text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              setIsTalking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsTalking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsTalking(false);
            }
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
            setIsTalking(false);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsConnecting(false);
            setIsTalking(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } }
          },
          systemInstruction: SYSTEM_INSTRUCTION_BASE(profile),
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    playTechSound('stop');
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (outputAudioContextRef.current) { outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    setIsActive(false);
    setIsTalking(false);
  };

  useEffect(() => { return () => stopSession(); }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      <div className="absolute top-10 text-center">
        <div className="inline-block px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-bold mb-2 uppercase tracking-widest">SECURE_COMM_CHANNEL</div>
        <h2 className="text-3xl font-bold font-heading mb-2 text-white">Voice Uplink</h2>
        <p className="text-cyan-400/60 uppercase text-xs tracking-[0.2em]">Deploying: <span className="text-cyan-400 font-bold">{profile.assistantName}</span></p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <button onClick={isActive ? stopSession : startSession} disabled={isConnecting} className="cursor-pointer outline-none group">
          <VoiceAvatar 
            isActive={isActive} 
            isConnecting={isConnecting} 
            isTalking={isTalking} 
            assistantName={profile.assistantName}
          />
        </button>

        <div className="w-full max-w-lg space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Signal: High</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isActive ? "Encryption: Active" : "Encryption: Standby"}</span>
          </div>
          <div className={`glass rounded-lg p-6 min-h-[140px] relative overflow-hidden group border transition-all ${
            isActive ? 'border-cyan-500/40 bg-slate-900/40' : 'border-slate-800 bg-slate-900/20 opacity-50'
          }`}>
            <div className="absolute inset-0 opacity-5 pointer-events-none"><div className="h-full w-full grid-bg"></div></div>
            {transcription.length > 0 ? (
              <div className="space-y-3 relative z-10">
                {transcription.map((t, i) => (
                  <p key={i} className={`text-sm font-medium tracking-wide ${t.startsWith('You:') ? 'text-slate-400' : 'text-cyan-300 flicker-text'}`}>
                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    {t}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 italic space-y-2 relative z-10">
                <i className={`fa-solid fa-satellite-dish ${isActive ? 'animate-pulse text-cyan-400' : ''}`}></i>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold">
                  {isActive ? 'Transcribing neural feedback...' : 'Establish link to begin uplink...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pb-10 flex space-x-6">
        <div className="flex flex-col items-center">
           <div className="w-12 h-1 bg-cyan-500/20 mb-1 rounded-full overflow-hidden">
              <div className={`h-full bg-cyan-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`}></div>
           </div>
           <span className="text-[10px] font-bold text-cyan-400/50 uppercase">{profile.assistantName}</span>
        </div>
        <div className="flex flex-col items-center">
           <div className="w-12 h-1 bg-cyan-500/20 mb-1 rounded-full overflow-hidden">
              <div className={`h-full bg-cyan-400 transition-all duration-300 ${isActive ? 'w-3/4' : 'w-0'}`}></div>
           </div>
           <span className="text-[10px] font-bold text-cyan-400/50 uppercase">Vocal: {profile.voiceType === 'male' ? 'Puck' : 'Zephyr'}</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceView;
