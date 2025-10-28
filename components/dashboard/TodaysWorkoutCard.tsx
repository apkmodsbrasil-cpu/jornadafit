import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Workout, ExerciseDetails } from '../../types.ts';
import DumbbellIcon from '../icons/DumbbellIcon.tsx';
import CheckCircleIcon from '../icons/CheckCircleIcon.tsx';
import ClockIcon from '../icons/ClockIcon.tsx';
import HistoryIcon from '../icons/HistoryIcon.tsx';
import XCircleIcon from '../icons/XCircleIcon.tsx';

interface TodaysWorkoutCardProps {
    studentData: Student;
    currentDate: Date;
    onStartWorkout: () => void;
    setStudentData: (updater: React.SetStateAction<Student>, options?: { showSuccessToast?: boolean }) => void;
    exerciseDatabase: Record<string, ExerciseDetails>;
    onResetWorkout: () => void;
}

const TodaysWorkoutCard: React.FC<TodaysWorkoutCardProps> = ({ studentData, currentDate, onStartWorkout, setStudentData, exerciseDatabase, onResetWorkout }) => {
    
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const isPastDate = currentDate < today;
    const todayKey = currentDate.toISOString().split('T')[0];
    const todaysWorkout = studentData.workoutPlan?.find(w => w.day.toLowerCase() === currentDate.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase());
    const isCompleted = studentData.completionHistory?.[todayKey] === 'completed';
    const isMissed = studentData.completionHistory?.[todayKey] === 'missed';
    const inProgress = !!studentData.currentWorkoutProgress && studentData.currentWorkoutProgress.date === todayKey;
    const progress = studentData.currentWorkoutProgress?.progress;

    useEffect(() => {
        if (isPastDate && todaysWorkout && !isCompleted && !isMissed) {
            setStudentData(prev => {
                const newHistory = { ...(prev.completionHistory || {}), [todayKey]: 'missed' as const };
                return { ...prev, completionHistory: newHistory };
            }, { showSuccessToast: false });
        }
    }, [isPastDate, todaysWorkout, isCompleted, isMissed, todayKey, setStudentData]);


    if (!todaysWorkout) {
        return (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 text-center">
                <h2 className="text-xl font-bold mb-2">Dia de Descanso</h2>
                <p className="text-gray-400">Aproveite para se recuperar. O descanso é parte do treino!</p>
            </div>
        );
    }
    
    const blockTypeLabels: Record<string, string> = {
        biset: 'Bi-Set',
        triset: 'Tri-Set',
        superset: 'Super-Set',
    };

    const renderCompletedFooter = () => {
        return (
            <div className="w-full bg-green-900/50 text-green-300 font-bold py-3 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 mr-2" /> Treino Concluído!
            </div>
        );
    };

    return (
        <>
            <div className={`p-6 rounded-xl border ${
                isCompleted ? 'bg-green-900/20 border-green-800/40' : 
                isMissed ? 'bg-red-900/20 border-red-800/40' :
                'bg-gray-800/50 border-gray-700/50'
            }`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-400">{todaysWorkout.day}</p>
                        <h2 className="text-2xl font-bold mb-1">{todaysWorkout.label}</h2>
                    </div>
                    {isCompleted && <CheckCircleIcon className="w-10 h-10 text-green-400" />}
                    {isMissed && <XCircleIcon className="w-10 h-10 text-red-400" />}
                </div>

                <div className="mt-6 space-y-4">
                    {todaysWorkout.blocks.filter(Boolean).map((block, blockIndex) => (
                        <div key={block.id} className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/60">
                            {block.type !== 'single' && (
                                <p className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">
                                    {blockTypeLabels[block.type] || block.type}
                                </p>
                            )}
                            <div className="space-y-3">
                                {(block.exercises || []).filter(Boolean).map((ex, exerciseIndex) => {
                                    let isExerciseCompleted = false;
                                    if (inProgress && progress) {
                                        if (blockIndex < progress.activeBlockIndex) {
                                            isExerciseCompleted = true;
                                        } else if (blockIndex === progress.activeBlockIndex && exerciseIndex < progress.activeExerciseInBlockIndex) {
                                            isExerciseCompleted = true;
                                        }
                                    }

                                    return (
                                        <div key={ex.id} className="flex justify-between items-center text-gray-300">
                                            <span className={`flex-1 pr-4 transition-colors ${isExerciseCompleted ? 'line-through text-gray-500' : ''}`}>
                                                {exerciseDatabase[ex.exerciseId]?.name || ex.exerciseId}
                                            </span>
                                            <span className={`bg-gray-700 text-white text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-md transition-opacity ${isExerciseCompleted ? 'opacity-50' : ''}`}>
                                                {ex.sets}x{ex.reps}{ex.durationType === 'time' ? 's' : ''}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6">
                    {isCompleted ? (
                        renderCompletedFooter()
                    ) : isMissed || isPastDate ? (
                        <button disabled className="w-full bg-gray-700 text-gray-400 font-bold py-3 rounded-lg flex items-center justify-center cursor-not-allowed">
                            <XCircleIcon className="w-5 h-5 mr-2"/> Treino Não Realizado
                        </button>
                    ) : (
                        <div className="flex gap-2">
                             <button onClick={onStartWorkout} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                                {inProgress ? <><ClockIcon className="w-5 h-5 mr-2"/> Continuar Treino</> : <><DumbbellIcon className="w-5 h-5 mr-2"/> Começar a Treinar</>}
                            </button>
                            {inProgress && (
                                <button onClick={onResetWorkout} className="p-3 bg-red-800/50 text-red-300 rounded-lg hover:bg-red-800/80 transition-colors" title="Reiniciar Treino de Hoje">
                                    <XCircleIcon className="w-6 h-6"/>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TodaysWorkoutCard;