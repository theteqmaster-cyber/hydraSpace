'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface VoiceContextType {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;
  assistantAudio: HTMLAudioElement | null;
  analyzer: AnalyserNode | null;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  setIsSpeaking: (val: boolean) => void;
  setIsProcessing: (val: boolean) => void;
  speak: (audioUrl: string) => void;
  setTranscript: (text: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setIsSpeaking(false);
    }
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const newAnalyzer = audioContextRef.current.createAnalyser();
      newAnalyzer.fftSize = 256;
      setAnalyzer(newAnalyzer);
      
      if (audioRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        source.connect(newAnalyzer);
        newAnalyzer.connect(audioContextRef.current.destination);
      }
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const startListening = () => {
    initAudioContext();
    setIsListening(true);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const stopSpeaking = () => {
    // Cancel browser TTS
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    // Also stop HTML audio element if used
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const speak = (audioUrl: string) => {
    initAudioContext();
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
      setIsSpeaking(true);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSpeaking,
        isProcessing,
        transcript,
        assistantAudio: audioRef.current,
        analyzer,
        startListening,
        stopListening,
        stopSpeaking,
        setIsSpeaking,
        setIsProcessing,
        speak,
        setTranscript,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
