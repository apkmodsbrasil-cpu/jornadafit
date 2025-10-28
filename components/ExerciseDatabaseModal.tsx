import React, { useState, useMemo } from 'react';
import type { ExerciseDetails } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import DumbbellIcon from './icons/DumbbellIcon.tsx';
import ClipboardIcon from './icons/ClipboardIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import PlusCircleIcon from './icons/PlusCircleIcon.tsx';
import AddExerciseModal from './AddExerciseModal.tsx';

interface ExerciseDatabaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseDatabase: Record<string, ExerciseDetails>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    onAddExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
    onUpdateExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
}

const ExerciseDatabaseModal: React.FC<ExerciseDatabaseModalProps> = ({ isOpen, onClose, exerciseDatabase, addToast, onAddExercise, onUpdateExercise }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<(ExerciseDetails & { id: string }) | null>(null);

    const filteredExercises = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (!lowerSearch) {
            // FIX: Cast properties to ExerciseDetails to allow sorting by name.
            return Object.entries(exerciseDatabase).sort(([, a], [, b]) => (a as ExerciseDetails).name.localeCompare((b as ExerciseDetails).name));
        }
        return Object.entries(exerciseDatabase).filter(([id, details]) => {
            const exerciseDetails = details as ExerciseDetails;
            return (
                id.toLowerCase().includes(lowerSearch) ||
                exerciseDetails.name.toLowerCase().includes(lowerSearch) ||
                exerciseDetails.muscleGroups.primary.some(m => m.toLowerCase().includes(lowerSearch)) ||
                exerciseDetails.muscleGroups.secondary?.some(m => m.toLowerCase().includes(lowerSearch))
            );
        // FIX: Cast properties to ExerciseDetails to allow sorting by name.
        }).sort(([, a], [, b]) => (a as ExerciseDetails).name.localeCompare((b as ExerciseDetails).name));
    }, [exerciseDatabase, searchTerm]);

    const handleCopyNames = () => {
        // FIX: Cast 'details' to ExerciseDetails to access the 'name' property.
        const names = filteredExercises.map(([_, details]) => (details as ExerciseDetails).name).join('\n');
        navigator.clipboard.writeText(names)
            .then(() => {
                addToast(`${filteredExercises.length} nomes de exercícios copiados!`, 'success');
            })
            .catch(err => {
                addToast('Falha ao copiar nomes.', 'error');
                console.error('Could not copy text: ', err);
            });
    };

    const handleOpenEditorForEdit = (id: string, details: ExerciseDetails) => {
        setEditingExercise({ id, ...details });
        setIsEditorOpen(true);
    };

    const handleOpenEditorForAdd = () => {
        setEditingExercise(null);
        setIsEditorOpen(true);
    };

    const handleSaveExercise = async (exercise: ExerciseDetails & { id: string }, isNew: boolean) => {
        const { id, ...details } = exercise;
        let success = false;
        if (isNew) {
            success = await onAddExercise(id, details);
        } else {
            success = await onUpdateExercise(id, details);
        }

        if (success) {
            addToast(`Exercício ${isNew ? 'adicionado' : 'atualizado'} com sucesso!`, 'success');
            setIsEditorOpen(false);
        } else {
            addToast(`Falha ao salvar o exercício.`, 'error');
        }
        return success;
    };


    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[70]" onClick={onClose}>
                <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                    <header className="p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                        <div className="flex items-center">
                            <DumbbellIcon className="w-6 h-6 mr-3 text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Base de Dados ({filteredExercises.length})</h2>
                        </div>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </header>

                    <div className="p-4 border-b border-gray-700 sticky top-[73px] bg-gray-800 z-10">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filtrar por nome, ID ou grupo muscular..."
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
                                    <li key={id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-white">{(details as ExerciseDetails).name}</p>
                                            <p className="text-xs text-gray-500 font-mono mb-1">ID: {id}</p>
                                            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                                                <span className="font-semibold text-blue-300">Primário:</span>
                                                <span className="text-gray-300">{(details as ExerciseDetails).muscleGroups.primary.join(', ')}</span>
                                                {(details as ExerciseDetails).muscleGroups.secondary && (details as ExerciseDetails).muscleGroups.secondary!.length > 0 && (
                                                    <>
                                                        <span className="font-semibold text-purple-300">| Secundário:</span>
                                                        <span className="text-gray-300">{(details as ExerciseDetails).muscleGroups.secondary!.join(', ')}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleOpenEditorForEdit(id, details as ExerciseDetails)} className="p-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0 ml-4">
                                            <EditIcon className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Nenhum exercício encontrado.</p>
                            </div>
                        )}
                    </div>

                    <footer className="p-4 border-t border-gray-700 flex justify-between items-center sticky bottom-0 bg-gray-800 z-10">
                        <div className="flex items-center gap-2">
                             <button 
                                type="button" 
                                onClick={handleOpenEditorForAdd} 
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center text-sm"
                            >
                                <PlusCircleIcon className="w-5 h-5 mr-2" />
                                Adicionar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCopyNames} 
                                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={filteredExercises.length === 0}
                            >
                                <ClipboardIcon className="w-4 h-4 mr-2" />
                                Copiar Nomes
                            </button>
                        </div>
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Fechar</button>
                    </footer>
                </div>
            </div>

            {isEditorOpen && (
                <AddExerciseModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSaveExercise}
                    exerciseToEdit={editingExercise}
                    exerciseDatabase={exerciseDatabase}
                />
            )}
        </>
    );
};

export default ExerciseDatabaseModal;
