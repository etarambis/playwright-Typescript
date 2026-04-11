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

    await page.getByRole('textbox', { name: 'usuario@dominio.com' }).fill('usrpqaau@pichincha.com');
    await page.locator('#idSIButton9').click();
    await page.locator('#i0118').click();
    await page.locator('#i0118').fill('GHtyrf4*8_3DaqJs');
    await page.locator("#idSIButton9").click();
    await expect(page.getByRole('table', { name: 'table-component' })).toBeVisible();

    await page.getByRole('button', { name: 'search Búsqueda avanzada' }).click();

    await expect(page.getByRole('button', { name: 'close Cerrar' })).toBeVisible();

    await page.getByText('Selecciona 1 empresa').click();
    await expect(page.getByRole('option', { name: 'Todos' })).toBeVisible();

    await page.getByRole('option', { name: 'Lucagiros' }).click();
    await page.getByText('Lucagiros arrow_drop_down').click();
    await expect(page.getByRole('option', { name: 'Todos' })).toBeVisible();

    await page.getByText('Selecciona 1 o más estados').click();
    await expect(page.getByRole('option', { name: 'Pendiente' })).toBeVisible();

    await page.getByText('Rechazada arrow_drop_down').click();
    await page.getByText('Selecciona rango o fecha').click();
    await expect(page.getByRole('heading', { name: 'Fecha de operación' })).toBeVisible();

    await page.locator('#month_1_day_7').getByText('7', { exact: true }).click();
    await page.locator('#month_1_day_27').click();
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByRole('heading', { name: 'Resultados de búsqueda' })).toBeVisible();
    await page.getByRole('link', { name: 'Cerrar sesión' }).click();

});

