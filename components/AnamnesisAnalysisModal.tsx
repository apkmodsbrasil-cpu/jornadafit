import React from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';

interface AnamnesisAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string | null;
  isLoading: boolean;
  onRegenerate?: () => void;
}

const AnamnesisAnalysisModal: React.FC<AnamnesisAnalysisModalProps> = ({ isOpen, onClose, analysis, isLoading, onRegenerate }) => {
  if (!isOpen) return null;

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-semibold text-blue-300 mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.trim().startsWith('-')) {
            return <li key={index} className="ml-4 list-disc text-gray-300">{line.substring(1).trim()}</li>;
        }
        if (line.trim() === '') {
            return <br key={index} />;
        }
        return <p key={index} className="text-gray-300 mb-2">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[60]" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <SparklesIcon className="w-6 h-6 mr-3 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Análise da Anamnese (IA)</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        
        <div className="flex-grow p-6 overflow-y-auto min-h-[300px]">
          {isLoading && !analysis ? (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
          ) : analysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
              {renderMarkdown(analysis)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Não foi possível gerar a análise.</p>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
          {onRegenerate ? (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600/80 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              {isLoading ? 'Gerando...' : 'Regerar'}
            </button>
          ) : <div />}
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Entendido!</button>
        </footer>
      </div>
    </div>
  );
};

export default AnamnesisAnalysisModal;