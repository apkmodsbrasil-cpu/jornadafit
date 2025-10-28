import React from 'react';
import LockIcon from './icons/LockIcon.tsx';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import { formatWhatsAppNumber } from '../utils/stringUtils.ts';

interface ExpiredPlanViewProps {
    studentName: string;
    expiryDate?: string;
    personalWhatsapp?: string;
}

const ExpiredPlanView: React.FC<ExpiredPlanViewProps> = ({ studentName, expiryDate, personalWhatsapp }) => {
    
    const handleContactPersonal = () => {
        if (!personalWhatsapp) {
            alert("O número de WhatsApp do seu personal não foi configurado.");
            return;
        }

        const message = `Olá! Sou ${studentName.split(' ')[0]} e meu plano expirou. Gostaria de renovar. Podemos conversar sobre as opções? Obrigado(a)!`;
        const encodedMessage = encodeURIComponent(message);
        
        const whatsappNumber = formatWhatsAppNumber(personalWhatsapp);
        const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(url, '_blank');
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-gray-800/50 border border-red-700/50 rounded-xl shadow-lg animate-fade-in flex flex-col items-center text-center">
            <LockIcon className="w-16 h-16 text-red-400 mb-4" />
            <h1 className="text-3xl font-bold text-red-300 mb-2">Seu Plano Venceu!</h1>
            <p className="text-gray-400 mb-6">
                Olá, {studentName.split(' ')[0]}! Seu acesso ao plano de treinos expirou em {expiryDate ? new Date(expiryDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'data anterior'}.
            </p>

            <div className="bg-gray-900/40 p-4 rounded-lg w-full mb-6">
                 <p className="text-gray-300">
                    Para continuar treinando e não perder seu progresso, entre em contato com seu personal trainer para renovar seu plano.
                </p>
            </div>

            <p className="text-lg font-semibold text-gray-200 mb-4 italic">
                "A jornada continua! Renove seu plano e vamos juntos alcançar novos resultados."
            </p>
            
            {personalWhatsapp ? (
                 <button 
                    className="w-full max-w-xs bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors text-lg flex items-center justify-center"
                    onClick={handleContactPersonal}
                >
                    <WhatsAppIcon className="w-6 h-6 mr-3" />
                    Contatar Personal
                </button>
            ) : (
                <p className="text-sm text-yellow-400 mt-4">Seu personal não configurou um número de contato. Por favor, entre em contato por outros meios.</p>
            )}
        </div>
    );
};

export default ExpiredPlanView;