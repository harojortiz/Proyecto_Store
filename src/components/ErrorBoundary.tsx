import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Algo salió mal</h1>
                            <p className="text-muted-foreground">
                                Ha ocurrido un error inesperado en la aplicación.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="bg-muted p-4 rounded-lg text-left overflow-auto max-h-40 text-xs font-mono">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <Button
                            className="w-full gap-2"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Recargar página
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
