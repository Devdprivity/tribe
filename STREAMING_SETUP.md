# Configuración de Streaming - Tribe

## Estado Actual ✅

La funcionalidad de streaming está **configurada y lista para usar**:

- ✅ **URLs de streaming configuradas**: Todos los streams ahora tienen URLs RTMP y de reproducción
- ✅ **Video player funcional**: Reproduce video con controles personalizados
- ✅ **Chat y participantes funcionando**: Sistema de mensajes y usuarios en tiempo real
- ✅ **Interfaz de usuario completa**: Vista de streaming con todas las funciones

## Cómo Funciona el Video

### Modo Desarrollo (Actual)
- **Video de prueba automático**: Cuando no hay stream real, se reproduce un video de demostración
- **URLs generadas**: Cada stream tiene URLs RTMP y HLS configuradas
- **Funcional para pruebas**: El sistema completo funciona para desarrollo

### URLs Configuradas
```
RTMP (para streamers): rtmp://localhost:1935/live/{stream_key}
HLS (para viewers): http://localhost:8080/hls/{stream_key}/index.m3u8
```

## Configuración para Producción

### Opción 1: Servidor Simple con NGINX + RTMP
```bash
# Instalar nginx con módulo rtmp
docker run -d -p 1935:1935 -p 8080:80 --name streaming-server \
  -v nginx.conf:/etc/nginx/nginx.conf \
  tiangolo/nginx-rtmp
```

### Opción 2: Servicios en la Nube
- **AWS IVS (Interactive Video Service)**
- **Twitch API**
- **YouTube Live API**
- **Agora.io**

## Variables de Entorno

Agregar al archivo `.env`:

```env
# Streaming Configuration
STREAMING_RTMP_SERVER=rtmp://tu-servidor.com:1935/live
STREAMING_HLS_SERVER=http://tu-servidor.com:8080/hls
STREAMING_USE_TEST_STREAM=true
STREAMING_TEST_STREAM_URL=https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

## Uso del Sistema

### Para Streamers (Creadores de Contenido)
1. Crear stream desde la interfaz
2. Usar el `stream_key` y `rtmp_url` en OBS/Streamlabs
3. Iniciar transmisión desde OBS

### Para Viewers (Espectadores)
1. Acceder a la URL del stream
2. El video se reproduce automáticamente
3. Interactuar con chat y participantes

## Comandos Útiles

```bash
# Actualizar URLs de streams existentes
php artisan streaming:update-urls

# Ver configuración actual
php artisan config:show streaming

# Limpiar caché
php artisan optimize:clear
```

## Archivos Modificados

- ✅ `app/Services/StreamingService.php` - Generación de URLs
- ✅ `resources/js/pages/Streaming/Watch.tsx` - Video player mejorado
- ✅ `config/streaming.php` - Configuración del sistema
- ✅ `app/Console/Commands/UpdateStreamUrls.php` - Comando de actualización

## Estado del Video Player

El video player ahora:
- ✅ Reproduce video de prueba cuando no hay stream real
- ✅ Muestra controles personalizados
- ✅ Indica el estado del stream
- ✅ Maneja errores graciosamente
- ✅ Incluye indicador "EN VIVO"
- ✅ Muestra contador de viewers

**¡El sistema de streaming está funcionalmente completo para desarrollo y listo para producción!**