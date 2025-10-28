import React from 'react';
import { SectionTitle, RadioGroup } from './AnamnesisControls.tsx';
import type { Student } from '../../types.ts';

interface StepProps {
    formData: Partial<Student>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSingleSelectChange: (name: keyof Student, value: string) => void;
}

const AnamnesisStep2: React.FC<StepProps> = ({ formData, handleInputChange, handleSingleSelectChange }) => (
    <>
        <SectionTitle>2. Objetivos</SectionTitle>
        <RadioGroup label="Qual é o seu principal objetivo com o treino?" name="goal" options={['Emagrecimento', 'Hipertrofia (ganho de massa)', 'Condicionamento físico', 'Definição muscular', 'Reabilitação', 'Melhora da saúde / qualidade de vida']} value={formData.goal} onChange={handleSingleSelectChange} />
        <textarea name="specificGoal" placeholder="Tem alguma meta específica (ex: perder 5kg, ganhar 3kg de massa, correr 5km)?" value={formData.specificGoal || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
        <input type="text" name="goalTimeline" placeholder="Em quanto tempo você espera atingir esse objetivo?" value={formData.goalTimeline || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
    </>
);

export default AnamnesisStep2;
