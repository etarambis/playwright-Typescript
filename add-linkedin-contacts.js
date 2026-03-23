const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
    });
    // Lanzar Chrome con debugging remoto
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(
        chromePath,
        [
            '--remote-debugging-port=9222',
            '--user-data-dir=C:/temp/chrome_debug',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--disable-component-update',
            '--disable-gpu'
        ],
        { shell: false }
    );

    chrome.stdout?.on('data', d => process.stdout.write(d));
    chrome.stderr?.on('data', d => {
        const text = d.toString();
        // Filtrar mensajes no deseados de Google GCM que son inofensivos
        if (text.includes('DEPRECATED_ENDPOINT')) return;
        process.stderr.write(d);
    });

    // Esperar a que Chrome abra el puerto CDP. Reintentar varios veces.
    const cdpUrl = 'http://localhost:9222';
    const maxAttempts = 10;
    let browser;
    let usedCDP = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await new Promise(r => setTimeout(r, 500 * attempt));
            browser = await chromium.connectOverCDP(cdpUrl);
            usedCDP = true;
            console.log('Connected to Chrome via CDP');
            break;
        } catch (err) {
            console.log(`CDP not ready (attempt ${attempt}/${maxAttempts})`);
            if (attempt === maxAttempts) {
                console.warn('No CDP connection after attempts, will use Playwright fallback. Last error:', err);
            }
        }
    }

    // Obtener o crear contexto/página
    let page;
    if (!browser) {
        console.log('No se pudo conectar por CDP. Lanzando Chromium gestionado por Playwright...');
        try {
            browser = await chromium.launch({ headless: false, args: ['--disable-gpu'] });
            console.log('Chromium lanzado por Playwright');
        } catch (launchErr) {
            console.error('Fallo al lanzar Chromium por Playwright:', launchErr);
            throw launchErr;
        }
        const ctx = await browser.newContext();
        try {
            await ctx.grantPermissions(['microphone', 'camera'], { origin: 'https://www.linkedin.com' });
            console.log('Permisos de mic/cámara concedidos para https://www.linkedin.com');
        } catch (e) {
            console.warn('No se pudieron conceder permisos automáticamente:', e);
        }
        page = await ctx.newPage();
    } else {
        console.log('Usando navegador conectado (CDP). Revisando contextos...');
        // Para garantizar que la página se abra en una pestaña visible del navegador
        // creamos un nuevo contexto y nueva página sobre la conexión CDP.
        if (usedCDP) {
                try {
                    // Reutilizar el contexto del navegador ya abierto para crear una pestaña
                    const contexts = browser.contexts();
                    console.log('Contextos encontrados (CDP):', contexts.length);
                    if (contexts.length > 0) {
                        const defaultContext = contexts[0];
                        try {
                            await defaultContext.grantPermissions(['microphone', 'camera'], { origin: 'https://www.linkedin.com' });
                            console.log('Permisos concedidos en contexto existente.');
                        } catch (permErr) {
                            console.warn('No fue posible conceder permisos en contexto existente:', permErr);
                        }
                        page = await defaultContext.newPage();
                        try { await page.bringToFront(); } catch (bfErr) { /* non-fatal */ }
                        console.log('Nueva pestaña creada en el contexto existente y traída al frente.');
                    } else {
                        const ctx = await browser.newContext();
                        try {
                            await ctx.grantPermissions(['microphone', 'camera'], { origin: 'https://www.linkedin.com' });
                        } catch (permErr) {
                            console.warn('No fue posible conceder permisos en nuevo contexto:', permErr);
                        }
                        page = await ctx.newPage();
                        console.log('Nuevo contexto/página creado sobre CDP (no había contextos existentes).');
                    }
                } catch (e) {
                    console.warn('Error creando/obteniendo página sobre CDP, intentaremos con contextos existentes fallback:', e);
                    const contexts = browser.contexts();
                    if (contexts.length > 0) {
                        const defaultContext = contexts[0];
                        const pages = defaultContext.pages();
                        page = pages.length > 0 ? pages[0] : await defaultContext.newPage();
                    } else {
                        const ctx = await browser.newContext();
                        page = await ctx.newPage();
                    }
                }
        } else {
            const contexts = browser.contexts();
            console.log('Contextos encontrados:', contexts.length);
            if (contexts.length > 0) {
                const defaultContext = contexts[0];
                const pages = defaultContext.pages();
                console.log('Páginas en el contexto por defecto:', pages.length);
                page = pages.length > 0 ? pages[0] : await defaultContext.newPage();
            } else {
                const ctx = await browser.newContext();
                page = await ctx.newPage();
            }
        }
    }

    try {
        console.log('Navigating to LinkedIn My Network...');
        await page.goto('https://www.linkedin.com/mynetwork', { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log('Navigation finished, url:', page.url());
    } catch (err) {
        console.error('Failed to navigate:', err);
    }

    // Nota: no cerramos Chrome automáticamente para poder inspeccionar la ventana.
})();