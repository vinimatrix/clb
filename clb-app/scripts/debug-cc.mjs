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
const textos = await page.evaluate(() => {
  const el = document.querySelector('[data-testid="page-callcenter"]')
  const parejas = JSON.parse(localStorage.getItem('clb.llamadas') ?? 'NO_HAY')
  return {
    head: el ? el.textContent.slice(0, 300) : 'NO PAGE',
    llamadasLS: typeof parejas === 'string' ? parejas : { c: parejas.completadasHoy, m: parejas.metaDiaria },
    hayClaves: Object.keys(localStorage).filter((k) => k.startsWith('clb')).join(','),
  }
})
console.log(JSON.stringify(textos, null, 2))
await browser.close()
