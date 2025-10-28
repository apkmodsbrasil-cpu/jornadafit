

import React, { useState, useEffect, useRef } from 'react';
import ClockIcon from './icons/ClockIcon.tsx';

interface RestTimerModalProps {
  duration: number; 
  onFinishRest: () => void;
}

const RestTimerModal: React.FC<RestTimerModalProps> = ({ duration, onFinishRest }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    if (duration <= 0) {
        onFinishRest();
        return;
    }

    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          playFinishSound();
          onFinishRest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [duration, onFinishRest]);

  const playFinishSound = () => {
    const context = audioContextRef.current;
    if (!context) return;
    
    
    if (context.state === 'suspended') {
        context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime); 
    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  
  if (duration <= 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80]">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-xs border border-gray-700 text-center animate-fade-in-scale">
        <ClockIcon className="w-10 h-10 mx-auto text-blue-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Descanso</h2>
        <p className="text-6xl font-mono font-bold mb-6">{String(timeLeft).padStart(2, '0')}</p>
        
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s linear' }}></div>
        </div>

        <button 
          onClick={onFinishRest} 
          className="w-full px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          Pular
        </button>
      </div>
    </div>
  );
};

export default RestTimerModal;