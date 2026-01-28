# DYM SAC - Sitio Web Corporativo

Página web profesional para DYM SAC, empresa de desarrollo de software y consultoría tecnológica en Huancayo, Junín - Perú.

## Características

- Diseño moderno y responsive
- Colores corporativos azul profesional
- Formulario de contacto funcional con envío de emails
- Secciones: Inicio, Servicios, Nosotros, Proyectos, Contacto
- Animaciones suaves y efectos visuales
- Compatible con todos los navegadores modernos

## Estructura de Archivos

```
pag_dym/
├── index.html                      # Página principal
├── styles.css                      # Estilos CSS
├── script.js                       # JavaScript interactivo
├── send_email.php                  # Script PHP para envío de emails
├── logo_general-removebg-preview.png  # Logo de la empresa
└── README.md                       # Este archivo
```

## Requisitos

- Servidor web (Apache, Nginx, etc.)
- PHP 7.0 o superior
- Configuración de correo en el servidor (función `mail()` de PHP)

## Instalación

1. **Copia los archivos** al directorio de tu servidor web (ej: `htdocs` para XAMPP)

2. **Configura el servidor de correo** para que PHP pueda enviar emails:

### En XAMPP (Windows):

Edita el archivo `php.ini`:
```ini
[mail function]
SMTP = smtp.gmail.com
smtp_port = 587
sendmail_from = tu-email@gmail.com
sendmail_path = "\"C:\xampp\sendmail\sendmail.exe\" -t"
```

Edita el archivo `sendmail.ini` (en `C:\xampp\sendmail\`):
```ini
[sendmail]
smtp_server=smtp.gmail.com
smtp_port=587
auth_username=tu-email@gmail.com
auth_password=tu-contraseña-de-aplicacion
force_sender=tu-email@gmail.com
```

**Nota:** Para Gmail, necesitas crear una "Contraseña de aplicación" en tu cuenta de Google.

### En Linux (con servidor de correo instalado):

PHP usará el comando `sendmail` del sistema. Asegúrate de tener configurado Postfix o Sendmail.

3. **Personaliza el email de destino** en `send_email.php`:

```php
$destinatario = 'contacto@dymsac.com'; // Cambia por tu email real
```

4. **Prueba el sitio**: Abre `http://localhost/pag_dym/` en tu navegador

## Configuración del Formulario de Contacto

El formulario envía emails a través de PHP. Cuando un usuario completa el formulario:

1. Los datos se validan en el servidor
2. Se envía un email a `contacto@dymsac.com` con la información
3. Se envía un email de confirmación automática al usuario
4. Se muestra un mensaje de éxito o error

### Personalización

Puedes modificar los textos de los emails en el archivo `send_email.php`:

- **Email principal**: Busca la variable `$cuerpo_html`
- **Email de confirmación**: Busca la variable `$confirmacion_cuerpo`

## Actualizar Contenido

### Cambiar textos:
Edita el archivo `index.html` y busca las secciones que desees modificar.

### Cambiar colores:
Edita el archivo `styles.css` y modifica las variables CSS al inicio:
```css
:root {
    --primary-color: #0066cc;  /* Color principal */
    --primary-dark: #004c99;   /* Color oscuro */
    --secondary-color: #0099ff; /* Color secundario */
}
```

### Cambiar imágenes:
Reemplaza el archivo `logo_general-removebg-preview.png` con tu nuevo logo.

### Agregar proyectos:
En `index.html`, busca la sección `<section id="proyectos">` y duplica el código de `.project-card`.

### Modificar servicios:
En `index.html`, busca la sección `<section id="servicios">` y edita los `.service-card`.

## Datos de Contacto Actuales

- **Email:** contacto@dymsac.com
- **Teléfono:** +51 (64) 123-4567
- **Ubicación:** Huancayo, Junín - Perú

Para cambiar estos datos, busca y reemplaza en `index.html` y `send_email.php`.

## Solución de Problemas

### El formulario no envía emails:

1. Verifica que PHP esté configurado correctamente para enviar emails
2. Revisa los logs de PHP en `xampp/php/logs/php_error_log`
3. Asegúrate de que el servidor SMTP esté correctamente configurado
4. Verifica que el email de destino sea válido

### Los estilos no se ven correctamente:

1. Asegúrate de que todos los archivos estén en la misma carpeta
2. Limpia la caché del navegador (Ctrl + Shift + R)
3. Verifica que el archivo `styles.css` se haya cargado correctamente

### El menú móvil no funciona:

1. Verifica que el archivo `script.js` esté cargado correctamente
2. Abre la consola del navegador (F12) y busca errores
3. Asegúrate de tener conexión a internet (se usan fuentes de Google)

## Alternativas para el Envío de Emails

Si tienes problemas con la función `mail()` de PHP, considera usar:

### 1. PHPMailer (Recomendado)

```bash
composer require phpmailer/phpmailer
```

Es más confiable y soporta SMTP con autenticación.

### 2. Servicios de Email API

- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/
- **Amazon SES**: https://aws.amazon.com/ses/

### 3. Formspree (sin backend)

Cambia el `action` del formulario a Formspree:
```html
<form action="https://formspree.io/f/tu-form-id" method="POST">
```

## Próximos Pasos

1. **Dominio propio**: Registra un dominio (ej: dymsac.com)
2. **Hosting profesional**: Contrata un hosting con soporte PHP y email
3. **SSL/HTTPS**: Instala un certificado SSL (gratis con Let's Encrypt)
4. **Google Analytics**: Agrega seguimiento de visitantes
5. **SEO**: Optimiza meta tags y contenido para buscadores
6. **Blog**: Agrega una sección de blog para contenido
7. **Portfolio real**: Reemplaza los proyectos de ejemplo con casos reales

## Soporte

Si necesitas ayuda o quieres agregar más funcionalidades, contacta con tu desarrollador web.

## Licencia

Este proyecto es propiedad de DYM SAC. Todos los derechos reservados.
