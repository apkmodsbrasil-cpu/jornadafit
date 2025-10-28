import React from 'react';
import { SectionTitle, RadioGroup, CheckboxGroup } from './AnamnesisControls.tsx';
import type { Student } from '../../types.ts';

interface StepProps {
    formData: Partial<Student>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSingleSelectChange: (name: keyof Student, value: string) => void;
    handleMultiSelectChange: (name: keyof Student, value: string) => void;
}

const AnamnesisStep7: React.FC<StepProps> = ({ formData, handleInputChange, handleSingleSelectChange, handleMultiSelectChange }) => (
    <>
        <SectionTitle>7. Disponibilidade e Estrutura</SectionTitle>
        <CheckboxGroup label="Quais dias da semana você pode treinar?" name="availableDays" options={['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']} value={formData.availableDays} onChange={handleMultiSelectChange} />
        <input type="text" name="trainingHours" placeholder="Quais horários tem disponibilidade?" value={formData.trainingHours || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" />
        <RadioGroup label="Onde pretende treinar?" name="trainingLocation" options={['Academia', 'Casa', 'Condomínio', 'Ao ar livre']} value={formData.trainingLocation} onChange={handleSingleSelectChange} />
        <CheckboxGroup label="Possui equipamentos?" name="equipment" options={['Nenhum', 'Halteres', 'Barra', 'Elásticos', 'Banco', 'Esteira / Bicicleta']} value={formData.equipment} onChange={handleMultiSelectChange} />
        <textarea name="observations" placeholder="Observações adicionais ou outro equipamento?" value={formData.observations || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded-lg border border-gray-600" rows={2} />
    </>
);

export default AnamnesisStep7;
