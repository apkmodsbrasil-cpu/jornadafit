import React, { useState } from 'react';
import type { Student, Personal, ExerciseDetails } from '../types.ts';
// FIX: Corrected import path for useAI hook.
import { useAI } from '../hooks/useAI.ts';
import RoadmapIcon from './icons/RoadmapIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';

interface PeriodizationAssistantModalProps {
  personal: Personal;
  student: Student;
  onClose: () => void;
  onApplyPlan: (plan: any) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  // FIX: Add exerciseDatabase and addExercise to props
  exerciseDatabase: Record<string, ExerciseDetails>;
  addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
  // FIX: Added apiKeys to props for the useAI hook.
  apiKeys: string[];
}

const PeriodizationAssistantModal: React.FC<PeriodizationAssistantModalProps> = ({ personal, student, onClose, onApplyPlan, addToast, exerciseDatabase, addExercise, apiKeys }) => {
    const [methodology, setMethodology] = useState('Linear');
    const [duration, setDuration] = useState('12 Semanas');
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
    // FIX: Pass apiKeys to the useAI hook.
    const { generators, isGenerating } = useAI({ personal, addToast, mode: 'personal', studentContext: student, exerciseDatabase, addExercise, apiKeys });

    const handleGenerate = async () => {
        try {
            // Fix: Updated function call to use the generators object from the useAI hook.
            const plan = await generators.suggestPeriodization(student, methodology, duration);
            setGeneratedPlan(plan || "Falha ao gerar o plano. Verifique o console ou as chaves de API.");
        } catch (e: any) {
            addToast(`Erro ao gerar periodização: ${e.message}`, 'error');
            setGeneratedPlan("Falha ao gerar o plano. Verifique o console ou as chaves de API.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[60]" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center">
                        <RoadmapIcon className="w-6 h-6 mr-3 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Assistente de Periodização</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-1">Metodologia</label>
                            <select value={methodology} onChange={(e) => setMethodology(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600">
                                <option>Linear</option>
                                <option>Ondulatória Diária</option>
                                <option>Blocos</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-1">Duração</label>
                            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600">
                                <option>12 Semanas</option>
                                <option>16 Semanas</option>
                                <option>24 Semanas</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleGenerate} disabled={isGenerating.periodization} className="w-full flex items-center justify-center p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isGenerating.periodization ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                )}
                                {isGenerating.periodization ? 'Gerando...' : 'Gerar Estrutura'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg min-h-[300px]">
                        {isGenerating.periodization && !generatedPlan && (
                            <div className="flex justify-center items-center h-full">
                                <LoadingSpinner />
                            </div>
                        )}
                        {generatedPlan ? (
                             <p className="text-gray-300 whitespace-pre-wrap font-sans text-base leading-relaxed">{generatedPlan}</p>
                        ) : (
                             <div className="flex justify-center items-center h-full text-center text-gray-500">
                                <p>A estrutura da sua periodização aparecerá aqui.</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Fechar</button>
                    <button onClick={() => onApplyPlan(generatedPlan)} disabled={true} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">Aplicar (Em Breve)</button>
                </footer>
            </div>
        </div>
    );
};

export default PeriodizationAssistantModal;