import React, { useState, useEffect } from 'react';
// FIX: Add ExerciseDetails to the import to use it in the component's props.
import type { Student, Correction, Personal, ExerciseDetails } from './types.ts';
import StudentManagementModal from './components/StudentManagementModal.tsx';
import PersonalRadarDashboard from './components/PersonalRadarDashboard.tsx';
import RadarIcon from './components/icons/RadarIcon.tsx';
import UserIcon from './components/icons/UserIcon.tsx';
import AddStudentModal from './components/AddStudentModal.tsx';
import StudentList from './components/personal/StudentList.tsx';

interface PersonalViewProps {
  personal: Personal;
  students: Student[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddStudent: (studentData: { name: string; email: string; password: string; }) => Promise<{success: boolean, error?: string}>;
  onAddCorrection: (correction: Correction) => void;
  onUpdatePersonalAiPrefs: (notes: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  // FIX: Added missing exerciseDatabase and addExercise props to the interface.
  exerciseDatabase: Record<string, ExerciseDetails>;
  addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
  apiKeys: string[];
}

const PersonalView: React.FC<PersonalViewProps> = ({ personal, students, onSaveStudent, onDeleteStudent, onAddStudent, onAddCorrection, onUpdatePersonalAiPrefs, addToast, exerciseDatabase, addExercise, apiKeys }) => {
  const [isManagementModalOpen, setManagementModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'radar'>('list');

  const handleAddNewStudent = () => {
    setAddModalOpen(true);
  };
  
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setManagementModalOpen(true);
  };

  const handleSaveAndClose = (studentData: Student) => {
    onSaveStudent(studentData);
    setManagementModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDeleteAndClose = (studentId: string) => {
    onDeleteStudent(studentId);
    setManagementModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel do Personal</h1>
        <button onClick={() => setViewMode(viewMode === 'list' ? 'radar' : 'list')} className="flex items-center px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
            {viewMode === 'list' ? <RadarIcon className="w-5 h-5 mr-2" /> : <UserIcon className="w-5 h-5 mr-2" />}
            {viewMode === 'list' ? 'Ver Radar' : 'Ver Alunos'}
        </button>
      </div>

      {viewMode === 'list' ? (
        <StudentList 
            students={students}
            onSelectStudent={handleSelectStudent}
            onAddNewStudent={handleAddNewStudent}
        />
      ) : (
        <PersonalRadarDashboard students={students} onSelectStudent={handleSelectStudent} />
      )}
      
      {isManagementModalOpen && selectedStudent && (
        <StudentManagementModal
          personal={personal}
          student={selectedStudent}
          onClose={() => setManagementModalOpen(false)}
          onSave={handleSaveAndClose}
          onDelete={handleDeleteAndClose}
          onAddCorrection={onAddCorrection}
          onUpdatePersonalAiPrefs={onUpdatePersonalAiPrefs}
          addToast={addToast}
          // FIX: Passed down the missing exerciseDatabase and addExercise props to the modal.
          exerciseDatabase={exerciseDatabase}
          addExercise={addExercise}
          apiKeys={apiKeys}
        />
      )}

      {isAddModalOpen && (
        <AddStudentModal
          onClose={() => setAddModalOpen(false)}
          onAddStudent={onAddStudent}
        />
      )}
    </div>
  );
};

export default PersonalView;
