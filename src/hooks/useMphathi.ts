'use client';

import { useState, useRef, useEffect } from 'react';
import { useVoice } from '@/contexts/VoiceContext';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useSearchParams } from 'next/navigation';

export function useMphathi() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { 
    isListening, 
    startListening, 
    stopListening, 
    speak, 
    setTranscript, 
    setIsProcessing, 
    setIsSpeaking 
  } = useVoice();
  const { courses, timetableEntries, events, notes } = useData();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        setIsProcessing(false);
        stream.getTracks().forEach(track => track.stop());
      };

      // VAD logic for hands-free stopping
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);

      let silenceStart = Date.now();
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        const volume = Math.sqrt(sum / input.length);

        if (volume > 0.005) {
          silenceStart = Date.now();
        } else if (Date.now() - silenceStart > 2500) {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            stopListening();
            processor.disconnect();
            source.disconnect();
          }
        }
      };

      mediaRecorder.start();
      startListening();
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      stopListening();
    }
  };

  const processAudio = async (blob: Blob) => {
    let attempts = 0;
    const maxRetries = 3;

    const performProcess = async () => {
      try {
        // 1. Transcribe (Groq Whisper)
        const formData = new FormData();
        formData.append('file', blob, 'audio.webm');

        const transResp = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!transResp.ok) throw new Error(`Transcription failed: ${transResp.status}`);
        const { text, error: transError } = await transResp.json();
        if (transError) throw new Error(transError);
        setTranscript(text);

        // --- FAIL-SAFE: Local Command Routing ---
        const lowerText = text.toLowerCase();
        const localTargets = ['dashboard', 'calendar', 'timetable', 'courses', 'settings'];
        const target = localTargets.find(t => lowerText.includes(t));
        if (target) {
          window.dispatchEvent(new CustomEvent('MPHATHI_COMMAND', { detail: `NAVIGATE_${target.toUpperCase()}` }));
        }

        // 2. Think (Groq Llama 3)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const noteId = searchParams.get('id');
        const activeNote = noteId ? notes.find(n => n.id === noteId) : null;

        let contextSummary = `
          User Courses: ${courses.map(c => `${c.name} (${c.code})`).join(', ')}
          Full Timetable: ${timetableEntries.map(t => `${t.title} on ${days[t.day_of_week]} at ${t.start_time} in ${t.location || 'N/A'}`).join('; ')}
          Upcoming Events: ${events.map(e => e.title).join(', ')}
          Today is: ${days[new Date().getDay()]}
        `;

        if (activeNote) {
          contextSummary += `
            --- ACTIVE NOTE ---
            Title: ${activeNote.title}
            Content: ${activeNote.content}
          `;
        }

        const voiceResp = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text, 
            context: contextSummary,
            isLoggedIn: !!user,
            userName: user?.email?.split('@')[0] || 'Student'
          }),
        });

        if (!voiceResp.ok) throw new Error(`Brain connection failed: ${voiceResp.status}`);
        const { text: replyText, error: voiceError } = await voiceResp.json();
        if (voiceError) throw new Error(voiceError);

        // 3. Peak Stability Voice (Browser Neural TTS)
        if (replyText) {
          const cleanText = replyText.split('COMMAND:')[0].trim();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          
          const speakFallback = () => {
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => 
              (v.name.includes('Neural') || v.name.includes('Natural')) && 
              (v.name.includes('English') || v.name.includes('US'))
            ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
            
            if (femaleVoice) utterance.voice = femaleVoice;
            utterance.rate = 1.05;
            utterance.pitch = 1.1;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          };

          if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = speakFallback;
          } else {
            speakFallback();
          }
        }

        // 4. Handle Commands
        if (replyText && replyText.includes('COMMAND:')) {
          const command = replyText.split('COMMAND:')[1].trim().split(' ')[0];
          window.dispatchEvent(new CustomEvent('MPHATHI_COMMAND', { detail: command }));
        }

      } catch (error) {
        attempts++;
        if (attempts < maxRetries) {
          console.warn(`Mphathi Retry Attempt ${attempts}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return performProcess();
        }
        
        console.error('Mphathi System Error after retries:', error);
        const errUtterance = new SpeechSynthesisUtterance("I'm sorry, I'm having trouble connecting right now. Please check your internet and try again.");
        window.speechSynthesis.speak(errUtterance);
      }
    };

    await performProcess();
  };

  return {
    startMphathi: startRecording,
    stopMphathi: stopRecording,
  };
}
