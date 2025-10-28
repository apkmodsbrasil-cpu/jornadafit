import React, { useRef, useEffect, useState } from 'react';
import type { Message } from '../types.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import ChatIcon from './icons/ChatIcon.tsx';
import UserIcon from './icons/UserIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    chat: {
        sendMessage: (text: string) => void;
        history: Message[];
        setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
        quickActions: string[];
        isLoading: boolean;
    }
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                const lines = part.split('\n').map((line, lineIndex) => {
                    if (line.trim().startsWith('- ')) {
                        return <li key={`${index}-${lineIndex}`} className="ml-4 list-disc">{line.trim().substring(2)}</li>;
                    }
                    return <span key={`${index}-${lineIndex}`}>{line}{lineIndex < part.split('\n').length - 1 && <br/>}</span>
                });
                return <span key={index}>{lines}</span>;
            })}
        </>
    );
};

const BlinkingCursor = () => (
    <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" style={{ animationDuration: '1s' }}></span>
);


const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, chat }) => {
    const { sendMessage, history, quickActions, isLoading } = chat;
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput('');
        }
    };
    
    const handleQuickActionClick = (action: string) => {
        if (!isLoading) {
            sendMessage(action);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col h-[90vh] max-h-[700px] m-4" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center">
                        <ChatIcon className="w-6 h-6 mr-3 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Assistente de Treino</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-purple-400 flex-shrink-0 mb-1" />}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl text-white ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                <MarkdownRenderer text={msg.parts} />
                                {isLoading && msg.role === 'model' && index === history.length -1 && <BlinkingCursor />}
                            </div>
                             {msg.role === 'user' && <UserIcon className="w-6 h-6 text-gray-300 flex-shrink-0 mb-1" />}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="border-t border-gray-700 flex flex-col">
                    {!isLoading && quickActions.length > 0 && (
                        <div className="p-3 flex flex-wrap gap-2 justify-start border-b border-gray-700/50">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickActionClick(action)}
                                    className="text-xs bg-gray-600/80 hover:bg-gray-600 text-gray-200 font-semibold py-1.5 px-3 rounded-full transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="p-3 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={'Pergunte sobre seu treino...'}
                            className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={isLoading || !input.trim()}>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ChatModal;