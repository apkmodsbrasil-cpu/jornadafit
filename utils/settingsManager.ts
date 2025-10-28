
import type { PersonalSettings } from '../types.ts';
import { PERSONAL_USER_MOCK } from '../database/users.ts';


const SUPABASE_URL = "https://zjyxafinuhmqzblbhzwl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqeXhhZmludWhtcXpibGJoendsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTAwNDEsImV4cCI6MjA3Njk4NjA0MX0.xIVFlQ49_npSb3cofs8snX69_i06qazK0REvQln0U9U";


export const getSupabaseCredentials = (): { url: string | null; anonKey: string | null } => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('Supabase URL or Anon Key is not configured correctly.');
    }
    return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
};


export const getPersonalSettings = (): PersonalSettings => {
    
    
    return PERSONAL_USER_MOCK.settings || {};
};