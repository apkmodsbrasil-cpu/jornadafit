import { getSupabaseClient } from '../lib/supabaseClient.ts';
import type { AuthError, PostgrestError } from '@supabase/supabase-js';
import type { Student, Personal, ExerciseDetails } from '../types.ts';

// UTILITY FUNCTIONS
const toCamelCase = (s: string): string => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

export const keysToCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToCamelCase(v));
    } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [toCamelCase(key)]: keysToCamelCase(obj[key]),
            }),
            {},
        );
    }
    return obj;
};

export const toSnakeCase = (str: string): string => {
  if (!str) return str;
  // This version correctly handles transitions between letters and numbers, e.g., 'canRun5min' -> 'can_run_5_min'
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/([a-z])([0-9])/g, '$1_$2')
    .toLowerCase()
    .replace(/^_/, '');
};


const keysToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [toSnakeCase(key)]: keysToSnakeCase(obj[key]),
            }),
            {},
        );
    }
    return obj;
};

// CONSTANTS
const STUDENT_SUMMARY_COLUMNS = 'id, name, email, personal_id, goal, plan_status, plan_expiry_date, performance_history, completion_history, last_feedback, ai_insights, workout_plan, available_days';


// AUTH FUNCTIONS
export const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: { message: 'Supabase client not initialized.' } as AuthError };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
};

export const signUp = async (name: string, email: string, password: string): Promise<{ error: AuthError | null }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: { message: 'Supabase client not initialized.' } as AuthError };
    
    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: 'personal' } }
    });

    if (authError) return { error: authError };
    if (!user) return { error: { message: 'User not created.' } as AuthError };

    const { error: profileError } = await supabase
        .from('personals')
        .insert({ id: user.id, name, email, role: 'personal' });
    
    return { error: profileError as AuthError | null };
};

export const signOut = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
};

// DATA FETCHING
export const fetchAdminSettings = async (): Promise<string[] | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('personals')
        .select('settings')
        .eq('email', 'admin@evoluai.com')
        .limit(1);

    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 means 0 rows, which is fine
            console.error("Error fetching admin settings:", error);
        }
        return null;
    }

    if (!data || data.length === 0) {
        return null; // No admin found, not an error
    }

    return data[0].settings?.geminiApiKeys || [];
};

export const fetchUserData = async (userId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: { message: 'Supabase client not initialized.' } };

    // Try to fetch personal data first
    const { data: personalData, error: personalError } = await supabase
        .from('personals').select('*').eq('id', userId).single();

    if (personalError && personalError.code !== 'PGRST116') { // PGRST116 = 0 rows
        // A real error occurred
        return { personalData: null, studentsData: null, studentData: null, error: personalError };
    }
    
    if (personalData) {
        const { data: studentsData, error: studentsError } = await supabase
            .from('students').select(STUDENT_SUMMARY_COLUMNS).eq('personal_id', userId);
        
        if (studentsError) {
             return { personalData: null, studentsData: null, studentData: null, error: studentsError };
        }

        const studentsWithRole = studentsData?.map(s => ({ ...s, role: 'student' }));

        return { 
            personalData: keysToCamelCase(personalData), 
            studentsData: keysToCamelCase(studentsWithRole), 
            studentData: null, 
            error: null
        };
    }

    // If not a personal, must be a student
    let { data: studentData, error: studentError } = await supabase
        .from('students').select('*, personals(settings)').eq('id', userId).single();
    
    if (studentError) {
         // This can happen if the user exists in auth but not in profiles table yet.
         // Or if there's a genuine error.
        return { personalData: null, studentsData: null, studentData: null, error: studentError };
    }
    
    if (studentData) {
        // Fallback: If the join failed but we have personal_id, fetch settings separately.
        if (studentData.personal_id && !studentData.personals) {
            const { data: personalSettingsData, error: personalFetchError } = await supabase
                .from('personals')
                .select('settings')
                .eq('id', studentData.personal_id)
                .single();

            if (personalSettingsData) {
                studentData.personals = { settings: personalSettingsData.settings };
            } else if (personalFetchError && personalFetchError.code !== 'PGRST116') {
                console.error("Fallback fetch for personal settings failed:", personalFetchError);
            }
        }
        (studentData as any).role = 'student';
    }

    return { 
        personalData: null, 
        studentsData: null, 
        studentData: keysToCamelCase(studentData), 
        error: null
    };
};

export const fetchFullStudent = async (studentId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: { message: 'Supabase client not initialized.' } };
    const { data, error } = await supabase.from('students').select('*, personals(settings)').eq('id', studentId).single();
    
    if (data) {
        (data as any).role = 'student';
    }
    
    return { data: keysToCamelCase(data), error };
};

export const fetchPersonalData = async (personalId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { personalData: null, error: { message: 'Supabase client not initialized.' } };

    const { data, error } = await supabase.from('personals').select('*').eq('id', personalId).single();
    return { personalData: keysToCamelCase(data), error };
};

export const fetchExercises = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: { message: 'Supabase client not initialized.' } as PostgrestError };
    const { data, error } = await supabase.from('exercise').select('*');
    return { data: keysToCamelCase(data), error };
};

