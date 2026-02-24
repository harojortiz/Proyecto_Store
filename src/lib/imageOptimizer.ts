/**
 * Optimiza y redimensiona una imagen antes de subirla
 * @param file - Archivo de imagen original
 * @param maxWidth - Ancho máximo (default: 800px)
 * @param maxHeight - Alto máximo (default: 800px)
 * @param quality - Calidad de compresión 0-1 (default: 0.8)
 * @returns Promise con la imagen optimizada como base64
 */
export async function optimizeImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.8
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calcular nuevas dimensiones manteniendo aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // Crear canvas para redimensionar
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('No se pudo obtener contexto del canvas'));
                    return;
                }

                // Dibujar imagen redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a base64 con compresión
                const optimizedImage = canvas.toDataURL('image/jpeg', quality);
                resolve(optimizedImage);
            };

            img.onerror = () => {
                reject(new Error('Error al cargar la imagen'));
            };

            img.src = e.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Valida que el archivo sea una imagen válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato no válido. Use JPG, PNG o WebP',
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'La imagen es muy grande. Máximo 5MB',
        };
    }

    return { valid: true };
}

/**
 * Obtiene el tamaño estimado de una imagen base64 en KB
 */
export function getBase64Size(base64: string): number {
    const base64Length = base64.length - (base64.indexOf(',') + 1);
    const padding = (base64.charAt(base64.length - 2) === '=' ? 2 : (base64.charAt(base64.length - 1) === '=' ? 1 : 0));
    const sizeInBytes = (base64Length * 0.75) - padding;
    return Math.round(sizeInBytes / 1024);
}
