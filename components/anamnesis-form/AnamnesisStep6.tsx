import React from 'react';
import { SectionTitle, RadioGroup } from './AnamnesisControls.tsx';
import type { Student } from '../../types.ts';

interface StepProps {
    formData: Partial<Student>;
    handleSingleSelectChange: (name: keyof Student, value: string) => void;
}

const AnamnesisStep6: React.FC<StepProps> = ({ formData, handleSingleSelectChange }) => (
    <>
        <SectionTitle>6. Nível Atual</SectionTitle>
        <RadioGroup label="Como você avalia seu condicionamento físico atual?" name="currentCondition" options={['Fraco', 'Regular', 'Bom', 'Excelente']} value={formData.currentCondition} onChange={handleSingleSelectChange} />
        <RadioGroup label="Consegue correr 5 minutos sem parar?" name="canRun5min" options={['Sim', 'Não']} value={formData.canRun5min} onChange={handleSingleSelectChange} />
        <RadioGroup label="Consegue realizar flexões de braço?" name="canDoPushups" options={['Sim', 'Não']} value={formData.canDoPushups} onChange={handleSingleSelectChange} />
        <RadioGroup label="Consegue agachar livremente sem dor?" name="canSquat" options={['Sim', 'Não']} value={formData.canSquat} onChange={handleSingleSelectChange} />
    </>
);

export default AnamnesisStep6;