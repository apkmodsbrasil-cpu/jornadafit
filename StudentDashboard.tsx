
import React, { useState, useMemo, useEffect } from 'react';
import type { Student, WorkoutLog, Feedback, ExerciseDetails } from './types.ts';
import WorkoutCalendar from './components/WorkoutCalendar.tsx';
import WorkoutExecutionModal from './components/WorkoutExecutionModal.tsx';
import FeedbackForm from './components/FeedbackForm.tsx';
import RoutineModal from './components/RoutineModal.tsx';
import Anamnesis from './components/Anamnesis.tsx';
// Fix: Renamed useGemini to useAI and updated the import path.
import { useAI } from './hooks/useAI.ts';
import ExpiredPlanView from './components/ExpiredPlanView.tsx';
import RenewalModal from './components/RenewalModal.tsx';
import PostWorkoutAnalysisModal from './components/PostWorkoutAnalysisModal.tsx';
import PendingPlanView from './components/PendingPlanView.tsx';
import { WARMUP_ROUTINE, COOLDOWN_ROUTINE } from './constants.ts';
import DashboardHeader from './components/dashboard/DashboardHeader.tsx';
import TodaysWorkoutCard from './components/dashboard/TodaysWorkoutCard.tsx';

interface StudentDashboardProps {
    studentData: Student;
    setStudentData: (updater: React.SetStateAction<Student>, options?: { showSuccessToast?: boolean }) => void;
    saveError: string | null;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    // FIX: Add exerciseDatabase and addExercise to props
    exerciseDatabase: Record<string, ExerciseDetails>;
    addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
    apiKeys: string[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentData, setStudentData, saveError, addToast, exerciseDatabase, addExercise, apiKeys }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Modal states
    const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false);
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [isRoutineModalOpen, setRoutineModalOpen] = useState<'warmup' | 'cooldown' | null>(null);
    const [isRenewalModalOpen, setRenewalModalOpen] = useState(false);
    const [isPostWorkoutAnalysisOpen, setPostWorkoutAnalysisOpen] = useState(false);
    
    const [postWorkoutAnalysis, setPostWorkoutAnalysis] = useState<string | null>(null);
    const [hasShownInitialRenewalModal, setHasShownInitialRenewalModal] = useState(false);
    
    // Fix: Switched from useGemini to useAI and updated the hook call to match the new structure.
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

    useEffect(() => {
        if (planStatus.isExpired && !hasShownInitialRenewalModal) {
            setRenewalModalOpen(true);
            setHasShownInitialRenewalModal(true);
        }
    }, [planStatus.isExpired, hasShownInitialRenewalModal]);

    const handleFinishWorkout = async (logs: WorkoutLog[]) => {
        setWorkoutModalOpen(false);
        const todayKey = currentDate.toISOString().split('T')[0];
        let updatedStudentForAnalysis: Student;

        setStudentData(prev => {
            const newHistory = { ...(prev.performanceHistory || {}) };
            logs.forEach(log => {
                const weight = parseFloat(log.weight || '0');
                const reps = parseInt(log.reps || '0');
                if (weight > 0 && reps > 0) {
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
// FIX: Cast 'completed' to a const to match the 'completionHistory' type in the Student interface. This resolves a TypeScript type incompatibility where a generic 'string' was being assigned to a field expecting a specific literal type ('completed' | 'missed').
                completionHistory: { ...(prev.completionHistory || {}), [todayKey]: 'completed' as const },
                currentWorkoutProgress: null
            };
            updatedStudentForAnalysis = updatedStudent;
            return updatedStudent;
        }, { showSuccessToast: true });
        
        try {
            setPostWorkoutAnalysisOpen(true);
            // Fix: Updated function call to use the generators object from the useAI hook.
            const analysisResult = await generators.generatePostWorkoutAnalysis(updatedStudentForAnalysis!, logs);
            setPostWorkoutAnalysis(analysisResult || "Não foi possível gerar a análise. Mas bom trabalho no treino!");
            if (analysisResult && !analysisResult.toLowerCase().startsWith('erro')) {
                // FIX: The postWorkoutAnalyses property expects an object with 'analysis' and 'status' properties, but was being assigned a raw string. This has been updated to match the 'Student' type definition.
                setStudentData(prev => ({ ...prev, postWorkoutAnalyses: { ...(prev.postWorkoutAnalyses || {}), [todayKey]: { analysis: analysisResult, status: 'pending_approval' } }}));
            }
        } catch(e: any) {
            addToast(e.message, 'error');
            setPostWorkoutAnalysis("Não foi possível gerar a análise. Mas bom trabalho no treino!");
        }

        // Fix: Updated function call to use the generators object from the useAI hook.
        generators.generateProgressionInsights(updatedStudentForAnalysis!).then(insights => {
            if (insights && insights.length > 0) {
                setStudentData(prev => {
                    const existingMessages = new Set((prev.aiInsights || []).map(i => i.message));
                    const newUniqueInsights = insights.filter(i => !existingMessages.has(i.message));
                    
                    if(newUniqueInsights.length === 0) return prev;

                    addToast(`${newUniqueInsights.length} nova(s) sugestão(ões) da IA gerada(s) para este aluno!`, 'info');

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
        setStudentData({ ...submittedStudentData, planStatus: 'pending_creation' }, { showSuccessToast: true });
    };

    if (planStatus.isExpired) {
        return (
            <>
                <ExpiredPlanView studentName={studentData.name} expiryDate={studentData.planExpiryDate} onRenew={() => setRenewalModalOpen(true)} />
                <RenewalModal isOpen={isRenewalModalOpen} onClose={() => setRenewalModalOpen(false)} studentName={studentData.name} />
            </>
        );
    }

    if (studentData.planStatus === 'pending_creation' && !studentData.goal) {
        return <Anamnesis student={studentData} onSubmit={handleAnamnesisSubmit} saveError={saveError} />;
    }

    if (studentData.planStatus === 'pending_creation') {
        return <PendingPlanView studentName={studentData.name} onEdit={() => { /* Need to implement edit mode */ }} />;
    }

    const todaysWorkout = studentData.workoutPlan?.find(w => w.day.toLowerCase() === currentDate.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase());

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
            <DashboardHeader studentName={studentData.name} studentSex={studentData.sex} planDaysLeft={planStatus.daysLeft} onRenew={() => setRenewalModalOpen(true)} />
            
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
                onStartWorkout={() => setWorkoutModalOpen(true)}
                setStudentData={setStudentData}
                exerciseDatabase={exerciseDatabase}
                onResetWorkout={() => {}}
            />


            {isWorkoutModalOpen && todaysWorkout && (
                <WorkoutExecutionModal
                    workout={todaysWorkout}
                    initialProgress={studentData.currentWorkoutProgress?.progress || { activeBlockIndex: 0, activeExerciseInBlockIndex: 0, currentSetIndex: 0, logs: [] }}
                    onClose={(progress) => {
                        const todayKey = currentDate.toISOString().split('T')[0];
                        setStudentData(prev => {
                            if (!todaysWorkout) return prev;
                            return {
                                ...prev,
                                currentWorkoutProgress: {
                                    workoutId: todaysWorkout.id,
                                    date: todayKey,
                                    progress: progress,
                                }
                            }
                        }, { showSuccessToast: false });
                        setWorkoutModalOpen(false);
                    }}
                    onFinish={handleFinishWorkout}
                    onProgressUpdate={(progress) => {
                         const todayKey = currentDate.toISOString().split('T')[0];
                         setStudentData(prev => {
                             if (!todaysWorkout) return prev;
                             const newProgressData = {
                                workoutId: todaysWorkout.id,
                                date: todayKey,
                                progress,
                             };
                             if (JSON.stringify(prev.currentWorkoutProgress) === JSON.stringify(newProgressData)) {
                                return prev;
                             }
                             return {
                                ...prev,
                                currentWorkoutProgress: newProgressData,
                             };
                        }, { showSuccessToast: false });
                    }}
                    performanceHistory={studentData.performanceHistory}
                    onOpenRoutine={(type) => setRoutineModalOpen(type)}
                    exerciseDatabase={exerciseDatabase}
                    addToast={addToast}
                />
            )}
            
            <PostWorkoutAnalysisModal 
                isOpen={isPostWorkoutAnalysisOpen}
                onClose={handleCloseAnalysisAndOpenFeedback}
                analysis={postWorkoutAnalysis}
                isLoading={isGenerating.postWorkoutAnalysis}
            />

            {isFeedbackModalOpen && <FeedbackForm onClose={() => setFeedbackModalOpen(false)} onSubmit={handleFeedbackSubmit} />}
            
            {isRoutineModalOpen && <RoutineModal 
                type={isRoutineModalOpen}
                routine={isRoutineModalOpen === 'warmup' ? WARMUP_ROUTINE : COOLDOWN_ROUTINE}
                onClose={() => setRoutineModalOpen(null)}
                exerciseDatabase={exerciseDatabase}
            />}

            <RenewalModal isOpen={isRenewalModalOpen} onClose={() => setRenewalModalOpen(false)} studentName={studentData.name} />
        </div>
    );
};

export default StudentDashboard;