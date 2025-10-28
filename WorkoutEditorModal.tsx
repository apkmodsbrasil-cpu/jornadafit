
import React, { useState } from 'react';
import type { Student, Workout, Exercise, Correction, ModificationType, WorkoutBlock, WorkoutBlockType, Personal, ExerciseDetails } from './types.ts';
import EditIcon from './icons/EditIcon.tsx';
import TrashIcon from './icons/TrashIcon.tsx';
import PlusCircleIcon from './icons/PlusCircleIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
// Fix: Renamed useGemini to useAI and updated the import path.
import { useAI } from './hooks/useAI.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import ShuffleIcon from './icons/ShuffleIcon.tsx';
import TrendingUpIcon from './icons/TrendingUpIcon.tsx';
import TrendingDownIcon from './icons/TrendingDownIcon.tsx';

interface WorkoutEditorModalProps {
  personal: Personal;
  student: Student;
  initialWorkoutPlan: Workout[];
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
  onAddCorrection: (correction: Correction) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  // FIX: Add exerciseDatabase and addExercise to props
  exerciseDatabase: Record<string, ExerciseDetails>;
  addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
  apiKeys: string[];
}

const WorkoutEditorModal: React.FC<WorkoutEditorModalProps> = ({ personal, student, initialWorkoutPlan, onClose, onSave, onAddCorrection, addToast, exerciseDatabase, addExercise, apiKeys }) => {
  const [editablePlan, setEditablePlan] = useState<Workout[]>(JSON.parse(JSON.stringify(initialWorkoutPlan)));
  const [openWorkoutId, setOpenWorkoutId] = useState<string | null>(initialWorkoutPlan[0]?.id || null);
  // Fix: Switched from useGemini to useAI and updated the hook call to match the new structure.
  const { generators } = useAI({ personal, addToast, mode: 'personal', studentContext: student, exerciseDatabase, addExercise, apiKeys });
  const [variationLoadingId, setVariationLoadingId] = useState<string | null>(null);
  const [modificationMenuId, setModificationMenuId] = useState<string | null>(null);

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

  const handleAddBlock = (workoutId: string) => {
    const newBlock: WorkoutBlock = {
      id: `block-${Date.now()}`,
      type: 'single',
      restAfterBlock: '60s',
      exercises: [{ id: `inst-${Date.now()}`, exerciseId: 'supino-reto-barra', sets: '3', reps: '10', rest: '10s' }]
    };
    setEditablePlan(prev => prev.map(w => w.id === workoutId ? { ...w, blocks: [...w.blocks, newBlock] } : w));
  };

  const handleAddExerciseToBlock = (workoutId: string, blockId: string) => {
    const newExercise: Exercise = { id: `inst-${Date.now()}`, exerciseId: 'supino-inclinado-halteres', sets: '3', reps: '10', rest: '10s' };
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
        // FIX: Added the missing 'workoutContext' argument to the function call.
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
  
  const blockTypeLabels: Record<WorkoutBlockType, string> = {
    single: 'Exercício Único',
    biset: 'Bi-Set',
    superset: 'Super-Set',
    triset: 'Tri-Set',
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col h-[90vh] max-h-[800px] m-4" onClick={e => e.stopPropagation()}>
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
                    <div key={block.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 space-y-2">
                        <div className="flex justify-between items-center">
                            <select value={block.type} onChange={e => handleBlockChange(workout.id, block.id, 'type', e.target.value as WorkoutBlockType)} className="bg-gray-700 text-white text-xs p-1 rounded">
                                {Object.entries(blockTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                            </select>
                            <button onClick={() => handleRemoveBlock(workout.id, block.id)}><TrashIcon className="w-4 h-4 text-red-400" /></button>
                        </div>

                      {block.exercises.map((exercise) => (
                        <div key={exercise.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">
                                {/* FIX: Use exerciseDatabase prop to render options */}
                                <select value={exercise.exerciseId} onChange={e => handleExerciseChange(workout.id, block.id, exercise.id, 'exerciseId', e.target.value)} className="w-full bg-gray-700 p-1.5 rounded-md text-sm">
                                    {/* FIX: Cast 'details' to ExerciseDetails to access the 'name' property. */}
                                    {Object.entries(exerciseDatabase).map(([id, details]) => <option key={id} value={id}>{(details as ExerciseDetails).name}</option>)}
                                </select>
                            </div>
                            <input type="text" value={exercise.sets} onChange={e => handleExerciseChange(workout.id, block.id, exercise.id, 'sets', e.target.value)} className="col-span-1 bg-gray-700 p-1.5 rounded-md text-center text-sm" />
                            <input type="text" value={exercise.reps} onChange={e => handleExerciseChange(workout.id, block.id, exercise.id, 'reps', e.target.value)} className="col-span-2 bg-gray-700 p-1.5 rounded-md text-center text-sm" />
                            <div className="col-span-3 flex items-center gap-1">
                                <button onClick={() => handleRemoveExercise(workout.id, block.id, exercise.id)}><TrashIcon className="w-4 h-4 text-red-400" /></button>
                                <div className="relative">
                                    <button onClick={() => setModificationMenuId(modificationMenuId === exercise.id ? null : exercise.id)} disabled={variationLoadingId === exercise.id}>
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
