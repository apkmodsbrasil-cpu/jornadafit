import React, { useState } from 'react';
// FIX: Corrected import path for types from root directory.
import type { Student, Workout, Exercise, Correction, ModificationType, WorkoutBlock, WorkoutBlockType, Personal, ExerciseDetails } from '../types.ts';
import EditIcon from './icons/EditIcon.tsx';
import TrashIcon from './icons/TrashIcon.tsx';
import PlusCircleIcon from './icons/PlusCircleIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
// FIX: Corrected import path for useAI hook.
import { useAI } from '../hooks/useAI.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import ShuffleIcon from './icons/ShuffleIcon.tsx';
import TrendingUpIcon from './icons/TrendingUpIcon.tsx';
import TrendingDownIcon from './icons/TrendingDownIcon.tsx';
import ExerciseAutocomplete from './ExerciseAutocomplete.tsx';
import GripVerticalIcon from './icons/GripVerticalIcon.tsx';

interface WorkoutEditorModalProps {
  personal: Personal;
  student: Student;
  initialWorkoutPlan: Workout[];
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
  onAddCorrection: (correction: Correction) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  exerciseDatabase: Record<string, ExerciseDetails>;
  addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
  apiKeys: string[];
}

const WorkoutEditorModal: React.FC<WorkoutEditorModalProps> = ({ personal, student, initialWorkoutPlan, onClose, onSave, onAddCorrection, addToast, exerciseDatabase, addExercise, apiKeys }) => {
  const [editablePlan, setEditablePlan] = useState<Workout[]>(JSON.parse(JSON.stringify(initialWorkoutPlan)));
  const [openWorkoutId, setOpenWorkoutId] = useState<string | null>(initialWorkoutPlan[0]?.id || null);
  const { generators, isGenerating } = useAI({ personal, addToast, mode: 'personal', studentContext: student, exerciseDatabase, addExercise, apiKeys });
  const [variationLoadingId, setVariationLoadingId] = useState<string | null>(null);
  const [modificationMenuId, setModificationMenuId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<{ workoutId: string; blockId: string } | null>(null);

  const handleBlockChange = (workoutId: string, blockId: string, field: keyof WorkoutBlock, value: any) => {
    setEditablePlan(prev => prev.map(w => w.id === workoutId ? { ...w, blocks: w.blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b) } : w));
  };
  
  const handleExerciseChange = (workoutId: string, blockId: string, exerciseId: string, field: keyof Exercise, value: any) => {
    setEditablePlan(prev => prev.map(w => w.id === workoutId ? {
      ...w,
      blocks: w.blocks.map(b => b.id === blockId ? {
        ...b,
        exercises: b.exercises.map(e => e.id === exerciseId ? { ...e, [field]: value } : e)
      } : b)
    } : w));
  };

  const handleAddNewExerciseForAutocomplete = async (exerciseName: string): Promise<string | null> => {
    const result = await generators.generateAndAddExercise(exerciseName);
    if (result) {
      return result.id;
    }
    addToast(`Falha ao criar o exercício "${exerciseName}"`, 'error');
    return null;
  };

  const handleAddBlock = (workoutId: string) => {
    const newBlock: WorkoutBlock = {
      id: `block-${Date.now()}`,
      type: 'single',
      restAfterBlock: '60s',
      exercises: [{ id: `inst-${Date.now()}`, exerciseId: 'supino-reto-barra', sets: '3', reps: '10', rest: '60s' }]
    };
    setEditablePlan(prev => prev.map(w => w.id === workoutId ? { ...w, blocks: [...w.blocks, newBlock] } : w));
  };

  const handleAddExerciseToBlock = (workoutId: string, blockId: string) => {
    const newExercise: Exercise = { id: `inst-${Date.now()}`, exerciseId: 'supino-inclinado-halteres', sets: '3', reps: '10', rest: '60s' };
    setEditablePlan(prev => prev.map(w => w.id === workoutId ? {
      ...w,
      blocks: w.blocks.map(b => b.id === blockId ? { ...b, exercises: [...b.exercises, newExercise] } : b)
    } : w));
  };

  const handleRemoveExercise = (workoutId: string, blockId: string, exerciseId: string) => {
    setEditablePlan(prev => prev.map(w => w.id === workoutId ? {
      ...w,
      blocks: w.blocks.map(b => b.id === blockId ? { ...b, exercises: b.exercises.filter(e => e.id !== exerciseId) } : b)
    } : w));
  };
  
  const handleRemoveBlock = (workoutId: string, blockId: string) => {
      setEditablePlan(prev => prev.map(w => w.id === workoutId ? { ...w, blocks: w.blocks.filter(b => b.id !== blockId) } : w));
  };


  const handleRequestModification = async (workoutId: string, blockId: string, exerciseInstanceId: string, exerciseIdToReplace: string, type: ModificationType) => {
    setModificationMenuId(null);
    setVariationLoadingId(exerciseInstanceId);
    
    const workoutContext = editablePlan.find(w => w.id === workoutId);
    if (!workoutContext) {
        addToast("Erro: Contexto do treino não encontrado.", 'error');
        setVariationLoadingId(null);
        return;
    }

    try {
        const newExerciseId = await generators.suggestExerciseModification(exerciseIdToReplace, student, type, workoutContext);
        if (newExerciseId && exerciseDatabase[newExerciseId]) {
            handleExerciseChange(workoutId, blockId, exerciseInstanceId, 'exerciseId', newExerciseId);
            addToast('Modificação sugerida pela IA aplicada!', 'success');
        } else {
            addToast("A IA não conseguiu sugerir uma modificação válida.", 'error');
        }
    } catch (e: any) {
        addToast(`Erro ao sugerir modificação: ${e.message}`, 'error');
    } finally {
        setVariationLoadingId(null);
    }
  }

  const handleSaveChanges = () => { 
      const updatedStudent = { ...student, workoutPlan: editablePlan };
      onSave(updatedStudent);
  };
  
  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, workoutId: string, blockId: string) => {
    setDraggedBlock({ workoutId, blockId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetWorkoutId: string, targetBlockId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock.workoutId !== targetWorkoutId || draggedBlock.blockId === targetBlockId) {
      return;
    }

    setEditablePlan(prevPlan => {
      const newPlan = [...prevPlan];
      const workoutIndex = newPlan.findIndex(w => w.id === targetWorkoutId);
      if (workoutIndex === -1) return prevPlan;

      const workout = newPlan[workoutIndex];
      const blocks = [...workout.blocks];
      const draggedIndex = blocks.findIndex(b => b.id === draggedBlock.blockId);
      const targetIndex = blocks.findIndex(b => b.id === targetBlockId);

      if (draggedIndex === -1 || targetIndex === -1) return prevPlan;

      const [removed] = blocks.splice(draggedIndex, 1);
      blocks.splice(targetIndex, 0, removed);
      
      newPlan[workoutIndex] = { ...workout, blocks };
      return newPlan;
    });

    setDraggedBlock(null);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  const blockTypeLabels: Record<WorkoutBlockType, string> = {
    single: 'Exercício Único',
    biset: 'Bi-Set',
    superset: 'Super-Set',
    triset: 'Tri-Set',
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[60]" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-700 flex flex-col h-[90vh] max-h-[800px] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <EditIcon className="w-6 h-6 mr-3 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Editar Treino de {student.name.split(' ')[0]}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>

        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-3">
          {editablePlan.map((workout) => (
            <div key={workout.id} className="bg-gray-800 rounded-lg border border-gray-700">
              <button 
                onClick={() => setOpenWorkoutId(openWorkoutId === workout.id ? null : workout.id)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <span className="font-semibold text-white">{workout.day}: {workout.label} ({workout.muscleGroups.join(', ')})</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openWorkoutId === workout.id ? 'rotate-180' : ''}`} />
              </button>
              {openWorkoutId === workout.id && (
                <div className="p-4 border-t border-gray-700/50 space-y-4">
                  {workout.blocks.map((block) => (
                    <div 
                        key={block.id} 
                        className={`bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-3 transition-opacity ${draggedBlock?.blockId === block.id ? 'opacity-30' : 'opacity-100'}`}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, workout.id, block.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, workout.id, block.id)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="cursor-grab text-gray-500 hover:text-gray-300" title="Arraste para reordenar">
                                    <GripVerticalIcon className="w-5 h-5" />
                                </div>
                                <select value={block.type} onChange={e => handleBlockChange(workout.id, block.id, 'type', e.target.value as WorkoutBlockType)} className="bg-gray-700 text-white text-xs p-1 rounded">
                                    {Object.entries(blockTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                </select>
                            </div>
                            <button onClick={() => handleRemoveBlock(workout.id, block.id)}><TrashIcon className="w-4 h-4 text-red-400" /></button>
                        </div>

                      {block.exercises.map((exercise) => (
                        <div key={exercise.id} className="p-2 bg-gray-800/50 rounded-md">
                            <div className="space-y-2">
                                <ExerciseAutocomplete
                                    value={exercise.exerciseId}
                                    onChange={newId => handleExerciseChange(workout.id, block.id, exercise.id, 'exerciseId', newId)}
                                    exerciseDatabase={exerciseDatabase}
                                    onAddNewExercise={handleAddNewExerciseForAutocomplete}
                                    isCreating={isGenerating.exerciseGeneration}
                                />
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center gap-1">
                                        <label htmlFor={`sets-${exercise.id}`} className="text-gray-400 text-xs">Séries</label>
                                        <input id={`sets-${exercise.id}`} type="text" value={exercise.sets} onChange={e => handleExerciseChange(workout.id, block.id, exercise.id, 'sets', e.target.value)} className="w-14 bg-gray-700 p-1.5 rounded-md text-center text-sm" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <label htmlFor={`reps-${exercise.id}`} className="text-gray-400 text-xs">Reps</label>
                                        <input id={`reps-${exercise.id}`} type="text" value={exercise.reps} onChange={e => handleExerciseChange(workout.id, block.id, exercise.id, 'reps', e.target.value)} className="w-20 bg-gray-700 p-1.5 rounded-md text-center text-sm" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <label htmlFor={`rest-${exercise.id}`} className="text-gray-400 text-xs">Desc.</label>
                                        <input id={`rest-${exercise.id}`} type="text" value={exercise.rest} onChange={e => handleExerciseChange(workout.id, block.id, exercise.id, 'rest', e.target.value)} className="w-16 bg-gray-700 p-1.5 rounded-md text-center text-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => handleRemoveExercise(workout.id, block.id, exercise.id)} className="p-1 hover:bg-gray-700 rounded-full"><TrashIcon className="w-4 h-4 text-red-400" /></button>
                                    <div className="relative">
                                        <button onClick={() => setModificationMenuId(modificationMenuId === exercise.id ? null : exercise.id)} disabled={variationLoadingId === exercise.id} className="p-1 hover:bg-gray-700 rounded-full">
                                        {variationLoadingId === exercise.id ? <LoadingSpinner size="sm" /> : <SparklesIcon className="w-5 h-5 text-purple-400" />}
                                        </button>
                                        {modificationMenuId === exercise.id && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10">
                                                <button onClick={() => handleRequestModification(workout.id, block.id, exercise.id, exercise.exerciseId, 'variation')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 flex items-center"><ShuffleIcon className="w-4 h-4 mr-2" />Variar Exercício</button>
                                                <button onClick={() => handleRequestModification(workout.id, block.id, exercise.id, exercise.exerciseId, 'progression')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 flex items-center"><TrendingUpIcon className="w-4 h-4 mr-2"/>Sugerir Progressão</button>
                                                <button onClick={() => handleRequestModification(workout.id, block.id, exercise.id, exercise.exerciseId, 'regression')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 flex items-center"><TrendingDownIcon className="w-4 h-4 mr-2"/>Sugerir Regressão</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                      ))}
                      <button onClick={() => handleAddExerciseToBlock(workout.id, block.id)} className="text-xs text-blue-400 hover:text-blue-300 mt-1">+ Add Exercício ao Bloco</button>
                    </div>
                  ))}
                  <button onClick={() => handleAddBlock(workout.id)} className="w-full flex items-center justify-center p-2 text-sm text-green-400 hover:bg-gray-700/50 rounded-md border border-dashed border-gray-600">
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Adicionar Bloco de Treino
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
          <button onClick={handleSaveChanges} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Salvar Plano de Treino</button>
        </footer>
      </div>
    </div>
  );
};

export default WorkoutEditorModal;