// Animated Logo Tagline
const logoTagline = document.querySelector('.logo-tagline');
if (logoTagline) {
    const text = logoTagline.textContent;
    logoTagline.innerHTML = '';

    const chars = text.split('');
    chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.animationDelay = `${index * 0.08}s`;
        span.style.animationIterationCount = 'infinite';
        span.style.animationDuration = `${chars.length * 0.08 + 3}s`;
        logoTagline.appendChild(span);
    });
}

// Preloader
const preloader = document.getElementById('preloader');
if (preloader) {
    document.body.classList.add('preloader-active');
    window.addEventListener('load', () => {
        const minimumDisplay = 4000;
        setTimeout(() => {
            preloader.classList.add('hide');
            document.body.classList.remove('preloader-active');
            document.body.classList.add('page-ready');
        }, minimumDisplay);
    });
}

// Binary logo fill
const binaryTextBlocks = document.querySelectorAll('.binary-text');
if (binaryTextBlocks.length) {
    const lines = 80;
    const lineLength = 120;
    const buildLine = () => Array.from({ length: lineLength }, () => (Math.random() > 0.5 ? '1' : '0')).join('');
    const buildBlock = () => Array.from({ length: lines }, buildLine).join('\n');
    binaryTextBlocks.forEach(block => {
        block.textContent = buildBlock();
    });
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.setAttribute('aria-pressed', 'true');
        themeToggle.setAttribute('aria-label', 'Activar tema claro');
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', isDark ? 'Activar tema claro' : 'Activar tema oscuro');
    });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Form submission
const contactForm = document.getElementById('contactForm');
const submitButton = contactForm.querySelector('button[type="submit"]');
const originalButtonText = submitButton.textContent;

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Deshabilitar el botón durante el envío
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    // Crear FormData del formulario
    const formData = new FormData(contactForm);

    try {
        const response = await fetch('php/send_email.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Mostrar mensaje de éxito
            showMessage('¡Gracias por contactarnos! Te responderemos pronto.', 'success');
            contactForm.reset();
        } else {
            // Mostrar mensaje de error
            let errorMessage = data.message;
            if (data.errors && data.errors.length > 0) {
                errorMessage += '\n- ' + data.errors.join('\n- ');
            }
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o contáctanos directamente.', 'error');
    } finally {
        // Rehabilitar el botón
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});

// Función para mostrar mensajes
function showMessage(message, type) {
    // Crear el elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-notification ${type}`;
    messageDiv.textContent = message;

    // Agregar estilos dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        .message-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1.5rem 2rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        }

        .message-notification.success {
            background: #10b981;
            color: white;
        }

        .message-notification.error {
            background: #ef4444;
            color: white;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;

    if (!document.getElementById('message-notification-styles')) {
        style.id = 'message-notification-styles';
        document.head.appendChild(style);
    }

    // Agregar al DOM
    document.body.appendChild(messageDiv);

    // Eliminar después de 5 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 5000);
}

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;

    console.log('Newsletter subscription:', email);
    alert('¡Gracias por suscribirte a nuestro newsletter!');
    newsletterForm.reset();
});

// Intersection Observer for scroll animations

// Section reveal transitions
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    entry.target.classList.add('is-visible');
                });
            });
        } else {
            entry.target.classList.remove('is-visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -120px 0px' });

const revealTargets = document.querySelectorAll(
    '.reveal, .reveal-slide-left, .reveal-slide-right, .reveal-scale, .reveal-wipe, .section-header, .hero-content, .about-text, .about-image, .contact-info, .contact-form, .footer-content, .footer-bottom'
);

revealTargets.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// Ensure above-the-fold reveals still animate after initial paint
window.addEventListener('load', () => {
    setTimeout(() => {
        revealTargets.forEach(el => {
            if (el.classList.contains('is-visible')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                el.classList.add('is-visible');
            }
        });
    }, 120);
});

// Counter animation for stats
const animateCounter = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16);
    const isPercentage = element.textContent.includes('%');
    const hasPlus = element.textContent.includes('+');

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (isPercentage ? '%' : '') + (hasPlus ? '+' : '');
    }, 16);
};

// Observe stats for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const number = entry.target.querySelector('.stat-number');
            const text = number.textContent;
            const target = parseInt(text.replace(/\D/g, ''));

            animateCounter(number, target);
            entry.target.classList.add('counted');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// Active navigation link based on scroll position
const sections = document.querySelectorAll('section[id]');

const highlightNavigation = () => {
    const scrollY = window.pageYOffset;
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    // Si estamos en el top de la página, activar "inicio"
    if (scrollY < 300) {
        currentSection = 'inicio';
    }

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
};

// Ejecutar al cargar la página
window.addEventListener('load', highlightNavigation);
window.addEventListener('scroll', highlightNavigation);

