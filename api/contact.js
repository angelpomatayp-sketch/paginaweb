const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

globalThis.dymContactAttempts ??= new Map();

function sendJson(response, status, payload, extraHeaders = {}) {
    Object.entries(extraHeaders).forEach(([name, value]) => response.setHeader(name, value));
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return response.status(status).json(payload);
}

function cleanText(value, maxLength) {
    return String(value ?? '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
    })[character]);
}

function isRateLimited(ipAddress) {
    const now = Date.now();
    const recentAttempts = (globalThis.dymContactAttempts.get(ipAddress) || [])
        .filter((timestamp) => timestamp > now - WINDOW_MS);

    if (recentAttempts.length >= MAX_REQUESTS) {
        globalThis.dymContactAttempts.set(ipAddress, recentAttempts);
        return true;
    }

    recentAttempts.push(now);
    globalThis.dymContactAttempts.set(ipAddress, recentAttempts);
    return false;
}

module.exports = async function contactHandler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return sendJson(response, 405, { success: false, message: 'Método no permitido.' });
    }

    const requestOrigin = request.headers.origin;
    const requestHost = request.headers.host;
    if (requestOrigin) {
        try {
            if (new URL(requestOrigin).host !== requestHost) {
                return sendJson(response, 403, { success: false, message: 'Origen no autorizado.' });
            }
        } catch {
            return sendJson(response, 403, { success: false, message: 'Origen no válido.' });
        }
    }

    let body = request.body || {};
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return sendJson(response, 400, { success: false, message: 'Solicitud no válida.' });
        }
    }

    if (cleanText(body.company_website, 200)) {
        return sendJson(response, 200, { success: true, message: 'Mensaje recibido.' });
    }

    const name = cleanText(body.name, 100).replace(/[\r\n]+/g, ' ');
    const email = cleanText(body.email, 254).toLowerCase();
    const phone = cleanText(body.phone, 25);
    const service = cleanText(body.service, 30);
    const message = cleanText(body.message, 3000);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+()\s-]{7,25}$/;
    const services = {
        web: 'Desarrollo Web',
        mobile: 'Aplicaciones Móviles',
        cloud: 'Soluciones Cloud',
        ai: 'Inteligencia Artificial',
        consulting: 'Consultoría Tecnológica',
        security: 'Seguridad Informática'
    };
    const errors = [];

    if (name.length < 3) errors.push('El nombre debe tener al menos 3 caracteres.');
    if (!emailPattern.test(email)) errors.push('El correo electrónico no es válido.');
    if (phone && !phonePattern.test(phone)) errors.push('El teléfono no tiene un formato válido.');
    if (service && !services[service]) errors.push('El servicio seleccionado no es válido.');
    if (message.length < 10) errors.push('El mensaje debe tener al menos 10 caracteres.');

    if (errors.length) {
        return sendJson(response, 400, { success: false, message: 'Revisa los datos ingresados.', errors });
    }

    const forwardedFor = request.headers['x-forwarded-for'];
    const ipAddress = String(Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || request.socket?.remoteAddress || 'unknown')
        .split(',')[0]
        .trim();
    if (isRateLimited(ipAddress)) {
        return sendJson(
            response,
            429,
            { success: false, message: 'Has realizado varios intentos. Espera unos minutos antes de volver a enviar.' },
            { 'Retry-After': '600' }
        );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const destination = process.env.CONTACT_TO_EMAIL || 'angel.pomatay.p@gmail.com';
    const sender = process.env.RESEND_FROM_EMAIL;
    if (!resendApiKey || !sender) {
        return sendJson(response, 503, {
            success: false,
            message: 'El formulario está temporalmente en configuración. Escríbenos a angel.pomatay.p@gmail.com.'
        });
    }

    const serviceName = services[service] || 'Consulta general';
    let emailResponse;
    try {
        emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: sender,
                to: [destination],
                reply_to: email,
                subject: `Nuevo mensaje web - ${serviceName}`,
                html: `<h2>Nuevo mensaje desde DYM SAC</h2><p><strong>Nombre:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Teléfono:</strong> ${escapeHtml(phone || 'No proporcionado')}</p><p><strong>Servicio:</strong> ${escapeHtml(serviceName)}</p><p><strong>Mensaje:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
            })
        });
    } catch (error) {
        console.error('Resend request failed', error instanceof Error ? error.message : 'Unknown error');
        return sendJson(response, 502, {
            success: false,
            message: 'No pudimos enviar el mensaje. Escríbenos a angel.pomatay.p@gmail.com.'
        });
    }

    if (!emailResponse.ok) {
        console.error('Resend delivery failed', emailResponse.status);
        return sendJson(response, 502, {
            success: false,
            message: 'No pudimos enviar el mensaje. Escríbenos a angel.pomatay.p@gmail.com.'
        });
    }

    return sendJson(response, 200, {
        success: true,
        message: '¡Gracias por contactarnos! Te responderemos pronto.'
    });
};
