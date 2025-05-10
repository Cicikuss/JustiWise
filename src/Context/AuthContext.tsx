import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../Models/User';
import { fetchUser, userLogin, userSignUp } from '../service/supabaseClient';



type AuthContextType = {
    isAuthenticated: boolean;
    user: UserType | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [user, setUser] = useState<UserType | null>(null);
    const navigate = useNavigate();

    const signup = async (email: string, password: string) => {
        try {
            const data  = await userSignUp(email, password);

             if (!data) {
            throw new Error("Kullanıcı bilgisi alınamadı.");
        }
        console.log(data.user?.id)
        const fetchedUser = await fetchUser(data.user!.id); 
        const userData: UserType = {
            id: fetchedUser.id,
            email: fetchedUser.email ?? '',
            role: fetchedUser.role,
            name: fetchedUser.username,
            created_at: fetchedUser.created_at,
            profile_image_url: fetchedUser.user_metadata?.profile_image_url ?? null
        };
        setUser(userData);
        setIsAuthenticated(true);
        navigate('/');

        }catch (error) {
            console.error('Kayıt başarısız:', error);
            setIsAuthenticated(false);
            setUser(null);
        }
    }
  
    const login = async (email: string, password: string) => {
        try {
            const { user,session } = await userLogin(email, password);
        if (!user) {
            throw new Error("Kullanıcı bilgisi alınamadı.");
        }


        const fetchedUser = await fetchUser(user.id);
        const userData: UserType = {
            id: fetchedUser.id,
            email: fetchedUser.email ?? '',
            role: fetchedUser.role,
            name: fetchedUser.username,
            created_at: fetchedUser.created_at,
            profile_image_url: fetchedUser.user_metadata?.profile_image_url ?? null
        };
        setUser(userData);
         setIsAuthenticated(true);
        navigate('/');
        } catch (error) {
        console.error('Giriş başarısız:', error);
        setIsAuthenticated(false);
        setUser(null);
    }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user,signup, login, logout  }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 