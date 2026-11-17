// Preloader
const preloader = document.getElementById('preloader');
if (preloader) {
    const preloaderStartedAt = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let bootedBefore = false;
    try {
        bootedBefore = sessionStorage.getItem('dym-booted') === '1';
        sessionStorage.setItem('dym-booted', '1');
    } catch (error) {
        bootedBefore = false;
    }
    // Primera visita: secuencia de arranque completa. Visitas siguientes: breve.
    const minimumDisplay = reduceMotion ? 100 : (bootedBefore ? 700 : 2100);
    document.documentElement.style.setProperty('--boot-ms', `${minimumDisplay}ms`);

    const hidePreloader = () => {
        const elapsed = performance.now() - preloaderStartedAt;
        const remaining = Math.max(0, minimumDisplay - elapsed);

        setTimeout(() => {
            preloader.classList.add('hide');
            preloader.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('preloader-active');
            document.body.classList.add('page-ready');
            document.dispatchEvent(new Event('dym:ready'));
            setTimeout(() => preloader.remove(), 600);
        }, remaining);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hidePreloader, { once: true });
    } else {
        hidePreloader();
    }
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const storedTheme = localStorage.getItem('theme');
const hasStoredTheme = storedTheme === 'dark' || storedTheme === 'light';

const applyTheme = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Activar tema claro' : 'Activar tema oscuro');
    }
};

applyTheme(hasStoredTheme ? storedTheme === 'dark' : systemTheme.matches);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (typeof document.startViewTransition !== 'function' || prefersReducedMotion) {
            applyTheme(isDark);
            return;
        }

        // Transición circular desde el botón de tema
        const rect = themeToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        const transition = document.startViewTransition(() => applyTheme(isDark));
        transition.ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
            );
        }).catch(() => {});
    });
}

const handleSystemThemeChange = event => {
    const currentStoredTheme = localStorage.getItem('theme');
    const hasManualPreference = currentStoredTheme === 'dark' || currentStoredTheme === 'light';

    if (!hasManualPreference) {
        applyTheme(event.matches);
    }
};

