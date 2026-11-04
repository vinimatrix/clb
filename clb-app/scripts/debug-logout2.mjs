import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 440, height: 930 } })).newPage()

// Login como demo
await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
await page.getByLabel(/cédula de identidad/i).fill('402-1234567-8')
await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
await page.getByRole('button', { name: /Iniciar sesión/i }).click()
await page.getByTestId('page-dashboard').waitFor({ timeout: 20000 })
console.log('Login OK, URL:', page.url())

// Ir a Perfil
await page.goto(BASE + '/app/perfil', { waitUntil: 'networkidle' })
await page.getByTestId('page-perfil').waitFor()
console.log('En Perfil, URL:', page.url())

// Click cerrar sesión
await page.getByRole('button', { name: /Cerrar sesión/ }).click()
console.log('Click en Cerrar sesión')

// Esperar a ver a dónde va
await page.waitForTimeout(2000)
console.log('URL post-logout:', page.url())
console.log('Portada visible:', await page.getByTestId('portada').isVisible().catch(() => false))

await browser.close()