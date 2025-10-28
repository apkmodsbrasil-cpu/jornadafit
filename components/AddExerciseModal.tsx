import React, { useState, useEffect } from 'react';
import type { ExerciseDetails } from '../types.ts';
import DumbbellIcon from './icons/DumbbellIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';

interface AddExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (exercise: ExerciseDetails & { id: string }, isNew: boolean) => Promise<boolean>;
    exerciseToEdit?: (ExerciseDetails & { id: string }) | null;
    exerciseDatabase: Record<string, ExerciseDetails>;
}

const initialExerciseState: ExerciseDetails & { id: string } = {
    id: '',
    name: '',
    videoUrl: '',
    gifUrl: '',
    tutorial: '',
    equipment: 'maquina',
    muscleGroups: { primary: [], secondary: [] },
    difficulty: 'iniciante',
    contraindications: []
};

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ isOpen, onClose, onSave, exerciseToEdit, exerciseDatabase }) => {
    const isEditMode = !!exerciseToEdit;
    const [exercise, setExercise] = useState(initialExerciseState);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (isEditMode && exerciseToEdit) {
            setExercise(exerciseToEdit);
        } else {
            setExercise(initialExerciseState);
        }
    }, [isEditMode, exerciseToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setExercise(prev => ({ ...prev, [name]: value }));
    };

    const handleMuscleGroupChange = (type: 'primary' | 'secondary', value: string) => {
        setExercise(prev => ({
            ...prev,
            muscleGroups: {
                ...prev.muscleGroups,
                [type]: value.split(',').map(s => s.trim()).filter(Boolean)
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exercise.id || !exercise.name) {
            alert('ID e Nome do exercício são obrigatórios.');
            return;
        }
        if (!isEditMode && exerciseDatabase[exercise.id]) {
            alert(`Exercício com ID "${exercise.id}" já existe.`);
            return;
        }
        setIsLoading(true);
        await onSave(exercise, !isEditMode);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[80]" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center">
                        {isEditMode ? <EditIcon className="w-6 h-6 mr-3 text-blue-400" /> : <DumbbellIcon className="w-6 h-6 mr-3 text-blue-400" />}
                        <h2 className="text-xl font-bold text-white">{isEditMode ? 'Editar Exercício' : 'Adicionar Novo Exercício'}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="id" placeholder="ID do Exercício (ex: supino-reto-barra)" value={exercise.id} onChange={handleChange} required disabled={isEditMode} className={`w-full p-2 rounded-lg border border-gray-600 ${isEditMode ? 'bg-gray-900 text-gray-400 cursor-not-allowed' : 'bg-gray-700'}`} />
                        <input type="text" name="name" placeholder="Nome Completo do Exercício" value={exercise.name} onChange={handleChange} required className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="videoUrl" placeholder="URL do Vídeo (YouTube)" value={exercise.videoUrl} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600" />
                        <input type="text" name="gifUrl" placeholder="URL do GIF" value={exercise.gifUrl || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600" />
                    </div>
                    <textarea name="tutorial" placeholder="Tutorial de execução (Markdown suportado)" value={exercise.tutorial} onChange={handleChange} rows={4} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="equipment" value={exercise.equipment} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600">
                            <option value="maquina">Máquina</option>
                            <option value="barra">Barra</option>
                            <option value="halteres">Halteres</option>
                            <option value="peso corporal">Peso Corporal</option>
                            <option value="kettlebell">Kettlebell</option>
                            <option value="elastico">Elástico</option>
                        </select>
                        <select name="difficulty" value={exercise.difficulty} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600">
                            <option value="iniciante">Iniciante</option>
                            <option value="intermediario">Intermediário</option>
                            <option value="avancado">Avançado</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Músculos Primários (separados por vírgula)" value={exercise.muscleGroups.primary.join(', ')} onChange={e => handleMuscleGroupChange('primary', e.target.value)} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600" />
                        <input type="text" placeholder="Músculos Secundários (opcional)" value={(exercise.muscleGroups.secondary || []).join(', ')} onChange={e => handleMuscleGroupChange('secondary', e.target.value)} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600" />
                    </div>
                    <input type="text" placeholder="Contraindicações (separadas por vírgula)" value={exercise.contraindications.join(', ')} onChange={e => setExercise(prev => ({...prev, contraindications: e.target.value.split(',').map(s => s.trim())}))} className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600" />
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end items-center">
                    <button type="button" onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50">
                        {isLoading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Exercício')}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default AddExerciseModal;