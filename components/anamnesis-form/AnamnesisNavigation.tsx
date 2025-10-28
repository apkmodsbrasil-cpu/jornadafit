import React from 'react';

interface AnamnesisNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrev: () => void;
    onNext: () => void;
}

const AnamnesisNavigation: React.FC<AnamnesisNavigationProps> = ({ currentStep, totalSteps, onPrev, onNext }) => {
    return (
        <div className="pt-6 border-t border-gray-700 flex justify-between items-center">
            <button
                type="button"
                onClick={onPrev}
                disabled={currentStep === 1}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Anterior
            </button>

            {currentStep < totalSteps ? (
                <button
                    type="button"
                    onClick={onNext}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Próximo
                </button>
            ) : (
                <button
                    type="submit"
                    className="w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg hover:bg-green-700"
                >
                    Enviar Anamnese
                </button>
            )}
        </div>
    );
};

export default AnamnesisNavigation;
