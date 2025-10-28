import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import type { Student, Personal, WorkoutLog, Workout, ModificationType, ExerciseDetails, AppMode, ProactiveInsight, WorkoutBlock, Exercise, WorkoutBlockType } from '../types.ts';
import * as Prompts from '../lib/prompts.ts';
import { toSnakeCase } from '../services/dataService.ts';

class ApiKeyManager {
    private keys: string[];
    private currentIndex: number;

    constructor(apiKeys: string[]) {
        const envKey = process.env.API_KEY;
        
        this.keys = [...apiKeys];
        if (envKey && !this.keys.includes(envKey)) {
            this.keys.unshift(envKey);
        }
        
        this.currentIndex = 0;
    }

    public getKey(): string | null {
        if (this.keys.length === 0) return null;
        return this.keys[this.currentIndex];
    }

    public getNextKey(): string | null {
        if (this.keys.length <= 1) return null;
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return this.keys[this.currentIndex];
    }

    public hasMultipleKeys(): boolean {
        return this.keys.length > 1;
    }
}

// Helper to ensure a value is a string, providing a default if not.
const ensureString = (value: any, defaultValue = ''): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

// Helper to ensure a value is an array.
const ensureArray = (value: any): any[] => {
    return Array.isArray(value) ? value : [];
};


const sanitizeWorkoutPlan = (plan: any): Workout[] => {
    if (!Array.isArray(plan)) {
        console.error("AI returned a non-array for the workout plan:", plan);
        return [];
    }

    return plan
        .filter((workout): workout is Record<string, any> => workout && typeof workout === 'object' && workout.day && workout.label)
        .map((workout): Workout | null => {
            const sanitizedBlocks = ensureArray(workout.blocks)
                .filter((block): block is Record<string, any> => block && typeof block === 'object')
                .map((block): WorkoutBlock | null => {
                    const sanitizedExercises = ensureArray(block.exercises)
                        .filter((ex): ex is Record<string, any> => ex && typeof ex === 'object' && ex.exerciseId)
                        .map((ex): Exercise => ({
                            id: ensureString(ex.id, `inst-${Date.now()}-${Math.random()}`),
                            exerciseId: ensureString(ex.exerciseId),
                            sets: ensureString(ex.sets, '3'),
                            reps: ensureString(ex.reps, '12'),
                            rest: ensureString(ex.rest, '60s'),
                            observation: ensureString(ex.observation),
                            durationType: ensureString(ex.durationType, 'reps') === 'time' ? 'time' : 'reps',
                            targetWeight: typeof ex.targetWeight === 'number' ? ex.targetWeight : undefined,
                            targetReps: typeof ex.targetReps === 'number' ? ex.targetReps : undefined,
                        }));

                    if (sanitizedExercises.length === 0) {
                        return null; // A block without valid exercises is useless
                    }

                    return {
                        id: ensureString(block.id, `block-${Date.now()}-${Math.random()}`),
                        type: ensureString(block.type, 'single') as WorkoutBlockType,
                        exercises: sanitizedExercises,
                        restAfterBlock: ensureString(block.restAfterBlock, '90s'),
                    };
                })
                .filter((b): b is WorkoutBlock => b !== null);

            if (sanitizedBlocks.length === 0) {
                return null; // A workout without valid blocks is useless
            }

            return {
                id: ensureString(workout.id, `workout-${Date.now()}-${Math.random()}`),
                day: ensureString(workout.day) as Workout['day'],
                label: ensureString(workout.label),
                muscleGroups: ensureArray(workout.muscleGroups).filter((mg): mg is string => typeof mg === 'string'),
                blocks: sanitizedBlocks,
                warmup: ensureArray(workout.warmup).filter(item => item && typeof item === 'object' && item.exerciseId),
                cooldown: ensureArray(workout.cooldown).filter(item => item && typeof item === 'object' && item.exerciseId),
            };
        })
        .filter((w): w is Workout => w !== null);
};

interface UseAIProps {
  personal: Personal | null;
  apiKeys: string[];
  mode: AppMode;
  studentContext?: Student | null;
  studentsContext?: Student[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  exerciseDatabase: Record<string, ExerciseDetails>;
  addExercise: (id: string, details: ExerciseDetails) => Promise<boolean>;
}

export const useAI = ({ personal, apiKeys, mode, studentContext, studentsContext, addToast, exerciseDatabase, addExercise }: UseAIProps) => {
    const [isGenerating, setIsGenerating] = useState({
        workoutPlan: false,
        splitSuggestion: false,
        exerciseModification: false,
        exerciseGeneration: false,
        periodization: false,
        weeklySummary: false,
        mealSuggestion: false,
        progressionInsights: false,
        // FIX: Added postWorkoutAnalysis to the isGenerating state to track its loading status.
        postWorkoutAnalysis: false,
        anamnesisAnalysis: false,
    });
    
    const apiKeyManager = useRef(new ApiKeyManager(apiKeys));

    useEffect(() => {
        apiKeyManager.current = new ApiKeyManager(apiKeys);
    }, [apiKeys]);

    const getAiClient = useCallback(() => {
        const apiKey = apiKeyManager.current.getKey();
        if (!apiKey) {
            addToast("Nenhuma chave de API da Gemini foi configurada.", "error");
            throw new Error("API Key not found.");
        }
        return new GoogleGenAI({ apiKey });
    }, [addToast]);
    
    const executeGeneration = useCallback(async <T>(
        taskKey: keyof typeof isGenerating,
        promptFn: () => string,
        schema: any
    ): Promise<T | null> => {
        setIsGenerating(prev => ({ ...prev, [taskKey]: true }));
        
        const callApi = async (isRetry = false): Promise<T | null> => {
            let ai;
            try {
                ai = getAiClient();
            } catch (e: any) {
                return null;
            }

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptFn(),
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                    }
                });

                const text = response.text.trim();
                return JSON.parse(text) as T;

            } catch (error: any) {
                console.error(`Error during ${String(taskKey)} generation:`, error);
                
                let errorMessage = error?.message || `Erro desconhecido ao gerar ${String(taskKey)}.`;

                if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                    if (apiKeyManager.current.hasMultipleKeys() && !isRetry) {
                        addToast('Cota da API atingida, tentando a próxima chave...', 'info');
                        apiKeyManager.current.getNextKey();
                        return callApi(true);
                    }
                     errorMessage = "Cota da API excedida.";
                }
                
                if (errorMessage.includes("API key not valid")) {
                    errorMessage = "Chave de API inválida.";
                }

                addToast(`Erro de IA: ${errorMessage}`, 'error');
                return null;
            }
        };

        const result = await callApi();
        setIsGenerating(prev => ({ ...prev, [taskKey]: false }));
        return result;
    }, [getAiClient, addToast]);
    
    const executeTextGeneration = useCallback(async (
        taskKey: keyof typeof isGenerating,
        promptFn: () => string
    ): Promise<string | null> => {
        setIsGenerating(prev => ({ ...prev, [taskKey]: true }));

        const callApi = async (isRetry = false): Promise<string | null> => {
            let ai;
            try {
                ai = getAiClient();
            } catch (e: any) {
                return null;
            }

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptFn(),
                });
                return response.text;
            } catch (error: any) {
                console.error(`Error during ${String(taskKey)} text generation:`, error);
                
                let errorMessage = error?.message || `Erro desconhecido ao gerar ${String(taskKey)}.`;

                if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                     if (apiKeyManager.current.hasMultipleKeys() && !isRetry) {
                        addToast('Cota da API atingida, tentando a próxima chave...', 'info');
                        apiKeyManager.current.getNextKey();
                        return callApi(true);
                    }
                    errorMessage = "Cota da API excedida.";
                }
               
                if (errorMessage.includes("API key not valid")) {
                    errorMessage = "Chave de API inválida.";
                }

                addToast(`Erro de IA: ${errorMessage}`, 'error');
                return null;
            }
        };

        const result = await callApi();
        setIsGenerating(prev => ({ ...prev, [taskKey]: false }));
        return result;
    }, [getAiClient, addToast]);


    const generators = {
        generateWorkoutPlan: async (student: Student, split: Record<string, string[]>, existingPlan: Workout[] = []) => {
            const generatedPlan = await executeGeneration<Workout[]>('workoutPlan', () => Prompts.generateWorkoutPlanPrompt(student, split, existingPlan, personal?.settings?.aiStyleNotes, personal?.settings?.aiLearnedPreferences, exerciseDatabase), Prompts.WORKOUT_PLAN_SCHEMA);
            return sanitizeWorkoutPlan(generatedPlan);
        },
        
        suggestWorkoutSplit: async (student: Student): Promise<Record<string, string[]> | null> => {
            const result = await executeGeneration<{ dayOfWeek: string; muscleGroups: string[] }[]>('splitSuggestion', () => Prompts.generateWorkoutSplitPrompt(student), Prompts.WORKOUT_SPLIT_SCHEMA);

            if (!result) return null;

            // Transform array of objects into a record for the UI
            return result.reduce((acc, item) => {
                if (student.availableDays.includes(item.dayOfWeek)) {
                    acc[item.dayOfWeek] = item.muscleGroups;
                }
                return acc;
            }, {} as Record<string, string[]>);
        },

        suggestExerciseModification: async (exerciseId: string, student: Student, type: ModificationType, workout: Workout): Promise<string | null> => {
            const result = await executeGeneration<{ exerciseId: string }>('exerciseModification', 
                () => Prompts.suggestExerciseModificationPrompt(exerciseId, student, type, exerciseDatabase, workout), 
                Prompts.EXERCISE_MODIFICATION_SCHEMA
            );
            return result?.exerciseId || null;
        },

        generateAndAddExercise: async (exerciseName: string): Promise<{ id: string, details: ExerciseDetails } | null> => {
            setIsGenerating(prev => ({ ...prev, exerciseGeneration: true }));
            try {
                const id = toSnakeCase(exerciseName.toLowerCase().replace(/ com /g, ' ').replace(/ /g, '-').replace(/[^\w-]+/g, ''));

                if (exerciseDatabase[id]) {
                    addToast(`Exercício com ID "${id}" já existe. Usando o existente.`, 'info');
                    return { id, details: exerciseDatabase[id] };
                }

                const details = await executeGeneration<ExerciseDetails>('exerciseGeneration', 
                    () => Prompts.generateExerciseDetailsPrompt(exerciseName), 
                    Prompts.EXERCISE_DETAILS_SCHEMA
                );

                if (details) {
                    const correctedName = details.name || exerciseName;
                    details.name = correctedName;
                    
                    const success = await addExercise(id, details);
                    if(success) return { id, details };
                }
                return null;
            } finally {
                setIsGenerating(prev => ({ ...prev, exerciseGeneration: false }));
            }
        },
        
        analyzeAndLearnFromWorkoutPlan: (student: Student, personalNotes: string, plan: Workout[]): Promise<string | null> => {
             return executeTextGeneration('workoutPlan', () => Prompts.analyzeWorkoutPlanPrompt(student, personalNotes, plan));
        },

        suggestPeriodization: (student: Student, methodology: string, duration: string): Promise<string | null> => {
            return executeTextGeneration('periodization', () => Prompts.generatePeriodizationPrompt(student, methodology, duration));
        },
        
        generateWeeklySummary: (student: Student): Promise<string | null> => {
            return executeTextGeneration('weeklySummary', () => Prompts.generateWeeklySummaryPrompt(student));
        },
        
        generateMealSuggestion: (student: Student): Promise<string | null> => {
            return executeTextGeneration('mealSuggestion', () => Prompts.generateMealSuggestionPrompt(student));
        },
        
        generatePostWorkoutAnalysis: (student: Student, logs: WorkoutLog[]): Promise<string | null> => {
            return executeTextGeneration('postWorkoutAnalysis', () => Prompts.generatePostWorkoutAnalysisPrompt(student, logs));
        },

        generateProgressionInsights: (student: Student): Promise<ProactiveInsight[] | null> => {
            return executeGeneration<ProactiveInsight[]>('progressionInsights', () => Prompts.generateProgressionInsightsPrompt(student, exerciseDatabase), Prompts.PROGRESSION_INSIGHTS_SCHEMA);
        },
        
        generateAnamnesisAnalysis: (student: Student): Promise<string | null> => {
            return executeTextGeneration('anamnesisAnalysis', () => Prompts.generateAnamnesisAnalysisPrompt(student));
        },
    };

    return {
        isGenerating,
        generators,
    };
};