import React from 'react';
import type { Student } from '../../types.ts';

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-xl font-bold text-blue-300 border-l-4 border-blue-400 pl-3 mb-6">{children}</h2>
);

export const RadioGroup: React.FC<{
    label: string;
    name: keyof Student;
    options: string[];
    value: string | undefined;
    onChange: (name: keyof Student, value: string) => void;
}> = ({ label, name, options, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-200 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    type="button"
                    key={option}
                    onClick={() => onChange(name, option)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        value === option
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

export const CheckboxGroup: React.FC<{
    label: string;
    name: keyof Student;
    options: string[];
    value: string[] | undefined;
    onChange: (name: keyof Student, value: string) => void;
}> = ({ label, name, options, value = [], onChange }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-200 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    type="button"
                    key={option}
                    onClick={() => onChange(name, option)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        (value || []).includes(option)
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);