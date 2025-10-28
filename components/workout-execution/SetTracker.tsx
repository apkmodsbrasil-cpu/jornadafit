import React from 'react';
import InfoIcon from '../icons/InfoIcon.tsx';
import QuestionMarkIcon from '../icons/QuestionMarkIcon.tsx';
import CornerDownRightIcon from '../icons/CornerDownRightIcon.tsx';

interface SetTrackerProps {
    totalSets: number;
    currentSetIndex: number;
    onOpenLogModal: () => void;
    onOpenHowToModal: () => void;
    onSkipExercise: () => void;
    observation?: string;
}

const SetTracker: React.FC<SetTrackerProps> = ({ totalSets, currentSetIndex, onOpenLogModal, onOpenHowToModal, onSkipExercise, observation }) => {

    const renderSetIndicators = () => {
        return Array.from({ length: totalSets }, (_, i) => {
            const isCompleted = i < currentSetIndex;
            const isActive = i === currentSetIndex;
            return (
                <div key={i} className={`h-2.5 flex-1 rounded-full transition-colors ${
                    isCompleted ? 'bg-blue-600' : isActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-700'
                }`}></div>
            );
        });
    };

    return (
        <>
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6 text-center">
                <p className="text-gray-300 font-semibold text-4xl">{`Série ${currentSetIndex + 1}`}</p>
                <div className="flex gap-2 mt-3">{renderSetIndicators()}</div>
            </div>

            {observation && (
                <div className="bg-yellow-900/40 border border-yellow-700/50 p-3 rounded-lg mb-6 flex items-start">
                    <InfoIcon className="w-5 h-5 mr-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-300 text-sm">{observation}</p>
                </div>
            )}
            
            <div className="flex justify-center mb-4">
                <button onClick={onOpenLogModal} className="bg-blue-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-blue-700 transition-colors text-lg">
                    Registrar Série
                </button>
            </div>

            <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-400">
                 <button onClick={onSkipExercise} className="flex items-center hover:text-white">
                    <CornerDownRightIcon className="w-4 h-4 mr-1.5" /> Fazer Depois
                </button>
                <button onClick={onOpenHowToModal} className="flex items-center hover:text-white">
                    <QuestionMarkIcon className="w-4 h-4 mr-2" /> Como Fazer?
                </button>
            </div>
        </>
    );
};

export default SetTracker;