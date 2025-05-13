// src/service/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { EditableUser } from '../Models/User';


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

export async function uploadImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  // 🟡 Kullanıcı ID'sini al
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error('Kullanıcı bilgisi alınamadı.');
  }

  const filePath = `${user.id}/${fileName}`; // 🔥 Kullanıcıya özel klasör

  const { error } = await supabaseClient.storage.from('profile-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error('Görsel yüklenemedi: ' + error.message);
  }

  const { data: publicUrlData } = supabaseClient.storage.from('profile-images').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}   

export const updateUser = async (id: string, user: EditableUser) => {
    const { data, error } = await supabaseClient
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}
