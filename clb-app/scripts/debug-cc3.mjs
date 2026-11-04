import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 440, height: 930 } })).newPage()
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
await page.getByLabel(/cédula de identidad/i).fill('402-1234567-8')
await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
await page.getByRole('button', { name: /Iniciar sesión/i }).click()
await page.getByTestId('page-dashboard').waitFor({ timeout: 20000 })
await page.goto('http://localhost:5173/app/callcenter', { waitUntil: 'networkidle' })
await page.getByTestId('page-callcenter').waitFor()
await page.waitForTimeout(800)
const ls0 = await page.evaluate(() => JSON.parse(localStorage.getItem('clb.llamadas')).completadasHoy)
console.log('LS inicial:', ls0)

await page.getByRole('button', { name: /Iniciar Siguiente Asignada/ }).click()
await page.getByText('Ficha Activa en Línea').waitFor()
await page.getByRole('button', { name: /Voto Seguro CLB/ }).click()
await page.getByRole('button', { name: /Ruta B-3/ }).click()
await page.getByRole('button', { name: /Mañana/ }).first().click()
await page.getByRole('button', { name: /Guardar y Pasar al Siguiente/ }).click()

try {
  await page.getByText('Contacto tipificado con éxito. Cargando siguiente...').waitFor({ timeout: 5000 })
  console.log('Toast apareció')
} catch (e) {
  console.log('NO TOAST:', e.message)
}

await page.waitForTimeout(1500)
const ls1 = await page.evaluate(() => JSON.parse(localStorage.getItem('clb.llamadas')).completadasHoy)
console.log('LS post-1:', ls1)

await page.getByRole('button', { name: /Iniciar Siguiente Asignada/ }).click()
await page.getByText('Ficha Activa en Línea').waitFor()
await page.getByRole('button', { name: /Simpatizante/ }).click()
await page.getByRole('button', { name: /Vehículo propio/ }).click()
await page.getByRole('button', { name: /Tarde/ }).first().click()
await page.getByRole('button', { name: /Guardar y Pasar al Siguiente/ }).click()

try {
  await page.getByText('Contacto tipificado con éxito. Cargando siguiente...').waitFor({ timeout: 5000 })
  console.log('Toast 2 apareció')
} catch (e) {
  console.log('NO TOAST 2:', e.message)
}

await page.waitForTimeout(1500)
const ls2 = await page.evaluate(() => JSON.parse(localStorage.getItem('clb.llamadas')).completadasHoy)
console.log('LS post-2:', ls2)

await browser.close()