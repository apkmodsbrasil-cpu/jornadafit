import React, { useState, useEffect, useMemo } from 'react';
import type { Workout, WorkoutLog, WorkoutProgressState, PerformanceHistory, ExerciseDetails, Routine } from '../types.ts';
import LogSetModal from './LogSetModal.tsx';
import RestTimerModal from './RestTimerModal.tsx';
import HowToModal from './HowToModal.tsx';
import FlameIcon from './icons/FlameIcon.tsx';
import SnowflakeIcon from './icons/SnowflakeIcon.tsx';
import ExerciseDisplay from './workout-execution/ExerciseDisplay.tsx';
import SetTracker from './workout-execution/SetTracker.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import XCircleIcon from './icons/XCircleIcon.tsx';


interface WorkoutExecutionModalProps {
  workout: Workout;
  initialProgress: WorkoutProgressState;
  onClose: (progress: WorkoutProgressState) => void;
  onFinish: (logs: WorkoutLog[]) => void;
  onProgressUpdate: (progress: WorkoutProgressState) => void;
  performanceHistory?: PerformanceHistory;
  onOpenRoutine: (type: 'warmup' | 'cooldown', routine: Routine) => void;
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

  const advanceToNextStep = () => {
    // This is called AFTER rest, or immediately for intermediate bi-set exercises.
    if (!activeBlock || !activeExercise) return;

    if (activeBlock.type === 'single') {
        if (currentSetIndex < totalSets - 1) {
            // Next set of same exercise
            setProgress(prev => ({...prev, currentSetIndex: prev.currentSetIndex + 1}));
        } else {
            // Finished all sets, move to next block
            if (activeBlockIndex < workout.blocks.length - 1) {
                setProgress(prev => ({...prev, activeBlockIndex: prev.activeBlockIndex + 1, activeExerciseInBlockIndex: 0, currentSetIndex: 0}));
            } else {
                // Finished workout
                setConfirmFinishOpen(true);
            }
        }
    } else { // Multi-exercise block logic (biset, triset, etc.)
        const isLastExerciseInBlock = activeExerciseInBlockIndex === activeBlock.exercises.length - 1;
        const isLastSet = currentSetIndex === totalSets - 1;
        
        if (!isLastExerciseInBlock) {
            // Move to next exercise in the same set
            setProgress(prev => ({...prev, activeExerciseInBlockIndex: prev.activeExerciseInBlockIndex + 1}));
        } else { // We finished the LAST exercise of the block for the current set.
            if (!isLastSet) {
                // Time to start the next set, back at the first exercise.
                setProgress(prev => ({...prev, activeExerciseInBlockIndex: 0, currentSetIndex: prev.currentSetIndex + 1}));
            } else {
                // Finished all sets of this block. Move to the next block.
                if (activeBlockIndex < workout.blocks.length - 1) {
                    setProgress(prev => ({...prev, activeBlockIndex: prev.activeBlockIndex + 1, activeExerciseInBlockIndex: 0, currentSetIndex: 0}));
                } else {
                    // Finished workout
                    setConfirmFinishOpen(true);
                }
            }
        }
    }
  };

  const handleLogSet = (logData: { weight?: string, reps?: string }) => {
    setLogModalOpen(false);
    
    const newLog: WorkoutLog = {
      blockId: activeBlock.id,
      exerciseId: activeExercise.exerciseId,
      setIndex: currentSetIndex,
      ...logData,
    };
    
    // Update progress with new log first, then decide next action
    setProgress(prev => {
        const nextProgress = {...prev, logs: [...prev.logs, newLog]};

        // Decide next step within the state update to avoid race conditions
        const isLastExerciseInBlock = activeExerciseInBlockIndex === activeBlock.exercises.length - 1;
        const isMultiExerciseBlock = activeBlock.type !== 'single';
        
        if (isMultiExerciseBlock && !isLastExerciseInBlock) {
            // Intermediate exercise in a multi-set block, advance immediately without rest.
            // No rest timer, so we manually call the next step logic.
            // This is tricky inside a state setter. Let's handle it outside.
        }
        
        return nextProgress;
    });

    const isLastExerciseInBlock = activeExerciseInBlockIndex === activeBlock.exercises.length - 1;
    const isMultiExerciseBlock = activeBlock.type !== 'single';
    
    if (isMultiExerciseBlock && !isLastExerciseInBlock) {
        // No rest for intermediate exercises in a bi-set, etc.
        advanceToNextStep();
    } else {
        // This is a single exercise or the last exercise of a multi-set block, so we rest.
        const isLastSetOfBlock = currentSetIndex === totalSets - 1;
        const isLastBlockOfWorkout = activeBlockIndex === workout.blocks.length - 1;

        if (isLastSetOfBlock && isLastBlockOfWorkout) {
             advanceToNextStep(); // This will trigger the finish confirmation, no rest needed.
             return;
        }

        let restTime = 60; // default
        if (!isLastSetOfBlock) {
            restTime = parseInt(activeExercise.rest?.replace('s', '') || '60');
        } else {
            restTime = parseInt(activeBlock.restAfterBlock?.replace('s', '') || '60');
        }

        setRestDuration(restTime);
        setRestModalOpen(true);
    }
  };

  const handleFinishRest = () => {
    setRestModalOpen(false);
    advanceToNextStep();
  };

  const handleSkipExercise = () => {
    addToast(`${activeExerciseDetails?.name} pulado.`, 'info');
    advanceToNextStep();
  }

  const handleClose = () => {
    onClose(progress);
  };
  
  if (!activeBlock || !activeExercise) {
    // This can happen if plan structure is broken. Close safely.
    if(progress.logs.length > 0) {
        onClose(progress);
    } else {
        onClose(initialProgress);
    }
    return null;
  }
  
  const activeExerciseDetails = exerciseDatabase[activeExercise.exerciseId];
  
  const hasWarmup = workout.warmup && workout.warmup.length > 0;
  const hasCooldown = workout.cooldown && workout.cooldown.length > 0;
  const showFooter = hasWarmup || hasCooldown;

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
                    onSkipExercise={handleSkipExercise}
                    observation={activeExercise.observation}
                />
            </div>

            {showFooter && (
                <footer className={`p-3 border-t border-gray-700 grid ${hasWarmup && hasCooldown ? 'grid-cols-2' : 'grid-cols-1'} gap-2 flex-shrink-0`}>
                    {hasWarmup && (
                        <button onClick={() => onOpenRoutine('warmup', { items: workout.warmup! })} className="flex items-center justify-center p-2 text-sm text-orange-300 hover:bg-gray-700 rounded-md">
                            <FlameIcon className="w-5 h-5 mr-2" /> Aquecimento
                        </button>
                    )}
                    {hasCooldown && (
                         <button onClick={() => onOpenRoutine('cooldown', { items: workout.cooldown! })} className="flex items-center justify-center p-2 text-sm text-cyan-300 hover:bg-gray-700 rounded-md">
                            <SnowflakeIcon className="w-5 h-5 mr-2" /> Volta à Calma
                        </button>
                    )}
                </footer>
            )}
        </div>
      </div>
      
      {isLogModalOpen && (
        <LogSetModal
          // FIX: Pass the required 'exercise' prop to the LogSetModal component.
          exercise={activeExercise}
          onClose={() => setLogModalOpen(false)}
          onLog={handleLogSet}
          initialValues={{ weight: activeExercise.targetWeight?.toString(), reps: activeExercise.targetReps?.toString() }}
        />
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