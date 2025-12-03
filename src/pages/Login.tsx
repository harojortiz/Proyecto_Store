import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Watch, Loader2 } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (error) {
            // Error ya manejado en AuthContext con toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
            <Card className="w-full max-w-md p-8 space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <Watch className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Reloj Flow</h1>
                    <p className="text-muted-foreground text-center">
                        Sistema de Gestión de Ventas
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Usuario</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Iniciando sesión...
                            </>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-primary hover:underline">
                        Regístrate aquí
                    </Link>
                </div>

                <div className="pt-4 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground">
                        Credenciales de prueba:
                        <br />
                        <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>
                    </p>
                </div>
            </Card>
        </div>
    );
}
