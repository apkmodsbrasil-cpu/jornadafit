import React from 'react';
import { useAppLogic } from './hooks/useAppLogic.ts';
import AuthView from './components/AuthView.tsx';
import StudentView from './components/StudentView.tsx';
import PersonalView from './components/PersonalView.tsx';
import AdminView from './components/AdminView.tsx';
import LogoutIcon from './components/icons/LogoutIcon.tsx';
import SettingsIcon from './components/icons/SettingsIcon.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import StudentManagementModal from './components/StudentManagementModal.tsx';
import AddStudentModal from './components/AddStudentModal.tsx';
import ShieldIcon from './components/icons/ShieldIcon.tsx';
import UserIcon from './components/icons/UserIcon.tsx';

const App: React.FC = () => {
    const {
        session,
        isAuthLoading,
        isBatchAdding,
        personal,
        studentData,
        students,
        saveError,
        toasts,
        isSettingsOpen,
        setIsSettingsOpen,
        actions,
        exerciseDatabase,
        // Centralized View State
        viewState,
        setViewState,
        selectedStudent,
        setSelectedStudent,
        globalApiKeys,
        allUsers,
    } = useAppLogic();

    const renderMainContent = () => {
        if (isAuthLoading) {
            return (
                <div className="flex flex-col justify-center items-center h-full pt-20">
                    <LoadingSpinner size="lg" />
                    <p className="text-xl text-gray-400 mt-4">Carregando...</p>
                </div>
            );
        }

        switch (viewState.screen) {
            case 'auth':
                return <AuthView onLogin={actions.login} onRegister={actions.register} />;
            case 'admin':
                if (personal?.isAdmin) {
                    return <AdminView
                        personal={personal}
                        onSaveSettings={actions.savePersonalProfile}
                        addToast={actions.addToast}
                        exerciseDatabase={exerciseDatabase}
                        onAddExercise={actions.addExercise}
                        onUpdateExercise={actions.updateExercise}
                        onAddExercisesBatch={actions.addExercisesBatch}
                        isBatchAdding={isBatchAdding}
                        allUsers={allUsers}
                        onUpdateUserAsAdmin={actions.updateUserAsAdmin}
                    />;
                }
                 return null; // Fallback for non-admins
            case 'student':
                if (studentData) {
                    return <StudentView 
                        studentData={studentData} 
                        setStudentData={actions.setStudentData}
                        saveError={saveError}
                        addToast={actions.addToast}
                        exerciseDatabase={exerciseDatabase}
                        addExercise={actions.addExercise}
                        viewState={viewState}
                        setViewState={setViewState}
                        // FIX: Pass globalApiKeys to the StudentView component.
                        apiKeys={globalApiKeys}
                    />;
                }
                return null;
            case 'personal':
                 if (personal) {
                    return <PersonalView
                        personal={personal}
                        students={students}
                        onSaveStudent={actions.saveStudent}
                        onDeleteStudent={actions.deleteStudent}
                        onAddStudent={actions.addStudent}
                        onAddCorrection={actions.addCorrection}
                        onUpdatePersonalAiPrefs={actions.updatePersonalAiPrefs}
                        addToast={actions.addToast}
                        exerciseDatabase={exerciseDatabase}
                        addExercise={actions.addExercise}
                        onFetchFullStudent={actions.fetchFullStudent}
                        viewState={viewState}
                        setViewState={setViewState}
                        setSelectedStudent={setSelectedStudent}
                    />;
                }
                return null;
            default:
                return null;
        }
    }

    return (
        <div className="text-white min-h-screen">
            <div className="fixed top-4 right-4 z-[100] space-y-2 w-full max-w-xs">
                {toasts.map(toast => {
                    const colors = {
                        success: 'bg-green-600/80 border-green-500/50',
                        error: 'bg-red-600/80 border-red-500/50',
                        info: 'bg-blue-600/80 border-blue-500/50',
                    };
                    return (
                        <div key={toast.id} className={`p-3 rounded-lg shadow-lg text-white text-sm animate-fade-in-scale border ${colors[toast.type]}`}>
                            {toast.message}
                        </div>
                    );
                })}
            </div>

            {session && viewState.screen !== 'auth' && (
                <header className="p-4 flex justify-between items-center">
                    <div className="w-full max-w-xs">
                        <h1 className="text-2xl font-bold tracking-wider text-white">Jornada<span className="text-blue-500">Fit</span></h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {personal?.isAdmin && (
                            <button
                            onClick={() => setViewState(prev => ({ ...prev, screen: prev.screen === 'admin' ? 'personal' : 'admin' }))}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                            {viewState.screen === 'admin' ? <UserIcon className="w-4 h-4" /> : <ShieldIcon className="w-4 h-4" />}
                            {viewState.screen === 'admin' ? 'Ver como Personal' : 'Painel Admin'}
                            </button>
                        )}
                        {personal && <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-700 rounded-full"><SettingsIcon /></button>}
                        <button onClick={actions.logout} className="p-2 hover:bg-gray-700 rounded-full"><LogoutIcon /></button>
                    </div>
                </header>
            )}
            
            <main className={!session ? 'h-full' : ''}>
                {renderMainContent()}
            </main>

            {isSettingsOpen && personal && (
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    personal={personal}
                    onSaveSettings={actions.savePersonalProfile}
                    addToast={actions.addToast}
                />
            )}

             {viewState.modal === 'student_management' && personal && selectedStudent && (
                <StudentManagementModal
                    personal={personal}
                    student={selectedStudent}
                    onClose={() => {
                        setViewState(prev => ({ ...prev, modal: null, selectedStudentId: null }));
                        setSelectedStudent(null);
                    }}
                    onSave={(student) => {
                        actions.saveStudent(student);
                        setViewState(prev => ({ ...prev, modal: null, selectedStudentId: null }));
                        setSelectedStudent(null);
                    }}
                    onDelete={(studentId) => {
                        actions.deleteStudent(studentId);
                        setViewState(prev => ({ ...prev, modal: null, selectedStudentId: null }));
                        setSelectedStudent(null);
                    }}
                    onAddCorrection={actions.addCorrection}
                    onUpdatePersonalAiPrefs={actions.updatePersonalAiPrefs}
                    addToast={actions.addToast}
                    exerciseDatabase={exerciseDatabase}
                    addExercise={actions.addExercise}
                    // FIX: Pass globalApiKeys to the StudentManagementModal component.
                    apiKeys={globalApiKeys}
                />
            )}

            {viewState.modal === 'add_student' && (
                <AddStudentModal
                    onClose={() => setViewState(prev => ({ ...prev, modal: null }))}
                    onAddStudent={actions.addStudent}
                />
            )}

        </div>
    );
};

export default App;
