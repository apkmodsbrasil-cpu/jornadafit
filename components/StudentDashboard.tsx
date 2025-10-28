import React, { useState, useMemo, useEffect } from 'react';
// FIX: Add WorkoutProgressState to the import to use it in the component's state.
// FIX: Import ViewState from types.ts and remove local definition.
import type { Student, WorkoutLog, Feedback, ExerciseDetails, PerformanceHistoryEntry, WorkoutProgressState, Routine, ViewState } from '../types.ts';
import WorkoutCalendar from './WorkoutCalendar.tsx';
// FIX: The WorkoutExecutionModal component was not being correctly imported, causing a module resolution error. This has been corrected to ensure the component is properly loaded.
import WorkoutExecutionModal from './WorkoutExecutionModal.tsx';
import FeedbackForm from './FeedbackForm.tsx';
import RoutineModal from './RoutineModal.tsx';
import Anamnesis from './Anamnesis.tsx';
import { useAI } from '../hooks/useAI.ts';
import ExpiredPlanView from './ExpiredPlanView.tsx';
import PendingPlanView from './PendingPlanView.tsx';
import { WARMUP_ROUTINE, COOLDOWN_ROUTINE } from '../constants.ts';
import DashboardHeader from './dashboard/DashboardHeader.tsx';
import TodaysWorkoutCard from './dashboard/TodaysWorkoutCard.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
// FIX: Import the PostWorkoutAnalysisModal component.
import PostWorkoutAnalysisModal from './PostWorkoutAnalysisModal.tsx';


interface StudentDashboardProps {
    studentData: Student;
    setStudentData: (updater: React.SetStateAction<Student>, options?: { showSuccessToast?: boolean }) => void;
    saveError: string | null;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    exerciseDatabase: Record<string, ExerciseDetails>;
    addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
    viewState: ViewState;
    setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
    // FIX: Add apiKeys to props to be passed to the useAI hook.
    apiKeys: string[];
}

