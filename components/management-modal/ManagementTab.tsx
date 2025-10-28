import React, { useState } from 'react';
import type { Student } from '../../types.ts';
import EditIcon from '../icons/EditIcon.tsx';
import FilePlusIcon from '../icons/FilePlusIcon.tsx';
import BarChartIcon from '../icons/BarChartIcon.tsx';
import RoadmapIcon from '../icons/RoadmapIcon.tsx';
import CalendarIcon from '../icons/CalendarIcon.tsx';
import WhatsAppIcon from '../icons/WhatsAppIcon.tsx';
import KeyIcon from '../icons/KeyIcon.tsx';
import { formatWhatsAppNumber } from '../../utils/stringUtils.ts';
import CheckCircleIcon from '../icons/CheckCircleIcon.tsx';

interface ManagementTabProps {
    editableStudent: Student;
    setEditableStudent: React.Dispatch<React.SetStateAction<Student>>;
    onOpenEditor: () => void;
    onOpenSplitSelector: () => void;
    onOpenPerformanceReview: () => void;
    onOpenPeriodizationAssistant: () => void;
    onOpenCredentials: () => void;
}

const ManagementTab: React.FC<ManagementTabProps> = ({
    editableStudent,
    setEditableStudent,
    onOpenEditor,
    onOpenSplitSelector,
    onOpenPerformanceReview,
    onOpenPeriodizationAssistant,
    onOpenCredentials
}) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableStudent(prev => ({ ...prev, [name]: value }));
    };

    const handlePlanStatusToggle = () => {
        setEditableStudent(prev => ({
            ...prev,
            planStatus: prev.planStatus === 'active' ? 'inactive' : 'active'
        }));
    };

    const handleRenewPlan = (months: number) => {
        setEditableStudent(prev => {
            const currentExpiry = prev.planExpiryDate ? new Date(prev.planExpiryDate + 'T00:00:00') : new Date();
            const startDate = currentExpiry < new Date() ? new Date() : currentExpiry;
            startDate.setMonth(startDate.getMonth() + months);
            return {
                ...prev,
                planExpiryDate: startDate.toISOString().split('T')[0],
                planStatus: 'active'
            };
        });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="pt-4 border-t border-gray-700/50">
                <h3 className="font-semibold mb-2">Credenciais e Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="email" name="email" placeholder="Email de acesso do aluno" onChange={handleChange} value={editableStudent.email || ''} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                    <div className="relative">
                        <KeyIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input type="text" name="password" placeholder="Nova senha (opcional)" onChange={handleChange} value={editableStudent.password || ''} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600 pl-8" />
                    </div>
                </div>
                 <button onClick={onOpenCredentials} className="mt-2 text-sm text-blue-400 hover:underline">
                    Compartilhar Acesso
                </button>
                <div className="flex items-center gap-4 mt-4">
                    <input type="tel" name="whatsapp" placeholder="WhatsApp (Ex: 5511999998888)" onChange={handleChange} value={editableStudent.whatsapp || ''} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                    {editableStudent.whatsapp && (
                        <a href={`https://wa.me/${formatWhatsAppNumber(editableStudent.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40 transition-colors" aria-label="Contatar no WhatsApp">
                            <WhatsAppIcon className="w-6 h-6" />
                        </a>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
                <h3 className="font-semibold mb-2">Status do Plano</h3>
                <div className="bg-gray-800/50 p-3 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 ${editableStudent.planStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="font-semibold">{editableStudent.planStatus === 'active' ? 'Plano Ativo' : 'Plano Inativo'}</span>
                        </div>
                        <button onClick={handlePlanStatusToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${editableStudent.planStatus === 'active' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${editableStudent.planStatus === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400"/>
                        <label htmlFor="planExpiryDate" className="mr-2 shrink-0">Vencimento:</label>
                        <input type="date" id="planExpiryDate" name="planExpiryDate" value={editableStudent.planExpiryDate || ''} onChange={handleChange} className="w-full bg-gray-700 text-white font-semibold rounded-md p-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" style={{ colorScheme: 'dark' }} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Renovar plano:</label>
                        <div className="flex gap-2">
                            {[1, 3, 6].map(months => (
                                <button key={months} onClick={() => handleRenewPlan(months)} className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded-md transition-colors">
                                    +{months} Mês{months > 1 ? 'es' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
                <h3 className="font-semibold mb-2">Plano de Treino</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onOpenEditor} disabled={!editableStudent.workoutPlan || editableStudent.workoutPlan.length === 0} className="flex items-center justify-center p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <EditIcon className="w-4 h-4 mr-2" /> Editar Plano Atual
                    </button>
                    <button onClick={onOpenSplitSelector} className="flex items-center justify-center p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600">
                        <FilePlusIcon className="w-4 h-4 mr-2" /> Gerar Novo Plano
                    </button>
                </div>
                <h3 className="font-semibold mb-2 mt-4">Análise e Ferramentas</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onOpenPerformanceReview} className="flex items-center justify-center p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600">
                        <BarChartIcon className="w-4 h-4 mr-2" /> Revisar Performance
                    </button>
                    <button onClick={onOpenPeriodizationAssistant} className="flex items-center justify-center p-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600">
                        <RoadmapIcon className="w-4 h-4 mr-2" /> Periodização
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagementTab;