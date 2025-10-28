import React, { useState, useEffect } from 'react';
import type { Personal, PersonalSettings } from '../types.ts';
import SettingsIcon from './icons/SettingsIcon.tsx';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    personal: Personal;
    onSaveSettings: (settings: PersonalSettings) => Promise<void>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, personal, onSaveSettings, addToast }) => {
    const [personalSettings, setPersonalSettings] = useState<Omit<PersonalSettings, 'geminiApiKeys'>>({});

    useEffect(() => {
        if (isOpen && personal) {
            const { geminiApiKeys, ...otherSettings } = personal.settings || {};
            setPersonalSettings(otherSettings || { planPrices: {} });
        }
    }, [isOpen, personal]);
    
    const handleSave = async () => {
        const settingsToSave: PersonalSettings = {
            ...personal.settings,
            ...personalSettings
        };
        await onSaveSettings(settingsToSave);
        addToast('Configurações salvas com sucesso!', 'success');
        onClose();
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name.startsWith('planPrices.')) {
            const [, month] = name.split('.');
            setPersonalSettings(prev => ({
                ...prev,
                planPrices: {
                    ...prev.planPrices,
                    [month as '1' | '3' | '6']: value ? parseFloat(value) : undefined,
                }
            }));
        } else {
            setPersonalSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center">
                        <SettingsIcon className="w-6 h-6 mr-3 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Configurações</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Preferências da IA</h3>
                        <textarea
                            name="aiStyleNotes"
                            value={personalSettings.aiStyleNotes || ''}
                            onChange={handleSettingsChange}
                            placeholder="Ex: Prefiro treinos com mais volume. Evitar exercícios de alto impacto para alunos iniciantes."
                            className="w-full h-20 bg-gray-800 p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Notas para guiar a IA na criação de treinos. Uma nota por linha.</p>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Configurações do Personal</h3>
                        <div className="space-y-3">
                            <input type="text" name="whatsapp" value={personalSettings.whatsapp || ''} onChange={handleSettingsChange} placeholder="Nº WhatsApp (Ex: 55119...)" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" name="planPrices.1" value={personalSettings.planPrices?.[1] || ''} onChange={handleSettingsChange} placeholder="Preço 1 Mês" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                                <input type="number" name="planPrices.3" value={personalSettings.planPrices?.[3] || ''} onChange={handleSettingsChange} placeholder="Preço 3 Meses" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                                <input type="number" name="planPrices.6" value={personalSettings.planPrices?.[6] || ''} onChange={handleSettingsChange} placeholder="Preço 6 Meses" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end items-center">
                    <button onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        Salvar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;