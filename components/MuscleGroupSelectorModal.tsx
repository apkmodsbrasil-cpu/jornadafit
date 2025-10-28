import React, { useState } from 'react';
import type { Student, Personal } from '../types.ts';
import WandIcon from './icons/WandIcon.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';
import { useAI } from '../hooks/useAI.ts';

interface AiGenerators {
    suggestWorkoutSplit: (student: Student) => Promise<Record<string, string[]> | null>;
}

interface MuscleGroupSelectorModalProps {
    personal: Personal;
    student: Student;
    onClose: () => void;
    onGenerate: (split: Record<string, string[]>) => void;
    onUpdatePersonalAiPrefs: (notes: string) => void;
    isGenerating: { workoutPlan: boolean; [key: string]: boolean };
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    aiGenerators: AiGenerators;
}

const allMuscleGroups = [
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas (Quadríceps)', 
    'Pernas (Posterior)', 'Panturrilhas', 'Abdômen', 'Core', 'Glúteos', 'Cardio'
];

const MuscleGroupSelectorModal: React.FC<MuscleGroupSelectorModalProps> = ({ personal, student, onClose, onGenerate, isGenerating, addToast, aiGenerators }) => {
    const [split, setSplit] = useState<Record<string, string[]>>(() => {
        const initialState: Record<string, string[]> = {};
        student.availableDays.forEach(day => {
            initialState[day] = [];
        });
        return initialState;
    });
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleMuscleGroupToggle = (dayOfWeek: string, muscle: string) => {
        setSplit(prev => {
            const currentMuscles = prev[dayOfWeek] || [];
            const newMuscles = currentMuscles.includes(muscle)
                ? currentMuscles.filter(m => m !== muscle)
                : [...currentMuscles, muscle];
            return { ...prev, [dayOfWeek]: newMuscles };
        });
    };
    
    const handleSuggestSplit = async () => {
        setIsSuggesting(true);
        try {
            const suggestedSplit = await aiGenerators.suggestWorkoutSplit(student);
            if (suggestedSplit) {
                const newSplit: Record<string, string[]> = {};
                student.availableDays.forEach(day => {
                    newSplit[day] = suggestedSplit[day] || [];
                });
                setSplit(newSplit);
                addToast("Sugestão de divisão de treino gerada!", "success");
            } else {
                addToast("Não foi possível gerar uma sugestão.", "error");
            }
        } catch(e: any) {
            addToast(`Erro: ${e.message}`, "error");
        } finally {
            setIsSuggesting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[60]" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-xl border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Definir Divisão de Treino</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
                    {student.availableDays.length > 0 ? student.availableDays.map((dayOfWeek) => {
                        const muscles = split[dayOfWeek] || [];
                        return (
                            <div key={dayOfWeek} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-blue-400">{dayOfWeek}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {allMuscleGroups.map(muscle => (
                                        <button
                                            key={muscle}
                                            onClick={() => handleMuscleGroupToggle(dayOfWeek, muscle)}
                                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                                muscles.includes(muscle)
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                                            }`}
                                        >
                                            {muscle}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-center text-gray-400">O aluno não informou os dias disponíveis na anamnese.</p>
                    )}
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
                    <button onClick={handleSuggestSplit} disabled={isSuggesting || student.availableDays.length === 0} className="flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50">
                        {isSuggesting ? <LoadingSpinner size="sm"/> : <WandIcon className="w-5 h-5 mr-2" />}
                        {isSuggesting ? 'Sugerindo...' : 'Sugerir Divisão'}
                    </button>
                    <button onClick={() => onGenerate(split)} disabled={isGenerating.workoutPlan || student.availableDays.length === 0} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {isGenerating.workoutPlan ? 'Gerando Plano...' : 'Gerar Plano de Treino'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default MuscleGroupSelectorModal;