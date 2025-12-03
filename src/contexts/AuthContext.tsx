import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (email: string | undefined, password: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Auto-login al cargar la app si hay token válido
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    // Verificar que el token siga siendo válido
                    const currentUser = await authService.getCurrentUser(storedToken);
                    setUser(currentUser);
                    setToken(storedToken);
                } catch (error) {
                    // Token inválido, limpiar storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await authService.login(username, password);
            setUser(response.user);
            setToken(response.token);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success(`¡Bienvenido, ${response.user.name}!`);
        } catch (error: any) {
            const message = error.response?.data?.error || 'Error al iniciar sesión';
            toast.error(message);
            throw error;
        }
    };

    const register = async (email: string | undefined, password: string, name: string) => {
        try {
            const response = await authService.register({ email, password, name });
            setUser(response.user);
            setToken(response.token);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success(`¡Cuenta creada! Tu usuario es: ${response.user.username}`);
        } catch (error: any) {
            const message = error.response?.data?.error || 'Error al registrar usuario';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('Sesión cerrada');
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
