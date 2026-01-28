<?php
/**
 * Versión simplificada del envío de emails
 * Usa solo la función mail() de PHP
 * Ideal para servidores con configuración básica
 */

// Solo acepta peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

// Configuración
$destinatario = 'contacto@dymsac.com';
$asunto_prefix = 'Contacto Web DYM SAC - ';

// Función para limpiar datos
function limpiar_dato($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

// Obtener y limpiar datos
$nombre = isset($_POST['name']) ? limpiar_dato($_POST['name']) : '';
$email = isset($_POST['email']) ? limpiar_dato($_POST['email']) : '';
$telefono = isset($_POST['phone']) ? limpiar_dato($_POST['phone']) : '';
$servicio = isset($_POST['service']) ? limpiar_dato($_POST['service']) : '';
$mensaje = isset($_POST['message']) ? limpiar_dato($_POST['message']) : '';

// Validación básica
$errores = [];

if (empty($nombre) || strlen($nombre) < 3) {
    $errores[] = 'El nombre debe tener al menos 3 caracteres';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'Debe proporcionar un email válido';
}

if (empty($mensaje) || strlen($mensaje) < 10) {
    $errores[] = 'El mensaje debe tener al menos 10 caracteres';
}

// Protección anti-spam básica
$palabras_spam = ['viagra', 'casino', 'porn', 'sex', 'xxx'];
$texto_completo = strtolower($nombre . ' ' . $mensaje);
foreach ($palabras_spam as $palabra) {
    if (strpos($texto_completo, $palabra) !== false) {
        $errores[] = 'El mensaje contiene contenido no permitido';
        break;
    }
}

// Si hay errores, volver al formulario
if (!empty($errores)) {
    $_SESSION['errores'] = $errores;
    $_SESSION['form_data'] = $_POST;
    header('Location: index.html#contacto');
    exit;
}

// Mapeo de servicios
$servicios_map = [
    'web' => 'Desarrollo Web',
    'mobile' => 'Aplicaciones Móviles',
    'cloud' => 'Soluciones Cloud',
    'ai' => 'Inteligencia Artificial',
    'consulting' => 'Consultoría Tecnológica',
    'security' => 'Seguridad Informática'
];

$servicio_texto = isset($servicios_map[$servicio]) ? $servicios_map[$servicio] : 'Consulta General';
$asunto = $asunto_prefix . $servicio_texto;

// Construir el mensaje
$mensaje_email = "
===========================================
NUEVO MENSAJE DE CONTACTO
===========================================

Fecha: " . date('d/m/Y H:i:s') . "

DATOS DEL CLIENTE:
------------------
Nombre: $nombre
Email: $email
Teléfono: " . ($telefono ? $telefono : 'No proporcionado') . "
Servicio de interés: $servicio_texto

MENSAJE:
--------
$mensaje

===========================================
Este mensaje fue enviado desde el formulario
de contacto de dymsac.com
===========================================
";

// Headers del email
$headers = "From: DYM SAC Web <noreply@dymsac.com>\r\n";
$headers .= "Reply-To: $nombre <$email>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Intentar enviar el email
$enviado = @mail($destinatario, $asunto, $mensaje_email, $headers);

if ($enviado) {
    // Redirigir con mensaje de éxito
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mensaje Enviado - DYM SAC</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                text-align: center;
            }
            .icon {
                width: 80px;
                height: 80px;
                background: #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                animation: scaleIn 0.5s ease;
            }
            .checkmark {
                width: 40px;
                height: 40px;
                border: 4px solid white;
                border-radius: 50%;
                border-top-color: transparent;
                animation: checkmark 0.6s ease forwards;
            }
            @keyframes scaleIn {
                from { transform: scale(0); }
                to { transform: scale(1); }
            }
            @keyframes checkmark {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            h1 {
                color: #0f172a;
                margin-bottom: 1rem;
                font-size: 2rem;
            }
            p {
                color: #64748b;
                line-height: 1.7;
                margin-bottom: 2rem;
            }
            .btn {
                display: inline-block;
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: transform 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">
                <div class="checkmark"></div>
            </div>
            <h1>¡Mensaje Enviado!</h1>
            <p>
                Gracias por contactarnos, <strong><?php echo htmlspecialchars($nombre); ?></strong>.
                Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.
            </p>
            <p style="font-size: 0.9rem; color: #94a3b8;">
                Te responderemos a: <strong><?php echo htmlspecialchars($email); ?></strong>
            </p>
            <a href="index.html" class="btn">Volver al Sitio</a>
        </div>
    </body>
    </html>
    <?php
} else {
    // Error al enviar
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - DYM SAC</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                text-align: center;
            }
            .icon {
                width: 80px;
                height: 80px;
                background: #ef4444;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 3rem;
                color: white;
            }
            h1 {
                color: #0f172a;
                margin-bottom: 1rem;
                font-size: 2rem;
            }
            p {
                color: #64748b;
                line-height: 1.7;
                margin-bottom: 1.5rem;
            }
            .contact-info {
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 2rem;
                text-align: left;
            }
            .contact-info p {
                margin-bottom: 0.5rem;
            }
            .contact-info strong {
                color: #0066cc;
            }
            .btn {
                display: inline-block;
                padding: 1rem 2rem;
                background: #0066cc;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: transform 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">✕</div>
            <h1>Error al Enviar</h1>
            <p>
                Lo sentimos, hubo un problema al enviar tu mensaje.
                Por favor, intenta de nuevo o contáctanos directamente.
            </p>
            <div class="contact-info">
                <p><strong>Email:</strong> contacto@dymsac.com</p>
                <p><strong>Teléfono:</strong> +51 (64) 123-4567</p>
                <p><strong>Ubicación:</strong> Huancayo, Junín - Perú</p>
            </div>
            <a href="index.html#contacto" class="btn">Volver al Formulario</a>
        </div>
    </body>
    </html>
    <?php
}
?>
