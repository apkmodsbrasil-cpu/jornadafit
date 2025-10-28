import React from 'react';
import { SectionTitle, RadioGroup } from './AnamnesisControls.tsx';
import type { Student } from '../../types.ts';

interface StepProps {
    formData: Partial<Student>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSingleSelectChange: (name: keyof Student, value: string) => void;
}

const AnamnesisStep4: React.FC<StepProps> = ({ formData, handleInputChange, handleSingleSelectChange }) => (
    <>
        <SectionTitle>4. Rotina Atual</SectionTitle>
        <input type="text" name="hoursSitting" placeholder="Quantas horas por dia você passa sentado (trabalho, estudo)?" value={formData.hoursSitting || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
        <input type="number" name="sleepHours" placeholder="Quantas horas de sono por noite, em média?" value={formData.sleepHours || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
        <RadioGroup label="Como é sua alimentação atual?" name="nutritionQuality" options={['Muito saudável', 'Moderada', 'Desequilibrada']} value={formData.nutritionQuality} onChange={handleSingleSelectChange} />
        <RadioGroup label="Costuma beber água com frequência?" name="waterIntake" options={['Sim', 'Às vezes', 'Quase nunca']} value={formData.waterIntake} onChange={handleSingleSelectChange} />
        <RadioGroup label="Consome álcool?" name="alcoholIntake" options={['Sim', 'Não']} value={formData.alcoholIntake} onChange={handleSingleSelectChange} />
        <RadioGroup label="Fuma?" name="smokerInfo" options={['Sim', 'Não']} value={formData.smokerInfo} onChange={handleSingleSelectChange} />
    </>
);

export default AnamnesisStep4;