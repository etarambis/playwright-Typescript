import { test, expect, chromium } from '@playwright/test';

test('loginRedBanco', async ({ }) => {

    const browser = await chromium.launch({ 
        slowMo: 1000
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await page.goto('https://test-administrador-remesas.pichincha.com/params-admin/#/app/tray/admin');

    await page.waitForTimeout(2000);

    await page.getByRole('textbox', { name: 'usuario@dominio.com' }).fill('etarambi@pichincha.com');
    await page.locator('#idSIButton9').click();
    await page.locator('#i0118').click();
    await page.locator('#i0118').fill('Judith12t4576..');
    await page.locator("#idSIButton9").click();

    
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'search Búsqueda avanzada' }).click();

    await page.getByText('Selecciona 1 empresa').click();
    await page.getByRole('option', { name: 'Lucagiros' }).click();
    await page.getByText('Lucagiros arrow_drop_down').click();

    await page.getByText('Selecciona 1 o más estados').click();  
    await page.getByRole('option', { name: 'Pagada' }).click();
    await page.locator('#selector_remittance_state').click();

    await page.getByText('Selecciona rango o fecha').click();
    await page.locator('#month_1_day_7').getByText('7', { exact: true }).click();
    await page.locator('#month_1_day_27').click();
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await page.getByRole('button', { name: 'Buscar' }).click();

    await page.getByRole('link', { name: 'Cerrar sesión' }).click();

});