if (typeof systemTheme.addEventListener === 'function') {
    systemTheme.addEventListener('change', handleSystemThemeChange);
} else {
    systemTheme.addListener(handleSystemThemeChange);
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

const setMobileMenuState = (isOpen) => {
    if (!mobileMenuBtn || !navMenu) return;
    navMenu.classList.toggle('active', isOpen);
    mobileMenuBtn.classList.toggle('active', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
};

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        setMobileMenuState(!navMenu.classList.contains('active'));
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        setMobileMenuState(false);
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    if (!navbar) return;
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

if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        const isLocalApache = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const endpoint = isLocalApache ? 'php/send_email.php' : '/api/contact';
        const formData = new FormData(contactForm);
        const requestBody = isLocalApache
            ? formData
            : JSON.stringify(Object.fromEntries(formData.entries()));

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: isLocalApache ? undefined : { 'Content-Type': 'application/json' },
                body: requestBody
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                const details = Array.isArray(data.errors) ? `\n- ${data.errors.join('\n- ')}` : '';
                throw new Error(`${data.message || 'No se pudo enviar el mensaje.'}${details}`);
            }

            showMessage(data.message || '¡Gracias por contactarnos! Te responderemos pronto.', 'success');
            contactForm.reset();
        } catch (error) {
            showMessage(error.message || 'Hubo un error al enviar el mensaje. Escríbenos a angel.pomatay.p@gmail.com.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

// Función para mostrar mensajes
function showMessage(message, type) {
    // Crear el elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-notification ${type}`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageDiv.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

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
            white-space: pre-line;
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

// Catálogo de proyectos: comunica la solución y la necesidad sin identificar clientes.
const projects = [
    {
        title: 'Logística e Inventario Minero',
        category: 'logistics',
        type: 'Logística y compras',
        sector: 'Minería',
        need: 'Controlar stock, compras y entregas en operaciones con múltiples almacenes.',
        solution: 'Centraliza kardex valorizado, requisiciones, órdenes de compra, EPP, préstamos y reportes.',
        tags: ['Laravel', 'React', 'MySQL'],
        image: 'img/projects/logistica_minero.png',
        icon: 'inventory'
    },
    {
        title: 'Gestión de Entregas Vehiculares',
        category: 'commercial',
        type: 'Ventas y atención',
        sector: 'Automotriz',
        need: 'Coordinar entregas, asesores y turnos de atención en diferentes puntos de operación.',
        solution: 'Organiza la cola de entrega, muestra turnos en pantalla y conserva el historial de atención.',
        tags: ['PHP', 'MySQL', 'Responsive'],
        image: 'img/projects/entregas_vehiculares.png',
        icon: 'commercial'
    },
    {
        title: 'Gestión de Compras y Servicios',
        category: 'logistics',
        type: 'Logística y compras',
        sector: 'Empresarial',
        need: 'Dar trazabilidad a solicitudes, compras, servicios y aprobaciones entre distintas áreas.',
        solution: 'Conecta requerimientos, cotizaciones, órdenes y validaciones de logística, contabilidad y finanzas.',
        tags: ['Next.js', 'TypeScript', 'Prisma'],
        image: 'img/projects/gestion_compras.png',
        icon: 'procurement'
    },
    {
        title: 'Gestión de Salud Preventiva',
        category: 'sectoral',
        type: 'Sistema sectorial',
        sector: 'Salud',
        need: 'Organizar citas, historias, controles y seguimiento preventivo de pacientes.',
        solution: 'Integra perfiles, agenda, controles clínicos, reportes y trazabilidad de atenciones.',
        tags: ['PHP', 'MariaDB', 'PWA'],
        image: 'img/projects/gestion_salud.png',
        icon: 'health'
    },
    {
        title: 'Gestión Académica',
        category: 'sectoral',
        type: 'Sistema sectorial',
        sector: 'Educación',
        need: 'Centralizar estudiantes, matrículas, asistencia, calificaciones y horarios.',
        solution: 'Ofrece módulos por rol, seguimiento académico y reportes para la gestión educativa.',
        tags: ['React', 'Node.js', 'MongoDB'],
        image: 'img/projects/gestion_academica.png',
        icon: 'education'
    },
    {
        title: 'Trivia Interactiva para Tótems',
        category: 'interactive',
        type: 'Tótems y pantallas',
        sector: 'Eventos',
        need: 'Aumentar la participación del público mediante una experiencia breve y medible.',
        solution: 'Combina preguntas táctiles, registro de participantes, premios y exportación de resultados.',
        tags: ['Electron', 'React', 'SQLite'],
        image: 'img/projects/totems_interactivos.png',
        icon: 'interactive'
    },
    {
        title: 'Gestión Hotelera',
        category: 'business',
        type: 'Gestión empresarial',
        sector: 'Hotelería',
        need: 'Administrar reservas, habitaciones y atención diaria desde un solo lugar.',
        solution: 'Integra disponibilidad, check-in, check-out, consumos, facturación y reportes.',
        tags: ['Vue.js', 'PHP', 'MySQL'],
        icon: 'business'
    },
    {
        title: 'POS Multi-Tenant',
        category: 'commercial',
        type: 'Ventas y atención',
        sector: 'Comercio',
        need: 'Gestionar ventas, caja e inventario de varios negocios sin mezclar su información.',
        solution: 'Separa tiendas, usuarios y datos por organización, con control de suscripciones y reportes.',
        tags: ['PHP', 'MySQL', 'Docker'],
        icon: 'commercial'
    },
    {
        title: 'Control de Activos por Serie',
        category: 'logistics',
        type: 'Logística y compras',
        sector: 'Tecnología',
        need: 'Conocer la ubicación y el estado de cada equipo durante todo su ciclo de vida.',
        solution: 'Registra series, asignaciones, préstamos, devoluciones, mantenimiento y bajas.',
        tags: ['Laravel', 'React', 'MySQL'],
        icon: 'inventory'
    },
    {
        title: 'CRM Comercial',
        category: 'commercial',
        type: 'Ventas y atención',
        sector: 'Ventas',
        need: 'Evitar oportunidades dispersas y mejorar el seguimiento de cada prospecto.',
        solution: 'Centraliza contactos, cotizaciones, pedidos, actividades y avance del embudo comercial.',
        tags: ['React', 'Node.js', 'MySQL'],
        icon: 'commercial'
    },
    {
        title: 'Gestión de Planillas',
        category: 'business',
        type: 'Gestión empresarial',
        sector: 'Recursos humanos',
        need: 'Reducir errores y tiempo en cálculos laborales, permisos y consolidación de información.',
        solution: 'Automatiza conceptos de planilla, incidencias, permisos y reportes por periodo.',
        tags: ['Laravel', 'React', 'PostgreSQL'],
        icon: 'business'
    },
    {
        title: 'Gestión de Servicios Recurrentes',
        category: 'business',
        type: 'Gestión empresarial',
        sector: 'Servicios',
        need: 'Controlar clientes, ciclos mensuales, pagos pendientes y continuidad del servicio.',
        solution: 'Administra contratos, periodos, estados de pago, alertas y tableros de seguimiento.',
        tags: ['Laravel', 'MySQL', 'Dashboard'],
        icon: 'business'
    },
    {
        title: 'Gestor de Contenidos para Tótems',
        category: 'interactive',
        type: 'Tótems y pantallas',
        sector: 'Retail',
        need: 'Actualizar contenido en equipos remotos y mantener la experiencia aun sin conexión.',
        solution: 'Gestiona listas de reproducción, sincronización, modo offline y apertura segura de experiencias.',
        tags: ['Laravel', 'Electron', 'API'],
        icon: 'interactive'
    },
    {
        title: 'Tótem Fotográfico Interactivo',
        category: 'interactive',
        type: 'Tótems y pantallas',
        sector: 'Institucional',
        need: 'Crear una activación visual que atraiga visitantes y facilite compartir el resultado.',
        solution: 'Integra captura, composición gráfica, fondos configurables, QR y panel de administración.',
        tags: ['Electron', 'React', 'TypeScript'],
        icon: 'interactive'
    },
    {
        title: 'Gestión de Locales y Pantallas',
        category: 'interactive',
        type: 'Tótems y pantallas',
        sector: 'Retail',
        need: 'Visualizar dónde opera cada pantalla y conocer rápidamente su disponibilidad.',
        solution: 'Relaciona locales, mapas, dispositivos, contenidos y estados en un tablero central.',
        tags: ['Laravel', 'React', 'Leaflet'],
        icon: 'interactive'
    },
    {
        title: 'Plataforma de Experiencia Automotriz',
        category: 'sectoral',
        type: 'Sistema sectorial',
        sector: 'Automotriz',
        need: 'Unificar el registro de visitantes y medir su experiencia en diferentes puntos de atención.',
        solution: 'Conecta formularios, ubicaciones, encuestas, indicadores y reportes de servicio.',
        tags: ['CodeIgniter', 'MySQL', 'API'],
        icon: 'sectoral'
    },
    {
        title: 'Gestión Inteligente de Cartelería',
        category: 'interactive',
        type: 'Tótems y pantallas',
        sector: 'Cartelería digital',
        need: 'Programar contenidos y supervisar numerosas pantallas desde una operación centralizada.',
        solution: 'Controla equipos, listas, horarios, alertas e incorpora asistencia para organizar campañas.',
        tags: ['PostgreSQL', 'Dashboard', 'IA'],
        icon: 'interactive'
    },
    {
        title: 'Marketplace con Trazabilidad',
        category: 'commercial',
        type: 'Ventas y atención',
        sector: 'Comercio',
        need: 'Conectar oferta y demanda conservando información clara sobre el origen de los productos.',
        solution: 'Gestiona productores, catálogo, pedidos y trazabilidad dentro de una experiencia de compra.',
        tags: ['Node.js', 'Express', 'Prisma'],
        icon: 'commercial'
    },
    {
        title: 'ERP para Operaciones Mineras',
        category: 'business',
        type: 'Gestión empresarial',
        sector: 'Minería',
        need: 'Evitar información aislada entre operación, logística, finanzas y administración.',
        solution: 'Integra procesos y datos clave en módulos conectados con roles, controles e indicadores.',
        tags: ['Laravel', 'React', 'Inertia'],
        icon: 'business'
    }
];

const projectIcons = {
    inventory: '<path d="M4 7h16M5 7l1 13h12l1-13M9 11v5m6-5v5M8 4h8l1 3H7l1-3Z"/>',
    procurement: '<path d="M6 3h12v18H6zM9 8h6m-6 4h6m-6 4h4"/>',
    commercial: '<path d="M4 5h16v12H4zM8 21h8M12 17v4M8 9h3m-3 4h8"/>',
    health: '<path d="M12 21S4 16.5 4 10a4 4 0 0 1 7-2.6A4 4 0 0 1 18 10c0 6.5-6 11-6 11Zm0-10v5m-2.5-2.5h5"/>',
    education: '<path d="m3 9 9-5 9 5-9 5-9-5Zm4 2.5V17c3 2 7 2 10 0v-5.5M21 9v6"/>',
    interactive: '<path d="M5 3h14v14H5zM9 21h6m-3-4v4M9 7h6v6H9z"/>',
    business: '<path d="M4 21V7h6v14m0-18h10v18M7 11h1m-1 4h1m6-8h2m-2 4h2m-2 4h2"/>',
    sectoral: '<path d="M4 20h16M6 20V8l6-4 6 4v12M9 11h2m2 0h2m-6 4h2m2 0h2"/>'
};

const projectsGrid = document.getElementById('projectsGrid');
const projectFilterButtons = document.querySelectorAll('.project-filter');
const showAllProjectsButton = document.getElementById('showAllProjects');
const projectsResultCount = document.getElementById('projectsResultCount');
const initialProjectLimit = 6;
let activeProjectFilter = 'all';
let showEveryProject = false;

const createProjectCard = (project) => `
    <article class="project-card">
        <div class="project-image">
            ${project.image
                ? `<img class="project-cover" src="${project.image}" alt="Representación visual de ${project.title}" loading="lazy" decoding="async">`
                : `<svg class="project-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    ${projectIcons[project.icon] || projectIcons.business}
                </svg>`}
            <div class="project-overlay"><span class="project-category">${project.sector}</span></div>
        </div>
        <div class="project-content">
            <p class="project-type">${project.type}</p>
            <h3>${project.title}</h3>
            <p class="project-need"><strong>Necesidad:</strong> ${project.need}</p>
            <p class="project-solution"><strong>Solución:</strong> ${project.solution}</p>
            <div class="project-tags" aria-label="Tecnologías utilizadas">
                ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
        </div>
    </article>
`;

function renderProjects() {
    if (!projectsGrid) return;

    const filteredProjects = activeProjectFilter === 'all'
        ? projects
        : projects.filter(project => project.category === activeProjectFilter);
    const visibleProjects = showEveryProject
        ? filteredProjects
        : filteredProjects.slice(0, initialProjectLimit);

    projectsGrid.innerHTML = visibleProjects.map(createProjectCard).join('');
    if (projectsResultCount) {
        projectsResultCount.textContent = `${filteredProjects.length} proyectos encontrados. ${visibleProjects.length} visibles.`;
    }

    if (showAllProjectsButton) {
        showAllProjectsButton.hidden = filteredProjects.length <= initialProjectLimit || showEveryProject;
    }
}

projectFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        activeProjectFilter = button.dataset.filter || 'all';
        showEveryProject = false;
        projectFilterButtons.forEach(filterButton => {
            const isActive = filterButton === button;
            filterButton.classList.toggle('active', isActive);
            filterButton.setAttribute('aria-pressed', String(isActive));
        });
        renderProjects();
    });
});

