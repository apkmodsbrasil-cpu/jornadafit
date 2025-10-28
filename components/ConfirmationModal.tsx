import React from 'react';
import AlertTriangleIcon from './icons/AlertTriangleIcon.tsx';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[80]" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm border border-gray-700 text-center animate-fade-in-scale" onClick={e => e.stopPropagation()}>
        <AlertTriangleIcon className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;