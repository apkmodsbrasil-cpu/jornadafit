import React from 'react';
import { SectionTitle, RadioGroup } from './AnamnesisControls.tsx';
import type { Student } from '../../types.ts';

interface StepProps {
    formData: Partial<Student>;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSingleSelectChange: (name: keyof Student, value: string) => void;
}

const AnamnesisStep5: React.FC<StepProps> = ({ formData, handleInputChange, handleSingleSelectChange }) => (
    <>
        <SectionTitle>5. Condição de Saúde</SectionTitle>
        <textarea name="orthopedicProblems" placeholder="Possui alguma lesão, dor ou limitação física? Se sim, qual?" value={formData.orthopedicProblems || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
        <textarea name="surgeriesInfo" placeholder="Já passou por alguma cirurgia? Qual?" value={formData.surgeriesInfo || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
        <textarea name="controlledMedication" placeholder="Toma algum medicamento regularmente? Qual?" value={formData.controlledMedication || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
        <textarea name="healthIssues" placeholder="Possui algum problema de saúde diagnosticado (hipertensão, diabetes, hérnia, etc)?" value={formData.healthIssues || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
        <RadioGroup label="Possui liberação médica para praticar exercícios físicos?" name="medicalClearance" options={['Sim', 'Não']} value={formData.medicalClearance} onChange={handleSingleSelectChange} />
    </>
);

export default AnamnesisStep5;