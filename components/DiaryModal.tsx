
import React from 'react';
import BookOpenIcon from './icons/BookOpenIcon.tsx';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string | null;
  isLoading: boolean;
}

const DiaryModal: React.FC<DiaryModalProps> = ({ isOpen, onClose, summary, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-3 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Diário de Bordo | Resumo da Semana</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        
        <div className="flex-grow p-6 overflow-y-auto min-h-[200px] flex items-center justify-center">
          {isLoading ? (
            <p className="text-gray-400">Carregando resumo semanal...</p>
          ) : summary ? (
            <p className="text-gray-300 whitespace-pre-wrap font-sans text-base leading-relaxed">{summary}</p>
          ) : (
            <p className="text-gray-500">Não foi possível gerar o resumo. Tente novamente mais tarde.</p>
          )}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Fechar</button>
        </footer>
      </div>
    </div>
  );
};

export default DiaryModal;