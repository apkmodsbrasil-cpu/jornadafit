import React from 'react';
import type { Student } from '../types.ts';

interface DetailItemProps {
    label: string;
    value?: string | number | string[] | null;
    className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    if (!displayValue && displayValue !== 0) return null;

    return (
        <div className={`py-2 ${className}`}>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-gray-200">{String(displayValue)}</p>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-blue-400 border-b border-gray-700 pb-2 mb-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {children}
        </div>
    </div>
);

const AnamnesisDetailView: React.FC<{ student: Student }> = ({ student }) => {
    return (
        <div className="space-y-4">
            <Section title="Dados Pessoais">
                <DetailItem label="Nome Completo" value={student.name} />
                <DetailItem label="Idade" value={student.age} />
                <DetailItem label="Sexo" value={student.sex} />
                <DetailItem label="Altura" value={student.height ? `${student.height} cm` : ''} />
                <DetailItem label="Peso" value={student.weight ? `${student.weight} kg` : ''} />
                <DetailItem label="Profissão" value={student.profession} />
                <DetailItem label="Cidade" value={student.city} />
            </Section>

            <Section title="Objetivos">
                <DetailItem label="Objetivo Principal" value={student.goal} />
                <DetailItem label="Meta Específica" value={student.specificGoal} className="md:col-span-2" />
                <DetailItem label="Prazo" value={student.goalTimeline} />
            </Section>
            
            <Section title="Histórico de Treino">
                <DetailItem label="Já treinou antes?" value={student.hasTrainedBefore} />
                <DetailItem label="Tempo de Experiência" value={student.trainingSince} />
                <DetailItem label="Frequência Anterior" value={student.previousTrainingFrequency} />
                <DetailItem label="Já teve Personal?" value={student.hadPersonalTrainer} />
                <DetailItem label="Treinos que Gosta" value={student.likedWorkouts} className="md:col-span-2" />
                <DetailItem label="Treinos que Não Gosta" value={student.dislikedWorkouts} className="md:col-span-2" />
            </Section>
            
            <Section title="Rotina e Hábitos">
                <DetailItem label="Horas sentado por dia" value={student.hoursSitting} />
                <DetailItem label="Horas de Sono" value={student.sleepHours} />
                <DetailItem label="Qualidade da Nutrição" value={student.nutritionQuality} />
                <DetailItem label="Ingestão de Água" value={student.waterIntake} />
                <DetailItem label="Consumo de Álcool" value={student.alcoholIntake} />
                <DetailItem label="Fumante" value={student.smokerInfo} />
            </Section>

            <Section title="Saúde">
                <DetailItem label="Problemas Ortopédicos/Dores" value={student.orthopedicProblems} className="md:col-span-2"/>
                <DetailItem label="Cirurgias" value={student.surgeriesInfo} className="md:col-span-2"/>
                <DetailItem label="Medicamentos Regulares" value={student.controlledMedication} className="md:col-span-2"/>
                <DetailItem label="Outros Problemas de Saúde" value={student.healthIssues} className="md:col-span-2"/>
                <DetailItem label="Liberação Médica" value={student.medicalClearance} />
            </Section>
            
             <Section title="Nível Físico Atual">
                <DetailItem label="Condicionamento Autodeclarado" value={student.currentCondition} />
                <DetailItem label="Consegue correr por 5 min?" value={student.canRun5min} />
                <DetailItem label="Consegue fazer flexões?" value={student.canDoPushups} />
                <DetailItem label="Consegue agachar sem dor?" value={student.canSquat} />
            </Section>

            <Section title="Logística de Treino">
                <DetailItem label="Dias Disponíveis" value={student.availableDays} className="md:col-span-2" />
                <DetailItem label="Horários Disponíveis" value={student.trainingHours} />
                <DetailItem label="Local de Treino" value={student.trainingLocation} />
                <DetailItem label="Equipamentos" value={student.equipment} className="md:col-span-2"/>
            </Section>

            <Section title="Observações Finais">
                <DetailItem label="Comentários do Aluno" value={student.observations} className="md:col-span-2"/>
            </Section>
        </div>
    );
};

export default AnamnesisDetailView;