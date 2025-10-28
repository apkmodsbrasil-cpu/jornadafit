import React from 'react';
import type { Student } from '../types.ts';
import KeyIcon from './icons/KeyIcon.tsx';
import CopyIcon from './icons/CopyIcon.tsx';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import { formatWhatsAppNumber } from '../utils/stringUtils.ts';

// **IMPORTANTE**: Substitua esta URL pela URL do seu aplicativo no Vercel.
const LOGIN_URL = 'https://jornadafit.vercel.app/';

interface CredentialsModalProps {
  student: Student;
  password?: string;
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({ student, password, onClose, addToast }) => {
  const finalPassword = password || '';
  const canShare = !!password;

  const getMessageText = (formatForWhatsApp: boolean) => {
    const bold = formatForWhatsApp ? '*' : '';
    return `Use essas informações para entrar na sua conta!
${bold}Login:${bold} ${student.email}
${bold}Senha:${bold} ${finalPassword}

Para fazer o login, acesse: ${LOGIN_URL}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getMessageText(false))
      .then(() => addToast('Credenciais copiadas!', 'success'))
      .catch(() => addToast('Falha ao copiar.', 'error'));
  };

  const handleSendWhatsApp = () => {
    if (!student.whatsapp) {
      addToast('Este aluno não tem um número de WhatsApp cadastrado.', 'error');
      return;
    }
    const message = encodeURIComponent(getMessageText(true));
    const whatsappNumber = formatWhatsAppNumber(student.whatsapp);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[70]" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center">
            <KeyIcon className="w-6 h-6 mr-3 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Compartilhar Acesso</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>

        <div className="p-6 space-y-4">
          {!canShare ? (
              <div className="bg-yellow-900/40 border border-yellow-700/50 text-yellow-300 p-3 rounded-lg text-sm text-center">
                Para compartilhar o acesso, primeiro digite uma nova senha para o aluno no campo "Nova Senha" na tela anterior.
              </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-400">Login (Email)</label>
                <p className="font-mono bg-gray-900 p-2 rounded-md">{student.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Senha</label>
                <p className="font-mono bg-gray-900 p-2 rounded-md">{finalPassword}</p>
                <p className="text-xs text-yellow-400 mt-1">Esta é a nova senha que você digitou.</p>
              </div>
            </>
          )}
        </div>

        <footer className="p-4 border-t border-gray-700 flex justify-end items-center gap-2">
          <button onClick={handleCopy} disabled={!canShare} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
            <CopyIcon className="w-5 h-5" /> Copiar
          </button>
          <button onClick={handleSendWhatsApp} disabled={!student.whatsapp || !canShare} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
            <WhatsAppIcon className="w-5 h-5" /> Enviar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CredentialsModal;