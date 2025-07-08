# Configuración OAuth para Tribe

## Variables de Entorno Necesarias

Agrega estas variables a tu archivo `.env`:

```env
# OAuth Configuration
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback

GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

## Configuración de GitHub OAuth

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Haz clic en "New OAuth App"
3. Completa los campos:
   - **Application name**: Tribe - Red Social para Desarrolladores
   - **Homepage URL**: `http://localhost:8000`
   - **Authorization callback URL**: `http://localhost:8000/auth/github/callback`
4. Copia el **Client ID** y **Client Secret**
5. Pégalos en tu archivo `.env`

## Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Configura:
   - **Tipo de aplicación**: Aplicación web
   - **Nombre**: Tribe
   - **Orígenes autorizados**: `http://localhost:8000`
   - **URI de redirección autorizados**: `http://localhost:8000/auth/google/callback`
6. Copia el **Client ID** y **Client Secret**
7. Pégalos en tu archivo `.env`

## Scopes Solicitados

### GitHub
- `user:email` - Acceso al email del usuario
- `read:user` - Información básica del perfil

### Google
- `openid` - Identificación OpenID
- `profile` - Información del perfil
- `email` - Dirección de email

## Notas Importantes

- Asegúrate de que las URLs de callback coincidan exactamente
- Para producción, cambia `localhost:8000` por tu dominio real
- Mantén tus client secrets seguros y nunca los commits al repositorio
- Los usuarios pueden desconectar sus cuentas sociales desde configuraciones 
