
import React, { useState } from 'react';
import UserIcon from './icons/UserIcon.tsx';
import KeyIcon from './icons/KeyIcon.tsx';

interface AddStudentModalProps {
  onClose: () => void;
  onAddStudent: (studentData: { name: string; email: string; password: string; }) => Promise<{success: boolean, error?: string}>;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onAddStudent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setError('');
    setIsLoading(true);

    const result = await onAddStudent({ name, email, password });
    
    setIsLoading(false);

    if (result.success) {
      alert('Aluno criado com sucesso!');
      onClose();
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Criar Novo Aluno</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>

        <div className="p-6 space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nome Completo do Aluno"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-800 p-3 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
             <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
            <input
              type="email"
              placeholder="Email de Acesso"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 p-3 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Senha Inicial"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 p-3 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{error}</p>}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center">
          <button type="button" onClick={onClose} className="px-6 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50">
            {isLoading ? 'Criando...' : 'Criar Aluno'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default AddStudentModal;