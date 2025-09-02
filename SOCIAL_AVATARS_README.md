# 🖼️ Sistema de Avatares Sociales - Tribe

## 📋 Descripción

Este sistema permite recuperar automáticamente las imágenes de perfil de usuarios autenticados a través de GitHub o Google, manteniendo sus avatares siempre actualizados.

## ✨ Características

- **Recuperación Automática**: Los avatares se recuperan automáticamente al autenticarse
- **Actualización Inteligente**: Solo se actualizan cuando es necesario (cada 24 horas)
- **Procesamiento Asíncrono**: Las actualizaciones se procesan en segundo plano
- **Fallback Inteligente**: Prioriza avatares locales sobre los del proveedor
- **Soporte Multi-proveedor**: GitHub y Google (con limitaciones para Google)

## 🚀 Cómo Funciona

### 1. **Autenticación Inicial**
Cuando un usuario se autentica por primera vez:
- Se obtiene el avatar del proveedor social
- Se guarda en `provider_avatar`
- Se copia al campo `avatar` principal si no existe uno local

### 2. **Actualizaciones Automáticas**
En cada request autenticado:
- El middleware `CheckSocialAvatar` verifica si necesita actualización
- Si es necesario, programa un job asíncrono
- El job actualiza el avatar desde la API del proveedor

### 3. **Priorización de Avatares**
```php
// Orden de prioridad:
1. Avatar local (avatar) - Si el usuario subió una imagen
2. Avatar del proveedor (provider_avatar) - Si no hay local
3. Sin avatar - Muestra fallback con iniciales
```

## 🛠️ Implementación Técnica

### **Modelo User**
```php
// Campos relevantes:
- avatar: Avatar local del usuario
- provider_avatar: Avatar del proveedor social
- provider: Proveedor (github, google)
- provider_id: ID en el proveedor
- github_username: Username de GitHub (para actualizaciones)

// Métodos:
- getAvatarUrlAttribute(): Obtiene el avatar con fallback
- updateProviderAvatar(): Actualiza avatar del proveedor
- createOrUpdateFromProvider(): Crea/actualiza usuario desde proveedor
```

### **Controlador SocialAuthController**
```php
// En handleProviderCallback():
- Obtiene avatar del proveedor
- Llama a createOrUpdateFromProvider()
- Verifica si el avatar cambió
- Actualiza si es necesario
```

### **Middleware CheckSocialAvatar**
```php
// En cada request autenticado:
- Verifica si es usuario social
- Comprueba si necesita actualización (cada 24h)
- Programa job asíncrono si es necesario
```

### **Job UpdateSocialAvatar**
```php
// Procesamiento asíncrono:
- GitHub: Llama a la API pública
- Google: Requiere re-autenticación
- Actualiza provider_avatar y avatar si es necesario
```

## 📱 Proveedores Soportados

### **GitHub** ✅
- **API**: Pública (no requiere tokens)
- **Avatar**: `https://api.github.com/users/{username}`
- **Actualización**: Automática cada 24 horas
- **Campos**: `avatar_url`, `bio`, `location`, `blog`

### **Google** ⚠️
- **API**: Requiere re-autenticación
- **Avatar**: Solo disponible durante login
- **Actualización**: Manual (re-login)
- **Limitación**: No hay API pública para perfiles

## 🎯 Comandos Disponibles

### **Sincronización Manual**
```bash
# Sincronizar todos los avatares
php artisan social:sync-avatars

# Forzar actualización (incluso si ya existe)
php artisan social:sync-avatars --force
```

### **Verificar Estado**
```bash
# Ver usuarios con autenticación social
php artisan tinker
>>> App\Models\User::whereNotNull('provider')->get(['id', 'email', 'provider', 'avatar', 'provider_avatar']);
```

## 🔧 Configuración

### **Variables de Entorno**
```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### **Middleware**
```php
// bootstrap/app.php
$middleware->web(append: [
    // ... otros middlewares
    \App\Http\Middleware\CheckSocialAvatar::class,
]);
```

## 📊 Monitoreo y Logs

### **Logs de Actividad**
```php
// Logs generados:
- "GitHub avatar updated for user {id}"
- "GitHub API error for user {id}: {error}"
- "Google avatar update requires re-authentication for user {id}"
```

### **Cache de Control**
```php
// Clave de cache:
"avatar_update_{user_id}" // Expira en 24 horas
```

## 🚨 Limitaciones y Consideraciones

### **GitHub**
- ✅ API pública disponible
- ✅ Actualización automática
- ✅ Información adicional (bio, location, etc.)

### **Google**
- ⚠️ No hay API pública para perfiles
- ⚠️ Avatar solo disponible durante login
- ⚠️ Requiere re-autenticación para actualizar

### **Rate Limiting**
- GitHub: 60 requests/hour para IPs no autenticadas
- Google: No aplica (solo durante login)

## 🔄 Flujo de Actualización

```
1. Usuario hace request autenticado
   ↓
2. Middleware CheckSocialAvatar se ejecuta
   ↓
3. Verifica si necesita actualización (cada 24h)
   ↓
4. Si es necesario, programa job UpdateSocialAvatar
   ↓
5. Job se ejecuta en cola (delay 5 minutos)
   ↓
6. Llama a API del proveedor
   ↓
7. Actualiza avatar si cambió
   ↓
8. Marca como actualizado (cache 24h)
```

## 🧪 Testing

### **Probar Comando**
```bash
# Crear usuario de prueba
php artisan tinker
>>> $user = App\Models\User::create(['email' => 'test@example.com', 'provider' => 'github', 'provider_id' => '123']);

# Ejecutar sincronización
php artisan social:sync-avatars

# Verificar resultado
>>> $user->fresh()->avatar;
```

### **Probar Middleware**
```bash
# Hacer request autenticado
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/user

# Verificar logs
tail -f storage/logs/laravel.log
```

## 📈 Métricas y Rendimiento

### **Tiempos de Respuesta**
- **Middleware**: < 1ms (solo verificación)
- **Job GitHub**: 100-500ms (depende de API)
- **Job Google**: N/A (no implementado)

### **Uso de Recursos**
- **Memoria**: Mínimo (solo cache de control)
- **CPU**: Mínimo (verificaciones ligeras)
- **Red**: Solo cuando se actualiza (GitHub API)

## 🔮 Mejoras Futuras

1. **Soporte para más proveedores** (Twitter, LinkedIn, etc.)
2. **Sincronización de información adicional** (bio, location, etc.)
3. **Webhooks para actualizaciones en tiempo real**
4. **Dashboard de administración** para monitoreo
5. **Notificaciones** cuando cambian avatares

## 📞 Soporte

Para problemas o preguntas sobre este sistema:
- Revisar logs en `storage/logs/laravel.log`
- Ejecutar comando de sincronización manual
- Verificar configuración de OAuth en `.env`
- Comprobar estado de la cola de jobs

---

**Desarrollado para Tribe - La comunidad de desarrolladores** 🚀
