/**
 * Función global para aplicar el fondo negro por defecto
 * Se ejecuta cuando termina el preloader, antes de pasar al sistema
 */
export const preloadAndApplyBackground = async (): Promise<void> => {
    return new Promise((resolve) => {
        // Aplicar fondo negro sólido inmediatamente (más rápido)
        applyDefaultBlackBackground();
        
        // Después de aplicar el negro, cargar el fondo personalizado del usuario
        setTimeout(() => {
            loadUserCustomBackground();
        }, 100); // Pequeño delay para asegurar que el negro se aplique primero
        
        resolve();
    });
};

/**
 * Carga y aplica el fondo personalizado guardado del usuario
 */
const loadUserCustomBackground = (): void => {
    const savedBackground = localStorage.getItem('selectedBackground');
    
    // Solo aplicar si hay un fondo guardado y no es negro o default
    if (savedBackground && savedBackground !== 'black' && savedBackground !== '/img/Theme/default-bg.jpg') {
        console.log('🎨 Background-loader: Aplicando fondo personalizado del usuario:', savedBackground);
        
        // Verificar si estamos en login (no aplicar fondo)
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/forgot-password';
        
        if (isLoginPage) {
            console.log('🎨 Background-loader: Página de login detectada - no se aplica fondo personalizado');
            return;
        }
        
        // Aplicar el fondo personalizado
        const body = document.body;
        const html = document.documentElement;
        
        if (body && html) {
            // Aplicar al body
            body.style.setProperty('background-image', `url(${savedBackground})`, 'important');
            body.style.setProperty('background-size', 'cover', 'important');
            body.style.setProperty('background-position', 'center', 'important');
            body.style.setProperty('background-repeat', 'no-repeat', 'important');
            body.style.setProperty('background-attachment', 'fixed', 'important');
            body.style.setProperty('min-height', '100vh', 'important');
            body.style.setProperty('background-color', 'transparent', 'important');
            
            // Aplicar al html
            html.style.setProperty('background-image', `url(${savedBackground})`, 'important');
            html.style.setProperty('background-size', 'cover', 'important');
            html.style.setProperty('background-position', 'center', 'important');
            html.style.setProperty('background-repeat', 'no-repeat', 'important');
            html.style.setProperty('background-attachment', 'fixed', 'important');
            html.style.setProperty('min-height', '100vh', 'important');
            html.style.setProperty('background-color', 'transparent', 'important');
            
            // Agregar overlay para mejorar legibilidad
            let overlay = document.querySelector('.global-background-overlay') as HTMLElement;
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'global-background-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    pointer-events: none;
                    z-index: -1;
                `;
                document.body.appendChild(overlay);
            }
            
            // Asegurar que el contenido esté por encima del overlay
            const appContainer = document.querySelector('#app');
            if (appContainer) {
                (appContainer as HTMLElement).style.position = 'relative';
                (appContainer as HTMLElement).style.zIndex = '1';
            }
            
            console.log('🎨 Background-loader: Fondo personalizado aplicado exitosamente');
        }
    } else {
        console.log('🎨 Background-loader: No hay fondo personalizado guardado o es fondo negro');
    }
};

/**
 * Aplica el fondo negro sólido por defecto y limpia fondos anteriores
 */
const applyDefaultBlackBackground = (): void => {
    // Verificar si estamos en login (mantener fondo negro)
    const isLoginPage = window.location.pathname === '/login' || 
                       window.location.pathname === '/register' || 
                       window.location.pathname === '/forgot-password';
    
    if (isLoginPage) {
        return; // No hacer nada en páginas de login
    }
    
    // Limpiar cualquier fondo anterior
    document.body.style.removeProperty('background-image');
    document.body.style.removeProperty('background-size');
    document.body.style.removeProperty('background-position');
    document.body.style.removeProperty('background-repeat');
    document.body.style.removeProperty('background-attachment');
    document.body.style.removeProperty('min-height');
    
    document.documentElement.style.removeProperty('background-image');
    document.documentElement.style.removeProperty('background-size');
    document.documentElement.style.removeProperty('background-position');
    document.documentElement.style.removeProperty('background-repeat');
    document.documentElement.style.removeProperty('background-attachment');
    document.documentElement.style.removeProperty('min-height');
    
    // Remover overlay si existe
    const overlay = document.querySelector('.global-background-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Aplicar fondo negro sólido
    document.body.style.setProperty('background-color', '#000000', 'important');
    document.body.style.setProperty('background-image', 'none', 'important');
    document.documentElement.style.setProperty('background-color', '#000000', 'important');
    document.documentElement.style.setProperty('background-image', 'none', 'important');
};

// Hacer la función disponible globalmente
if (typeof window !== 'undefined') {
    (window as any).preloadAndApplyBackground = preloadAndApplyBackground;
}
