import type { Student, WorkoutLog, Workout, ExerciseDetails, ModificationType } from '../types.ts';
import { Type } from '@google/genai';

// SCHEMAS
export const WORKOUT_PLAN_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: 'Unique ID for the workout day (e.g., "segunda-1")' },
      day: { type: Type.STRING, description: 'Day of the week in Portuguese (e.g., "Segunda-feira")' },
      label: { type: Type.STRING, description: 'A short, descriptive label for the workout (e.g., "Peito e Tríceps")' },
      muscleGroups: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Primary muscle groups targeted' },
      warmup: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            exerciseId: { type: Type.STRING },
            duration: { type: Type.STRING }
          },
          required: ['exerciseId', 'duration']
        },
        description: 'Optional warmup routine for this workout day.'
      },
      cooldown: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            exerciseId: { type: Type.STRING },
            duration: { type: Type.STRING }
          },
          required: ['exerciseId', 'duration']
        },
        description: 'Optional cooldown/stretching routine for this workout day.'
      },
      blocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'Unique ID for the block (e.g., "block-1")' },
            type: { type: Type.STRING, description: 'Type of block (single, biset, superset, triset)' },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'Unique ID for the exercise instance (e.g., "inst-1")' },
                  exerciseId: { type: Type.STRING, description: 'The ID of the exercise from the database' },
                  sets: { type: Type.STRING, description: 'Number of sets (e.g., "3", "4")' },
                  reps: { type: Type.STRING, description: 'Repetition range (e.g., "8-12", "15") or time in seconds for isometrics (e.g., "30").' },
                  durationType: { type: Type.STRING, description: 'Specifies if the exercise is "reps" or "time" based. Default to "reps".' },
                  rest: { type: Type.STRING, description: 'Rest time after the set (e.g., "60s")' },
                  observation: { type: Type.STRING, description: 'Optional observation or tip for the exercise' },
                },
                required: ['id', 'exerciseId', 'sets', 'reps', 'rest'],
              },
            },
            restAfterBlock: { type: Type.STRING, description: 'Rest time after the entire block (e.g., "90s")' },
          },
          required: ['id', 'type', 'exercises'],
        },
      },
    },
    required: ['id', 'day', 'label', 'muscleGroups', 'blocks'],
  },
};

export const WORKOUT_SPLIT_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            dayOfWeek: { type: Type.STRING, description: 'Day of the week in Portuguese (e.g., "Segunda-feira")' },
            muscleGroups: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Muscle groups to be trained on this day' }
        },
        required: ['dayOfWeek', 'muscleGroups']
    }
};

export const EXERCISE_MODIFICATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        exerciseId: { type: Type.STRING, description: 'The ID of the suggested replacement exercise from the database.' }
    },
    required: ['exerciseId']
};

export const EXERCISE_DETAILS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Nome completo e correto do exercício. Corrija qualquer erro de digitação do nome fornecido.' },
        videoUrl: { type: Type.STRING, description: 'URL de um vídeo curto e claro no YouTube que demonstre a execução correta.' },
        gifUrl: { type: Type.STRING, description: 'URL de um GIF demonstrando a execução. Pode ser nulo.' },
        tutorial: { type: Type.STRING, description: 'Tutorial conciso em português com seções "**Posição Inicial:**" e "**Execução:**". Use listas numeradas para os passos.' },
        equipment: { type: Type.STRING, enum: ['maquina', 'barra', 'halteres', 'peso corporal', 'kettlebell', 'elastico'], description: 'O equipamento principal.' },
        muscleGroups: {
            type: Type.OBJECT,
            properties: {
                primary: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Músculos primários trabalhados.' },
                secondary: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Músculos secundários (opcional).' }
            },
            required: ['primary']
        },
        difficulty: { type: Type.STRING, enum: ['iniciante', 'intermediario', 'avancado'], description: 'Nível de dificuldade.' },
        contraindications: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de possíveis contraindicações ou dores a serem observadas.' }
    },
    required: ['name', 'tutorial', 'equipment', 'muscleGroups', 'difficulty']
};

export const PROGRESSION_INSIGHTS_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, description: 'Type of insight: "suggestion", "warning", or "achievement".' },
            message: { type: Type.STRING, description: 'The proactive message for the personal trainer.' },
            relatedExerciseId: { type: Type.STRING, description: 'Optional ID of the related exercise.' }
        },
        required: ['type', 'message']
    }
};

