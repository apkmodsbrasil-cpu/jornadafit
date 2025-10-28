

import React, { useState } from 'react';
import UserIcon from './icons/UserIcon.tsx';
import KeyIcon from './icons/KeyIcon.tsx';
import type { AuthError } from '@supabase/supabase-js';

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  onRegister: (name: string, email: string, password: string) => Promise<{ error: AuthError | null }>;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let result;
    if (isLogin) {
      result = await onLogin(email, password);
    } else {
      result = await onRegister(name, email, password);
    }
    
    if (result.error) {
        setError(result.error.message);
    }
    
    setIsLoading(false);
  };
  
  const baseTabClass = "flex-1 text-center py-3 font-semibold transition-colors duration-300";
  const activeTabClass = "text-white border-b-2 border-blue-500";
  const inactiveTabClass = "text-gray-400 hover:text-white border-b-2 border-transparent";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 tracking-wider">Jornada<span className="text-blue-500">Fit</span></h1>
        <p className="text-gray-400">Conectando você aos seus resultados</p>
      </div>
      <div className="w-full max-w-md bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex">
          <button onClick={() => setIsLogin(true)} className={`${baseTabClass} ${isLogin ? activeTabClass : inactiveTabClass}`}>
            Login
          </button>
          <button onClick={() => setIsLogin(false)} className={`${baseTabClass} ${isLogin ? inactiveTabClass : activeTabClass}`}>
            Registrar (Personal)
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isLogin && (
             <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-800 p-3 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="relative">
             <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
            <input
              type="email"
              placeholder="Email"
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
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 p-3 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50"
          >
            {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthView;