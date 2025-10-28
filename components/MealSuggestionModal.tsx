
import React from 'react';
import UtensilsIcon from './icons/UtensilsIcon.tsx';

interface MealSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: string | null;
  isLoading: boolean;
}

const MealSuggestionModal: React.FC<MealSuggestionModalProps> = ({ isOpen, onClose, suggestion, isLoading }) => {
  if (!isOpen) return null;

    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold text-blue-300 mt-4 mb-2">{line.substring(4)}</h3>;
            }
            if (line.startsWith('- ')) {
                return <li key={index} className="ml-4 list-disc text-gray-300">{line.substring(2)}</li>;
            }
            if (line.trim() === '') {
                return <br key={index} />;
            }
            return <p key={index} className="text-gray-400 mb-2">{line}</p>;
        });
    };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <UtensilsIcon className="w-6 h-6 mr-3 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Sugestão Alimentar da IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        
        <div className="flex-grow p-6 overflow-y-auto min-h-[300px] flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
                <p className="text-gray-400">Montando uma sugestão para você...</p>
            </div>
          ) : suggestion ? (
            <div className="prose prose-invert prose-sm max-w-none">
              {renderMarkdown(suggestion)}
            </div>
          ) : (
            <p className="text-gray-500">Não foi possível gerar a sugestão. Tente novamente mais tarde.</p>
          )}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Fechar</button>
        </footer>
      </div>
    </div>
  );
};

export default MealSuggestionModal;