import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from '../utils/settingsManager.ts';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
    if (supabaseClient) {
        return supabaseClient;
    }

    const { url, anonKey } = getSupabaseCredentials();

    if (url && anonKey) {
        supabaseClient = createClient(url, anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
        return supabaseClient;
    }

    console.warn("Supabase credentials are not set.");
    return null;
};