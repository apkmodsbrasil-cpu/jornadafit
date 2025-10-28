import React, { useState, useEffect, useMemo } from 'react';
import type { Personal, PersonalSettings, ExerciseDetails, Student, UserProfile } from '../types.ts';
import { GoogleGenAI } from '@google/genai';
import AddExerciseModal from './AddExerciseModal.tsx';
import ExerciseDatabaseModal from './ExerciseDatabaseModal.tsx';
import KeyIcon from './icons/KeyIcon.tsx';
import DumbbellIcon from './icons/DumbbellIcon.tsx';
import UserIcon from './icons/UserIcon.tsx';
import CalendarIcon from './icons/CalendarIcon.tsx';

interface AdminViewProps {
    personal: Personal;
    onSaveSettings: (settings: PersonalSettings) => Promise<void>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    exerciseDatabase: Record<string, ExerciseDetails>;
    onAddExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
    onUpdateExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
    onAddExercisesBatch: (jsonString: string) => Promise<boolean>;
    isBatchAdding: boolean;
    allUsers: { personals: Personal[], students: Student[] };
    onUpdateUserAsAdmin: (user: Personal | Student, updates: Partial<Personal | Student>, authUpdates: { password?: string }) => Promise<void>;
}

const AdminView: React.FC<AdminViewProps> = ({ personal, onSaveSettings, addToast, exerciseDatabase, onAddExercise, onUpdateExercise, onAddExercisesBatch, isBatchAdding, allUsers, onUpdateUserAsAdmin }) => {
    const [activeTab, setActiveTab] = useState<'apiKeys' | 'exercises' | 'users'>('apiKeys');
    const [apiKeys, setApiKeys] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDbModalOpen, setDbModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    
    // User Management State
    const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Personal | Student | null>(null);
    const [editedUserData, setEditedUserData] = useState<Partial<Personal | Student>>({});
    const [newPassword, setNewPassword] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');

    useEffect(() => {
        if (personal) {
            setApiKeys((personal.settings?.geminiApiKeys || []).join('\n'));
        }
    }, [personal]);

    const filteredUsers = useMemo(() => {
        const lowerSearch = userSearchTerm.toLowerCase();
        if (!lowerSearch) return allUsers;
        return {
            personals: allUsers.personals.filter(p => p.name.toLowerCase().includes(lowerSearch) || p.email.toLowerCase().includes(lowerSearch)),
            students: allUsers.students.filter(s => s.name.toLowerCase().includes(lowerSearch) || s.email.toLowerCase().includes(lowerSearch)),
        }
    }, [allUsers, userSearchTerm]);
    
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
            console.error("Erro desconhecido ao validar a chave:", error);
            return { status: 'invalid', error: 'Erro desconhecido ao validar a chave.' };
        }
    };

    const handleSaveApiKeys = async () => {
        const keysArray = apiKeys.split('\n').map(k => k.trim()).filter(Boolean);
        const settingsToSave: PersonalSettings = { ...personal.settings, geminiApiKeys: keysArray };
        
        await onSaveSettings(settingsToSave);
        
        addToast('Configurações salvas. Validando chaves...', 'info');
        setIsVerifying(true);

        const validationPromises = keysArray.map(async key => {
            const result = await validateApiKey(key);
            const keyPreview = `...${key.slice(-4)}`;
            if (result.status === 'valid') {
                addToast(`Chave ${keyPreview} é válida e está funcionando.`, 'success');
            } else if (result.status === 'quota_exceeded') {
                addToast(`Chave ${keyPreview} é válida, mas a cota foi excedida.`, 'info');
            } else {
                addToast(`Chave ${keyPreview} é inválida.`, 'error');
            }
        });
        
        await Promise.all(validationPromises);
        setIsVerifying(false);
        addToast('Validação concluída!', 'info');
    };

    const handleAddBatch = async () => {
        const success = await onAddExercisesBatch(jsonInput);
        if (success) setJsonInput('');
    };

    const handleOpenUserEdit = (user: Personal | Student) => {
        setSelectedUser(user);
        setEditedUserData(user);
        setNewPassword('');
        setIsUserEditModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        await onUpdateUserAsAdmin(selectedUser, editedUserData, { password: newPassword });
        setIsUserEditModalOpen(false);
    };

    const handleRenewPlan = (months: number) => {
        setEditedUserData(prev => {
            const user = prev as Partial<Personal | Student>;
            const currentExpiry = user.planExpiryDate ? new Date(user.planExpiryDate + 'T00:00:00') : new Date();
            const startDate = currentExpiry < new Date() ? new Date() : currentExpiry;
            startDate.setMonth(startDate.getMonth() + months);
            return {
                ...prev,
                planExpiryDate: startDate.toISOString().split('T')[0],
                planStatus: 'active'
            };
        });
    };

    const jsonExample = JSON.stringify([{
        "id": "remada-articulada-unilateral",
        "name": "Remada Articulada Unilateral",
        "videoUrl": "https://www.youtube.com/watch?v=example",
        "gifUrl": "https://example.com/remada.gif",
        "tutorial": "**Posição Inicial:**\\n- Sente-se na máquina...\\n**Execução:**\\n1. Puxe a alça...",
        "equipment": "maquina",
        "muscleGroups": { "primary": ["latíssimo do dorso"], "secondary": ["bíceps", "romboides"] },
        "difficulty": "intermediario",
        "contraindications": []
    }], null, 2);
    
    const TabButton: React.FC<{ tab: 'apiKeys' | 'exercises' | 'users', label: string, icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
            {icon} {label}
        </button>
    );
    
    const UserListItem: React.FC<{user: UserProfile}> = ({user}) => (
        <li onClick={() => handleOpenUserEdit(user as Student | Personal)} className="p-3 flex justify-between items-center hover:bg-gray-700/50 cursor-pointer transition-colors rounded-md">
            <div>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
            </div>
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.role === 'personal' ? 'bg-purple-900/50 text-purple-300' : 'bg-green-900/50 text-green-300'}`}>
                {user.role}
            </span>
        </li>
    );

    return (
        <>
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
                <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>

                <div className="border-b border-gray-700 mb-6">
                    <div className="flex items-center -mb-px">
                        <TabButton tab="apiKeys" label="Chaves de API" icon={<KeyIcon className="w-5 h-5"/>}/>
                        <TabButton tab="exercises" label="Base de Exercícios" icon={<DumbbellIcon className="w-5 h-5"/>}/>
                        <TabButton tab="users" label="Usuários" icon={<UserIcon className="w-5 h-5"/>}/>
                    </div>
                </div>

                {activeTab === 'apiKeys' && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg p-6 animate-fade-in">
                        <label className="block text-lg font-semibold text-gray-200 mb-2">Chaves de API Gemini</label>
                        <textarea
                            value={apiKeys}
                            onChange={(e) => setApiKeys(e.target.value)}
                            placeholder="Cole uma chave por linha"
                            className="w-full h-32 bg-gray-800 p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-2">Estas chaves são as chaves GLOBAIS para toda a aplicação. Elas serão usadas por todos os personais e alunos em sistema de rodízio.</p>
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleSaveApiKeys} disabled={isVerifying} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isVerifying ? 'Verificando...' : 'Salvar e Validar Chaves'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'exercises' && (
                     <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg p-6 animate-fade-in space-y-4">
                        <h2 className="text-lg font-semibold text-gray-200">Gerenciamento de Exercícios</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                            <button onClick={() => setDbModalOpen(true)} className="text-sm bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 w-full">Visualizar / Editar Base</button>
                            <button onClick={handleAddBatch} disabled={!jsonInput.trim() || isBatchAdding} className="text-sm bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center w-full">
                                {isBatchAdding ? 'Adicionando...' : 'Adicionar via JSON'}
                            </button>
                        </div>
                         <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Cole um array de objetos de exercícios em JSON aqui para adicionar em lote."
                            disabled={isBatchAdding}
                            className="w-full h-40 bg-gray-800 p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-xs"
                         />
                        <details>
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">Ver Exemplo de Formato JSON</summary>
                            <pre className="mt-2 bg-gray-950 p-2 rounded-md text-xs text-gray-300 overflow-x-auto"><code>{jsonExample}</code></pre>
                        </details>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg p-6 animate-fade-in">
                        <input type="text" placeholder="Buscar por nome ou email..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-purple-300">Personais ({filteredUsers.personals.length})</h3>
                                <ul className="space-y-2 h-96 overflow-y-auto pr-2">
                                    {filteredUsers.personals.map(p => <UserListItem key={p.id} user={p}/>)}
                                </ul>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-2 text-green-300">Alunos ({filteredUsers.students.length})</h3>
                                <ul className="space-y-2 h-96 overflow-y-auto pr-2">
                                    {filteredUsers.students.map(s => <UserListItem key={s.id} user={s}/>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isDbModalOpen && (
                <ExerciseDatabaseModal
                    isOpen={isDbModalOpen}
                    onClose={() => setDbModalOpen(false)}
                    exerciseDatabase={exerciseDatabase}
                    addToast={addToast}
                    onAddExercise={onAddExercise}
                    onUpdateExercise={onUpdateExercise}
                />
            )}
            
            {isUserEditModalOpen && selectedUser && editedUserData && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[80]" onClick={() => setIsUserEditModalOpen(false)}>
                    <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                        <header className="p-4 flex justify-between items-center border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">Editar Usuário: {selectedUser.name}</h2>
                            <button onClick={() => setIsUserEditModalOpen(false)} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                        </header>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <input type="text" placeholder="Nome Completo" value={editedUserData.name || ''} onChange={e => setEditedUserData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600 font-bold" />
                            <input type="email" placeholder="Email" value={editedUserData.email || ''} onChange={e => setEditedUserData(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
                            <div className="relative">
                                <KeyIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                <input type="text" placeholder="Nova senha (deixe em branco para não alterar)" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600 pl-8" />
                            </div>
                            
                            <div className="pt-4 border-t border-gray-700/50">
                                <h3 className="font-semibold mb-2">Plano de Assinatura</h3>
                                <div className="bg-gray-800/50 p-3 rounded-lg space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className={`w-3 h-3 rounded-full mr-3 ${(editedUserData as Personal | Student).planStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="font-semibold">{(editedUserData as Personal | Student).planStatus === 'active' ? 'Plano Ativo' : 'Plano Inativo'}</span>
                                        </div>
                                        <button type="button" onClick={() => setEditedUserData(prev => ({...prev, planStatus: (prev as Personal | Student).planStatus === 'active' ? 'inactive' : 'active'}))} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${(editedUserData as Personal | Student).planStatus === 'active' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${(editedUserData as Personal | Student).planStatus === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-300">
                                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400"/>
                                        <label className="mr-2 shrink-0">Vencimento:</label>
                                        <input type="date" value={(editedUserData as Personal | Student).planExpiryDate || ''} onChange={e => setEditedUserData(prev => ({...prev, planExpiryDate: e.target.value}))} className="w-full bg-gray-700 text-white font-semibold rounded-md p-1 border border-gray-600" style={{ colorScheme: 'dark' }} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Renovar plano:</label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                            {[1, 3, 6, 12].map(months => (
                                                <button key={months} type="button" onClick={() => handleRenewPlan(months)} className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded-md transition-colors">
                                                    {months === 12 ? '+1 Ano' : `+${months} Mês${months > 1 ? 'es' : ''}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <footer className="p-4 border-t border-gray-700 flex justify-end items-center">
                             <button onClick={() => setIsUserEditModalOpen(false)} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
                             <button onClick={handleSaveUser} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Salvar Alterações</button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminView;