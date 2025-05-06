import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type UserType = {
    name: string;
    email: string;
};

type AuthContextType = {
    isAuthenticated: boolean;
    user: UserType | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes, start as authenticated
    const [user, setUser] = useState<UserType | null>({
        name: 'Ahmet Engin',
        email: 'ahmet@example.com'
    });
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        // This will be implemented when we have the backend
        // For now, just simulate a successful login
        setIsAuthenticated(true);
        setUser({
            name: 'Ahmet Engin',
            email: email
        });
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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