// Add CSS for active nav link
const style = document.createElement('style');
style.textContent = `
    .nav-menu a.active {
        color: var(--primary-color);
        position: relative;
    }

    .nav-menu a.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--gradient);
    }
`;
document.head.appendChild(style);

// Service Modal Functionality
const serviceModal = document.getElementById('serviceModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');

// Contenido de los modales para cada servicio
const serviceContent = {
    web: {
        title: 'Desarrollo Web',
        subtitle: 'Creamos aplicaciones web modernas, escalables y adaptadas a tus necesidades',
        description: 'Desarrollamos soluciones web personalizadas que se ajustan perfectamente a tu negocio. Desde sistemas de gestión empresarial hasta plataformas de comercio electrónico.',
        features: [
            {
                title: 'Desarrollo Frontend',
                description: 'Interfaces de usuario modernas y responsive utilizando React, Vue.js, Angular y las últimas tecnologías web.'
            },
            {
                title: 'Desarrollo Backend',
                description: 'APIs robustas y escalables con Node.js, Python (Django/Flask), PHP (Laravel), y bases de datos SQL/NoSQL.'
            },
            {
                title: 'Diseño Responsive',
                description: 'Aplicaciones que funcionan perfectamente en cualquier dispositivo: desktop, tablet y móvil.'
            }
        ],
        solutions: [
            'Sistemas de gestión para hoteles (reservas, check-in/out, facturación)',
            'Software para control de inventarios en bodegas',
            'Plataformas administrativas para ferreterías',
            'E-commerce y tiendas virtuales',
            'Sistemas de gestión empresarial (ERP)',
            'Portales web corporativos',
            'Dashboards y paneles de control',
            'Intranets empresariales'
        ]
    },
    mobile: {
        title: 'Aplicaciones Móviles',
        subtitle: 'Apps nativas e híbridas para iOS y Android con experiencia excepcional',
        description: 'Desarrollamos aplicaciones móviles que conectan tu negocio con tus clientes. Apps personalizadas para cualquier sector empresarial.',
        features: [
            {
                title: 'Apps Nativas',
                description: 'Desarrollo nativo para iOS (Swift) y Android (Kotlin) con máximo rendimiento y acceso completo a funcionalidades del dispositivo.'
            },
            {
                title: 'Apps Híbridas',
                description: 'Desarrollo con React Native y Flutter para crear apps multiplataforma con una única base de código.'
            },
            {
                title: 'UI/UX Design',
                description: 'Diseño de interfaces intuitivas y atractivas siguiendo las mejores prácticas de cada plataforma.'
            }
        ],
        solutions: [
            'Apps de gestión de inventarios para almacenes',
            'Aplicaciones de punto de venta móvil',
            'Apps de delivery y logística',
            'Aplicaciones de reservas para hoteles',
            'Apps de catálogo de productos para negocios',
            'Sistemas de pedidos móviles',
            'Apps de gestión de clientes (CRM móvil)',
            'Aplicaciones de fidelización'
        ]
    },
    cloud: {
        title: 'Soluciones Cloud',
        subtitle: 'Infraestructura escalable y confiable en la nube',
        description: 'Migramos y optimizamos tu infraestructura tecnológica en plataformas cloud líderes, garantizando disponibilidad, seguridad y escalabilidad.',
        features: [
            {
                title: 'Migración a la Nube',
                description: 'Planificación y ejecución de migraciones seguras de tus sistemas actuales a AWS, Azure o Google Cloud.'
            },
            {
                title: 'DevOps & CI/CD',
                description: 'Automatización de despliegues, integración continua y entrega continua para mayor agilidad en el desarrollo.'
            },
            {
                title: 'Arquitectura Cloud-Native',
                description: 'Diseño de aplicaciones modernas aprovechando servicios como contenedores, serverless y microservicios.'
            }
        ],
        solutions: [
            'Hosting escalable para aplicaciones empresariales',
            'Bases de datos en la nube con alta disponibilidad',
            'Almacenamiento seguro de archivos y backups',
            'Infraestructura para sistemas de hoteles en múltiples sedes',
            'Sincronización de inventarios multi-sucursal',
            'Servidores de aplicaciones con auto-escalado',
            'Balanceo de carga y CDN',
            'Disaster recovery y continuidad de negocio'
        ]
    },
    ai: {
        title: 'Inteligencia Artificial',
        subtitle: 'Automatización inteligente y análisis predictivo para tu negocio',
        description: 'Implementamos soluciones de IA y Machine Learning que automatizan procesos, predicen tendencias y mejoran la toma de decisiones.',
        features: [
            {
                title: 'Machine Learning',
                description: 'Modelos de aprendizaje automático para clasificación, predicción y reconocimiento de patrones en tus datos.'
            },
            {
                title: 'Análisis Predictivo',
                description: 'Predicción de demanda, forecast de ventas, detección de anomalías y optimización de inventarios.'
            },
            {
                title: 'Procesamiento de Lenguaje Natural',
                description: 'Chatbots inteligentes, análisis de sentimientos, clasificación automática de documentos y asistentes virtuales.'
            }
        ],
        solutions: [
            'Predicción de demanda para control de inventarios en bodegas',
            'Chatbots para atención al cliente en hoteles',
            'Recomendación de productos en ferreterías',
            'Análisis de ventas y patrones de compra',
            'Detección de fraudes y anomalías',
            'Optimización de precios dinámicos',
            'Clasificación automática de productos',
            'Análisis de comentarios de clientes'
        ]
    },
    consulting: {
        title: 'Consultoría Tecnológica',
        subtitle: 'Asesoría estratégica para tu transformación digital',
        description: 'Te ayudamos a definir la mejor estrategia tecnológica para tu negocio, optimizar procesos y maximizar el retorno de inversión en tecnología.',
        features: [
            {
                title: 'Auditoría Tecnológica',
                description: 'Evaluación completa de tu infraestructura actual, identificación de problemas y oportunidades de mejora.'
            },
            {
                title: 'Planificación Estratégica',
                description: 'Definición de roadmap tecnológico alineado con los objetivos de tu negocio.'
            },
            {
                title: 'Optimización de Procesos',
                description: 'Automatización y mejora de procesos empresariales mediante tecnología adecuada.'
            }
        ],
        solutions: [
            'Evaluación de sistemas actuales en hoteles y propuestas de mejora',
            'Optimización de procesos de inventario en bodegas',
            'Digitalización de procesos en ferreterías',
            'Selección de tecnologías adecuadas para cada negocio',
            'Diseño de arquitecturas de software escalables',
            'Evaluación de seguridad y cumplimiento normativo',
            'Capacitación de equipos técnicos',
            'Definición de estrategias de transformación digital'
        ]
    },
    security: {
        title: 'Seguridad Informática',
        subtitle: 'Protección integral para tus sistemas y datos',
        description: 'Aseguramos tus sistemas, aplicaciones y datos mediante las mejores prácticas de seguridad, auditorías y cumplimiento normativo.',
        features: [
            {
                title: 'Auditorías de Seguridad',
                description: 'Evaluación exhaustiva de vulnerabilidades en tus aplicaciones, redes e infraestructura.'
            },
            {
                title: 'Pentesting',
                description: 'Pruebas de penetración éticas para identificar y corregir vulnerabilidades antes de que sean explotadas.'
            },
            {
                title: 'Cumplimiento Normativo',
                description: 'Aseguramiento del cumplimiento de normativas como GDPR, ISO 27001, PCI-DSS según tu industria.'
            }
        ],
        solutions: [
            'Protección de datos de clientes en sistemas hoteleros',
            'Seguridad en transacciones de e-commerce',
            'Control de acceso y autenticación de usuarios',
            'Encriptación de datos sensibles',
            'Protección contra ataques DDoS',
            'Monitoreo de seguridad 24/7',
            'Backups seguros y recuperación de desastres',
            'Auditorías de cumplimiento GDPR'
        ]
    }
};

