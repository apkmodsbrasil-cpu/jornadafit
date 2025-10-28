import React, { useMemo } from 'react';
import type { Student, ExerciseDetails } from '../types.ts';
import BarChartIcon from './icons/BarChartIcon.tsx';
import PerformanceChart from './PerformanceChart.tsx';
import AwardIcon from './icons/AwardIcon.tsx';
import TrendingUpIcon from './icons/TrendingUpIcon.tsx';
import TargetIcon from './icons/TargetIcon.tsx';


interface PerformanceReviewModalProps {
  student: Student;
  onClose: () => void;
  exerciseDatabase: Record<string, ExerciseDetails>;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-700/50 p-3 rounded-lg flex items-center">
        <div className="p-2 bg-gray-900/50 rounded-md mr-3">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400">{title}</p>
            <p className="font-bold text-white text-sm md:text-base">{value}</p>
        </div>
    </div>
);


const PerformanceReviewModal: React.FC<PerformanceReviewModalProps> = ({ student, onClose, exerciseDatabase }) => {
  const performanceHistory = student.performanceHistory || {};

  const exerciseStats = useMemo(() => {
    const stats: Record<string, {
      maxWeight: number;
      firstWeight: number;
      lastWeight: number;
      progress: number;
      totalVolume: number;
    }> = {};

    Object.keys(performanceHistory).forEach(exerciseId => {
      const history = performanceHistory[exerciseId].history;
      if (history.length < 1) return;

      const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const maxWeight = Math.max(...sortedHistory.map(h => h.weight));
      const firstWeight = sortedHistory[0].weight;
      const lastWeight = sortedHistory[sortedHistory.length - 1].weight;
      const progress = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight) * 100 : 0;
      const totalVolume = sortedHistory.reduce((acc, h) => acc + (h.weight * h.reps), 0);

      stats[exerciseId] = { maxWeight, firstWeight, lastWeight, progress, totalVolume };
    });
    return stats;
  }, [performanceHistory]);

  const keyExercises = Object.keys(performanceHistory).filter(exId => performanceHistory[exId].history.length > 0);
  const chartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981']; // blue, purple, pink, green


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[60]" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <BarChartIcon className="w-6 h-6 mr-3 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Revisão de Performance de {student.name.split(' ')[0]}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-8">
          {keyExercises.length > 0 ? (
            keyExercises.map((exerciseId, index) => {
                const exerciseData = performanceHistory[exerciseId].history;
                const stats = exerciseStats[exerciseId];
                return (
                    <div key={exerciseId} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <PerformanceChart
                            title={exerciseDatabase[exerciseId]?.name || exerciseId}
                            data={exerciseData}
                            color={chartColors[index % chartColors.length]}
                        />
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                                <StatCard title="Recorde de Carga" value={`${stats.maxWeight.toFixed(1)} kg`} icon={<AwardIcon className="w-5 h-5 text-yellow-400" />} />
                                <StatCard title="Progresso Total" value={`${stats.progress.toFixed(0)}%`} icon={<TrendingUpIcon className="w-5 h-5 text-green-400" />} />
                                <StatCard title="Volume Total" value={`${(stats.totalVolume / 1000).toFixed(1)} t`} icon={<TargetIcon className="w-5 h-5 text-indigo-400" />} />
                            </div>
                        )}
                    </div>
                );
            })
          ) : (
            <div className="text-center p-8 text-gray-500">
              <p>Nenhum dado de performance registrado ainda.</p>
              <p className="text-sm">Os gráficos aparecerão aqui quando o aluno começar a registrar os treinos.</p>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Fechar</button>
        </footer>
      </div>
    </div>
  );
};

export default PerformanceReviewModal;