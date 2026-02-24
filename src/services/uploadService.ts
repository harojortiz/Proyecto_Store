import apiClient from '@/lib/api';

export interface UploadResponse {
    message: string;
    filename: string;
    url: string;
    size: number;
    mimetype: string;
}

/**
 * Servicio para subir imágenes al servidor
 */
export const uploadService = {
    /**
     * Sube una imagen al servidor
     * @param file - Archivo de imagen a subir
     * @returns URL de la imagen subida
     */
    uploadImage: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('image', file);

        const { data } = await apiClient.post<UploadResponse>('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data;
    },

    /**
     * Elimina una imagen del servidor
     * @param filename - Nombre del archivo a eliminar
     */
    deleteImage: async (filename: string): Promise<void> => {
        await apiClient.delete(`/upload/image/${filename}`);
    },

    /**
     * Extrae el nombre del archivo de una URL completa
     */
    getFilenameFromUrl: (url: string): string | null => {
        if (!url) return null;
        const parts = url.split('/');
        return parts[parts.length - 1] || null;
    },
};
