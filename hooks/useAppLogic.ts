import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as dataService from '../services/dataService.ts';
import { useAI } from './useAI.ts';
import { useExerciseDatabase } from './useExerciseDatabase.ts';
// FIX: Import ViewState from types.ts and remove local definition.
import type { AppMode, Personal, PersonalSettings, Student, Correction, ExerciseDetails, ViewState } from '../types.ts';
import { getSupabaseClient } from '../lib/supabaseClient.ts';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ADMIN_EMAIL = 'admin@evoluai.com';

export const useAppLogic = () => {
  // Core state
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [mode, setMode] = useState<AppMode | null>(null);
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [globalApiKeys, setGlobalApiKeys] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<{personals: Personal[], students: Student[]}>({personals: [], students: []});
  
  // UI and feedback state
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  
  // --- Centralized View State for Persistence ---
  const [viewState, setViewState] = useState<ViewState>({ screen: 'auth' });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // For holding full student data when modal is open
  const isInitialLoad = useRef(true);


  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const { exerciseDatabase, addExercise, updateExercise, setExerciseDatabase } = useExerciseDatabase();

  const studentPersonal = useMemo(() => {
    if (mode === 'student' && studentData?.personals?.settings) {
        // Reconstruct a partial Personal object for the ApiKeyManager
        return {
            id: studentData.personalId,
            role: 'personal',
            settings: studentData.personals.settings,
        } as Personal;
    }
    return null;
  }, [mode, studentData]);

  const ai = useAI({
      personal: personal || studentPersonal,
      apiKeys: globalApiKeys,
      mode: mode || 'student',
      studentContext: studentData,
      studentsContext: students,
      addToast,
      exerciseDatabase,
      addExercise,
  });

  // Effect for Auth state change
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
        setIsAuthLoading(false);
        addToast("Erro de configuração do Supabase.", "error");
        return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) { // User logged out
            setSession(null);
            setPersonal(null);
            setStudentData(null);
            setStudents([]);
            setMode(null);
            setSelectedStudent(null);
            setGlobalApiKeys([]);
            isInitialLoad.current = true;
            localStorage.removeItem('appState');
            setViewState({ screen: 'auth' });
        } else {
            setSession(session);
        }
    });

    return () => subscription.unsubscribe();
  }, [addToast]);
  
  const fetchFullStudent = useCallback(async (studentId: string): Promise<Student | null> => {
      const { data, error } = await dataService.fetchFullStudent(studentId);
      if (error) {
          addToast(`Erro ao buscar dados completos do aluno: ${error.message}`, 'error');
          return null;
      }
      return data;
  }, [addToast]);

  // Effect to fetch initial data and restore state
  useEffect(() => {
    const loadDataAndRestoreState = async () => {
        if (!session?.user) {
            setViewState({ screen: 'auth' });
            setIsAuthLoading(false);
            return;
        }

        if(!isInitialLoad.current) {
          setIsAuthLoading(false);
          return;
        }

        setIsAuthLoading(true);

        const { personalData, studentsData, studentData: fetchedStudent, error } = await dataService.fetchUserData(session.user.id);

        if (error) {
            addToast(`Erro ao carregar dados: ${error.message}`, 'error');
            setSaveError(error.message);
            setIsAuthLoading(false);
            return;
        }

        let restored = false;
        try {
            const savedStateJSON = localStorage.getItem('appState');
            if (savedStateJSON) {
                const savedState: ViewState & { userId: string } = JSON.parse(savedStateJSON);
                if (savedState.userId === session.user.id) {
                    if (savedState.modal === 'student_management' && savedState.selectedStudentId) {
                       const student = await fetchFullStudent(savedState.selectedStudentId);
                       if (student) {
                           setSelectedStudent(student);
                       }
                    }
                    setViewState(savedState);
                    restored = true;
                }
            }
        } catch (e) {
            console.error("Failed to restore state", e);
            localStorage.removeItem('appState');
        }

        if (personalData) {
            personalData.isAdmin = personalData.email === ADMIN_EMAIL;
            if (personalData.isAdmin) {
                setGlobalApiKeys(personalData.settings?.geminiApiKeys || []);
                const { personals, students, error: usersError } = await dataService.fetchAllUsersAsAdmin();
                if (usersError) {
                    addToast(`Erro ao carregar usuários: ${usersError.message}. Verifique se a função 'get_all_users' foi criada no Supabase.`, 'error');
                } else {
                    setAllUsers({ personals: personals || [], students: students || [] });
                }
            } else {
                dataService.fetchAdminSettings().then(keys => setGlobalApiKeys(keys || []));
            }
            setPersonal(personalData);
            setStudents(studentsData || []);
            setMode('personal');
            if (!restored) {
                 setViewState({ screen: personalData.isAdmin ? 'admin' : 'personal' });
            }
        } else if (fetchedStudent) {
            dataService.fetchAdminSettings().then(keys => setGlobalApiKeys(keys || []));
            setStudentData(fetchedStudent);
            setMode('student');
            if (!restored) {
                setViewState({ screen: 'student' });
            }
        }
        
        isInitialLoad.current = false;
        setIsAuthLoading(false);
    };
    
    loadDataAndRestoreState();
  }, [session, addToast, fetchFullStudent]);

  // --- STATE PERSISTENCE ---
  useEffect(() => {
    if (isAuthLoading || !session?.user?.id || viewState.screen === 'auth') {
        return;
    }
    const stateToSave = { ...viewState, userId: session.user.id };
    localStorage.setItem('appState', JSON.stringify(stateToSave));
  }, [viewState, session, isAuthLoading]);
  
  
  // Student data subscription for personal view
  useEffect(() => {
    if (mode === 'personal' && personal?.id) {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        
        const handleChanges = (payload: any) => {
            const updatedStudent = dataService.keysToCamelCase({ ...payload.new, role: 'student' });
            
            if (payload.eventType === 'INSERT') {
                setStudents(prev => [...prev, updatedStudent]);
            } else if (payload.eventType === 'UPDATE') {
                setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
            } else if (payload.eventType === 'DELETE') {
                setStudents(prev => prev.filter(s => s.id !== payload.old.id));
            }
        };

        const subscription = dataService.subscribeToStudentChanges(personal.id, handleChanges);

        return () => {
            supabase.removeChannel(subscription);
        };
    }
  }, [mode, personal?.id]);


  // Actions
  const login = async (email: string, password: string) => {
    isInitialLoad.current = true;
    return await dataService.signIn(email, password);
  };
  
  const register = async (name: string, email: string, password: string) => {
    return await dataService.signUp(name, email, password);
  };
  
  const logout = async () => {
    const supabase = getSupabaseClient();
    if(supabase) await supabase.auth.signOut();
  };

  const handleStudentUpdate = async (studentId: string, updates: Partial<Student>, options?: { showSuccessToast?: boolean }) => {
      setSaveError(null);
      const error = await dataService.updateStudent(studentId, updates);
      if (error) {
          setSaveError(error.message);
          addToast(`Erro ao salvar: ${error.message}`, 'error');
      } else if (options?.showSuccessToast) {
          addToast("Dados salvos com sucesso!", "success");
      }
  };

  const saveStudent = async (studentToSave: Student) => {
      const { id, ...updates } = studentToSave;
      setStudents(prev => prev.map(s => s.id === id ? studentToSave : s)); // Optimistic update
      await handleStudentUpdate(id, updates, { showSuccessToast: true });
  };
  
  const setAndSaveStudentData = (updater: React.SetStateAction<Student>, options?: { showSuccessToast?: boolean; }) => {
    setStudentData(currentStudent => {
        if (!currentStudent) return null;
        const newStudentData = typeof updater === 'function' ? updater(currentStudent) : updater;
        handleStudentUpdate(newStudentData.id, newStudentData, options);
        return newStudentData;
    });
  };

  const addStudent = async (studentData: { name: string; email: string; password: string; }) => {
    if (!personal) return { success: false, error: "Personal não está logado." };
    const result = await dataService.addStudent(personal.id, studentData);
    if (!result.success) {
      addToast(`Erro ao adicionar aluno: ${result.error}`, 'error');
    } else {
      addToast("Aluno adicionado com sucesso!", "success");
      const { studentsData } = await dataService.fetchUserData(personal.id);
      setStudents(studentsData || []);
    }
    return result;
  };
  
  const deleteStudent = async (studentId: string) => {
    const error = await dataService.deleteStudent(studentId);
    if (error) {
      addToast(`Erro ao excluir aluno: ${error.message}`, 'error');
    } else {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      addToast("Aluno excluído com sucesso!", "success");
    }
  };

  const savePersonalProfile = async (newSettings: PersonalSettings) => {
      if (!personal) return;
      
      const error = await dataService.updatePersonalProfile(personal.id, { settings: newSettings });
      
      if (error) {
          addToast(`Erro ao salvar configurações: ${error.message}`, 'error');
      } else {
          setPersonal(prev => prev ? { ...prev, settings: newSettings } : null);
      }
  };

  const updatePersonalAiPrefs = async (notes: string) => {
      if (!personal) return;
      const newSettings = { ...(personal.settings || {}), aiStyleNotes: notes };
      await savePersonalProfile(newSettings);
  };

  const addCorrection = async (correction: Correction) => {
      if (!personal || !correction.reason) {
        console.log("AI Correction/Learning (sem salvar):", correction);
        return;
      }
  
      const newLearnedPreferences = [
        ...(personal.settings?.aiLearnedPreferences || []),
        correction.reason,
      ];
  
      const limitedPreferences = newLearnedPreferences.slice(-20);
  
      const newSettings = {
        ...(personal.settings || {}),
        aiLearnedPreferences: limitedPreferences,
      };
      
      await savePersonalProfile(newSettings);
      addToast("IA aprendeu uma nova preferência!", "info");
  };
  
  const updateUserAsAdmin = async (user: Personal | Student, updates: Partial<Personal | Student>, authUpdates: { password?: string }) => {
    const table = user.role === 'personal' ? 'personals' : 'students';
    const { error } = await dataService.updateUserAsAdmin(user.id, table, updates);
    if (error) {
        addToast(`Erro ao atualizar perfil: ${error.message}`, 'error');
        return;
    }

    if (authUpdates.password) {
        const { error: authError } = await dataService.updateUserAuthAsAdmin(user.id, authUpdates);
        if (authError) {
            addToast(`Perfil atualizado, mas falha ao atualizar senha: ${authError.message}`, 'error');
            return;
        }
    }

    addToast('Usuário atualizado com sucesso!', 'success');
    
    const { personals, students: updatedStudents, error: usersError } = await dataService.fetchAllUsersAsAdmin();
    if (!usersError) {
        setAllUsers({ personals: personals || [], students: updatedStudents || [] });
    }
  };

  const addExercisesBatch = async (jsonString: string): Promise<boolean> => {
      setIsBatchAdding(true);
      try {
          const exercises: (ExerciseDetails & { id: string })[] = JSON.parse(jsonString);
          
          if (!Array.isArray(exercises)) {
              throw new Error("O JSON deve ser um array de exercícios.");
          }

          const existingIds = exercises.filter(ex => exerciseDatabase[ex.id]).map(ex => ex.id);
          if (existingIds.length > 0) {
              throw new Error(`IDs de exercícios já existem: ${existingIds.join(', ')}`);
          }
          
          const { data, error } = await dataService.addExercisesBatch(exercises);
          if (error) {
              throw new Error(error.message);
          }
          
          if (data) {
             const newDbEntries = data.reduce((acc, exercise) => {
                const { id, ...details } = exercise;
                acc[id] = details;
                return acc;
             }, {} as Record<string, ExerciseDetails>);

             setExerciseDatabase(prev => ({ ...prev, ...newDbEntries }));
             addToast(`${data.length} exercícios adicionados com sucesso!`, 'success');
          }
          return true;
      } catch (e: any) {
          addToast(`Erro ao adicionar em lote: ${e.message}`, 'error');
          return false;
      } finally {
          setIsBatchAdding(false);
      }
  };

  return {
    session,
    isAuthLoading,
    mode,
    personal,
    studentData,
    students,
    saveError,
    toasts,
    isSettingsOpen,
    setIsSettingsOpen,
    isBatchAdding,
    globalApiKeys,
    allUsers,
    
    // State and setters for child components
    viewState,
    setViewState,
    selectedStudent,
    setSelectedStudent,

    actions: {
      login,
      register,
      logout,
      saveStudent,
      deleteStudent,
      addStudent,
      addCorrection,
      updatePersonalAiPrefs,
      savePersonalProfile,
      addToast,
      setStudentData: setAndSaveStudentData as (updater: React.SetStateAction<Student>, options?: { showSuccessToast?: boolean; }) => void,
      fetchFullStudent,
      addExercise,
      updateExercise,
      addExercisesBatch,
      updateUserAsAdmin,
    },
    ai,
    exerciseDatabase
  };
};