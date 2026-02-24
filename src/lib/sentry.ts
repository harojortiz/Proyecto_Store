import * as Sentry from "@sentry/react";

// Solo inicializar Sentry si está configurado
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,

        // Integración con React Router
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true, // Ocultar texto sensible en replays
                blockAllMedia: true, // No grabar imágenes/videos
            }),
        ],

        // Capturar el 100% de las transacciones para performance monitoring
        tracesSampleRate: 1.0,

        // Capturar el 10% de las sesiones para Session Replay
        replaysSessionSampleRate: 0.1,

        // Capturar el 100% de las sesiones con errores
        replaysOnErrorSampleRate: 1.0,

        // Filtrar información sensible
        beforeSend(event) {
            // Remover información sensible de los eventos
            if (event.request) {
                delete event.request.cookies;
                if (event.request.headers) {
                    delete event.request.headers['authorization'];
                }
            }
            return event;
        },
    });

    console.log('✅ Sentry (Frontend) inicializado correctamente');
} else {
    console.log('ℹ️  Sentry (Frontend) no inicializado (VITE_SENTRY_DSN no configurado)');
}

export default Sentry;
