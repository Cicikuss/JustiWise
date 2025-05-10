export type UserType ={
    id: string;
    email: string;
    role: string;
    username: string;
    created_at: string;
    profile_image_url?: string | null;
   
}

export type EditableUser = Partial<Omit<UserType, 'id' | 'email' | 'created_at'>>;
