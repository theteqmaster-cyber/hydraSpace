'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Sparkles, X } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useMphathi } from '@/hooks/useMphathi';

export default function MphathiOrb() {
  const { isListening, isSpeaking, isProcessing, analyzer, transcript } = useVoice();
  const { startMphathi, stopMphathi } = useMphathi();
  const [scale, setScale] = useState(1);
  const [glow, setGlow] = useState(0);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (isListening || isSpeaking || isProcessing) {
      const update = () => {
        if (analyzer) {
          const dataArray = new Uint8Array(analyzer.frequencyBinCount);
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setScale(1 + (average / 128) * 0.5);
          setGlow((average / 128) * 20);
        } else if (isSpeaking) {
          // Procedural fallback animation for browser TTS
          const time = Date.now() / 100;
          setScale(1 + Math.sin(time) * 0.15);
          setGlow(10 + Math.sin(time) * 5);
        }
        animationRef.current = requestAnimationFrame(update);
      };
      update();
    } else {
      setScale(1);
      setGlow(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening, isSpeaking, analyzer]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl max-w-xs text-sm text-slate-700 italic"
          >
            {transcript || "Listening..."}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={isListening ? stopMphathi : startMphathi}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: scale,
          boxShadow: `0 0 ${20 + glow}px rgba(59, 130, 246, 0.5)`,
        }}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border border-white/30 transition-colors ${
          isListening ? 'bg-blue-500' : isSpeaking ? 'bg-indigo-600' : isProcessing ? 'bg-amber-500' : 'bg-slate-900'
        }`}
      >
        {/* Animated Background Layers */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-600 blur-xl"
          />
        </div>

        <div className="relative z-10 text-white">
          {isListening ? (
            <div className="flex gap-1 items-end h-4">
               {[1,2,3].map(i => (
                 <motion.div 
                   key={i}
                   animate={{ height: [4, 12, 4] }}
                   transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                   className="w-1 bg-white rounded-full"
                 />
               ))}
            </div>
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6 animate-pulse" />
          ) : isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
        </div>
      </motion.button>
    </div>
  );
}
