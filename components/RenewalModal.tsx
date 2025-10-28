import React, { useState, useMemo } from 'react';
import type { PersonalSettings } from '../types.ts';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import CalendarIcon from './icons/CalendarIcon.tsx';
import { formatWhatsAppNumber } from '../utils/stringUtils.ts';

interface RenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    personalSettings?: PersonalSettings;
}

// Define plan details for labels, descriptions, and potential discounts
const planDetails: { [key: string]: { label: string; discountText?: string; } } = {
    '1': { label: 'Mensal' },
    '3': { label: 'Trimestral', discountText: 'Economize 5%' },
    '6': { label: 'Semestral', discountText: 'Economize 10%' },
    '12': { label: 'Anual', discountText: 'Economize 15%' },
};


const RenewalModal: React.FC<RenewalModalProps> = ({ isOpen, onClose, studentName, personalSettings }) => {
    
    // Set a default plan, e.g., '3' months, to encourage a choice.
    const [selectedPlan, setSelectedPlan] = useState<keyof typeof planDetails | null>('3');
    
    const availablePlans = useMemo(() => {
        if (!personalSettings?.planPrices) return [];
        return Object.entries(personalSettings.planPrices)
                     // FIX: Use a more specific type check to ensure 'price' is a number before comparison.
                     .filter(([, price]) => typeof price === 'number' && price > 0)
                     .map(([duration]) => duration)
                     .sort((a,b) => Number(a) - Number(b)); // Sort durations numerically
    }, [personalSettings?.planPrices]);

    const handleContactPersonal = () => {
        if (!personalSettings?.whatsapp) {
            alert("O número de WhatsApp do seu personal não foi configurado.");
            return;
        }
        if (!selectedPlan) {
            alert("Por favor, selecione um plano para continuar.");
            return;
        }

        const duration = selectedPlan;
        const price = personalSettings?.planPrices?.[duration as '1' | '3' | '6' | '12'];
        const planLabel = planDetails[duration]?.label || `${duration} Meses`;
        
        const message = `Olá! Sou ${studentName.split(' ')[0]} e gostaria de renovar meu plano. Escolhi a opção do plano ${planLabel} por R$ ${price?.toFixed(2)}. Podemos prosseguir? Obrigado(a)!`;
        const encodedMessage = encodeURIComponent(message);
        
        const whatsappNumber = formatWhatsAppNumber(personalSettings.whatsapp);
        const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(url, '_blank');
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center">
                        <CalendarIcon className="w-6 h-6 mr-3 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Renovar Plano</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
                    <p className="text-center text-gray-300">Escolha o plano ideal para você e continue sua jornada fitness!</p>

                    {availablePlans.length > 0 ? (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3`}>
                            {availablePlans.map(duration => {
                                const price = personalSettings?.planPrices?.[duration as '1' | '3' | '6' | '12'];
                                if (!price) return null;
                                
                                const numDuration = Number(duration);
                                const monthlyPrice = numDuration > 0 ? price / numDuration : 0;
                                const details = planDetails[duration];

                                return (
                                    <button 
                                        key={duration}
                                        onClick={() => setSelectedPlan(duration as keyof typeof planDetails)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden ${selectedPlan === duration ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-800/60 border-gray-700 hover:border-gray-500'}`}
                                    >
                                        {details?.discountText && (
                                            <div className="absolute top-2 right-[-28px] bg-yellow-500 text-black text-xs font-bold px-8 py-0.5 transform rotate-45">
                                                {details.discountText}
                                            </div>
                                        )}
                                        <p className="text-lg font-bold text-white">{details?.label || `${duration} Meses`}</p>
                                        <p className="text-2xl font-extrabold text-blue-300">R$ {price.toFixed(2)}</p>
                                        {numDuration > 1 && (
                                            <p className="text-sm text-gray-400">
                                                Apenas R$ {monthlyPrice.toFixed(2)} / mês
                                            </p>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                         <p className="text-center text-gray-400 bg-gray-800 p-4 rounded-lg">Os planos de preço ainda não foram configurados pelo seu personal.</p>
                    )}

                    <button 
                        onClick={handleContactPersonal}
                        disabled={!personalSettings?.whatsapp || !selectedPlan || availablePlans.length === 0}
                        className="w-full text-center mt-4 p-4 bg-green-600 rounded-lg flex justify-center items-center hover:bg-green-700 transition-colors border border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <WhatsAppIcon className="w-6 h-6 mr-3 text-white" />
                        <span className="font-bold text-lg text-white">Contatar para Renovar</span>
                    </button>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-center items-center text-xs text-gray-500">
                    <WhatsAppIcon className="w-4 h-4 mr-2 text-green-500" />
                    Você será redirecionado para o WhatsApp para confirmar sua escolha.
                </footer>
            </div>
        </div>
    );
};

export default RenewalModal;
