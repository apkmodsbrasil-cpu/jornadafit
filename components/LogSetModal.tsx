import React, { useState, useRef, useEffect } from 'react';
import type { Exercise } from '../types.ts';
import InfoIcon from './icons/InfoIcon.tsx';

interface LogSetModalProps {
  exercise: Exercise;
  onClose: () => void;
  onLog: (logData: { weight?: string; reps?: string }) => void;
  initialValues?: { weight?: string; reps?: string };
}

const LogSetModal: React.FC<LogSetModalProps> = ({ exercise, onClose, onLog, initialValues }) => {
  const [weight, setWeight] = useState(initialValues?.weight || '');
  const [reps, setReps] = useState(initialValues?.reps || '');
  const weightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    weightInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLog({ weight, reps });
  };
  
  const isTimeBased = exercise.durationType === 'time';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80]" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-xs border border-gray-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-center mb-6">Registrar Série</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-semibold text-gray-400 mb-1">Carga (kg)</label>
            <input
              id="weight"
              ref={weightInputRef}
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 50.5"
              className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 text-center text-lg font-bold"
              disabled={isTimeBased}
            />
          </div>
          <div>
            <label htmlFor="reps" className="block text-sm font-semibold text-gray-400 mb-1">{isTimeBased ? 'Tempo (s)' : 'Repetições'}</label>
            <input
              id="reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder={isTimeBased ? 'Ex: 30' : 'Ex: 10'}
              className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 text-center text-lg font-bold"
            />
          </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-400 flex items-start gap-2 bg-gray-700/50 p-2 rounded-md border border-gray-600/50">
            <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
            <p>Registrar seus treinos com precisão ajuda seu personal a ajustar e progredir seu plano de forma mais inteligente!</p>
        </div>

        <div className="mt-4">
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Registrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogSetModal;