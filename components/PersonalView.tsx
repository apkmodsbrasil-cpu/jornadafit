import React, { useState, useEffect } from 'react';
// FIX: Import ViewState from types.ts and remove local definition.
import type { Student, Correction, Personal, ExerciseDetails, ViewState } from '../types.ts';
import PersonalRadarDashboard from './PersonalRadarDashboard.tsx';
import RadarIcon from './icons/RadarIcon.tsx';
import UserIcon from './icons/UserIcon.tsx';
import StudentList from './personal/StudentList.tsx';
import LoadingSpinner from './LoadingSpinner.tsx';

interface PersonalViewProps {
  personal: Personal;
  students: Student[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddStudent: (studentData: { name: string; email: string; password: string; }) => Promise<{success: boolean, error?: string}>;
  onAddCorrection: (correction: Correction) => void;
  onUpdatePersonalAiPrefs: (notes: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  exerciseDatabase: Record<string, ExerciseDetails>;
  addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
  onFetchFullStudent: (studentId: string) => Promise<Student | null>;
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
}

const PersonalView: React.FC<PersonalViewProps> = ({
    personal, students, onSaveStudent, onDeleteStudent, onAddStudent,
    onAddCorrection, onUpdatePersonalAiPrefs, addToast, exerciseDatabase,
    addExercise, onFetchFullStudent, viewState, setViewState, setSelectedStudent
}) => {
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const { personalViewMode = 'list' } = viewState;

  const handleAddNewStudent = () => {
    setViewState(prev => ({ ...prev, modal: 'add_student' }));
  };
  
  const handleSelectStudent = async (student: Student) => {
    setIsFetchingStudent(true);
    const fullStudentData = await onFetchFullStudent(student.id);
    setIsFetchingStudent(false);
    if (fullStudentData) {
        setSelectedStudent(fullStudentData);
        setViewState(prev => ({ ...prev, modal: 'student_management', selectedStudentId: fullStudentData.id }));
    } else {
        addToast("Não foi possível carregar os dados completos do aluno.", "error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fade-in relative">
      {isFetchingStudent && (
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-20">
              <LoadingSpinner />
          </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel do Personal</h1>
        <button 
            onClick={() => setViewState(prev => ({ ...prev, personalViewMode: prev.personalViewMode === 'list' ? 'radar' : 'list' }))} 
            className="flex items-center px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
        >
            {personalViewMode === 'list' ? <RadarIcon className="w-5 h-5 mr-2" /> : <UserIcon className="w-5 h-5 mr-2" />}
            {personalViewMode === 'list' ? 'Ver Radar' : 'Ver Alunos'}
        </button>
      </div>

      {personalViewMode === 'list' ? (
        <StudentList 
            students={students}
            onSelectStudent={handleSelectStudent}
            onAddNewStudent={handleAddNewStudent}
        />
      ) : (
        <PersonalRadarDashboard students={students} onSelectStudent={handleSelectStudent} />
      )}
    </div>
  );
};

export default PersonalView;