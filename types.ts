// FIX: Removed self-import of RoutineItem to resolve conflict with local declaration.
export type Role = 'personal' | 'student' | 'admin';
export type AppMode = 'personal' | 'student' | 'admin' | null;

// FIX: Centralized ViewState type to be used across the application.
export type ViewState = {
  screen: 'auth' | 'personal' | 'student' | 'admin';
  modal?: 'student_management' | 'add_student' | 'workout_execution' | 'edit_anamnesis' | null;
  selectedStudentId?: string | null;
  personalViewMode?: 'list' | 'radar';
};

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: Role;
    password?: string;
    planStatus?: PlanStatus;
    planExpiryDate?: string;
}

export interface Personal extends UserProfile {
    role: 'personal';
    settings?: PersonalSettings;
    isAdmin?: boolean;
}

export interface PersonalSettings {
    geminiApiKeys?: string[];
    aiStyleNotes?: string;
    aiLearnedPreferences?: string[];
    whatsapp?: string;
}

export type PlanStatus = 'active' | 'inactive' | 'pending_review' | 'pending_creation';

export interface Student extends UserProfile {
    role: 'student';
    personalId: string;
    personals?: { settings: PersonalSettings };
    // Anamnesis
    age?: number;
    sex?: 'Masculino' | 'Feminino';
    height?: number;
    weight?: number;
    whatsapp?: string;
    profession?: string;
    city?: string;
    goal?: string;
    specificGoal?: string;
    goalTimeline?: string;
    hasTrainedBefore?: 'Sim' | 'Não';
    trainingSince?: string;
    previousTrainingFrequency?: string;
    hadPersonalTrainer?: 'Sim' | 'Não';
    likedWorkouts?: string;
    dislikedWorkouts?: string;
    hoursSitting?: string;
    sleepHours?: number;
    nutritionQuality?: 'Muito saudável' | 'Moderada' | 'Desequilibrada';
    waterIntake?: 'Sim' | 'Às vezes' | 'Quase nunca';
    alcoholIntake?: 'Sim' | 'Não';
    smokerInfo?: 'Sim' | 'Não';
    orthopedicProblems?: string;
    surgeriesInfo?: string;
    controlledMedication?: string;
    healthIssues?: string;
    medicalClearance?: 'Sim' | 'Não';
    currentCondition?: 'Fraco' | 'Regular' | 'Bom' | 'Excelente';
    canRun5min?: 'Sim' | 'Não';
    canDoPushups?: 'Sim' | 'Não';
    canSquat?: 'Sim' | 'Não';
    availableDays: string[];
    trainingHours?: string;
    trainingLocation?: 'Academia' | 'Casa' | 'Condomínio' | 'Ao ar livre';
    equipment?: ('Nenhum' | 'Halteres' | 'Barra' | 'Elásticos' | 'Banco' | 'Esteira / Bicicleta')[];
    observations?: string;
    
    // Training data
    workoutPlan?: Workout[];
    completionHistory?: { [date: string]: 'completed' | 'missed' };
    performanceHistory?: PerformanceHistory;
    lastFeedback?: Feedback;
    currentWorkoutProgress?: {
        workoutId: string;
        date: string;
        progress: WorkoutProgressState;
    } | null;
    // FIX: Added postWorkoutAnalyses to store AI feedback on completed workouts.
    postWorkoutAnalyses?: {
        [date: string]: {
            analysis: string;
            status: 'pending_approval' | 'approved' | 'rejected';
        }
    };
    aiInsights?: ProactiveInsight[];
    anamnesisAnalysis?: string;
}

export type WorkoutBlockType = 'single' | 'biset' | 'superset' | 'triset';

export interface Exercise {
    id: string;
    exerciseId: string;
    sets: string;
    reps: string;
    rest?: string;
    observation?: string;
    targetWeight?: number;
    targetReps?: number;
    durationType?: 'reps' | 'time';
}

export interface WorkoutBlock {
    id: string;
    type: WorkoutBlockType;
    exercises: Exercise[];
    restAfterBlock?: string;
}

export interface Workout {
    id: string;
    day: 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado' | 'Domingo';
    label: string;
    muscleGroups: string[];
    blocks: WorkoutBlock[];
    warmup?: RoutineItem[];
    cooldown?: RoutineItem[];
}

export interface WorkoutLog {
    blockId: string;
    exerciseId: string;
    setIndex: number;
    weight?: string;
    reps?: string;
}

export interface WorkoutProgressState {
    activeBlockIndex: number;
    activeExerciseInBlockIndex: number;
    currentSetIndex: number;
    logs: WorkoutLog[];
}

export interface Feedback {
    difficulty: 'Fácil demais' | 'Ideal' | 'Difícil demais' | 'Extremamente difícil';
    energyLevel: 'Muito baixo' | 'Baixo' | 'Normal' | 'Alto' | 'Muito alto';
    sleepQuality: 'Péssima' | 'Ruim' | 'Ok' | 'Boa' | 'Ótima';
    overallRPE: number;
    painPoints: string;
    enjoyment: 'Gostei da maioria' | 'Indiferente' | 'Não gostei da maioria';
    comments: string;
}

export interface PerformanceHistoryEntry {
    date: string;
    weight: number;
    reps: number;
}

export interface PerformanceHistory {
    [exerciseId: string]: {
        lastWeight: number;
        lastReps: number;
        history: PerformanceHistoryEntry[];
    };
}

export interface ExerciseDetails {
    name: string;
    videoUrl?: string;
    gifUrl?: string;
    tutorial: string;
    equipment: 'maquina' | 'barra' | 'halteres' | 'peso corporal' | 'kettlebell' | 'elastico';
    muscleGroups: {
        primary: string[];
        secondary?: string[];
    };
    difficulty: 'iniciante' | 'intermediario' | 'avancado';
    contraindications: string[];
}

export interface Correction {
    studentId: string;
    exerciseId?: string;
    reason: string;
}

export type ModificationType = 'variation' | 'progression' | 'regression';

export interface Message {
    role: 'user' | 'model';
    parts: string;
}

export interface RoutineItem {
    exerciseId: string;
    duration: string;
}

export interface Routine {
    items: RoutineItem[];
}

export interface ProactiveInsight {
    type: 'suggestion' | 'warning' | 'achievement';
    message: string;
    relatedExerciseId?: string;
}