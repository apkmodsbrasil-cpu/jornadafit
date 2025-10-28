import React from 'react';
import type { WorkoutBlock, Exercise, ExerciseDetails, PerformanceHistory } from '../../types.ts';
import HistoryIcon from '../icons/HistoryIcon.tsx';

interface ExerciseDisplayProps {
    activeBlock: WorkoutBlock;
    activeExercise: Exercise;
    exerciseDetails?: ExerciseDetails;
    performanceHistory?: PerformanceHistory;
}

const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({ activeBlock, activeExercise, exerciseDetails, performanceHistory }) => {
    const lastPerformance = performanceHistory?.[activeExercise.exerciseId];
    
    return (
        <div className="mb-6">
            <div className="bg-gray-800/50 p-4 rounded-xl text-center">
                {activeBlock.type !== 'single' && (
                    <p className="font-bold text-sm text-purple-400 mb-2 uppercase tracking-widest">{activeBlock.type}</p>
                )}
                <h3 className="text-2xl font-bold">{exerciseDetails?.name || activeExercise.exerciseId}</h3>
                <p className="text-gray-300 text-lg font-semibold">
                    {activeExercise.sets} séries de {activeExercise.reps} {activeExercise.durationType === 'time' ? 'segundos' : 'repetições'}
                </p>
                {lastPerformance && lastPerformance.lastWeight > 0 && (
                    <div className="mt-3 text-xs inline-flex items-center bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                        <HistoryIcon className="w-4 h-4 mr-2" />
                        Última vez: {lastPerformance.lastWeight}kg x {lastPerformance.lastReps} reps
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseDisplay;