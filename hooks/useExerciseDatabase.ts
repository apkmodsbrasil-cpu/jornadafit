import { useState, useCallback, useEffect } from 'react';
import type { ExerciseDetails } from '../types.ts';
import * as dataService from '../services/dataService.ts';

const arrayToRecord = (exercises: (ExerciseDetails & {id: string})[]): Record<string, ExerciseDetails> => {
    if (!exercises) return {};
    return exercises.reduce((acc, exercise) => {
        const { id, ...details } = exercise;
        acc[id] = details;
        return acc;
    }, {} as Record<string, ExerciseDetails>);
};


export const useExerciseDatabase = () => {
    const [exerciseDatabase, setExerciseDatabase] = useState<Record<string, ExerciseDetails>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialExercises = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await dataService.fetchExercises();
                if (fetchError) {
                    const message = fetchError.message || JSON.stringify(fetchError);
                    setError(`Falha ao carregar exercícios: ${message}`);
                    console.error("Error fetching exercises:", fetchError);
                } else if (data) {
                    setExerciseDatabase(arrayToRecord(data as (ExerciseDetails & { id: string })[]));
                }
            } catch (e) {
                let errorMessage = "Ocorreu um erro desconhecido.";
                if (e instanceof Error) {
                    errorMessage = e.message;
                } else if (e && typeof e === 'object') {
                    const errObj = e as any;
                    if (errObj.message && typeof errObj.message === 'string') {
                        errorMessage = errObj.message;
                    } else {
                        try {
                            // Safely stringify the error object to get more details
                            errorMessage = JSON.stringify(e, null, 2);
                        } catch {
                            errorMessage = "Objeto de erro não serializável. Verifique o console do navegador para mais detalhes.";
                        }
                    }
                } else if (typeof e === 'string') {
                    errorMessage = e;
                }
                
                setError(`Erro ao buscar exercícios: ${errorMessage}`);
                console.error("Error fetching exercises:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialExercises();
    }, []);


    const addExercise = useCallback(async (id: string, details: ExerciseDetails): Promise<boolean> => {
        if (exerciseDatabase[id]) {
            console.warn(`Exercício com ID "${id}" já existe.`);
            return false;
        }

        const { data, error: insertError } = await dataService.addExercise({ id, ...details });

        if (insertError) {
            const message = insertError.message || JSON.stringify(insertError);
            setError(`Falha ao adicionar exercício: ${message}`);
            console.error("Error adding exercise:", insertError);
            return false;
        }
        
        if (data && data[0]) {
            const newExercise = data[0];
            setExerciseDatabase(prevDb => ({
                ...prevDb,
                [newExercise.id]: {
                    name: newExercise.name,
                    videoUrl: newExercise.videoUrl,
                    gifUrl: newExercise.gifUrl,
                    tutorial: newExercise.tutorial,
                    equipment: newExercise.equipment,
                    muscleGroups: newExercise.muscleGroups,
                    difficulty: newExercise.difficulty,
                    contraindications: newExercise.contraindications,
                },
            }));
        }
        return true;
    }, [exerciseDatabase]);

    const updateExercise = useCallback(async (id: string, details: ExerciseDetails): Promise<boolean> => {
        const { error: updateError } = await dataService.updateExercise(id, details);

        if (updateError) {
            const message = updateError.message || JSON.stringify(updateError);
            setError(`Falha ao atualizar exercício: ${message}`);
            console.error("Error updating exercise:", updateError);
            return false;
        }

        setExerciseDatabase(prevDb => ({
            ...prevDb,
            [id]: details,
        }));
        return true;
    }, []);

    return { exerciseDatabase, isLoading, error, addExercise, updateExercise, setExerciseDatabase };
};