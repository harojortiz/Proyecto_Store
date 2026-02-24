import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Watch, Loader2, User, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            // Error ya manejado en AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Panel izquierdo - Estética de Lujo */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-primary">
                {/* Imagen/Patrón de fondo sofisticado */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border border-accent/30 rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] border border-accent/20 rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground max-w-2xl">
                    <div className="space-y-8">
                        {/* Logo */}
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                                <Watch className="w-8 h-8 text-accent-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold tracking-tighter uppercase">V&H Luxe</h1>
                                <p className="text-[10px] tracking-[0.3em] opacity-60 uppercase font-bold">Luxury Timepieces</p>
                            </div>
                        </div>

                        {/* Título Principal */}
                        <div className="space-y-4">
                            <h2 className="text-5xl font-bold leading-tight tracking-tight">
                                La Excelencia en el
                                <span className="block text-accent">Control del Tiempo</span>
                            </h2>
                            <p className="text-lg opacity-70 font-medium leading-relaxed">
                                Plataforma exclusiva para la gestión profesional de inventario y ventas de alta relojería.
                            </p>
                        </div>

                        {/* Pilares */}
                        <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 border-t border-white/10">
                            {['Inventario', 'Ventas', 'Clientes', 'Análisis'].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80">
                                    <Sparkles className="w-3 h-3 text-accent" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Efecto de degradado suave */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Panel derecho - Formulario Elegante */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-sm space-y-10">
                    {/* Header Móvil / Título de Formulario */}
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-tight">Acceso</h3>
                        <p className="text-muted-foreground font-medium">Ingrese sus credenciales para gestionar V&H Luxe.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest opacity-70">Usuario</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-12 pl-10 bg-secondary/50 border-none rounded-lg focus-visible:ring-accent/40"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest opacity-70">Contraseña</Label>
                                    <a href="#" className="text-[10px] font-bold uppercase text-accent hover:opacity-80">¿Olvidó su clave?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-12 pl-10 bg-secondary/50 border-none rounded-lg focus-visible:ring-accent/40"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground font-bold uppercase tracking-widest text-xs hover:opacity-90 shadow-xl transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </Button>
                    </form>

                    {/* Credenciales de Prueba */}
                    <div className="p-4 bg-secondary/30 rounded-xl border border-border/40 text-center">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Credenciales de Acceso</p>
                        <div className="flex items-center justify-center gap-3 font-mono text-xs">
                            <span className="bg-white px-2 py-0.5 rounded shadow-sm">admin</span>
                            <span className="text-muted-foreground opacity-30">/</span>
                            <span className="bg-white px-2 py-0.5 rounded shadow-sm">admin123</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} V&H Luxe. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
