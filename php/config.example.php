<?php
/**
 * Archivo de configuración para DYM SAC
 *
 * IMPORTANTE:
 * 1. Copia este archivo como "config.php"
 * 2. Completa los datos reales de tu servidor SMTP
 * 3. NO compartas este archivo en repositorios públicos
 */

// Configuración de Email
define('SMTP_HOST', 'smtp.gmail.com');          // Servidor SMTP (Gmail, Outlook, etc.)
define('SMTP_PORT', 587);                        // Puerto SMTP (587 para TLS, 465 para SSL)
define('SMTP_SECURE', 'tls');                    // Tipo de encriptación: 'tls' o 'ssl'
define('SMTP_USERNAME', 'tu-email@gmail.com');   // Tu email completo
define('SMTP_PASSWORD', 'tu-contraseña-app');    // Contraseña de aplicación (no tu contraseña normal)

// Configuración de Destinatarios
define('EMAIL_DESTINO', 'contacto@dymsac.com');  // Email donde recibirás los mensajes
define('EMAIL_REMITENTE', 'noreply@dymsac.com'); // Email que aparecerá como remitente
define('NOMBRE_EMPRESA', 'DYM SAC');             // Nombre de tu empresa

// Configuración del Sitio
define('SITIO_URL', 'http://localhost/pag_dym'); // URL de tu sitio
define('SITIO_NOMBRE', 'DYM SAC');               // Nombre del sitio

// Configuración de Seguridad
define('ENABLE_RECAPTCHA', false);               // Habilitar Google reCAPTCHA (true/false)
define('RECAPTCHA_SITE_KEY', '');                // Tu site key de reCAPTCHA
define('RECAPTCHA_SECRET_KEY', '');              // Tu secret key de reCAPTCHA

// Configuración de Rate Limiting (límite de envíos)
define('MAX_EMAILS_PER_HOUR', 10);               // Máximo de emails por hora desde una IP
define('MAX_EMAILS_PER_DAY', 50);                // Máximo de emails por día desde una IP

// Modo Debug
define('DEBUG_MODE', false);                     // true para ver errores, false en producción

/**
 * NOTAS IMPORTANTES:
 *
 * Para Gmail:
 * 1. Ve a https://myaccount.google.com/security
 * 2. Activa la verificación en 2 pasos
 * 3. Ve a "Contraseñas de aplicaciones"
 * 4. Genera una contraseña para "Correo"
 * 5. Usa esa contraseña en SMTP_PASSWORD
 *
 * Para Outlook/Hotmail:
 * SMTP_HOST: smtp.office365.com
 * SMTP_PORT: 587
 * SMTP_SECURE: tls
 *
 * Para otros proveedores:
 * Consulta la documentación de tu proveedor de email
 */
?>
