import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
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
    const [isLoading, setIsLoading] = useState(true);

    // Auto-login al cargar la app si hay sesión activa (cookies)
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                try {
                    // Verificar que la sesión siga siendo válida (el token está en cookies)
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    // Sesión inválida, limpiar storage
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
            // Guardar solo el usuario en localStorage (los tokens están en cookies httpOnly)
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
            // Guardar solo el usuario en localStorage (los tokens están en cookies httpOnly)
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success(`¡Cuenta creada! Tu usuario es: ${response.user.username}`);
        } catch (error: any) {
            const message = error.response?.data?.error || 'Error al registrar usuario';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        // Llamar al servicio de logout para limpiar cookies en el servidor
        authService.logout();
        setUser(null);
        toast.info('Sesión cerrada');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
