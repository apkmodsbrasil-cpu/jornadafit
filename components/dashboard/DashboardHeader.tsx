import React from 'react';
import AlertTriangleIcon from '../icons/AlertTriangleIcon.tsx';
import { formatWhatsAppNumber } from '../../utils/stringUtils.ts';

interface DashboardHeaderProps {
    studentName: string;
    studentSex?: 'Masculino' | 'Feminino';
    planDaysLeft: number;
    personalWhatsapp?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ studentName, studentSex, planDaysLeft, personalWhatsapp }) => {
    const greetingWord = studentSex === 'Feminino' ? 'Pronta' : 'Pronto';
    
    const handleContactPersonal = () => {
        if (!personalWhatsapp) {
            alert("O número de WhatsApp do seu personal não foi configurado.");
            return;
        }

        const message = `Olá! Meu plano está prestes a expirar. Gostaria de conversar sobre a renovação. Obrigado(a)!`;
        const encodedMessage = encodeURIComponent(message);
        
        const whatsappNumber = formatWhatsAppNumber(personalWhatsapp);
        const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(url, '_blank');
    };

    return (
        <>
            {planDaysLeft <= 7 && (
                <div className="bg-yellow-900/40 border border-yellow-700/50 p-3 rounded-lg mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangleIcon className="w-6 h-6 mr-3 text-yellow-400 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-yellow-300">Atenção! Seu plano vence em {planDaysLeft} dia{planDaysLeft !== 1 ? 's' : ''}.</p>
                            <p className="text-yellow-400 text-sm">Não pare agora! Fale com seu personal para manter o ritmo.</p>
                        </div>
                    </div>
                    <button onClick={handleContactPersonal} disabled={!personalWhatsapp} className="ml-4 px-4 py-1.5 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                        Renovar
                    </button>
                </div>
            )}
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">Olá, {studentName.split(' ')[0]}!</h1>
                <p className="text-gray-400">{greetingWord} para o treino de hoje?</p>
            </header>
        </>
    );
};

export default DashboardHeader;