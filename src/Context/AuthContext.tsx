import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../Models/User';
import { fetchUser, userLogin, userLogout, userSignUp } from '../service/supabaseClient';
import { showErrorToast } from '../Helper/ErrorHandler';

type AuthContextType = {

    user: UserType | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    checkLoggedInUser: () => boolean;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   
    const [user, setUser] = useState<UserType | null>(null);
    const navigate = useNavigate();

    // Sayfa yüklendiğinde localStorage'dan isAuthenticated kontrol ediliyor
    useEffect(() => {

       
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
        
            const userID=  JSON.parse(localStorage.getItem('user') || '{}').id;
            fetchUser(userID).then((fetchedUser) => {
                const userData: UserType = {
                    id: fetchedUser.id,
                    email: fetchedUser.email ?? '',
                    role: fetchedUser.role,
                    username: fetchedUser.username,
                    created_at: fetchedUser.created_at,
                    profile_image_url: fetchedUser.profile_image_url,
                };
                setUser(userData);
                console.log("Kullanıcı bilgileri alındı:", userData);
               
            }).catch((error) => {
                console.error('Kullanıcı bilgileri alınamadı:', error);
                setUser(null);
            });            
        
        } else {
           
            console.log("User is not authenticated");
        }
    }, []); // Bu useEffect sadece component mount edildiğinde çalışacak

    const signup = async (email: string, password: string) => {
        try {
            const data = await userSignUp(email, password);

            // auth durumunu localStorage'a kaydet
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(data)); // Kullanıcı bilgilerini localStorage'a kaydet

            navigate('/'); // Başarıyla giriş yaptıktan sonra yönlendir

        } catch (error) {
            showErrorToast(error);
            showErrorToast('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
            setUser(null);
        }
    };

    const checkLoggedInUser =  () => {
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
           
            return true;
        } else {
           
            return false;
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const { user } = await userLogin(email, password);
          

            const fetchedUser = await fetchUser(user.id);
            const userData: UserType = {
                id: fetchedUser.id,
                email: fetchedUser.email ?? '',
                role: fetchedUser.role,
                username: fetchedUser.username,
                created_at: fetchedUser.created_at,
                profile_image_url: fetchedUser.user_metadata?.profile_image_url ?? null,
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData)); // Kullanıcı bilgilerini localStorage'a kaydet
            // auth durumunu localStorage'a kaydet
            localStorage.setItem('isAuthenticated', 'true');

            navigate('/'); // Başarıyla giriş yaptıktan sonra yönlendir

        } catch (error) {
            showErrorToast(error);
            
            setUser(null);
        }
    };

    const logout = async () => {
      
        setUser(null);

       
        localStorage.removeItem('isAuthenticated');

        navigate('/login'); 
        await userLogout();
        localStorage.removeItem('user'); 
    };

    return (
        <AuthContext.Provider value={{ user, signup, login, logout,checkLoggedInUser}}>
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