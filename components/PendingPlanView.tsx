import React from 'react';
import ClockIcon from './icons/ClockIcon.tsx';

interface PendingPlanViewProps {
    studentName: string;
    onEdit: () => void;
}

const PendingPlanView: React.FC<PendingPlanViewProps> = ({ studentName, onEdit }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg animate-fade-in flex flex-col items-center text-center">
            <ClockIcon className="w-16 h-16 text-blue-400 mb-4" />
            <h1 className="text-3xl font-bold text-blue-300 mb-2">Quase lá, {studentName.split(' ')[0]}!</h1>
            <p className="text-gray-400 mb-6">
                Suas informações foram enviadas com sucesso.
            </p>

            <div className="bg-gray-900/40 p-4 rounded-lg w-full mb-6">
                 <p className="text-gray-300">
                    Seu personal trainer está analisando seus dados para criar um plano de treino exclusivo para você.
                </p>
            </div>

            <p className="text-lg font-semibold text-gray-200 mb-4">
                Você será notificado(a) assim que seu plano estiver pronto.
            </p>
            
            <button 
                onClick={onEdit}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
                Digitou algo errado? Edite sua anamnese aqui.
            </button>
        </div>
    );
};

export default PendingPlanView;