import React from 'react';

interface AnamnesisProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const AnamnesisProgressBar: React.FC<AnamnesisProgressBarProps> = ({ currentStep, totalSteps }) => {
    const progressPercentage = (currentStep / totalSteps) * 100;
    
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2 text-sm text-gray-300">
                <span>Progresso</span>
                <span>Etapa <span className="font-bold">{currentStep}</span> de {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </div>
    );
};

export default AnamnesisProgressBar;
