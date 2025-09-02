/**
 * Función utilitaria para formatear tiempo transcurrido de manera consistente
 */
export const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Calcular diferencia en milisegundos
    const diffInMs = now.getTime() - date.getTime();
    
    // Si la diferencia es negativa (fecha futura), mostrar "Ahora"
    if (diffInMs < 0) return 'Ahora';
    
    // Calcular diferentes unidades de tiempo
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    // Formatear según la diferencia de tiempo
    if (diffInSeconds < 60) {
        return 'Ahora';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
        return `${diffInHours}h`;
    } else if (diffInDays < 7) {
        return `${diffInDays}d`;
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks}sem`;
    } else if (diffInMonths < 12) {
        return `${diffInMonths}mes`;
    } else {
        return `${diffInYears}año${diffInYears > 1 ? 's' : ''}`;
    }
};

/**
 * Función para formatear fecha de registro
 */
export const formatJoinDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) {
        return 'Nuevo miembro';
    } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return `Se unió hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
        const years = Math.floor(diffInDays / 365);
        return `Se unió hace ${years} año${years > 1 ? 's' : ''}`;
    }
};
