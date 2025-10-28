import React from 'react';
import StudentDashboard from './StudentDashboard.tsx';
// FIX: Import ViewState from types.ts and remove local definition.
import type { Student, ExerciseDetails, ViewState } from '../types.ts';

interface StudentViewProps {
    studentData: Student;
    setStudentData: (updater: React.SetStateAction<Student>, options?: { showSuccessToast?: boolean }) => void;
    saveError: string | null;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    exerciseDatabase: Record<string, ExerciseDetails>;
    addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
    viewState: ViewState;
    setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
    // FIX: Add apiKeys to props to be passed down to child components.
    apiKeys: string[];
}

const StudentView: React.FC<StudentViewProps> = (props) => {
  return (
    <div className="w-full min-h-screen text-white">
      <StudentDashboard {...props} />
    </div>
  );
};

export default StudentView;