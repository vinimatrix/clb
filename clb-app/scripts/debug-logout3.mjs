import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 440, height: 930 } })).newPage()

// Registro completo como en el e2e test
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Unirme al proyecto/i }).click()
await page.getByTestId('page-registro').waitFor()
await page.getByPlaceholder('Ej. 00112345678').fill('03199999999')
await page.getByPlaceholder('Tu nombre').fill('Ana')
await page.getByPlaceholder('Tu primer apellido').fill('Navegador')
await page.getByPlaceholder('(829) 123-4567').fill('8295550777')
await page.getByRole('button', { name: /Continuar/i }).click()
await page.getByTestId('page-confirmacion').waitFor()
await page.getByRole('button', { name: /Continuar|Confirmar/i }).click()
await page.getByTestId('page-usuario').waitFor()
await page.getByPlaceholder('Ej. clbarcelo2026').fill('navegador2026')
await page.getByText('Disponible').waitFor()
await page.getByRole('button', { name: /Continuar/i }).click()
await page.getByTestId('page-otp').waitFor()
const chip = await page.getByText(/tu código es/i).locator('..').textContent()
const codigo = chip.match(/(\d{5})/)[1]
const cajas = page.getByLabel(/dígito/i)
for (let i = 0; i < 5; i++) await cajas.nth(i).fill(codigo[i])
await page.getByRole('button', { name: /Continuar/i }).click()
await page.getByTestId('page-contrasena').waitFor()
await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
await page.locator('input[type="password"]').nth(1).fill('ClbSegura2026@')
await page.getByRole('button', { name: /Continuar/i }).click()
await page.getByTestId('page-exito').waitFor({ timeout: 10000 })
await page.getByRole('button', { name: /iniciar sesión/i }).click()

// Login con la cuenta nueva
await page.getByTestId('page-login').waitFor()
await page.getByLabel(/cédula de identidad/i).fill('031-9999999-9')
await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
await page.getByRole('button', { name: /Iniciar sesión/i }).click()
await page.getByTestId('page-dashboard').waitFor({ timeout: 20000 })
console.log('Login nueva cuenta OK, URL:', page.url())

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