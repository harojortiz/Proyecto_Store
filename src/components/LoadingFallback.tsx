import { Loader2 } from 'lucide-react';

export default function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Cargando...</p>
            </div>
        </div>
    );
}