// PROMPT FUNCTIONS

export const generatePostWorkoutAnalysisPrompt = (student: Student, logs: WorkoutLog[]): string => `
    Aja como um personal trainer motivador. Analise os logs do treino que o aluno acabou de completar e forneça um feedback curto e encorajador.

    **Dados do Aluno:**
    - Nome: ${student.name}
    - Objetivo: ${student.goal}

    **Logs do Treino de Hoje (series x reps @ carga):**
    ${logs.map(log => `- Exercício ${log.exerciseId}: ${log.reps || 'N/A'} reps com ${log.weight || 'N/A'}kg`).join('\n')}

    **Histórico de Performance (para comparação):**
    ${JSON.stringify(student.performanceHistory, null, 2)}

    **Sua Tarefa:**
    Escreva uma mensagem curta (2-3 frases) para o aluno.
    1.  Comece parabenizando-o pelo treino concluído.
    2.  Se possível, identifique UM ponto positivo específico, como um aumento de carga ou consistência em um exercício, comparando com o histórico.
    3.  Termine com uma frase motivacional para o próximo treino.
    4.  Mantenha um tom positivo e encorajador. Não seja técnico demais. Use markdown com **asteriscos duplos** para dar ênfase a pontos importantes, como o nome do exercício ou uma conquista.

    Exemplo: "Ótimo treino hoje, ${student.name.split(' ')[0]}! Mandou muito bem no **supino**, aumentou a carga e manteve as repetições. É assim que se progride! Continue com essa dedicação que os resultados virão. Descanse bem!"
`;

export const generateWorkoutPlanPrompt = (
    student: Student,
    split: Record<string, string[]>,
    existingPlan: Workout[],
    personalNotes?: string,
    learnedPreferences?: string[],
    exerciseDatabase?: Record<string, ExerciseDetails>
): string => {
    return `
    Crie um plano de treino de musculação para o seguinte aluno, com base em sua anamnese e na divisão de treino fornecida.

    **Dados do Aluno:**
    - Nome: ${student.name}
    - Idade: ${student.age}
    - Sexo: ${student.sex}
    - Objetivo: ${student.goal}
    - Nível de Experiência: ${student.trainingSince} (${student.currentCondition})
    - Lesões/Limitações: ${student.orthopedicProblems || 'Nenhuma informada'}
    - Equipamentos Disponíveis: ${student.equipment?.join(', ')}
    - Local de Treino: ${student.trainingLocation}
    - Exercícios que Gosta/Não Gosta: Gosta de ${student.likedWorkouts}. Não gosta de ${student.dislikedWorkouts}.

    **Preferências do Personal Trainer:**
    ${personalNotes || 'Nenhuma preferência geral.'}

    **Aprendizados da IA (Preferências implícitas):**
    ${learnedPreferences?.join('\n') || 'Nenhum aprendizado.'}
    
    **Divisão de Treino (dias e grupos musculares):**
    ${JSON.stringify(split, null, 2)}

    **Base de Dados de Exercícios Disponíveis (use APENAS exercícios desta lista):**
    ${JSON.stringify(Object.keys(exerciseDatabase || {}), null, 2)}
    
    **Regras:**
    1.  O plano DEVE seguir a estrutura JSON Schema fornecida.
    2.  Use APENAS os exerciseIds da base de dados fornecida. NÃO invente novos IDs.
    3.  Para exercícios isométricos (ex: pranchas), use 'durationType: "time"' e a duração em segundos em 'reps'. Para exercícios normais, use 'durationType: "reps"'.
    4.  Selecione exercícios apropriados para o nível, objetivo e limitações do aluno.
    5.  **Estrutura Lógica OBRIGATÓRIA:** Agrupe todos os exercícios para o mesmo grupo muscular em sequência. Por exemplo, se o treino é de 'Peito e Tríceps', todos os exercícios de Peito devem vir primeiro, seguidos por todos os exercícios de Tríceps. Dentro de cada agrupamento muscular, comece com os exercícios compostos (multiarticulares) e depois passe para os exercícios de isolamento (monoarticulares).
    6.  Varie os exercícios, mas mantenha os principais compostos.
    7.  Defina séries, repetições e descanso apropriados para o objetivo de ${student.goal}.
    8.  Adicione observações úteis para o aluno quando necessário (ex: "Controle a descida", "Foco na contração").
    9.  O ID de cada treino, bloco e instância de exercício deve ser único.
    10. Adicione uma rotina de 'warmup' (aquecimento) e 'cooldown' (volta à calma) apropriada para cada dia de treino, usando os IDs de exercícios de aquecimento/alongamento disponíveis na base.

    Gere o plano de treino completo.
    `;
};

