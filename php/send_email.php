<?php
// Configuración
header('Content-Type: application/json; charset=utf-8');

// Permitir CORS (opcional, solo si necesitas llamadas AJAX desde otro dominio)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Configuración del correo
$destinatario = 'contacto@dymsac.com'; // Email donde recibirás los mensajes
$asunto_prefix = 'Nuevo mensaje desde el sitio web - ';

// Obtener y validar datos del formulario
$nombre = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$telefono = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$servicio = isset($_POST['service']) ? trim($_POST['service']) : '';
$mensaje = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validación básica
$errores = [];

if (empty($nombre)) {
    $errores[] = 'El nombre es requerido';
}

if (empty($email)) {
    $errores[] = 'El email es requerido';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'El email no es válido';
}

if (empty($mensaje)) {
    $errores[] = 'El mensaje es requerido';
}

// Si hay errores, retornar
if (!empty($errores)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Por favor corrige los siguientes errores:',
        'errors' => $errores
    ]);
    exit;
}

// Preparar el asunto
$servicios = [
    'web' => 'Desarrollo Web',
    'mobile' => 'Aplicaciones Móviles',
    'cloud' => 'Soluciones Cloud',
    'ai' => 'Inteligencia Artificial',
    'consulting' => 'Consultoría Tecnológica',
    'security' => 'Seguridad Informática'
];

$servicio_nombre = isset($servicios[$servicio]) ? $servicios[$servicio] : 'Consulta General';
$asunto = $asunto_prefix . $servicio_nombre;

// Preparar el cuerpo del correo en HTML
$cuerpo_html = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
        .field-label { font-weight: bold; color: #0066cc; margin-bottom: 5px; }
        .field-value { color: #333; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Nuevo Mensaje de Contacto</h2>
            <p>DYM SAC - Sitio Web</p>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='field-label'>Nombre:</div>
                <div class='field-value'>" . htmlspecialchars($nombre) . "</div>
            </div>
            <div class='field'>
                <div class='field-label'>Email:</div>
                <div class='field-value'>" . htmlspecialchars($email) . "</div>
            </div>
            " . (!empty($telefono) ? "
            <div class='field'>
                <div class='field-label'>Teléfono:</div>
                <div class='field-value'>" . htmlspecialchars($telefono) . "</div>
            </div>
            " : "") . "
            <div class='field'>
                <div class='field-label'>Servicio de Interés:</div>
                <div class='field-value'>" . htmlspecialchars($servicio_nombre) . "</div>
            </div>
            <div class='field'>
                <div class='field-label'>Mensaje:</div>
                <div class='field-value'>" . nl2br(htmlspecialchars($mensaje)) . "</div>
            </div>
            <div class='footer'>
                <p>Este mensaje fue enviado desde el formulario de contacto de dymsac.com</p>
                <p>Fecha: " . date('d/m/Y H:i:s') . "</p>
            </div>
        </div>
    </div>
</body>
</html>
";

// Preparar el cuerpo del correo en texto plano (alternativa)
$cuerpo_texto = "
Nuevo mensaje de contacto desde DYM SAC

Nombre: $nombre
Email: $email
" . (!empty($telefono) ? "Teléfono: $telefono\n" : "") . "
Servicio de Interés: $servicio_nombre

Mensaje:
$mensaje

---
Este mensaje fue enviado desde el formulario de contacto de dymsac.com
Fecha: " . date('d/m/Y H:i:s') . "
";

// Configurar los headers del correo
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=utf-8';
$headers[] = 'From: DYM SAC Web <noreply@dymsac.com>';
$headers[] = 'Reply-To: ' . $nombre . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

// Intentar enviar el correo
$enviado = mail($destinatario, $asunto, $cuerpo_html, implode("\r\n", $headers));

// Responder según el resultado
if ($enviado) {
    // Email de confirmación al cliente (opcional)
    $confirmacion_asunto = 'Gracias por contactar a DYM SAC';
    $confirmacion_cuerpo = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>¡Gracias por contactarnos!</h2>
            </div>
            <div class='content'>
                <p>Hola <strong>" . htmlspecialchars($nombre) . "</strong>,</p>
                <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.</p>
                <p>Nuestro equipo revisará tu consulta sobre <strong>" . htmlspecialchars($servicio_nombre) . "</strong> y te responderá a la brevedad.</p>
                <p>Si tienes alguna pregunta urgente, no dudes en llamarnos al <strong>+51 (64) 123-4567</strong>.</p>
                <br>
                <p>Saludos cordiales,<br><strong>Equipo DYM SAC</strong></p>
                <p style='margin-top: 20px; font-size: 12px; color: #666;'>
                    Huancayo, Junín - Perú<br>
                    contacto@dymsac.com<br>
                    +51 (64) 123-4567
                </p>
            </div>
        </div>
    </body>
    </html>
    ";

    $confirmacion_headers = [];
    $confirmacion_headers[] = 'MIME-Version: 1.0';
    $confirmacion_headers[] = 'Content-type: text/html; charset=utf-8';
    $confirmacion_headers[] = 'From: DYM SAC <contacto@dymsac.com>';
    $confirmacion_headers[] = 'X-Mailer: PHP/' . phpversion();

    // Enviar email de confirmación (opcional)
    mail($email, $confirmacion_asunto, $confirmacion_cuerpo, implode("\r\n", $confirmacion_headers));

    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => '¡Gracias por contactarnos! Hemos recibido tu mensaje y te responderemos pronto.'
    ]);
} else {
    // Error al enviar
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o contáctanos directamente por teléfono.'
    ]);
}
?>
