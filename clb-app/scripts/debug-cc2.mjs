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
  const txts = []
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
  let node
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim()
    if (t) txts.push(t)
  }
  return txts
})
console.log(textos.join('\n---'))
await browser.close()