const motivationalQuotes = [
    "Acredite em você. A força não vem do que você pode fazer. Ela vem de superar as coisas que você pensou que não poderia.",
    "O corpo alcança o que a mente acredita. Mantenha o foco!",
    "A dor que você sente hoje será a força que você sentirá amanhã.",
    "Cada treino é um passo a mais na sua jornada. Não desista!",
    "A consistência é mais importante que a perfeição. Apenas continue.",
    "Não se trata de ter tempo, trata-se de fazer tempo.",
    "Seu único limite é você. Supere-se a cada dia."
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentData, setStudentData, saveError, addToast, exerciseDatabase, addExercise, viewState, setViewState, apiKeys }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Local modal states (not persisted)
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [routineModalData, setRoutineModalData] = useState<{ type: 'warmup' | 'cooldown', routine: Routine } | null>(null);
    const [isResetConfirmModalOpen, setResetConfirmModalOpen] = useState(false);
    // FIX: Add state for post-workout analysis modal and its content.
    const [isPostWorkoutAnalysisOpen, setPostWorkoutAnalysisOpen] = useState(false);
    const [postWorkoutAnalysis, setPostWorkoutAnalysis] = useState<string | null>(null);
        
    const [activeProgress, setActiveProgress] = useState<WorkoutProgressState | null>(null);

    // FIX: Pass the apiKeys prop to the useAI hook to satisfy the UseAIProps interface.
    const { generators, isGenerating } = useAI({ personal: null, addToast, mode: 'student', studentContext: studentData, exerciseDatabase, addExercise, apiKeys });

    const planStatus = useMemo(() => {
        if (studentData.planStatus === 'inactive') return { isExpired: true, daysLeft: 0 };
        if (!studentData.planExpiryDate) return { isExpired: false, daysLeft: Infinity };
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(studentData.planExpiryDate + 'T00:00:00');
        if (expiryDate < today) return { isExpired: true, daysLeft: 0 };
        
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { isExpired: false, daysLeft };
    }, [studentData.planStatus, studentData.planExpiryDate]);

    const quote = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return motivationalQuotes[dayOfYear % motivationalQuotes.length];
    }, []);
    
    useEffect(() => {
        setActiveProgress(studentData.currentWorkoutProgress?.progress || null);
    }, [studentData.currentWorkoutProgress]);


    // FIX: Refactor handleFinishWorkout to include AI analysis before showing the feedback form.
    const handleFinishWorkout = async (logs: WorkoutLog[]) => {
        setViewState(prev => ({ ...prev, modal: null }));
        setActiveProgress(null);
        const todayKey = currentDate.toISOString().split('T')[0];
        let updatedStudentForAnalysis: Student;

        // Finaliza o treino
        setStudentData(prev => {
            const newHistory = { ...(prev.performanceHistory || {}) };
            logs.forEach(log => {
                const weight = parseFloat(log.weight || '0');
                const reps = parseInt(log.reps || '0');
                if (weight > 0 || reps > 0) { // Also log time-based exercises
                    if (!newHistory[log.exerciseId]) {
                        newHistory[log.exerciseId] = { lastWeight: 0, lastReps: 0, history: [] };
                    }
                    newHistory[log.exerciseId].history.push({ date: todayKey, weight, reps });
                    newHistory[log.exerciseId].lastWeight = weight;
                    newHistory[log.exerciseId].lastReps = reps;
                }
            });
            const updatedStudent = { 
                ...prev, 
                performanceHistory: newHistory, 
                completionHistory: { ...(prev.completionHistory || {}), [todayKey]: 'completed' as const },
                currentWorkoutProgress: null
            };
            updatedStudentForAnalysis = updatedStudent;
            return updatedStudent;
        }, { showSuccessToast: true });
        
        // Gera análise pós-treino
        try {
            setPostWorkoutAnalysisOpen(true);
            const analysisResult = await generators.generatePostWorkoutAnalysis(updatedStudentForAnalysis!, logs);
            setPostWorkoutAnalysis(analysisResult || "Não foi possível gerar a análise. Mas bom trabalho no treino!");
            if (analysisResult && !analysisResult.toLowerCase().startsWith('erro')) {
                setStudentData(prev => ({ ...prev, postWorkoutAnalyses: { ...(prev.postWorkoutAnalyses || {}), [todayKey]: { analysis: analysisResult, status: 'pending_approval' } }}));
            }
        } catch(e: any) {
            addToast(e.message, 'error');
            setPostWorkoutAnalysis("Não foi possível gerar a análise. Mas bom trabalho no treino!");
        }
        
        // Gera insights de progressão em background
        generators.generateProgressionInsights(updatedStudentForAnalysis!).then(insights => {
            if (insights && insights.length > 0) {
                setStudentData(prev => {
                    const existingMessages = new Set((prev.aiInsights || []).map(i => i.message));
                    const newUniqueInsights = insights.filter(i => !existingMessages.has(i.message));
                    
                    if(newUniqueInsights.length === 0) return prev;

                    return {
                        ...prev,
                        aiInsights: [...(prev.aiInsights || []), ...newUniqueInsights].slice(-10)
                    };
                });
            }
        }).catch(e => {
            console.error("Failed to generate progression insights:", e);
        });
    };

    // FIX: Add handler to chain modals.
    const handleCloseAnalysisAndOpenFeedback = () => {
        setPostWorkoutAnalysisOpen(false);
        setPostWorkoutAnalysis(null);
        setFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = (feedback: Feedback) => {
        setFeedbackModalOpen(false);
        setStudentData(prev => ({ ...prev, lastFeedback: feedback }), { showSuccessToast: true });
    };

    const handleAnamnesisSubmit = (submittedStudentData: Student) => {
        setViewState(prev => ({ ...prev, modal: null }));
        setStudentData({ ...submittedStudentData, planStatus: 'pending_creation' }, { showSuccessToast: true });
    };

    const executeResetWorkout = () => {
        const todayKey = currentDate.toISOString().split('T')[0];
        setStudentData(prev => {
            const newCompletionHistory = { ...prev.completionHistory };
            delete newCompletionHistory[todayKey];
            
            const newPerformanceHistory = JSON.parse(JSON.stringify(prev.performanceHistory || {}));
            Object.keys(newPerformanceHistory).forEach(exerciseId => {
                if (newPerformanceHistory[exerciseId].history) {
                    newPerformanceHistory[exerciseId].history = newPerformanceHistory[exerciseId].history.filter(
                        (entry: PerformanceHistoryEntry) => entry.date !== todayKey
                    );
                }
            });

            return {
                ...prev,
                completionHistory: newCompletionHistory,
                currentWorkoutProgress: null,
                performanceHistory: newPerformanceHistory,
            };
        }, { showSuccessToast: false });
        addToast('Progresso do treino de hoje foi reiniciado!', 'success');
    };

    if (planStatus.isExpired) {
        return (
            <ExpiredPlanView 
                studentName={studentData.name} 
                expiryDate={studentData.planExpiryDate} 
                personalWhatsapp={studentData.personals?.settings?.whatsapp}
            />
        );
    }
    
    const showAnamnesis = (studentData.planStatus === 'pending_creation' && !studentData.goal) || viewState.modal === 'edit_anamnesis';

    if (showAnamnesis) {
        return <Anamnesis student={studentData} onSubmit={handleAnamnesisSubmit} saveError={saveError} />;
    }

    if (studentData.planStatus === 'pending_creation') {
        return <PendingPlanView studentName={studentData.name} onEdit={() => setViewState(prev => ({ ...prev, modal: 'edit_anamnesis'}))} />;
    }

    const todaysWorkout = studentData.workoutPlan?.find(w => w.day.toLowerCase() === currentDate.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase());

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
            <DashboardHeader 
                studentName={studentData.name} 
                studentSex={studentData.sex} 
                planDaysLeft={planStatus.daysLeft} 
                personalWhatsapp={studentData.personals?.settings?.whatsapp}
            />
            
            <div className="mb-8">
                <WorkoutCalendar 
                    workouts={studentData.workoutPlan!}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    completionHistory={studentData.completionHistory as { [date: string]: string }}
                />
            </div>

            <TodaysWorkoutCard 
                studentData={studentData}
                currentDate={currentDate}
                onStartWorkout={() => {
                    if (todaysWorkout && !activeProgress) {
                        setActiveProgress({ activeBlockIndex: 0, activeExerciseInBlockIndex: 0, currentSetIndex: 0, logs: [] });
                    }
                    setViewState(prev => ({ ...prev, modal: 'workout_execution' }));
                }}
                setStudentData={setStudentData}
                exerciseDatabase={exerciseDatabase}
                onResetWorkout={() => setResetConfirmModalOpen(true)}
            />

            <div className="mt-8 text-center animate-fade-in px-4">
                <p className="text-gray-400 italic text-sm">"{quote}"</p>
            </div>

            {viewState.modal === 'workout_execution' && todaysWorkout && (
                <WorkoutExecutionModal
                    workout={todaysWorkout}
                    initialProgress={activeProgress || { activeBlockIndex: 0, activeExerciseInBlockIndex: 0, currentSetIndex: 0, logs: [] }}
                    onClose={(progress) => {
                        const todayKey = currentDate.toISOString().split('T')[0];
                        setStudentData(prev => ({
                            ...prev,
                            currentWorkoutProgress: {
                                workoutId: todaysWorkout.id,
                                date: todayKey,
                                progress: progress,
                            }
                        }));
                        setViewState(prev => ({ ...prev, modal: null }));
                    }}
                    onFinish={handleFinishWorkout}
                    onProgressUpdate={(progress) => {
                        if (todaysWorkout) {
                            const todayKey = currentDate.toISOString().split('T')[0];
                            const newProgressData = {
                                workoutId: todaysWorkout.id,
                                date: todayKey,
                                progress,
                            };
                            setStudentData(prev => {
                                if (JSON.stringify(prev.currentWorkoutProgress) === JSON.stringify(newProgressData)) {
                                    return prev;
                                }
                                return {
                                    ...prev,
                                    currentWorkoutProgress: newProgressData,
                                };
                            });
                        }
                    }}
                    performanceHistory={studentData.performanceHistory}
                    onOpenRoutine={(type, routine) => setRoutineModalData({ type, routine })}
                    exerciseDatabase={exerciseDatabase}
                    addToast={addToast}
                />
            )}
            
            {/* FIX: Render the PostWorkoutAnalysisModal. */}
            <PostWorkoutAnalysisModal 
                isOpen={isPostWorkoutAnalysisOpen}
                onClose={handleCloseAnalysisAndOpenFeedback}
                analysis={postWorkoutAnalysis}
                isLoading={isGenerating.postWorkoutAnalysis}
            />

            {isFeedbackModalOpen && <FeedbackForm onClose={() => setFeedbackModalOpen(false)} onSubmit={handleFeedbackSubmit} />}
            
            {routineModalData && <RoutineModal 
                type={routineModalData.type}
                routine={routineModalData.routine}
                onClose={() => setRoutineModalData(null)}
                exerciseDatabase={exerciseDatabase}
            />}
            
            <ConfirmationModal
                isOpen={isResetConfirmModalOpen}
                onClose={() => setResetConfirmModalOpen(false)}
                onConfirm={() => {
                    executeResetWorkout();
                    setResetConfirmModalOpen(false);
                }}
                title="Reiniciar Treino?"
                message="Todo o seu progresso de hoje será perdido. Tem certeza que deseja começar do zero?"
                confirmText="Sim, reiniciar"
                cancelText="Cancelar"
            />
        </div>
    );
};

export default StudentDashboard;