
import React, { useState } from 'react';
import type { Feedback } from '../types.ts';
import CheckSquareIcon from './icons/CheckSquareIcon.tsx';
import HeartIcon from './icons/HeartIcon.tsx';
import MoonIcon from './icons/MoonIcon.tsx';

interface FeedbackFormProps {
  onClose: () => void;
  onSubmit: (feedback: Feedback) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState<Feedback>({
    difficulty: 'Ideal',
    energyLevel: 'Normal',
    sleepQuality: 'Boa',
    overallRPE: 7,
    painPoints: '',
    enjoyment: 'Gostei da maioria',
    comments: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
  };
  
  const renderRadioGroup = (
    field: keyof Feedback,
    options: string[],
    label: string
  ) => (
    <div>
      <label className="block text-sm font-semibold text-gray-200 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setFeedback(f => ({ ...f, [field]: option }))}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              feedback[field] === option
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <CheckSquareIcon className="w-6 h-6 mr-3 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Feedback do Treino</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6">
          {renderRadioGroup('difficulty', ['Fácil demais', 'Ideal', 'Difícil demais', 'Extremamente difícil'], 'Como você sentiu a dificuldade do treino de hoje?')}
          {renderRadioGroup('energyLevel', ['Muito baixo', 'Baixo', 'Normal', 'Alto', 'Muito alto'], 'Qual foi seu nível de energia durante o treino?')}
          {renderRadioGroup('sleepQuality', ['Péssima', 'Ruim', 'Ok', 'Boa', 'Ótima'], 'Como foi sua noite de sono anterior?')}
          
          <div>
            <label htmlFor="rpe" className="block text-sm font-semibold text-gray-200 mb-2">
              Numa escala de 1 (muito fácil) a 10 (esforço máximo), qual nota você daria para o treino?
            </label>
            <div className="flex items-center gap-4">
              <input
                id="rpe"
                type="range"
                min="1"
                max="10"
                value={feedback.overallRPE}
                onChange={e => setFeedback(f => ({ ...f, overallRPE: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="font-bold text-lg text-blue-400 w-8 text-center">{feedback.overallRPE}</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="pain" className="block text-sm font-semibold text-gray-200 mb-1">Sentiu alguma dor ou desconforto específico?</label>
            <textarea
              id="pain"
              value={feedback.painPoints}
              onChange={e => setFeedback(f => ({ ...f, painPoints: e.target.value }))}
              placeholder="Ex: Dor no ombro direito ao fazer supino."
              className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
            />
          </div>
          
           <div>
            <label htmlFor="comments" className="block text-sm font-semibold text-gray-200 mb-1">Algum comentário adicional?</label>
            <textarea
              id="comments"
              value={feedback.comments}
              onChange={e => setFeedback(f => ({ ...f, comments: e.target.value }))}
              placeholder="Ex: Adorei o exercício novo de costas!"
              className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
            />
          </div>
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">Cancelar</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Enviar Feedback</button>
        </footer>
      </form>
    </div>
  );
};

export default FeedbackForm;