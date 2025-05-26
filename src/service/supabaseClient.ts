import { createClient } from '@supabase/supabase-js';
import { EditableUser } from '../Models/User';
import { newCase } from '../Models/Case';



const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const userID= JSON.parse(localStorage.getItem('user') || '{}').id;
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
  


  const filePath = `${userID}/${fileName}`; 

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


export const getLoggedInUser = async () => {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
        throw new Error(error.message);
    }
    return user;
}

export const getUserById = async (id: string) => {
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
export const getNotifications = async () => {
    
    const { data, error } = await supabaseClient
        .from('notifications')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }
    return data;
}


export const uploadFile = async (file: File) => {
 
    const filePath = `${userID}/${file.name}`; 
    const { data,error } = await supabaseClient.storage.from('case-files').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data;
}


export const addNewCase = async (caseData: newCase) => {

 
  const fileurl =!caseData.file? "" :(await uploadFile(caseData.file!)).path;
    const { data, error } = await supabaseClient
        .from('cases')
        .insert([{title: caseData.title, description: caseData.description, status: caseData.status, category: caseData.category, priority: caseData.priority,client:userID,document_url:fileurl}])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const getCasesClient = async () => {
  
    const { data, error } = await supabaseClient
        .from('cases')
        .select('*')
        .eq('client', userID);

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const getCasesLawyer = async () => {
   
    const { data, error } = await supabaseClient
        .from('cases')
        .select('*')
        .eq('lawyer_id', userID);

    if (error) {
        throw new Error(error.message);
    }
    return data;
}



export const deleteCase = async (caseId: string) => {
    const { data, error } = await supabaseClient
        .from('cases')
        .delete()
        .eq('id', caseId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}


export const getCaseById = async (caseId: string) => {
    const { data, error } = await supabaseClient
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const applyForCase = async (caseId: string) => {

    const { data: existingRequests, error: fetchError } = await supabaseClient
        .from('case_requests')
        .select('id')
        .eq('case_id', caseId)
        .eq('lawyer_id', userID)
        .in('request_status', ['pending', 'approved']); 

         if (fetchError) {
        console.error('Error checking existing requests:', fetchError.message);
        throw new Error(`Mevcut başvuruları kontrol ederken hata oluştu: ${fetchError.message}`);
    }

    if (existingRequests && existingRequests.length > 0) {
        throw new Error("Bu dava için zaten bir başvurunuz bulunuyor veya başvurunuz onaylanmış.");
    }

    
    const { data, error } = await supabaseClient
       .from('case_requests')
       .insert([{ case_id: caseId, lawyer_id: userID ,request_status: 'pending'}])
       .select();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const getCaseRequestByLawyerAndCase = async (caseId: string, lawyerId: string) => {
    const { data, error } = await supabaseClient
        .from('case_requests')
        .select('*')
        .eq('case_id', caseId)
        .eq('lawyer_id', lawyerId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching case request:', error.message);
        return null;
    }
    return data;
};