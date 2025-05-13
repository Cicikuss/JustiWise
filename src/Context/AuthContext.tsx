import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../Models/User';
import { fetchUser, userLogin, userSignUp } from '../service/supabaseClient';
import { supabaseClient } from '../service/supabaseClient'; // NEW: Supabase client import edildi


type AuthContextType = {

    user: UserType | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, role: string) => Promise<void>; //  UPDATED: role parametresi eklendi
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

    const signup = async (email: string, password: string, role: string) => { // ✅ UPDATED
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { role } //  NEW: Rolü metadata'ya kaydet
                }
            });

            if (error) throw error;

            // Kullanıcı bilgisi döndü mü?
            if (!data.user) throw new Error("Kullanıcı oluşturulamadı.");

            // Kullanıcıyı localStorage'a kaydet
            localStorage.setItem('isAuthenticated', 'true'); //  NEW
            localStorage.setItem('user', JSON.stringify(data.user)); //  NEW

            navigate('/'); //  NEW: Başarılı kayıt sonrası yönlendirme
        } catch (error) {
            console.error('Kayıt başarısız:', error);
            setUser(null); //  NEW: Başarısızlıkta user'ı temizle
        }
    };

    const checkLoggedInUser =  () => {
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
            // Kullanıcı giriş yapmış
            return true;
        } else {
            // Kullanıcı giriş yapmamış
            return false;
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const { user, session } = await userLogin(email, password);
            if (!user) {
                throw new Error("Kullanıcı bilgisi alınamadı.");
            }

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
            console.error('Giriş başarısız:', error);
            
            setUser(null);
        }
    };

    const logout = () => {
      
        setUser(null);

        // auth bilgisini localStorage'dan temizle
        localStorage.removeItem('isAuthenticated');

        navigate('/login'); // Çıkış yapıldığında login sayfasına yönlendir
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