showAllProjectsButton?.addEventListener('click', () => {
    showEveryProject = true;
    renderProjects();
});

renderProjects();

// Intersection Observer for scroll animations

// Section reveal transitions
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                });
            });
        }
    });
}, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

// Al llegar al final de la página, mostrar cualquier elemento que el observer no alcanzó
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => el.classList.add('is-visible'));
    }
}, { passive: true });

const revealTargets = document.querySelectorAll(
    '.reveal, .reveal-slide-left, .reveal-slide-right, .reveal-scale, .reveal-wipe, .section-header, .hero-content, .about-text, .about-image, .project-card, .contact-info, .contact-form, .footer-content, .footer-bottom'
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
let lastFocusedElement = null;

// Contenido de los modales para cada servicio
const serviceContent = {
    enterprise: {
        title: 'Software empresarial a medida',
        subtitle: 'Sistemas alineados con la forma real en que trabaja tu organización',
        description: 'Diseñamos plataformas que centralizan procesos, usuarios e información para reducir tareas manuales y mejorar el control de la operación.',
        features: [
            { title: 'Procesos a medida', description: 'Modelamos flujos, reglas y módulos según las necesidades concretas de cada operación.' },
            { title: 'Roles y trazabilidad', description: 'Definimos permisos, responsables e historial de cambios para trabajar con mayor seguridad.' },
            { title: 'Indicadores y reportes', description: 'Convertimos los datos diarios en consultas, exportaciones y tableros útiles para decidir.' }
        ],
        solutions: [
            'ERP y plataformas administrativas',
            'Gestión hotelera, educativa y de salud',
            'Planillas y procesos de recursos humanos',
            'Gestión de contratos y servicios recurrentes',
            'Portales internos con roles y aprobaciones',
            'Integración de módulos y fuentes de datos'
        ]
    },
    logistics: {
        title: 'Inventarios, logística y compras',
        subtitle: 'Trazabilidad desde el requerimiento hasta la entrega',
        description: 'Construimos herramientas para conocer existencias, movimientos, responsables y documentos vinculados a cada operación logística.',
        features: [
            { title: 'Inventario trazable', description: 'Control de kardex, series, ubicaciones, entradas, salidas y transferencias entre almacenes.' },
            { title: 'Compras y aprobaciones', description: 'Flujos para requerimientos, cotizaciones, órdenes, conformidades y coordinación entre áreas.' },
            { title: 'Control operativo', description: 'Seguimiento de activos, EPP, préstamos, proveedores y entregas con evidencias y alertas.' }
        ],
        solutions: [
            'Kardex valorizado e inventario multialmacén',
            'Solicitudes y órdenes de compra',
            'Control de activos por número de serie',
            'Entrega y devolución de EPP',
            'Evaluación y seguimiento de proveedores',
            'Reportes operativos y exportación a Excel o PDF'
        ]
    },
    commercial: {
        title: 'CRM, ventas y atención',
        subtitle: 'Información comercial conectada desde el primer contacto',
        description: 'Creamos soluciones para ordenar oportunidades, ventas, caja y atención, manteniendo el contexto de cada cliente y cada operación.',
        features: [
            { title: 'Seguimiento comercial', description: 'Contactos, oportunidades, actividades y estados visibles para todo el equipo autorizado.' },
            { title: 'Ventas y punto de venta', description: 'Cotizaciones, pedidos, comprobantes, caja e inventario en un mismo flujo.' },
            { title: 'Atención organizada', description: 'Turnos, entregas, encuestas e historial para ofrecer un servicio consistente.' }
        ],
        solutions: [
            'CRM y embudos de venta',
            'Puntos de venta para una o varias tiendas',
            'Cotizaciones, pedidos y facturación',
            'Suscripciones y servicios recurrentes',
            'Gestión de turnos y entregas',
            'Marketplace y catálogos digitales'
        ]
    },
    interactive: {
        title: 'Tótems y experiencias interactivas',
        subtitle: 'Interacciones táctiles diseñadas para informar, activar y medir',
        description: 'Desarrollamos aplicaciones para equipos de autoservicio y activaciones que combinan una interfaz clara con control administrativo.',
        features: [
            { title: 'Experiencia táctil', description: 'Interfaces sencillas, rápidas y adaptadas a pantallas de distintos formatos.' },
            { title: 'Operación autónoma', description: 'Aplicaciones de escritorio con sesión controlada, sincronización y funcionamiento offline.' },
            { title: 'Resultados medibles', description: 'Registro de interacciones, participantes, respuestas y exportación de resultados.' }
        ],
        solutions: [
            'Trivia y dinámicas interactivas',
            'Tótems fotográficos con QR',
            'Catálogos y formularios de autoservicio',
            'Gestores de contenidos para kioscos',
            'Pantallas de turnos y entregas',
            'Experiencias para eventos y espacios de atención'
        ]
    },
    signage: {
        title: 'Cartelería digital y monitoreo',
        subtitle: 'Contenido correcto, en la pantalla correcta y en el momento indicado',
        description: 'Centralizamos la administración de pantallas y contenidos para facilitar campañas, programación y soporte técnico.',
        features: [
            { title: 'Gestión de dispositivos', description: 'Inventario de pantallas, locales, ubicación, configuración y estado operativo.' },
            { title: 'Programación de contenido', description: 'Listas de reproducción, campañas y horarios administrados desde un panel central.' },
            { title: 'Monitoreo remoto', description: 'Indicadores, alertas y evidencias para detectar incidencias y responder con rapidez.' }
        ],
        solutions: [
            'Panel de pantallas y locales',
            'Listas de reproducción y calendarios',
            'Sincronización y reproducción offline',
            'Alertas de conectividad y estado',
            'Mapas de equipos instalados',
            'Tableros de cumplimiento de campañas'
        ]
    },
    automation: {
        title: 'Datos, automatización e IA',
        subtitle: 'Menos trabajo repetitivo y más información para decidir',
        description: 'Conectamos datos y automatizamos tareas para convertir operaciones dispersas en flujos medibles, oportunos y escalables.',
        features: [
            { title: 'Automatización de procesos', description: 'Reglas, alertas y tareas programadas que reducen pasos manuales y tiempos de respuesta.' },
            { title: 'Integraciones', description: 'APIs y conectores para que sistemas, servicios y fuentes de datos trabajen juntos.' },
            { title: 'Analítica e IA aplicada', description: 'Tableros, asistentes y modelos enfocados en necesidades concretas del negocio.' }
        ],
        solutions: [
            'Dashboards de indicadores clave',
            'Alertas y notificaciones automáticas',
            'Importación, validación y exportación de datos',
            'Integración entre plataformas mediante APIs',
            'Asistentes para consultar u organizar información',
            'Análisis de tendencias y apoyo a la planificación'
        ]
    }
};

// Función para abrir el modal
function openServiceModal(serviceType) {
    const content = serviceContent[serviceType];
    if (!content || !serviceModal || !modalBody) return;

    lastFocusedElement = document.activeElement;

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2 id="serviceModalTitle">${content.title}</h2>
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
    serviceModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose?.focus();
}

// Función para cerrar el modal
function closeServiceModal() {
    if (!serviceModal) return;
    serviceModal.classList.remove('active');
    serviceModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocusedElement?.focus();
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
modalClose?.addEventListener('click', closeServiceModal);

// Cerrar modal al hacer click fuera del contenido
serviceModal?.addEventListener('click', (e) => {
    if (e.target === serviceModal) closeServiceModal();
});

// Cerrar modal con la tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && serviceModal?.classList.contains('active')) {
        closeServiceModal();
    }
});
