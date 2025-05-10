// src/service/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
 
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const userLogin = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        throw new Error(error.message);
    }
    
    return {
        user: data.user,
        session: data.session,
    };
};

export const userSignUp = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const userLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        throw new Error(error.message);
    }
}

export const fetchUser = async (id:string) => {
    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}
