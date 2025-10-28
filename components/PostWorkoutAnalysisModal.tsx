import React from 'react';
import SparklesIcon from './icons/SparklesIcon.tsx';

interface PostWorkoutAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string | null;
  isLoading: boolean;
}

const PostWorkoutAnalysisModal: React.FC<PostWorkoutAnalysisModalProps> = ({ isOpen, onClose, analysis, isLoading }) => {
  if (!isOpen) return null;

  const renderAnalysisText = (text: string) => {
    if (!text) return null;
    // Simple renderer for bold text using **markdown**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-blue-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 mr-3 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Feedback do Seu Personal</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        
        <div className="flex-grow p-6 overflow-y-auto min-h-[200px] flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
                <p className="text-gray-400">Analisando sua performance...</p>
            </div>
          ) : analysis ? (
            <p className="text-gray-300 whitespace-pre-wrap font-sans text-base leading-relaxed">
              {renderAnalysisText(analysis)}
            </p>
          ) : (
            <p className="text-gray-500">Não foi possível gerar a análise. Mas bom trabalho no treino!</p>
          )}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Entendido!</button>
        </footer>
      </div>
    </div>
  );
};

export default PostWorkoutAnalysisModal;