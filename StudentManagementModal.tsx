import React, { useState } from 'react';
import type { Student, Workout, Correction, Personal, ExerciseDetails } from './types.ts';
// Fix: Renamed useGemini to useAI and updated the import path.
import { useAI } from './hooks/useAI.ts';
import MuscleGroupSelectorModal from './components/MuscleGroupSelectorModal.tsx';
import WorkoutEditorModal from './WorkoutEditorModal.tsx';
import PerformanceReviewModal from './components/PerformanceReviewModal.tsx';
import PeriodizationAssistantModal from './PeriodizationAssistantModal.tsx';
import TrashIcon from './components/icons/TrashIcon.tsx';
import UserIcon from './components/icons/UserIcon.tsx';
import ClipboardIcon from './components/icons/ClipboardIcon.tsx';
import AnamnesisDetailView from './components/AnamnesisDetailView.tsx';
import ManagementTab from './components/management-modal/ManagementTab.tsx';
import CredentialsModal from './components/CredentialsModal.tsx';

interface StudentManagementModalProps {
  personal: Personal;
  student: Student;
  onClose: () => void;
  onSave: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onAddCorrection: (correction: Correction) => void;
  onUpdatePersonalAiPrefs: (notes: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  // FIX: Add exerciseDatabase and addExercise to props
  exerciseDatabase: Record<string, ExerciseDetails>;
  addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
  apiKeys: string[];
}

const StudentManagementModal: React.FC<StudentManagementModalProps> = ({ personal, student, onClose, onSave, onDelete, onAddCorrection, onUpdatePersonalAiPrefs, addToast, exerciseDatabase, addExercise, apiKeys }) => {
  const [editableStudent, setEditableStudent] = useState<Student>(student);
  const [activeTab, setActiveTab] = useState<'management' | 'anamnesis'>('management');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSplitSelectorOpen, setIsSplitSelectorOpen] = useState(false);
  const [isPerformanceReviewOpen, setIsPerformanceReviewOpen] = useState(false);
  const [isPeriodizationAssistantOpen, setIsPeriodizationAssistantOpen] = useState(false);
  const [isCredentialsModalOpen, setCredentialsModalOpen] = useState(false);
  
  // Fix: Switched from useGemini to useAI and updated the hook call to match the new structure.
  const { generators, isGenerating } = useAI({ personal, addToast, mode: 'personal', studentsContext: [student], exerciseDatabase, addExercise, apiKeys });

  const handleSaveChanges = () => {
    onSave(editableStudent);
    onClose();
  };

  const handleDeleteConfirm = () => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${student.name}? Esta ação não pode ser desfeita.`)) {
      onDelete(student.id);
    }
  };

  const handleGeneratePlan = async (split: Record<string, string[]>) => {
    // Fix: Updated function call to use the generators object from the useAI hook.
    const newPlan = await generators.generateWorkoutPlan(editableStudent, split, []);
    if (newPlan) {
        setEditableStudent(prev => ({ ...prev, workoutPlan: newPlan, planStatus: 'pending_review' }));
        addToast(`Plano de treino gerado para ${student.name}! Revise antes de ativar.`, 'success');
    } else {
        addToast("Falha ao gerar o plano de treino. Verifique o console.", 'error');
    }
    setIsSplitSelectorOpen(false);
  };
  
  const handleSaveEditedPlan = (updatedStudent: Student) => {
      setEditableStudent(updatedStudent);
      setIsEditorOpen(false);
      onSave(updatedStudent);
  }

  const TabButton: React.FC<{
      tabName: 'management' | 'anamnesis';
      icon: React.ReactNode;
      label: string;
    }> = ({ tabName, icon, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === tabName
            ? 'border-blue-500 text-blue-400'
            : 'border-transparent text-gray-400 hover:text-white'
        }`}
    >
        {icon}
        <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col h-[90vh] max-h-[800px] m-4" onClick={e => e.stopPropagation()}>
          <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Gerenciar {student.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </header>

          <div className="flex border-b border-gray-700 flex-shrink-0">
             <TabButton tabName="management" icon={<UserIcon className="w-5 h-5"/>} label="Gerenciamento" />
             <TabButton tabName="anamnesis" icon={<ClipboardIcon className="w-5 h-5"/>} label="Anamnese" />
          </div>

          <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
            {activeTab === 'management' && (
              <ManagementTab
                editableStudent={editableStudent}
                setEditableStudent={setEditableStudent}
                onOpenEditor={() => setIsEditorOpen(true)}
                onOpenSplitSelector={() => setIsSplitSelectorOpen(true)}
                onOpenPerformanceReview={() => setIsPerformanceReviewOpen(true)}
                onOpenPeriodizationAssistant={() => setIsPeriodizationAssistantOpen(true)}
                onOpenCredentials={() => setCredentialsModalOpen(true)}
              />
            )}
            {activeTab === 'anamnesis' && (
              <div className="animate-fade-in">
                  <AnamnesisDetailView student={student} />
              </div>
            )}
          </div>

          <footer className="p-4 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center">
              <TrashIcon className="w-4 h-4 mr-2" /> Excluir Aluno
            </button>
            <div className="flex items-center">
              <button onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
              <button onClick={handleSaveChanges} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Salvar Alterações</button>
            </div>
          </footer>
        </div>
      </div>
      
      {isSplitSelectorOpen && (
        <MuscleGroupSelectorModal 
            personal={personal}
            student={editableStudent}
            onClose={() => setIsSplitSelectorOpen(false)}
            onGenerate={handleGeneratePlan}
            onUpdatePersonalAiPrefs={onUpdatePersonalAiPrefs}
            isGenerating={isGenerating}
            addToast={addToast}
            aiGenerators={generators}
        />
      )}
      
      {isEditorOpen && editableStudent.workoutPlan && (
        <WorkoutEditorModal 
            personal={personal}
            student={editableStudent}
            initialWorkoutPlan={editableStudent.workoutPlan}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveEditedPlan}
            onAddCorrection={onAddCorrection}
            addToast={addToast}
            exerciseDatabase={exerciseDatabase}
            addExercise={addExercise}
            apiKeys={apiKeys}
        />
      )}

      {isPerformanceReviewOpen && (
        <PerformanceReviewModal
            student={editableStudent}
            onClose={() => setIsPerformanceReviewOpen(false)}
            exerciseDatabase={exerciseDatabase}
        />
      )}

      {isPeriodizationAssistantOpen && (
        <PeriodizationAssistantModal
            personal={personal}
            student={editableStudent}
            onClose={() => setIsPeriodizationAssistantOpen(false)}
            onApplyPlan={() => {}} // Placeholder
            addToast={addToast}
            exerciseDatabase={exerciseDatabase}
            addExercise={addExercise}
            apiKeys={apiKeys}
        />
      )}

      {isCredentialsModalOpen && (
        <CredentialsModal
            student={editableStudent}
            password={editableStudent.password || ''}
            onClose={() => setCredentialsModalOpen(false)}
            addToast={addToast}
        />
      )}
    </>
  );
};

export default StudentManagementModal;