export const generateWorkoutSplitPrompt = (student: Student): string => {
    return `
    Sugira uma divisão de treino (split) para o aluno abaixo, com base nos dias que ele tem disponível.
    
    **Dados do Aluno:**
    - Objetivo: ${student.goal}
    - Dias Disponíveis: ${student.availableDays.join(', ')}
    - Nível de Experiência: ${student.trainingSince}

    **Instruções:**
    - Retorne um array de objetos, onde cada objeto contém "dayOfWeek" e "muscleGroups".
    - Distribua os principais grupos musculares (Peito, Costas, Ombros, Pernas, Bíceps, Tríceps, Abdômen) de forma equilibrada pelos dias disponíveis.
    - Considere o objetivo do aluno para agrupar os músculos (ex: push/pull/legs para hipertrofia, full body para iniciantes).
    - O formato da resposta DEVE seguir o JSON Schema fornecido.
    `;
};

export const suggestExerciseModificationPrompt = (
    exerciseIdToReplace: string,
    student: Student,
    type: ModificationType,
    exerciseDatabase: Record<string, ExerciseDetails>,
    workout: Workout
): string => {
    const exerciseToReplace = exerciseDatabase[exerciseIdToReplace];

    let instruction = '';
    switch (type) {
        case 'variation':
            instruction = `Sugira uma VARIAÇÃO para o exercício "${exerciseToReplace.name}" que trabalhe os mesmos músculos primários (${exerciseToReplace.muscleGroups.primary.join(', ')}), mas com um estímulo diferente (ex: usando halteres em vez de barra, ou uma máquina diferente).`;
            break;
        case 'progression':
            instruction = `Sugira uma PROGRESSÃO para o exercício "${exerciseToReplace.name}". A progressão deve ser um exercício mais desafiador que o original, seja por maior instabilidade, amplitude de movimento ou complexidade.`;
            break;
        case 'regression':
            instruction = `Sugira uma REGRESSÃO para o exercício "${exerciseToReplace.name}". A regressão deve ser um exercício mais fácil ou com mais suporte, ideal para quem tem dificuldade com o original ou está voltando de lesão. Considere as limitações do aluno: ${student.orthopedicProblems || 'Nenhuma'}.`;
            break;
    }

    return `
    **Tarefa:** ${instruction}

    **Contexto:**
    - Aluno: ${student.name}, Objetivo: ${student.goal}, Nível: ${student.trainingSince}.
    - Exercício a ser substituído: ${exerciseIdToReplace} (${exerciseToReplace.name})
    - Músculos primários do exercício original: ${exerciseToReplace.muscleGroups.primary.join(', ')}
    - Exercícios já presentes no treino de hoje (${workout.label}): ${workout.blocks.flatMap(b => b.exercises).map(e => e.exerciseId).join(', ')}

    **Base de Dados de Exercícios Disponíveis (sugira APENAS um ID desta lista):**
    ${JSON.stringify(Object.keys(exerciseDatabase), null, 2)}

    **Regras:**
    1.  O exercício sugerido NÃO PODE ser o mesmo que o original (${exerciseIdToReplace}).
    2.  O exercício sugerido NÃO PODE ser um que já está no treino de hoje.
    3.  A sugestão deve ser um único 'exerciseId' da base de dados.
    4.  A resposta DEVE seguir o JSON Schema fornecido.

    Sugira o exerciseId.
    `;
};

export const generateExerciseDetailsPrompt = (exerciseName: string): string => {
    return `
    Gere os detalhes completos para o exercício de musculação: "${exerciseName}". Se o nome parecer ter um erro de digitação, corrija-o no campo "name".

    **Instruções para preencher o JSON:**
    1.  **name:** Forneça o nome completo e correto do exercício em português.
    2.  **videoUrl:** Encontre uma URL de um vídeo demonstrativo no YouTube. Se não encontrar, deixe em branco.
    3.  **gifUrl:** Encontre uma URL de um GIF. Se não encontrar, deixe em branco.
    4.  **tutorial:** Escreva um tutorial claro e objetivo. Use as seções "**Posição Inicial:**" e "**Execução:**".
    5.  **equipment:** Classifique o equipamento principal em uma das categorias: 'maquina', 'barra', 'halteres', 'peso corporal', 'kettlebell', 'elastico'.
    6.  **muscleGroups:** Liste os músculos primários e secundários.
    7.  **difficulty:** Classifique a dificuldade em 'iniciante', 'intermediario', ou 'avancado'.
    8.  **contraindications:** Liste 1 ou 2 contraindicações importantes (ex: "Evitar com dor lombar", "Cuidado com instabilidade no ombro").

    A resposta DEVE seguir o JSON Schema fornecido.
    `;
};