export const fetchAllUsersAsAdmin = async (): Promise<{ personals: Personal[] | null, students: Student[] | null, error: PostgrestError | null }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { personals: null, students: null, error: { message: 'Supabase client not initialized.' } as PostgrestError };

    const { data, error } = await supabase.rpc('get_all_users');

    if (error) {
        return { personals: null, students: null, error };
    }
    
    const personalsData = data.personals || [];
    const studentsData = data.students || [];

    const personalsWithRole = personalsData.map((p: any) => ({ ...p, role: 'personal' as const }));
    const studentsWithRole = studentsData.map((s: any) => ({ ...s, role: 'student' as const }));

    return {
        personals: keysToCamelCase(personalsWithRole),
        students: keysToCamelCase(studentsWithRole),
        error: null
    };
};

// DATA MUTATION
export const addStudent = async (personalId: string, studentInfo: { name: string; email: string; password: string; }) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase client not initialized.' };

    // Guarda a sessão atual do personal para restaurá-la depois.
    const { data: { session: personalSession } } = await supabase.auth.getSession();
    if (!personalSession) return { success: false, error: 'Sessão do personal não encontrada.' };

    // Registra o novo aluno. Isso irá temporariamente logar o novo aluno.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: studentInfo.email,
        password: studentInfo.password,
        options: { data: { full_name: studentInfo.name, role: 'student' } }
    });

    // Restaura imediatamente a sessão do personal para que ele não seja desconectado.
    await supabase.auth.setSession({
        access_token: personalSession.access_token,
        refresh_token: personalSession.refresh_token,
    });

    if (signUpError) {
        const errorMessage = signUpError.message.includes('User already registered')
            ? 'Este email já está cadastrado.'
            : signUpError.message;
        return { success: false, error: errorMessage };
    }
    
    if (!signUpData.user) {
        return { success: false, error: 'Não foi possível criar o usuário do aluno.' };
    }

    // Insere os detalhes do aluno na tabela 'students'.
    const { error: profileError } = await supabase.from('students').insert({
        id: signUpData.user.id,
        name: studentInfo.name,
        email: studentInfo.email,
        personal_id: personalId,
        plan_status: 'pending_creation',
    });

    if (profileError) {
        // NOTA: Limitação da abordagem no lado do cliente. Um usuário de autenticação órfão pode ser criado se isso falhar.
        // Uma função de borda (edge function) seria ideal para lidar com isso de forma transacional.
        return { success: false, error: `Usuário criado, mas falha ao salvar perfil: ${profileError.message}` };
    }

    return { success: true };
};

export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<PostgrestError | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { message: 'Supabase client not initialized.', code: '', details: '', hint: '' };
    
    // @ts-ignore
    const { id, role, personals, ...updateData } = updates;
    const snakeCaseUpdates = keysToSnakeCase(updateData);

    const { error } = await supabase
        .from('students').update(snakeCaseUpdates).eq('id', studentId);
    return error;
};

export const deleteStudent = async (studentId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { message: 'Supabase client not initialized.' };
    
    const { error: profileError } = await supabase.from('students').delete().eq('id', studentId);
    if (profileError) return profileError;

    // Supabase automatically deletes the auth user if a public.users cascade is set up.
    // If not, this admin call is needed.
    const { error: authError } = await supabase.auth.admin.deleteUser(studentId);
    return authError;
};

export const updatePersonalProfile = async (personalId: string, updates: Partial<Personal>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { message: 'Supabase client not initialized.' };

    const { error } = await supabase
        .from('personals').update(keysToSnakeCase(updates)).eq('id', personalId);
    return error;
};

export const updateUserAsAdmin = async (userId: string, table: 'personals' | 'students', updates: Partial<Personal | Student>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: { message: 'Supabase client not initialized.' } as PostgrestError };
    
    // @ts-ignore
    const { id, role, ...updateData } = updates;
    const snakeCaseUpdates = keysToSnakeCase(updateData);
    const { error } = await supabase.from(table).update(snakeCaseUpdates).eq('id', userId);
    return { error };
}

export const updateUserAuthAsAdmin = async (userId: string, updates: { password?: string; }) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: { message: 'Supabase client not initialized.' } as AuthError };
    
    const { error } = await supabase.auth.admin.updateUserById(userId, updates);
    return { error };
}

export const addExercise = async (exercise: ExerciseDetails & {id: string}) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: { message: 'Supabase client not initialized.' } as PostgrestError };
    
    const { data, error } = await supabase.from('exercise').insert(keysToSnakeCase(exercise)).select();
    return { data: keysToCamelCase(data), error };
};

export const updateExercise = async (exerciseId: string, details: Partial<ExerciseDetails>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: { message: 'Supabase client not initialized.' } as PostgrestError };
    
    const { data, error } = await supabase.from('exercise').update(keysToSnakeCase(details)).eq('id', exerciseId).select();
    return { data: keysToCamelCase(data), error };
};

export const addExercisesBatch = async (exercises: (ExerciseDetails & { id: string })[]) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: { message: 'Supabase client not initialized.' } as PostgrestError };

    const exercisesToInsert = exercises.map(ex => keysToSnakeCase(ex));

    const { data, error } = await supabase.from('exercise').insert(exercisesToInsert).select();
    return { data: keysToCamelCase(data), error };
};

// SUBSCRIPTIONS
export const subscribeToStudentChanges = (personalId: string, callback: (payload: any) => void) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase client not initialized.");

    const subscription = supabase.channel(`public:students:personal_id=eq.${personalId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `personal_id=eq.${personalId}` }, callback)
        .subscribe();
    
    return subscription;
};