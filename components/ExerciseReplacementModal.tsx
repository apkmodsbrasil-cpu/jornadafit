import React, { useState, useMemo } from 'react';
import type { ExerciseDetails } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';

interface ExerciseReplacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectExercise: (exerciseId: string) => void;
    exerciseDatabase: Record<string, ExerciseDetails>;
}

const ExerciseReplacementModal: React.FC<ExerciseReplacementModalProps> = ({ isOpen, onClose, onSelectExercise, exerciseDatabase }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredExercises = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (!lowerSearch) {
            // FIX: Cast properties to ExerciseDetails to allow sorting by name.
            return Object.entries(exerciseDatabase).sort(([, a], [, b]) => (a as ExerciseDetails).name.localeCompare((b as ExerciseDetails).name));
        }
        return Object.entries(exerciseDatabase).filter(([id, details]) => {
            // FIX: Cast 'details' to ExerciseDetails to access its properties.
            const exerciseDetails = details as ExerciseDetails;
            return (
                exerciseDetails.name.toLowerCase().includes(lowerSearch) ||
                exerciseDetails.muscleGroups.primary.some(m => m.toLowerCase().includes(lowerSearch))
            );
        // FIX: Cast properties to ExerciseDetails to allow sorting by name.
        }).sort(([, a], [, b]) => (a as ExerciseDetails).name.localeCompare((b as ExerciseDetails).name));
    }, [exerciseDatabase, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[80]" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-white">Trocar Exercício</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>
                <div className="p-4 border-b border-gray-700">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou músculo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 p-2 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    {filteredExercises.length > 0 ? (
                        <ul className="divide-y divide-gray-700">
                            {filteredExercises.map(([id, details]) => (
                                <li key={id} onClick={() => onSelectExercise(id)} className="py-3 px-2 flex justify-between items-center rounded-md hover:bg-gray-700/60 cursor-pointer">
                                    <div>
                                        <p className="font-semibold text-white">{(details as ExerciseDetails).name}</p>
                                        <p className="text-xs text-gray-400">{(details as ExerciseDetails).muscleGroups.primary.join(', ')}</p>
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">{(details as ExerciseDetails).equipment}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>Nenhum exercício encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseReplacementModal;
