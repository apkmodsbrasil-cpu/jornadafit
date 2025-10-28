import React, { useState } from 'react';
import type { Routine, ExerciseDetails } from '../types.ts';
import FlameIcon from './icons/FlameIcon.tsx';
import SnowflakeIcon from './icons/SnowflakeIcon.tsx';
import BookOpenIcon from './icons/BookOpenIcon.tsx';
import RoutineHowToModal from './RoutineHowToModal.tsx';
import QuestionMarkIcon from './icons/QuestionMarkIcon.tsx';

interface RoutineModalProps {
  type: 'warmup' | 'cooldown';
  routine: Routine | null;
  onClose: () => void;
  exerciseDatabase: Record<string, ExerciseDetails>;
}

const RoutineModal: React.FC<RoutineModalProps> = ({ type, routine, onClose, exerciseDatabase }) => {
  const [selectedItem, setSelectedItem] = useState<ExerciseDetails | null>(null);

  const title = type === 'warmup' ? 'Aquecimento Geral' : 'Alongamento / Volta à Calma';
  const Icon = type === 'warmup' ? FlameIcon : SnowflakeIcon;

  if (!routine) {
    onClose();
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 flex flex-col h-[90vh] max-h-[600px] m-4" onClick={e => e.stopPropagation()}>
          <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center">
              <Icon className={`w-6 h-6 mr-3 ${type === 'warmup' ? 'text-orange-400' : 'text-cyan-400'}`} />
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </header>

          <div className="flex-grow p-4 overflow-y-auto">
            <p className="text-sm text-gray-400 mb-4">{type === 'warmup' ? 'Prepare seu corpo para o treino com estes exercícios de aquecimento dinâmico.' : 'Ajude seu corpo a se recuperar e a melhorar a flexibilidade com esta rotina.'}</p>
            <div className="space-y-3">
              {routine.items.map(item => {
                const details = exerciseDatabase[item.exerciseId];
                if (!details) return null;
                
                return (
                  <div key={item.exerciseId} className="bg-gray-800/60 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{details.name}</p>
                      <p className="text-sm text-gray-400">{item.duration}</p>
                    </div>
                    <button onClick={() => setSelectedItem(details)} className="flex items-center text-sm text-blue-400 hover:text-blue-300 p-1">
                      <QuestionMarkIcon className="w-4 h-4 mr-1" />
                      Como fazer?
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          
          <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
            <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Fechar</button>
          </footer>
        </div>
      </div>
      
      {selectedItem && (
        <RoutineHowToModal 
          itemDetails={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
};

export default RoutineModal;