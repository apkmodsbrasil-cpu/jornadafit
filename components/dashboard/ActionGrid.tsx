import React from 'react';
import BookOpenIcon from '../icons/BookOpenIcon.tsx';
import UtensilsIcon from '../icons/UtensilsIcon.tsx';

interface ActionGridProps {
    onOpenDiary: () => void;
    onOpenMealSuggestion: () => void;
}

const ActionGrid: React.FC<ActionGridProps> = ({ onOpenDiary, onOpenMealSuggestion }) => {
    return (
        <div className="mt-6 grid grid-cols-2 gap-4">
            <button onClick={onOpenDiary} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors">
                <BookOpenIcon className="w-5 h-5 mr-2" /> Diário de Bordo
            </button>
            <button onClick={onOpenMealSuggestion} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors">
                <UtensilsIcon className="w-5 h-5 mr-2" /> Sugestão Alimentar
            </button>
        </div>
    );
};

export default ActionGrid;