// Función para abrir el modal
function openServiceModal(serviceType) {
    const content = serviceContent[serviceType];
    if (!content) return;

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${content.title}</h2>
            <p>${content.subtitle}</p>
        </div>
        <div class="modal-body">
            <div class="modal-section">
                <p>${content.description}</p>
            </div>

            <div class="modal-section">
                <h3>¿Qué incluye este servicio?</h3>
                <div class="modal-features">
                    ${content.features.map(feature => `
                        <div class="modal-feature-item">
                            <h4>${feature.title}</h4>
                            <p>${feature.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="modal-section">
                <h3>Soluciones que desarrollamos</h3>
                <ul class="modal-list">
                    ${content.solutions.map(solution => `<li>${solution}</li>`).join('')}
                </ul>
            </div>

            <div class="modal-cta">
                <h3>¿Listo para empezar?</h3>
                <p>Contáctanos y platiquemos sobre cómo podemos ayudarte con tu proyecto</p>
                <a href="#contacto" class="btn btn-primary" onclick="closeServiceModal()">Solicitar Cotización</a>
            </div>
        </div>
    `;

    serviceModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal
function closeServiceModal() {
    serviceModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners para los botones de servicio
document.querySelectorAll('.service-card').forEach(card => {
    const button = card.querySelector('.btn-service-more');
    if (button) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const serviceType = card.getAttribute('data-service');
            openServiceModal(serviceType);
        });
    }
});

// Cerrar modal al hacer click en X
modalClose.addEventListener('click', closeServiceModal);

// Cerrar modal al hacer click fuera del contenido
serviceModal.addEventListener('click', (e) => {
    if (e.target === serviceModal) {
        closeServiceModal();
    }
});

// Cerrar modal con la tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && serviceModal.classList.contains('active')) {
        closeServiceModal();
    }
});
