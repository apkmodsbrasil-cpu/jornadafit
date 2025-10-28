import React, { useState, useEffect } from 'react';
import type { Personal, PersonalSettings } from './types.ts';
import SettingsIcon from './icons/SettingsIcon.tsx';
import { GoogleGenAI } from '@google/genai';

interface AdminPanelModalProps {
    isOpen: boolean;
    onClose: () => void;
    personal: Personal;
    onSaveSettings: (settings: PersonalSettings) => Promise<void>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose, personal, onSaveSettings, addToast }) => {
    const [apiKeys, setApiKeys] = useState('');
    const [personalSettings, setPersonalSettings] = useState<Omit<PersonalSettings, 'geminiApiKeys'>>({});
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (isOpen && personal) {
// FIX: Corrected property access from personal.geminiApiKeys to personal.settings?.geminiApiKeys to match the 'Personal' type structure.
            setApiKeys((personal.settings?.geminiApiKeys || []).join('\n'));
            const { geminiApiKeys, ...otherSettings } = personal.settings || {};
            setPersonalSettings(otherSettings || { planPrices: {} });
        }
    }, [isOpen, personal]);
    
    const validateApiKey = async (key: string): Promise<{ status: 'valid' | 'quota_exceeded' | 'invalid', error?: string }> => {
        if (!key) return { status: 'invalid', error: 'Chave vazia.' };
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
            return { status: 'valid' };
        } catch (error: any) {
            const errorString = JSON.stringify(error) || error.toString();
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                return { status: 'quota_exceeded' };
            }
            if (errorString.includes('API key not valid')) {
                return { status: 'invalid', error: 'Chave de API inválida.' };
            }
            return { status: 'invalid', error: 'Erro desconhecido ao validar a chave.' };
        }
    };

    const handleSave = async () => {
        const keysArray = apiKeys.split('\n').map(k => k.trim()).filter(Boolean);
        
        const settingsToSave: PersonalSettings = {
            ...personal.settings,
            ...personalSettings,
            geminiApiKeys: keysArray
        };
        
        await onSaveSettings(settingsToSave);
        
        addToast('Configurações salvas. Validando chaves...', 'info');
        setIsVerifying(true);

        for (const key of keysArray) {
            const result = await validateApiKey(key);
            const keyPreview = `...${key.slice(-4)}`;
            if (result.status === 'valid') {
                addToast(`Chave ${keyPreview} é válida e está funcionando.`, 'success');
            } else if (result.status === 'quota_exceeded') {
                addToast(`Chave ${keyPreview} é válida, mas a cota foi excedida.`, 'info');
            } else {
                addToast(`Chave ${keyPreview} é inválida.`, 'error');
            }
        }
        setIsVerifying(false);
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
                        <h2 className="text-xl font-bold text-white">Painel Administrativo</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">Chaves de API Gemini</label>
                        <textarea
                            value={apiKeys}
                            onChange={(e) => setApiKeys(e.target.value)}
                            placeholder="Cole uma chave por linha"
                            className="w-full h-24 bg-gray-800 p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                        />
                         <p className="text-xs text-gray-400 mt-1">Estas chaves serão salvas no seu perfil e usadas em rodízio caso a principal atinja a cota.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Configurações do Personal</h3>
                        <div className="space-y-3">
                             <input type="text" name="whatsapp" value={personalSettings.whatsapp || ''} onChange={(e) => handleSettingsChange(e)} placeholder="Nº WhatsApp (Ex: 55119...)" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" name="planPrices.1" value={personalSettings.planPrices?.[1] || ''} onChange={(e) => handleSettingsChange(e)} placeholder="Preço 1 Mês" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                                <input type="number" name="planPrices.3" value={personalSettings.planPrices?.[3] || ''} onChange={(e) => handleSettingsChange(e)} placeholder="Preço 3 Meses" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                                <input type="number" name="planPrices.6" value={personalSettings.planPrices?.[6] || ''} onChange={(e) => handleSettingsChange(e)} placeholder="Preço 6 Meses" className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end items-center">
                    <button onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleSave} disabled={isVerifying} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {isVerifying ? 'Verificando...' : 'Salvar e Validar'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AdminPanelModal;
