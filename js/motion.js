// DYM SAC — Motion graphics (circuitos, HUD, revelados y microinteracciones)
(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const onReady = (callback) => {
        if (!document.getElementById('preloader') || document.body.classList.contains('page-ready')) {
            callback();
        } else {
            document.addEventListener('dym:ready', callback, { once: true });
        }
    };

    if (!document.getElementById('preloader')) {
        document.body.classList.add('no-preloader');
    }

    /* ---------- Preloader: contador de porcentaje ---------- */
    const percent = document.getElementById('preloaderPercent');
    if (percent) {
        const bootMs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--boot-ms')) || 2000;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min(1, (now - start) / bootMs);
            const eased = 1 - Math.pow(1 - progress, 2);
            percent.textContent = `${Math.round(eased * 100)}%`;
            if (progress < 1 && document.body.contains(percent)) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* ---------- Barra de progreso de scroll ---------- */
    const navbar = $('.navbar');
    if (navbar) {
        const bar = document.createElement('span');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        navbar.appendChild(bar);
        let scheduled = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.setProperty('--scroll', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
            scheduled = false;
        };
        window.addEventListener('scroll', () => {
            if (!scheduled) {
                scheduled = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        update();
    }

    /* ---------- Texto que se "decodifica" ---------- */
    const glyphs = '!<>-_\\/[]{}=+*^?#01ABCDEF';
    const scramble = (el, duration = 650) => {
        if (reduceMotion || el.dataset.scrambling === '1') return;
        const finalText = el.dataset.finalText || el.textContent;
        el.dataset.finalText = finalText;
        el.dataset.scrambling = '1';
        const start = performance.now();
        const frame = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const revealed = Math.floor(progress * finalText.length);
            let output = '';
            for (let i = 0; i < finalText.length; i++) {
                const char = finalText[i];
                output += i < revealed || char === ' '
                    ? char
                    : glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            el.textContent = output;
            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                el.textContent = finalText;
                el.dataset.scrambling = '0';
            }
        };
        requestAnimationFrame(frame);
    };

    if (finePointer) {
        $$('.nav-menu a').forEach(link => {
            link.addEventListener('mouseenter', () => scramble(link, 420));
        });
    }

    const tagObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scramble(entry.target, 800);
                tagObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });
    $$('.section-tag').forEach(tag => tagObserver.observe(tag));

    /* ---------- Revelado escalonado ---------- */
    const projectsGrid = document.getElementById('projectsGrid');
    const staggerContainers = [
        $('.services-grid'),
        $('.about-features'),
        $('.contact-details'),
        projectsGrid
    ].filter(Boolean);

    const indexChildren = (container) => {
        Array.from(container.children).forEach((child, index) => {
            child.style.setProperty('--i', Math.min(index, 8));
        });
    };

    const staggerObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('st-in');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });

    staggerContainers.forEach(container => {
        container.classList.add('stagger');
        indexChildren(container);
        staggerObserver.observe(container);
    });

    // Dibujar trazos de íconos con pathLength normalizado
    $$('.service-icon path, .about-feature path, .contact-item path').forEach(path => {
        path.setAttribute('pathLength', '1');
    });

    if (projectsGrid) {
        $$('.project-card', projectsGrid).forEach(card => card.classList.remove('reveal'));
        new MutationObserver(() => indexChildren(projectsGrid))
            .observe(projectsGrid, { childList: true });
    }

    /* ---------- Trazas animadas entre secciones ---------- */
    $$('#servicios, #nosotros, #proyectos, #contacto').forEach(section => {
        const trace = document.createElement('div');
        trace.className = 'section-trace';
        trace.setAttribute('aria-hidden', 'true');
        trace.innerHTML = '<span></span>';
        section.prepend(trace);
    });

    /* ---------- Hero: título por palabras ---------- */
    const heroTitle = $('.hero-title');
    if (heroTitle && !reduceMotion) {
        let wordIndex = 0;
        const splitNode = (node) => {
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const parts = child.textContent.split(/(\s+)/);
                    const fragment = document.createDocumentFragment();
                    parts.forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) {
                            fragment.appendChild(document.createTextNode(' '));
                            return;
                        }
                        const outer = document.createElement('span');
                        outer.className = 'w';
                        const inner = document.createElement('span');
                        inner.className = 'wi';
                        inner.style.setProperty('--i', wordIndex++);
                        inner.textContent = part;
                        outer.appendChild(inner);
                        fragment.appendChild(outer);
                    });
                    child.replaceWith(fragment);
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    splitNode(child);
                    child.classList.add('is-split');
                }
            });
        };
        heroTitle.setAttribute('aria-label', heroTitle.textContent.replace(/\s+/g, ' ').trim());
        splitNode(heroTitle);
        heroTitle.classList.add('is-split');
        $$('.w', heroTitle).forEach(word => word.setAttribute('aria-hidden', 'true'));
    }

    $$('.hero-benefits li').forEach((item, index) => item.style.setProperty('--i', index));

    /* ---------- Hero: máquina de escribir ---------- */
    const typewriter = $('.typewriter');
    if (typewriter && !reduceMotion) {
        let phrases = [];
        try {
            phrases = JSON.parse(typewriter.dataset.phrases || '[]');
        } catch (error) {
            phrases = [];
        }
        if (phrases.length > 1) {
            let phraseIndex = 0;
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const run = async () => {
                await wait(2600);
                while (true) {
                    const current = phrases[phraseIndex];
                    for (let i = current.length; i >= 0; i--) {
                        typewriter.textContent = current.slice(0, i);
                        await wait(22);
                    }
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    const next = phrases[phraseIndex];
                    await wait(260);
                    for (let i = 1; i <= next.length; i++) {
                        typewriter.textContent = next.slice(0, i);
                        await wait(48 + Math.random() * 40);
                    }
                    await wait(2600);
                }
            };
            onReady(run);
        }
    }

    /* ---------- Hero: parallax del showcase ---------- */
    const hero = $('.hero');
    const showcase = $('.hero-showcase');
    if (hero && showcase && finePointer && !reduceMotion) {
        let frame = null;
        hero.addEventListener('pointermove', (event) => {
            const rect = hero.getBoundingClientRect();
            const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                showcase.style.setProperty('--px', px.toFixed(3));
                showcase.style.setProperty('--py', py.toFixed(3));
            });
        });
        hero.addEventListener('pointerleave', () => {
            showcase.style.setProperty('--px', 0);
            showcase.style.setProperty('--py', 0);
        });
    }

    /* ---------- Hero: red de circuitos en canvas ---------- */
    const canvas = document.getElementById('heroCircuit');
    if (canvas && hero && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        const staticLayer = document.createElement('canvas');
        const staticCtx = staticLayer.getContext('2d');
        const CELL = 54;
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        let width = 0;
        let height = 0;
        let dpr = 1;
        let traces = [];
        let packets = [];
        let running = false;
        let visible = true;
        let lastSpawn = 0;
        let lastTime = 0;
        const pointer = { x: -9999, y: -9999 };

        const glow = document.createElement('canvas');
        glow.width = glow.height = 48;
        const glowCtx = glow.getContext('2d');
        const gradient = glowCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
        gradient.addColorStop(0, 'rgba(255, 236, 190, 1)');
        gradient.addColorStop(0.25, 'rgba(255, 190, 90, 0.75)');
        gradient.addColorStop(1, 'rgba(247, 147, 30, 0)');
        glowCtx.fillStyle = gradient;
        glowCtx.fillRect(0, 0, 48, 48);

        const randomInt = (max) => Math.floor(Math.random() * max);

        const buildTraces = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = hero.clientWidth;
            height = hero.clientHeight;
            [canvas, staticLayer].forEach(layer => {
                layer.width = Math.round(width * dpr);
                layer.height = Math.round(height * dpr);
            });

            const cols = Math.ceil(width / CELL);
            const rows = Math.ceil(height / CELL);
            const total = Math.max(10, Math.round((cols * rows) / (width < 700 ? 14 : 9)));
            traces = [];

            for (let t = 0; t < total; t++) {
                let cx = randomInt(cols + 1);
                let cy = randomInt(rows + 1);
                const points = [[cx * CELL, cy * CELL]];
                let dir = directions[randomInt(4)];
                const segments = 2 + randomInt(3);
                for (let s = 0; s < segments; s++) {
                    const length = 1 + randomInt(3);
                    cx = Math.max(0, Math.min(cols, cx + dir[0] * length));
                    cy = Math.max(0, Math.min(rows, cy + dir[1] * length));
                    const last = points[points.length - 1];
                    if (last[0] !== cx * CELL || last[1] !== cy * CELL) points.push([cx * CELL, cy * CELL]);
                    dir = dir[0] === 0
                        ? directions[randomInt(2)]
                        : directions[2 + randomInt(2)];
                }
                if (points.length < 2) continue;
                const lengths = [];
                let totalLength = 0;
                for (let i = 1; i < points.length; i++) {
                    const segment = Math.abs(points[i][0] - points[i - 1][0]) + Math.abs(points[i][1] - points[i - 1][1]);
                    lengths.push(segment);
                    totalLength += segment;
                }
                traces.push({ points, lengths, totalLength });
            }

            staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            staticCtx.clearRect(0, 0, width, height);
            staticCtx.lineWidth = 1.2;
            staticCtx.lineJoin = 'round';
            traces.forEach(trace => {
                staticCtx.strokeStyle = 'rgba(212, 168, 75, 0.16)';
                staticCtx.beginPath();
                trace.points.forEach(([x, y], index) => index ? staticCtx.lineTo(x, y) : staticCtx.moveTo(x, y));
                staticCtx.stroke();
                [trace.points[0], trace.points[trace.points.length - 1]].forEach(([x, y]) => {
                    staticCtx.fillStyle = 'rgba(247, 147, 30, 0.4)';
                    staticCtx.beginPath();
                    staticCtx.arc(x, y, 2.4, 0, Math.PI * 2);
                    staticCtx.fill();
                    staticCtx.strokeStyle = 'rgba(247, 147, 30, 0.18)';
                    staticCtx.beginPath();
                    staticCtx.arc(x, y, 5.5, 0, Math.PI * 2);
                    staticCtx.stroke();
                });
            });
            packets = [];
        };

        const pointAt = (trace, distance) => {
            let remaining = Math.max(0, Math.min(distance, trace.totalLength));
            for (let i = 0; i < trace.lengths.length; i++) {
                if (remaining <= trace.lengths[i]) {
                    const [x1, y1] = trace.points[i];
                    const [x2, y2] = trace.points[i + 1];
                    const ratio = trace.lengths[i] ? remaining / trace.lengths[i] : 0;
                    return [x1 + (x2 - x1) * ratio, y1 + (y2 - y1) * ratio];
                }
                remaining -= trace.lengths[i];
            }
            return trace.points[trace.points.length - 1];
        };

        const spawnPacket = () => {
            if (!traces.length) return;
            let trace = traces[randomInt(traces.length)];
            if (pointer.x > -9000) {
                const near = traces.filter(item => {
                    const [x, y] = item.points[0];
                    return Math.hypot(x - pointer.x, y - pointer.y) < 220;
                });
                if (near.length && Math.random() < 0.6) trace = near[randomInt(near.length)];
            }
            packets.push({
                trace,
                distance: 0,
                speed: 110 + Math.random() * 140,
                reverse: Math.random() < 0.5
            });
        };

        const draw = (time) => {
            if (!running) return;
            const delta = Math.min(64, time - (lastTime || time));
            lastTime = time;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(staticLayer, 0, 0);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (time - lastSpawn > (width < 700 ? 420 : 220) && packets.length < (width < 700 ? 8 : 18)) {
                spawnPacket();
                lastSpawn = time;
            }

            ctx.globalCompositeOperation = 'lighter';
            packets = packets.filter(packet => {
                packet.distance += packet.speed * (delta / 1000);
                const { trace } = packet;
                if (packet.distance > trace.totalLength + 60) return false;
                for (let k = 7; k >= 0; k--) {
                    const along = packet.distance - k * 7;
                    if (along < 0 || along > trace.totalLength) continue;
                    const position = pointAt(trace, packet.reverse ? trace.totalLength - along : along);
                    const alpha = (1 - k / 8) * 0.9;
                    const size = k === 0 ? 26 : 12;
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(glow, position[0] - size / 2, position[1] - size / 2, size, size);
                }
                return true;
            });
            ctx.globalAlpha = 1;

            if (pointer.x > -9000) {
                const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
                halo.addColorStop(0, 'rgba(247, 147, 30, 0.10)');
                halo.addColorStop(1, 'rgba(247, 147, 30, 0)');
                ctx.fillStyle = halo;
                ctx.fillRect(pointer.x - 180, pointer.y - 180, 360, 360);
            }
            ctx.globalCompositeOperation = 'source-over';

            requestAnimationFrame(draw);
        };

        const setRunning = () => {
            const shouldRun = visible && !document.hidden && !reduceMotion;
            if (shouldRun && !running) {
                running = true;
                lastTime = 0;
                requestAnimationFrame(draw);
            } else if (!shouldRun) {
                running = false;
            }
        };

        buildTraces();
        if (reduceMotion) {
            ctx.drawImage(staticLayer, 0, 0);
        }

        // Reconstruye cuando cambia el tamaño real del hero (incluye la aparición de la barra de scroll)
        let resizeTimer = null;
        const rebuild = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (Math.abs(hero.clientWidth - width) < 2 && Math.abs(hero.clientHeight - height) < 80) return;
                buildTraces();
                if (reduceMotion) ctx.drawImage(staticLayer, 0, 0);
            }, 150);
        };
        if (typeof ResizeObserver === 'function') {
            new ResizeObserver(rebuild).observe(hero);
        } else {
            window.addEventListener('resize', rebuild);
        }

        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            setRunning();
        }).observe(hero);
        document.addEventListener('visibilitychange', setRunning);

        if (finePointer) {
            hero.addEventListener('pointermove', (event) => {
                const rect = hero.getBoundingClientRect();
                pointer.x = event.clientX - rect.left;
                pointer.y = event.clientY - rect.top;
            });
            hero.addEventListener('pointerleave', () => {
                pointer.x = pointer.y = -9999;
            });
        }

        setRunning();
    }

    /* ---------- Emblema de "Nosotros": reproduce la animación al verse ---------- */
    const emblemImage = $('.about-emblem img[data-src]');
    if (emblemImage) {
        new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                emblemImage.src = emblemImage.dataset.src;
                observer.disconnect();
            }
        }, { threshold: 0.3 }).observe(emblemImage.parentElement);
    }

    if (reduceMotion || !finePointer) return;

    /* ---------- Tarjetas: foco de luz e inclinación 3D ---------- */
    let activeCard = null;
    const resetCard = (card) => {
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
    };
    document.addEventListener('pointermove', (event) => {
        const card = event.target.closest?.('.service-card, .project-card, .about-card, .contact-form');
        if (activeCard && activeCard !== card) resetCard(activeCard);
        activeCard = card;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        if (card.matches('.service-card, .project-card')) {
            card.style.setProperty('--rx', `${((0.5 - y / rect.height) * 6).toFixed(2)}deg`);
            card.style.setProperty('--ry', `${((x / rect.width - 0.5) * 8).toFixed(2)}deg`);
        }
    }, { passive: true });

    /* ---------- Botones magnéticos ---------- */
    $$('.btn-primary, .hero-secondary, .whatsapp-float, .theme-toggle').forEach(button => {
        button.addEventListener('pointermove', (event) => {
            const rect = button.getBoundingClientRect();
            const dx = (event.clientX - rect.left - rect.width / 2) * 0.22;
            const dy = (event.clientY - rect.top - rect.height / 2) * 0.32;
            button.style.setProperty('--mgx', `${Math.max(-10, Math.min(10, dx)).toFixed(1)}px`);
            button.style.setProperty('--mgy', `${Math.max(-8, Math.min(8, dy)).toFixed(1)}px`);
        });
        button.addEventListener('pointerleave', () => {
            button.style.setProperty('--mgx', '0px');
            button.style.setProperty('--mgy', '0px');
        });
    });

    /* ---------- Brillo que sigue al cursor ---------- */
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursorGlow);
    let glowFrame = null;
    document.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(glowFrame);
        glowFrame = requestAnimationFrame(() => {
            cursorGlow.style.setProperty('--cx', `${event.clientX}px`);
            cursorGlow.style.setProperty('--cy', `${event.clientY}px`);
            cursorGlow.classList.add('on');
        });
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursorGlow.classList.remove('on'));
})();
