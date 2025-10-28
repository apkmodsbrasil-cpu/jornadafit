import React, { useState, useEffect } from 'react';
import type { Student } from '../types.ts';
import AnamnesisProgressBar from './anamnesis-form/AnamnesisProgressBar.tsx';
import AnamnesisNavigation from './anamnesis-form/AnamnesisNavigation.tsx';
import AnamnesisStep1 from './anamnesis-form/AnamnesisStep1.tsx';
import AnamnesisStep2 from './anamnesis-form/AnamnesisStep2.tsx';
import AnamnesisStep3 from './anamnesis-form/AnamnesisStep3.tsx';
import AnamnesisStep4 from './anamnesis-form/AnamnesisStep4.tsx';
import AnamnesisStep5 from './anamnesis-form/AnamnesisStep5.tsx';
import AnamnesisStep6 from './anamnesis-form/AnamnesisStep6.tsx';
import AnamnesisStep7 from './anamnesis-form/AnamnesisStep7.tsx';
import InfoIcon from './icons/InfoIcon.tsx';
import WandIcon from './icons/WandIcon.tsx';


interface AnamnesisProps {
  student: Student;
  onSubmit: (student: Student) => void;
  saveError: string | null;
}

const Anamnesis: React.FC<AnamnesisProps> = ({ student, onSubmit, saveError }) => {
  const [formData, setFormData] = useState<Partial<Student>>(() => {
    try {
        const savedData = localStorage.getItem(`anamnesisForm_${student.id}`);
        const initialData = savedData ? JSON.parse(savedData) : {};
        return { ...student, ...initialData };
    } catch (error) {
        console.error("Failed to parse anamnesis form data from localStorage", error);
        return student;
    }
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem(`anamnesisStep_${student.id}`);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const totalSteps = 7;

  useEffect(() => {
      localStorage.setItem(`anamnesisForm_${student.id}`, JSON.stringify(formData));
  }, [formData, student.id]);

  useEffect(() => {
    localStorage.setItem(`anamnesisStep_${student.id}`, currentStep.toString());
  }, [currentStep, student.id]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    if (target.type === 'number') {
        setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelectChange = (name: keyof Student, value: string) => {
    setFormData(prev => {
        const currentValues = (prev[name] as string[] | undefined) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        return { ...prev, [name]: newValues };
    });
  };
  
  const handleSingleSelectChange = (name: keyof Student, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatWhatsApp = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

   const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, whatsapp: formatWhatsApp(e.target.value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem(`anamnesisForm_${student.id}`);
    localStorage.removeItem(`anamnesisStep_${student.id}`);
    onSubmit({ ...student, ...formData, planStatus: 'pending_creation' });
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
    const handleFillForTest = () => {
        const mockAnamnesisData: Partial<Student> = {
            age: 30,
            sex: 'Masculino',
            height: 180,
            weight: 85,
            whatsapp: '(11) 98765-4321',
            profession: 'Desenvolvedor de Software',
            city: 'São Paulo',
            goal: 'Hipertrofia (ganho de massa)',
            specificGoal: 'Ganhar 5kg de massa muscular e aumentar a força nos exercícios básicos.',
            goalTimeline: '6 meses',
            hasTrainedBefore: 'Sim',
            trainingSince: 'Mais de 2 anos, com interrupções',
            previousTrainingFrequency: '3-4 vezes por semana',
            hadPersonalTrainer: 'Sim',
            likedWorkouts: 'Treinos de força, exercícios compostos como agachamento e supino.',
            dislikedWorkouts: 'Muito cardio ou treinos excessivamente longos.',
            hoursSitting: '8 horas ou mais',
            sleepHours: 7,
            nutritionQuality: 'Moderada',
            waterIntake: 'Sim',
            alcoholIntake: 'Sim',
            smokerInfo: 'Não',
            orthopedicProblems: 'Leve dor no joelho direito ocasionalmente, sem diagnóstico.',
            surgeriesInfo: 'Nenhuma',
            controlledMedication: 'Nenhum',
            healthIssues: 'Nenhum',
            medicalClearance: 'Sim',
            currentCondition: 'Bom',
            canRun5min: 'Sim',
            canDoPushups: 'Sim',
            canSquat: 'Sim',
            availableDays: ['Segunda-feira', 'Quarta-feira', 'Sexta-feira', 'Sábado'],
            trainingHours: 'Noite (após as 18h)',
            trainingLocation: 'Academia',
            equipment: ['Barra', 'Halteres', 'Banco', 'Elásticos'],
            observations: 'Gostaria de focar em técnica e progressão de carga segura. Aberto a sugestões de exercícios novos.'
        };

        setFormData(prev => ({...prev, ...mockAnamnesisData}));
        setCurrentStep(totalSteps);
    };

  const renderStep = () => {
    const props = {
      formData,
      handleInputChange,
      handleSingleSelectChange,
      handleMultiSelectChange,
      handleWhatsAppChange
    };
    switch (currentStep) {
      case 1: return <AnamnesisStep1 {...props} />;
      case 2: return <AnamnesisStep2 {...props} />;
      case 3: return <AnamnesisStep3 {...props} />;
      case 4: return <AnamnesisStep4 {...props} />;
      case 5: return <AnamnesisStep5 {...props} />;
      case 6: return <AnamnesisStep6 {...props} />;
      case 7: return <AnamnesisStep7 {...props} />;
      default: return null;
    }
  };


  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg animate-fade-in relative">
        <button 
            onClick={handleFillForTest}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 text-xs bg-purple-600/50 text-purple-300 rounded-full hover:bg-purple-600/70 transition-colors"
            title="Preencher formulário com dados de teste para agilizar a avaliação."
        >
            <WandIcon className="w-4 h-4" />
            Modo Teste
        </button>

      {saveError && (
        <div className="bg-red-900/50 border border-red-700/50 text-red-300 p-4 rounded-lg mb-6 text-center animate-fade-in">
            <p className="font-bold">Ocorreu um erro!</p>
            <p className="text-sm">{saveError}</p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-2">Anamnese do Aluno</h1>
      <p className="text-gray-400 text-center mb-6">Responda o mais detalhadamente possível.</p>
      
      <div className="bg-blue-900/30 border border-blue-800/50 text-blue-300 p-3 rounded-lg mb-6 text-sm flex items-start gap-3">
          <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <p><strong>Dica:</strong> Quanto mais detalhes você fornecer, mais seu personal trainer conseguirá usar a plataforma para criar um plano de treino que seja perfeito para você. Sua dedicação aqui faz toda a diferença!</p>
      </div>

      <AnamnesisProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div key={currentStep} className="animate-fade-in space-y-4">
            {renderStep()}
        </div>
        <AnamnesisNavigation 
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrev={handlePrev}
            onNext={handleNext}
        />
      </form>
    </div>
  );
};

export default Anamnesis;