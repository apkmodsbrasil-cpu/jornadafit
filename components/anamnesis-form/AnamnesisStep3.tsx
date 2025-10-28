import React from 'react';
import { SectionTitle, RadioGroup } from './AnamnesisControls.tsx';
import type { Student } from '../../types.ts';

interface StepProps {
    formData: Partial<Student>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSingleSelectChange: (name: keyof Student, value: string) => void;
}

const AnamnesisStep3: React.FC<StepProps> = ({ formData, handleInputChange, handleSingleSelectChange }) => (
    <>
        <SectionTitle>3. Histórico de Treinamento</SectionTitle>
        <RadioGroup label="Já praticou musculação antes?" name="hasTrainedBefore" options={['Sim', 'Não']} value={formData.hasTrainedBefore} onChange={handleSingleSelectChange} />
        <input type="text" name="trainingSince" placeholder="Há quanto tempo treina (ou treinou)?" value={formData.trainingSince || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
        <input type="text" name="previousTrainingFrequency" placeholder="Quantas vezes por semana treinava?" value={formData.previousTrainingFrequency || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
        <RadioGroup label="Já teve acompanhamento com personal?" name="hadPersonalTrainer" options={['Sim', 'Não']} value={formData.hadPersonalTrainer} onChange={handleSingleSelectChange} />
        <textarea name="likedWorkouts" placeholder="Qual tipo de treino mais gosta (força, funcional, cardio, etc)?" value={formData.likedWorkouts || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
        <textarea name="dislikedWorkouts" placeholder="Quais exercícios ou treinos você não gosta de fazer?" value={formData.dislikedWorkouts || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
    </>
);

export default AnamnesisStep3;
