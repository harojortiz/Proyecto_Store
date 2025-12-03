import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, User, Lock } from 'lucide-react';

export default function Profile() {
    const { user, login } = useAuth(); // Usamos login para actualizar el estado del usuario si cambia
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    // Estado para perfil
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    // Estado para contraseña
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingProfile(true);
        try {
            const updatedUser = await authService.updateProfile({ name, email: email || undefined });
            // Actualizar el usuario en el contexto/localStorage es un poco truco aquí sin un método específico en context
            // Lo ideal sería tener un método updateUser en el context, pero por ahora podemos recargar la página o confiar en que el usuario se actualice
            // Vamos a actualizar el localStorage manualmente y forzar una recarga suave o simplemente mostrar éxito
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Perfil actualizado correctamente');
            // Recargar para ver cambios reflejados en el header si es necesario
            window.location.reload();
        } catch (error: any) {
            const message = error.response?.data?.error || 'Error al actualizar perfil';
            toast.error(message);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast.error('Las nuevas contraseñas no coinciden');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoadingPassword(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            toast.success('Contraseña actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Error al cambiar contraseña';
            toast.error(message);
        } finally {
            setIsLoadingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Datos Personales */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Información Personal
                        </CardTitle>
                        <CardDescription>
                            Actualiza tu información básica
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Usuario</Label>
                                <Input value={user?.username} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">El nombre de usuario no se puede cambiar.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                />
                            </div>
                            <Button type="submit" disabled={isLoadingProfile}>
                                {isLoadingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Cambio de Contraseña */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Seguridad
                        </CardTitle>
                        <CardDescription>
                            Cambia tu contraseña de acceso
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
                                <Input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" variant="secondary" disabled={isLoadingPassword}>
                                {isLoadingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Actualizar Contraseña
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
