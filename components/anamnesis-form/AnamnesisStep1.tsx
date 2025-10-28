import React from 'react';
import { SectionTitle, RadioGroup } from './AnamnesisControls.tsx';
import type { Student } from '../../types.ts';

interface StepProps {
    formData: Partial<Student>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSingleSelectChange: (name: keyof Student, value: string) => void;
    handleWhatsAppChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AnamnesisStep1: React.FC<StepProps> = ({ formData, handleInputChange, handleSingleSelectChange, handleWhatsAppChange }) => (
    <>
        <SectionTitle>1. Dados Pessoais</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" value={formData.name || ''} readOnly className="w-full bg-gray-700 p-2 rounded-lg border border-gray-600 text-gray-400 cursor-not-allowed" />
            <input type="number" name="age" placeholder="Idade" value={formData.age || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
            <RadioGroup label="Sexo" name="sex" options={['Masculino', 'Feminino']} value={formData.sex} onChange={handleSingleSelectChange} />
            <div/>
            <input type="number" name="height" placeholder="Altura (cm)" value={formData.height || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
            <input type="number" step="0.1" name="weight" placeholder="Peso atual (kg)" value={formData.weight || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
            <input type="tel" name="whatsapp" placeholder="(XX) XXXXX-XXXX" value={formData.whatsapp || ''} onChange={handleWhatsAppChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
            <input type="text" name="profession" placeholder="Profissão" value={formData.profession || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
            <input type="text" name="city" placeholder="Cidade" value={formData.city || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
        </div>
    </>
);

export default AnamnesisStep1;
