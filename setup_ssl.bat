@echo off
echo Configurando SSL para PHP...

REM Configurar variables de entorno para SSL
set CURL_CA_BUNDLE=C:\tools\php84\cacert.pem
set SSL_CERT_FILE=C:\tools\php84\cacert.pem

echo Variables de entorno configuradas:
echo CURL_CA_BUNDLE=%CURL_CA_BUNDLE%
echo SSL_CERT_FILE=%SSL_CERT_FILE%

echo.
echo Iniciando servidor Laravel con configuración SSL...
php artisan serve