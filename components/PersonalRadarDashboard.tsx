

import React, { useMemo } from 'react';
import type { Student, ProactiveInsight, PerformanceHistoryEntry } from '../types.ts';
import AlertTriangleIcon from './icons/AlertTriangleIcon.tsx';
import MessageCircleIcon from './icons/MessageCircleIcon.tsx';
import AwardIcon from './icons/AwardIcon.tsx';
import FilePlusIcon from './icons/FilePlusIcon.tsx';
import WandIcon from './icons/WandIcon.tsx';
import TrendingUpIcon from './icons/TrendingUpIcon.tsx';
import TrendingDownIcon from './icons/TrendingDownIcon.tsx';

interface PersonalRadarDashboardProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

const toDateKey = (date: Date) => date.toISOString().split('T')[0];
const weekDaysMap: Record<string, number> = { 'Domingo': 0, 'Segunda-feira': 1, 'Terça-feira': 2, 'Quarta-feira': 3, 'Quinta-feira': 4, 'Sexta-feira': 5, 'Sábado': 6 };

const InsightCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 shadow-lg h-full">
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="font-bold text-lg text-white ml-3">{title}</h3>
        </div>
        <div className="space-y-2 text-sm">
            {children}
        </div>
    </div>
);

const PersonalRadarDashboard: React.FC<PersonalRadarDashboardProps> = ({ students, onSelectStudent }) => {

    const missedWorkoutStudents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const missed = new Map<string, { student: Student, lastMissed: string }>();

        students.forEach(student => {
            if (!student.workoutPlan || student.workoutPlan.length === 0 || !student.availableDays) return;
            const studentWorkoutDays = new Set(student.availableDays.map(day => weekDaysMap[day]));

            
            for (let i = 1; i <= 7; i++) {
                const dayToCheck = new Date(today);
                dayToCheck.setDate(today.getDate() - i);
                
                const dateKey = toDateKey(dayToCheck);
                const dayOfWeek = dayToCheck.getDay();

                if (studentWorkoutDays.has(dayOfWeek)) {
                    if (!student.completionHistory?.[dateKey]) {
                        
                        if (!missed.has(student.name)) {
                           missed.set(student.name, { student, lastMissed: dayToCheck.toLocaleDateString('pt-BR', { weekday: 'long' }) });
                        }
                    }
                }
            }
        });
        return Array.from(missed.values());
    }, [students]);

    const feedbackAlerts = useMemo(() => {
        return students.filter(student => {
            const feedback = student.lastFeedback;
            if (!feedback) return false;
            const hasHighDifficulty = feedback.difficulty === 'Extremamente difícil';
            const hasPain = feedback.painPoints && feedback.painPoints.trim().length > 0;
            return hasHighDifficulty || hasPain;
        }).map(s => ({
            student: s,
            reason: s.lastFeedback?.difficulty === 'Extremamente difícil' ? 'Dificuldade extrema' : `Relatou dor: "${s.lastFeedback?.painPoints}"`
        }));
    }, [students]);

    const performanceHighlights = useMemo(() => {
        const keyLifts = {
            'supino-reto-barra': 'Supino Reto',
            'agachamento-livre': 'Agachamento',
            'remada-curvada': 'Remada Curvada',
        };
        const highlights: { student: Student; liftName: string; weight: number }[] = [];

        Object.entries(keyLifts).forEach(([liftId, liftName]) => {
            const topPerformer = students
                .filter(s => s.performanceHistory?.[liftId]?.lastWeight > 0)
                .sort((a, b) => (b.performanceHistory![liftId].lastWeight) - (a.performanceHistory![liftId].lastWeight))[0];

            if (topPerformer) {
                highlights.push({
                    student: topPerformer,
                    liftName: liftName,
                    weight: topPerformer.performanceHistory![liftId].lastWeight,
                });
            }
        });
        return highlights;
    }, [students]);
    
    const performanceProgress = useMemo(() => {
        let bestProgress: { student: Student; liftName: string; percentage: number } | null = null;
        const LIFT_ID_TO_TRACK = 'supino-reto-barra';
        const LIFT_NAME = 'Supino Reto';
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        students.forEach(student => {
            const history = student.performanceHistory?.[LIFT_ID_TO_TRACK]?.history;
            if (!history || history.length < 2) return;

            const recentHistory = history
                .filter(entry => new Date(entry.date) >= fourWeeksAgo)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (recentHistory.length < 2) return;

            const earliestEntry = recentHistory[0];
            const latestEntry = recentHistory[recentHistory.length - 1];

            if (earliestEntry.weight > 0) {
                const percentageIncrease = ((latestEntry.weight - earliestEntry.weight) / earliestEntry.weight) * 100;
                if (!bestProgress || percentageIncrease > bestProgress.percentage) {
                    bestProgress = {
                        student,
                        liftName: LIFT_NAME,
                        percentage: percentageIncrease
                    };
                }
            }
        });
        return bestProgress;
    }, [students]);

    const pendingPlanStudents = useMemo(() => {
        return students.filter(s => !s.workoutPlan || s.workoutPlan.length === 0);
    }, [students]);
    
    const proactiveInsights = useMemo(() => {
        return students.flatMap(s => (s.aiInsights || []).map(insight => ({ student: s, insight })))
    }, [students]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
             <InsightCard title="Sugestões da IA" icon={<WandIcon className="w-6 h-6 text-purple-400" />}>
                {proactiveInsights.length > 0 ? (
                    proactiveInsights.map(({ student, insight }, index) => (
                        <div key={`${student.name}-${index}`} onClick={() => onSelectStudent(student)} className="p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                            <p className="font-semibold text-gray-200">{student.name}</p>
                            <p className="text-xs text-gray-400 truncate">{insight.message}</p>
                        </div>
                    ))
                ) : <p className="text-gray-400">Nenhuma sugestão proativa no momento.</p>}
            </InsightCard>

            <InsightCard title="Pontos de Atenção (Feedback)" icon={<MessageCircleIcon className="w-6 h-6 text-yellow-400" />}>
                {feedbackAlerts.length > 0 ? (
                    feedbackAlerts.map(({ student, reason }) => (
                        <div key={student.name} onClick={() => onSelectStudent(student)} className="p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                            <p className="font-semibold text-gray-200">{student.name}</p>
                            <p className="text-xs text-gray-400 truncate">{reason}</p>
                        </div>
                    ))
                ) : <p className="text-gray-400">Nenhum feedback urgente. Tudo em ordem!</p>}
            </InsightCard>

            <InsightCard title="Baixo Engajamento" icon={<TrendingDownIcon className="w-6 h-6 text-orange-400" />}>
                {missedWorkoutStudents.length > 0 ? (
                    missedWorkoutStudents.map(({ student, lastMissed }) => (
                        <div key={student.name} onClick={() => onSelectStudent(student)} className="p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                            <p className="font-semibold text-gray-200">{student.name}</p>
                            <p className="text-xs text-gray-400 truncate">Faltou ao treino de {lastMissed}.</p>
                        </div>
                    ))
                ) : <p className="text-gray-400">Todos os alunos estão engajados!</p>}
            </InsightCard>

            <InsightCard title="Destaques de Performance" icon={<AwardIcon className="w-6 h-6 text-green-400" />}>
                {performanceHighlights.length > 0 ? (
                     performanceHighlights.map(({ student, liftName, weight }) => (
                        <div key={`${student.name}-${liftName}`} onClick={() => onSelectStudent(student)} className="p-2 rounded-md hover:bg-gray-700/50 cursor-pointer flex justify-between items-center">
                            <div>
                               <p className="font-semibold text-gray-200">Maior Carga ({liftName})</p>
                               <p className="text-xs text-gray-400">{student.name}</p>
                            </div>
                            <span className="font-bold text-green-300">{weight.toFixed(0)} kg</span>
                        </div>
                    ))
                ) : <p className="text-gray-400">Nenhum recorde de carga registrado ainda.</p>}

                {performanceProgress && (
                    <div 
                        key={`${performanceProgress.student.name}-progress`} 
                        onClick={() => onSelectStudent(performanceProgress.student)} 
                        className="p-2 rounded-md hover:bg-gray-700/50 cursor-pointer flex justify-between items-center mt-2 border-t border-gray-700/50 pt-2"
                    >
                        <div>
                           <p className="font-semibold text-gray-200">Maior Progresso ({performanceProgress.liftName})</p>
                           <p className="text-xs text-gray-400">{performanceProgress.student.name}</p>
                        </div>
                        <div className="flex items-center">
                             <span className="font-bold text-teal-300 mr-2">+{performanceProgress.percentage.toFixed(0)}%</span>
                             <TrendingUpIcon className="w-5 h-5 text-teal-400" />
                        </div>
                    </div>
                )}
            </InsightCard>
            
            <InsightCard title="Pendências" icon={<FilePlusIcon className="w-6 h-6 text-blue-400" />}>
                {pendingPlanStudents.length > 0 ? (
                    pendingPlanStudents.map(student => (
                        <div key={student.name} onClick={() => onSelectStudent(student)} className="p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                            <p className="font-semibold text-gray-200">{student.name}</p>
                            <p className="text-xs text-gray-400">Precisa de um plano de treino.</p>
                        </div>
                    ))
                ) : <p className="text-gray-400">Todos os alunos têm um plano de treino ativo!</p>}
            </InsightCard>
        </div>
    );
};

export default PersonalRadarDashboard;