export const analyzeWorkoutPlanPrompt = (student: Student, personalNotes: string, plan: Workout[]): string => `
    Analise o plano de treino a seguir. Ele foi gerado por uma IA. Aja como um personal trainer experiente e forneça um feedback construtivo.
    
    **Aluno:** ${student.name}, Objetivo: ${student.goal}, Nível: ${student.trainingSince}.
    **Notas do Personal:** ${personalNotes}
    **Plano Gerado:** ${JSON.stringify(plan, null, 2)}

    **Sua Tarefa:**
    Forneça uma análise de texto simples, respondendo:
    1. O plano está bem estruturado para o objetivo e nível do aluno?
    2. A seleção de exercícios é boa? Há algo que você mudaria?
    3. O volume (séries x repetições) parece adequado?
    4. Há alguma sugestão de melhoria ou ponto de atenção?
`;

export const generatePeriodizationPrompt = (student: Student, methodology: string, duration: string): string => `
    Crie uma estrutura de periodização de treino para o aluno abaixo, usando o método e a duração especificados.
    
    **Aluno:** ${student.name}, Objetivo: ${student.goal}, Nível: ${student.trainingSince}.
    **Metodologia:** ${methodology}
    **Duração:** ${duration}

    **Sua Tarefa:**
    Descreva, em texto, a estrutura da periodização. Divida o período total (${duration}) em fases (ou mesociclos), como "Adaptação", "Hipertrofia", "Força", "Deload", etc. Para cada fase, especifique:
    - Duração (em semanas)
    - Foco principal (ex: aumentar volume, aumentar intensidade)
    - Faixa de repetições sugerida
    - Nível de intensidade (ex: RPE 7-8)
    - Exemplo de como a progressão ocorreria (ex: "A cada semana, tentar aumentar a carga ou adicionar uma repetição").

    Seja claro e objetivo. A resposta deve ser um guia para o personal trainer aplicar no planejamento detalhado dos treinos.
`;

export const generateWeeklySummaryPrompt = (student: Student): string => `
    Aja como um diário de bordo inteligente. Analise os dados de treino da última semana do aluno e crie um resumo.
    
    **Aluno:** ${student.name}
    **Histórico de Conclusão (últimos 7 dias):** ${JSON.stringify(student.completionHistory, null, 2)}
    **Último Feedback:** ${JSON.stringify(student.lastFeedback, null, 2)}
    **Histórico de Cargas (geral):** ${JSON.stringify(student.performanceHistory, null, 2)}
    
    **Sua Tarefa:**
    Escreva um resumo da semana em 3-4 parágrafos:
    1.  **Engajamento:** Comente sobre a frequência de treinos na semana (quantos foram feitos vs. planejados).
    2.  **Performance:** Destaque o maior progresso em algum exercício (aumento de carga ou reps).
    3.  **Feedback:** Mencione o último feedback do aluno (nível de energia, dores, etc.) e como isso pode impactar o treino.
    4.  **Próximos Passos:** Dê uma sugestão para a próxima semana (ex: "Focar em melhorar a execução do exercício X" ou "Tentar aumentar a carga no exercício Y").
`;

export const generateMealSuggestionPrompt = (student: Student): string => `
    Crie uma sugestão de plano alimentar para um dia, focada no objetivo do aluno. NÃO sou nutricionista, então apresente isso como uma "sugestão geral" e recomende a consulta com um profissional.

    **Aluno:**
    - Objetivo: ${student.goal}
    - Peso: ${student.weight} kg
    - Nível de Atividade: ${student.hasTrainedBefore === 'Sim' ? 'Ativo' : 'Iniciante'}
    - Horários de Treino: ${student.trainingHours}

    **Sua Tarefa:**
    1.  Comece com um aviso claro de que esta é uma sugestão genérica e não substitui a avaliação de um nutricionista.
    2.  Crie uma estrutura para um dia, com 4 a 5 refeições (ex: Café da Manhã, Almoço, Lanche da Tarde, Jantar, Ceia).
    3.  Para cada refeição, sugira 2-3 opções de alimentos, balanceando macronutrientes (proteínas, carboidratos, gorduras saudáveis) de acordo com o objetivo de ${student.goal}.
    4.  Use linguagem simples e exemplos práticos de alimentos (ex: "1 filé de frango grelhado (aprox. 120g)", "1 concha de feijão").
    5.  Inclua uma sugestão de pré-treino e pós-treino se os horários do aluno permitirem.
    6.  Reforce a importância da hidratação.
`;

