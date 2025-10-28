import React, { useState, useEffect, useMemo } from 'react';
import type { Workout, WorkoutLog, WorkoutProgressState, PerformanceHistory, ExerciseDetails } from './types.ts';
import LogSetModal from './components/LogSetModal.tsx';
import RestTimerModal from './components/RestTimerModal.tsx';
import HowToModal from './components/HowToModal.tsx';
import FlameIcon from './components/icons/FlameIcon.tsx';
import SnowflakeIcon from './components/icons/SnowflakeIcon.tsx';
import ExerciseDisplay from './components/workout-execution/ExerciseDisplay.tsx';
import SetTracker from './components/workout-execution/SetTracker.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';

interface WorkoutExecutionModalProps {
  workout: Workout;
  initialProgress: WorkoutProgressState;
  onClose: (progress: WorkoutProgressState) => void;
  onFinish: (logs: WorkoutLog[]) => void;
  onProgressUpdate: (progress: WorkoutProgressState) => void;
  performanceHistory?: PerformanceHistory;
  onOpenRoutine: (type: 'warmup' | 'cooldown') => void;
  // FIX: Add exerciseDatabase prop
  exerciseDatabase: Record<string, ExerciseDetails>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const WorkoutExecutionModal: React.FC<WorkoutExecutionModalProps> = ({ workout, initialProgress, onClose, onFinish, onProgressUpdate, performanceHistory, onOpenRoutine, exerciseDatabase, addToast }) => {
  const [progress, setProgress] = useState<WorkoutProgressState>(initialProgress);
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [isRestModalOpen, setRestModalOpen] = useState(false);
  const [isHowToModalOpen, setHowToModalOpen] = useState(false);
  const [isConfirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [restDuration, setRestDuration] = useState(0);

  const { activeBlockIndex, activeExerciseInBlockIndex, currentSetIndex } = progress;
  const activeBlock = workout.blocks[activeBlockIndex];
  const activeExercise = activeBlock?.exercises[activeExerciseInBlockIndex];
  
  const totalSets = useMemo(() => activeExercise ? parseInt(activeExercise.sets) : 0, [activeExercise]);

  useEffect(() => {
    onProgressUpdate(progress);
  }, [progress, onProgressUpdate]);
  
  const handleLogSet = (logData: { weight?: string, reps?: string }) => {
    setLogModalOpen(false);
    
    const newLog: WorkoutLog = {
      blockId: activeBlock.id,
      exerciseId: activeExercise.exerciseId,
      setIndex: currentSetIndex,
      ...logData,
    };
    
    setProgress(prev => ({...prev, logs: [...prev.logs, newLog] }));
    
    let restTime = 60; // default
    if (currentSetIndex < totalSets - 1) {
        const restString = activeExercise.rest || '60s';
        restTime = parseInt(restString.replace('s', ''));
    } else {
        const restString = activeBlock.restAfterBlock || '60s';
        restTime = parseInt(restString.replace('s', ''));
    }
    setRestDuration(restTime);
    setRestModalOpen(true);
  };

  const handleFinishRest = () => {
    setRestModalOpen(false);
    advanceToNextStep();
  };
  
  const advanceToNextStep = () => {
     if (currentSetIndex < totalSets - 1) {
      setProgress(prev => ({...prev, currentSetIndex: prev.currentSetIndex + 1}));
    } else {
      if (activeExerciseInBlockIndex < activeBlock.exercises.length - 1) {
        setProgress(prev => ({...prev, activeExerciseInBlockIndex: prev.activeExerciseInBlockIndex + 1, currentSetIndex: 0}));
      } else {
        if (activeBlockIndex < workout.blocks.length - 1) {
          setProgress(prev => ({...prev, activeBlockIndex: prev.activeBlockIndex + 1, activeExerciseInBlockIndex: 0, currentSetIndex: 0}));
        } else {
          setConfirmFinishOpen(true);
        }
      }
    }
  }

  const handleClose = () => {
    onClose(progress);
  };
  
  if (!activeBlock || !activeExercise) {
    return null;
  }
  
  // FIX: Use exerciseDatabase from props
  const activeExerciseDetails = exerciseDatabase[activeExercise.exerciseId];

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={handleClose}>
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-[90vh] max-h-[700px] m-4" onClick={e => e.stopPropagation()}>
            <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-white">{workout.label}</h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
            </header>
            
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <ExerciseDisplay 
                    activeBlock={activeBlock}
                    activeExercise={activeExercise}
                    exerciseDetails={activeExerciseDetails}
                    performanceHistory={performanceHistory}
                />
                
                <SetTracker
                    currentSetIndex={currentSetIndex}
                    totalSets={totalSets}
                    onOpenLogModal={() => setLogModalOpen(true)}
                    onOpenHowToModal={() => setHowToModalOpen(true)}
                    onSkipExercise={advanceToNextStep}
                    observation={activeExercise.observation}
                />
            </div>

            <footer className="p-3 border-t border-gray-700 grid grid-cols-2 gap-2 flex-shrink-0">
                <button onClick={() => onOpenRoutine('warmup')} className="flex items-center justify-center p-2 text-sm text-orange-300 hover:bg-gray-700 rounded-md">
                    <FlameIcon className="w-5 h-5 mr-2" /> Aquecimento
                </button>
                <button onClick={() => onOpenRoutine('cooldown')} className="flex items-center justify-center p-2 text-sm text-cyan-300 hover:bg-gray-700 rounded-md">
                    <SnowflakeIcon className="w-5 h-5 mr-2" /> Volta à Calma
                </button>
            </footer>
        </div>
      </div>
      
      {isLogModalOpen && (
        // FIX: Pass the required 'exercise' prop to the LogSetModal component.
        <LogSetModal exercise={activeExercise} onClose={() => setLogModalOpen(false)} onLog={handleLogSet} initialValues={{ weight: activeExercise.targetWeight?.toString(), reps: activeExercise.targetReps?.toString() }}/>
      )}
      {isRestModalOpen && (
        <RestTimerModal duration={restDuration} onFinishRest={handleFinishRest} />
      )}
      {isHowToModalOpen && activeExerciseDetails && (
          <HowToModal exerciseDetails={activeExerciseDetails} onClose={() => setHowToModalOpen(false)} />
      )}
      {isConfirmFinishOpen && (
        <ConfirmationModal
            isOpen={isConfirmFinishOpen}
            onClose={() => setConfirmFinishOpen(false)}
            onConfirm={() => {
                setConfirmFinishOpen(false);
                onFinish(progress.logs);
            }}
            title="Finalizar Treino?"
            message="Tem certeza que deseja finalizar o treino de hoje?"
            confirmText="Sim, Finalizar"
            cancelText="Ainda não"
        />
      )}
    </>
  );
};

export default WorkoutExecutionModal;