export const generateProgressionInsightsPrompt = (student: Student, exerciseDatabase: Record<string, ExerciseDetails>): string => `
    Analise o histórico de performance do aluno e gere insights proativos para o personal trainer.
    
    **Aluno:** ${student.name}, Objetivo: ${student.goal}
    **Histórico de Performance:** ${JSON.stringify(student.performanceHistory, null, 2)}

    **Sua Tarefa:**
    Identifique tendências, estagnações ou grandes saltos de performance e crie insights acionáveis para o personal.

    **Tipos de Insight:**
    - **achievement:** Quando o aluno quebra um recorde pessoal significativo ou mostra progresso consistente.
    - **warning:** Quando o aluno está estagnado (mesma carga/reps por 2-3 treinos) ou teve uma queda na performance em um exercício chave.
    - **suggestion:** Uma sugestão para o personal, como "Considerar um deload para o agachamento" ou "Sugerir aumentar a carga no supino".

    **Regras:**
    1.  Foque nos principais exercícios compostos se houver dados.
    2.  Seja específico na mensagem. Ex: "Aluno estagnado no supino-reto-barra em 50kg por 3 treinos."
    3.  Gere de 0 a 2 insights, apenas se forem realmente relevantes. Não force a criação de insights.
    4.  A resposta DEVE seguir o JSON Schema fornecido.
`;

export const generateAnamnesisAnalysisPrompt = (student: Student): string => `
    Aja como um personal trainer especialista em análise de dados. Analise a anamnese completa do aluno abaixo e forneça um resumo com os pontos mais críticos para o planejamento do treino.

    **Dados da Anamnese do Aluno:**
    - Nome: ${student.name}
    - Idade: ${student.age}
    - Sexo: ${student.sex}
    - Objetivo Principal: ${student.goal}
    - Meta Específica: ${student.specificGoal}
    - Nível de Experiência: ${student.hasTrainedBefore === 'Sim' ? `Experiente (${student.trainingSince})` : 'Iniciante'}
    - Condição Física Atual: ${student.currentCondition}
    - Lesões, Dores ou Limitações: ${student.orthopedicProblems || 'Nenhuma informada'}
    - Problemas de Saúde: ${student.healthIssues || 'Nenhum informado'}
    - Liberação Médica: ${student.medicalClearance}
    - Rotina: ${student.hoursSitting} por dia sentado, dorme ${student.sleepHours} horas.
    - Logística: Treina em "${student.trainingLocation}" nos dias "${student.availableDays?.join(', ')}" com os equipamentos: ${student.equipment?.join(', ')}.

    **Sua Tarefa:**
    Crie um resumo em formato de texto, usando títulos de nível 3 (###) para os seguintes tópicos:

    ### Resumo do Perfil
    Uma breve descrição do aluno em 2 frases (quem é, qual o objetivo principal e nível).

    ### Pontos de Atenção (Riscos)
    Liste em tópicos (usando '-') os principais fatores de risco ou limitações que exigem cuidado no planejamento (ex: dores, problemas de saúde, poucas horas de sono, ser iniciante). Se não houver, escreva "Nenhum ponto de atenção principal identificado".

    ### Fatores-Chave (Oportunidades)
    Liste em tópicos (usando '-') os pontos positivos que podem ser alavancados (ex: boa disponibilidade, experiência prévia, objetivo claro, liberação médica).

    ### Recomendações Iniciais para o Treino
    Com base em tudo, forneça 3 a 4 recomendações diretas e acionáveis para o personal trainer considerar ao montar o treino (usando '-'). Ex: "Iniciar com exercícios de fortalecimento para o joelho", "Focar em exercícios compostos para hipertrofia", "Incluir mobilidade para compensar as horas sentado".

    Seja conciso e direto ao ponto. O objetivo é dar ao personal trainer uma visão rápida e estratégica do aluno.
`;