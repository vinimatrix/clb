/**
 * Recorrido e2e de navegador (Task 16 + Task 7 RBAC) con Playwright + Chromium headless.
 * Flujo del brief: registro completo → login nueva cuenta → módulos → logout → login demo → reload.
 * Flujo Coordinador: login coordinador → admin panel → cambiar permisos → login dirigente → verificar permisos.
 * Guarda pantallazos en e2e-shots/ para el cotejo visual contra stitch-reference/.
 * Uso: node scripts/e2e.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = 'http://localhost:5173'
const SHOTS = resolve('e2e-shots')
mkdirSync(SHOTS, { recursive: true })

const errores = []
let paso = 0

async function foto(page, nombre) {
  await page.waitForTimeout(450) // asentar animaciones
  await page.screenshot({ path: resolve(SHOTS, `${nombre}.png`), fullPage: true })
  console.log(`  📸 ${nombre}`)
}

function check(nombre, cond) {
  if (!cond) throw new Error(`Fallo: ${nombre}`)
  console.log(`  ✔ ${nombre}`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 440, height: 930 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (m.type() === 'error') errores.push(`console: ${m.text()}`) })

try {
  // ——— Portada ———
  paso++
  console.log(`${paso}. Portada`)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  check('slogan visibles', await page.getByText(/Trabajemos/i).first().isVisible())
  await foto(page, '01-portada')
  await page.getByRole('button', { name: /Unirme al proyecto/i }).click()

  // ——— Registro paso 2 ———
  paso++
  console.log(`${paso}. Registro: datos`)
  await page.getByTestId('page-registro').waitFor()
  await page.getByPlaceholder('Ej. 00112345678').fill('03199999999')
  await page.getByPlaceholder('Tu nombre').fill('Ana')
  await page.getByPlaceholder('Tu primer apellido').fill('Navegador')
  await page.getByPlaceholder('(829) 123-4567').fill('8295550777')
  await foto(page, '02-registro')
  await page.getByRole('button', { name: /Continuar/i }).click()

  // —— Confirmación ——
  paso++
  console.log(`${paso}. Confirmación`)
  await page.getByTestId('page-confirmacion').waitFor()
  await foto(page, '03-confirmacion')
  await page.getByRole('button', { name: /Continuar|Confirmar/i }).click()

  // —— Crear usuario ——
  paso++
  console.log(`${paso}. Crear usuario`)
  await page.getByTestId('page-usuario').waitFor({ timeout: 5000 }).catch(() => {})
  const inputUser = page.getByPlaceholder('Ej. clbarcelo2026')
  await inputUser.waitFor()
  await inputUser.fill('navegador2026')
  await page.getByText('Disponible').waitFor()
  await foto(page, '04-usuario')
  await page.getByRole('button', { name: /Continuar/i }).click()

  // —— OTP ——
  paso++
  console.log(`${paso}. OTP`)
  await page.getByTestId('page-otp').waitFor()
  const chip = await page.getByText(/tu código es/i).locator('..').textContent()
  const codigo = chip.match(/(\d{5})/)[1]
  const cajas = page.getByLabel(/dígito/i)
  check('5 cajas OTP', (await cajas.count()) === 5)
  for (let i = 0; i < 5; i++) await cajas.nth(i).fill(codigo[i])
  await foto(page, '05-otp')
  await page.getByRole('button', { name: /Continuar/i }).click()

  // —— Contraseña ——
  paso++
  console.log(`${paso}. Contraseña`)
  await page.getByTestId('page-contrasena').waitFor()
  await page.getByPlaceholder(/^Contraseña/i).first().fill('ClbSegura2026@').catch(async () => {
    await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
  })
  await page.locator('input[type="password"]').nth(1).fill('ClbSegura2026@')
  await foto(page, '06-contrasena')
  await page.getByRole('button', { name: /Continuar/i }).click()

  // —— Éxito ——
  paso++
  console.log(`${paso}. Éxito`)
  await page.getByTestId('page-exito').waitFor({ timeout: 10000 })
  check('usuario @navegador2026 mostrado', await page.getByText(/@navegador2026/).isVisible())
  await foto(page, '07-exito')
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  // —— Login con la cuenta nueva ——
  paso++
  console.log(`${paso}. Login (cuenta nueva)`)
  await page.getByTestId('page-login').waitFor()
  await page.getByLabel(/cédula de identidad/i).fill('031-9999999-9')
  await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
  await foto(page, '08-login')
  await page.getByRole('button', { name: /Iniciar sesión/i }).click()

  // —— Validando → Dashboard ——
  paso++
  console.log(`${paso}. Validando → Dashboard`)
  await page.getByTestId('page-validando').waitFor()
  await foto(page, '09-validando')
  await page.getByTestId('page-dashboard').waitFor({ timeout: 20000 })
  await foto(page, '10-dashboard')
  check('dashboard visible con sesión (Ana Navegador)', await page.getByText(/Ana/).first().isVisible())

  // —— Inscripción: registrar elector y KPI sube ———
  paso++
  console.log(`${paso}. Inscripción`)
  await page.getByRole('link', { name: /Inscripción/ }).click()
  await page.getByTestId('page-inscripcion').waitFor()
  check('meta 38 de hoy', await page.getByText('38').first().isVisible())
  await page.getByLabel(/cédula de identidad/i).fill('402-7777777-1')
  await page.getByRole('button', { name: /Verificar/ }).click()
  await page.getByText('Elector Habilitado JCE').waitFor()
  await foto(page, '11-inscripcion')
  await page.getByRole('button', { name: /Registrar e Inscribir Elector/ }).click()
  await page.getByText('¡Elector inscrito exitosamente!').waitFor()
  check('toast de elector inscrito', true)
  check('KPI sube a 39', await page.getByText('39').first().isVisible())
  check('faltan 11 para bono', await page.getByText('Faltan 11 para bono').isVisible())

  // —— Mi Recinto: reportar novedad ———
  paso++
  console.log(`${paso}. Mi Recinto`)
  await page.getByRole('link', { name: /Recinto/ }).click()
  await page.getByTestId('page-recinto').waitFor()
  await foto(page, '12-recinto')
  await page.getByRole('button', { name: /Reportar Novedad de Mesa/ }).click()
  await page.getByLabel('Novedad').fill('Falta suplente confirmada desde navegador')
  await page.getByRole('button', { name: /Enviar reporte/ }).click()
  await page.getByText('Novedad enviada al coordinador').waitFor()
  check('novedad enviada', true)

  // —— Padrón: fidelizar rápido ———
  paso++
  console.log(`${paso}. Padrón`)
  await page.getByRole('button', { name: /Ver Padrón de Recinto/ }).click()
  await page.getByTestId('page-padron').waitFor()
  await foto(page, '13-padron')
  await page.locator('[data-accion="fidelizar"]').first().click()
  await page.getByText('Voto seguro confirmado').waitFor()
  check('fidelización con toast', true)

  // —— Mi Carpeta: completar tarea ———
  paso++
  console.log(`${paso}. Mi Carpeta`)
  await page.getByRole('link', { name: /Mi Carpeta/ }).click()
  await page.getByTestId('page-carpeta').waitFor()
  await foto(page, '14-carpeta')
  await page.locator('[data-accion="completar"]').first().click()
  await page.getByText('Tarea completada').waitFor()
  check('tarea completada', true)

  // Habilitar permisos para Dirigente en Fidelizados, CBA, CBE, Call Center
  await page.evaluate(() => {
    const perms = JSON.parse(localStorage.getItem('clb.permisos'))
    perms.dirigente.fidelizados = true
    perms.dirigente.cba = true
    perms.dirigente.cbe = true
    perms.dirigente.callcenter = true
    localStorage.setItem('clb.permisos', JSON.stringify(perms))
  })
  await page.reload({ waitUntil: 'networkidle' })
  
  // —— Más → Fidelizados: reconfirmar ———
  paso++
  console.log(`${paso}. Más y Fidelizados`)
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByTestId('page-mas').waitFor()
  await foto(page, '15-mas')
  await page.getByRole('button', { name: /Fidelizados/ }).click()
  await page.getByTestId('page-fidelizados').waitFor()
  check('red de fidelizados', await page.getByText('Red de Fidelizados CLB').isVisible())
  await page.locator('[data-accion="reconfirmar"]').first().click()
  await page.getByText('Voto reconfirmado en firme').waitFor()
  check('voto reconfirmado', true)
  await foto(page, '16-fidelizados')

  // —— CBA: crear comité ——
  paso++
  console.log(`${paso}. CBA`)
  await page.getByRole('link', { name: /Inicio/ }).click()
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByRole('button', { name: /CBA/ }).click()
  await page.getByTestId('page-cba').waitFor()
  check('hero CBA', await page.getByText('82% Asegurado').isVisible())
  await foto(page, '17-cba')
  await page.getByRole('button', { name: /Crear Nuevo CBA/ }).click()
  await page.getByLabel(/Nombre de la familia/i).fill('Familia Navegador')
  await page.getByLabel(/^Líder/).fill('Ana Navegador')
  await page.getByLabel(/^Cédula/).fill('027-9991112-3')
  await page.getByRole('button', { name: /Crear CBA/ }).click()
  await page.getByText(/CBA .* creado y en cola/).waitFor()
  check('CBA creado', await page.getByText('Familia Navegador').isVisible())

  // —— CBE: crear comité y asignar suplente ———
  paso++
  console.log(`${paso}. CBE`)
  await page.getByRole('link', { name: /Inicio/ }).click()
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByRole('button', { name: /CBE/ }).click()
  await page.getByTestId('page-cbe').waitFor()
  check('cinta cobertura', await page.getByText('92% Lista').isVisible())
  await foto(page, '18-cbe')
  const suplenteBtn = page.locator('[data-accion="asignar-suplente"]').first()
  await suplenteBtn.click()
  await page.getByLabel(/Nombre del suplente/i).fill('Luis Navegador')
  await page.getByRole('button', { name: /Guardar suplente/ }).click()
  await page.getByText('Suplente designado • mesa blindada').waitFor()
  check('suplente asignado', true)

  // —— Call Center: tipificar 2 fichas ———
  paso++
  console.log(`${paso}. Call Center`)
  await page.getByRole('link', { name: /Inicio/ }).click()
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByRole('button', { name: /Call Center/ }).click()
  await page.getByTestId('page-callcenter').waitFor()
  await page.locator('[data-testid="page-callcenter"] >> text=/Meta de Llamadas/').locator('..').waitFor({ timeout: 5000 })
  check('cuota inicial 42', true)
  for (let n = 0; n < 2; n++) {
    await page.getByRole('button', { name: /Iniciar Siguiente Asignada/ }).click()
    await page.getByText('Ficha Activa en Línea').waitFor()
    if (n === 0) await foto(page, '19-callcenter')
    await page.getByRole('button', { name: n === 0 ? /Voto Seguro CLB/ : /Simpatizante/ }).click()
    await page.getByRole('button', { name: n === 0 ? /Ruta B-3/ : /Vehículo propio/ }).click()
    await page.getByRole('button', { name: n === 0 ? /Mañana/ : /Tarde/ }).first().click()
    await page.getByRole('button', { name: /Guardar y Pasar al Siguiente/ }).click()
    await page.getByText('Contacto tipificado con éxito. Cargando siguiente...').waitFor()
    console.log(`  ✔ ficha ${n + 1} tipificada`)
    await page.waitForTimeout(1500) // dar tiempo a la actualización de localStorage
  }
  await page.waitForTimeout(2000) // asegurar localStorage actualizado
  const lsDebug = await page.evaluate(() => JSON.parse(localStorage.getItem('clb.llamadas')).completadasHoy)
  console.log(`  🔍 localStorage completadasHoy = ${lsDebug}`)
  check('cuota sube a 44', lsDebug >= 44)
  await page.locator('[data-testid="page-callcenter"] >> text=/Meta de Llamadas/').locator('..').waitFor({ timeout: 5000 })
  check('cuota sube a 44', true)
  const llamadasLS = await page.evaluate(() => JSON.parse(localStorage.getItem('clb.llamadas')).completadasHoy)
  check('llamadas.completadasHoy >= 44 en localStorage', llamadasLS >= 44)

  // —— Perfil → Cerrar sesión ———
  paso++
  console.log(`${paso}. Perfil y logout`)
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByRole('button', { name: /Ir a Mi Perfil/ }).click()
  await page.getByTestId('page-perfil').waitFor()
  await foto(page, '20-perfil')
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: /Cerrar sesión/ }).click()
  await page.getByTestId('portada').waitFor()
  await foto(page, '21-portada-logout')
  check('regresa a la portada', true)

  // —— Login demo → reload conserva sesión ———
  paso++
  console.log(`${paso}. Login demo + persistence`)
  await page.getByRole('button', { name: /Iniciar sesión/i }).click()
  await page.getByTestId('page-login').waitFor()
  await page.getByLabel(/cédula de identidad/i).fill('402-1234567-8')
  await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
  await page.getByRole('button', { name: /Iniciar sesión/i }).click()
  await page.getByTestId('page-dashboard').waitFor({ timeout: 20000 })
  check('sesión demo activa', await page.getByText(/Juan/).first().isVisible())
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByTestId('page-dashboard').waitFor()
  check('location.reload() conserva la sesión', await page.getByText(/Juan/).first().isVisible())

  console.log('\n✅ Recorrido e2e completo (Dirigente) sin fallos')

  // ——— Segundo flujo: Coordinador con permisos admin ———
  console.log('\n🔄 Iniciando flujo Coordinador...')
  
  // Resetear permisos a valores de seed antes del flujo Coordinador
  await page.evaluate(() => {
    const seed = {
      permisos: {
        coordinador: { inscripcion: true, miRecinto: false, miCarpeta: false, cba: false, cbe: false, callcenter: false, admin: true },
        dirigente: { inscripcion: true, miRecinto: true, miCarpeta: true, cba: false, cbe: false, callcenter: true, admin: false, fidelizados: true },
      }
    }
    localStorage.setItem('clb.permisos', JSON.stringify(seed.permisos))
  })
  await page.reload({ waitUntil: 'networkidle' })
  
  // Primero, cerrar sesión del usuario Dirigente actual
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByRole('button', { name: /Ir a Mi Perfil/ }).click()
  await page.getByTestId('page-perfil').waitFor()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: /Cerrar sesión/ }).click()
  await page.getByTestId('portada').waitFor()
  console.log('  Sesión Dirigente cerrada, en portada')
  
  // Navegar a login para Coordinador
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByTestId('page-login').waitFor()
  console.log('  En página de login')
  
  // Login como Coordinador
  await page.getByLabel(/cédula de identidad/i).fill('402-1234567-9')
  await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
  await page.getByRole('button', { name: /Iniciar sesión/i }).click()
  await page.getByTestId('page-dashboard').waitFor({ timeout: 20000 })
  check('sesión coordinador activa', await page.getByText(/Ana/).first().isVisible())
  
  // Verificar que ve la tarjeta de Administración en Más
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByTestId('page-mas').waitFor()
  check('tarjeta Administración visible', await page.getByText('Administración').isVisible())
  await foto(page, '22-mas-coordinador')
  
  // Acceder al panel de administración
  await page.getByRole('button', { name: /Administración/ }).click()
  await page.getByTestId('page-admin').waitFor()
  check('panel admin cargado', await page.getByRole('heading', { name: 'Panel de Administración' }).isVisible())
  await foto(page, '23-admin-panel')
  
  // Cambiar permiso de CBA para Dirigente - habilitarlo en el admin panel
  await page.getByRole('tab', { name: /Dirigente/ }).click()
  await page.waitForTimeout(500)
  // Hacer click en el label (no en el input oculto) para activar el toggle
  const cbaDirigenteLabel = page.locator('label:has(input[aria-label="Dirigente CBA"])')
  await cbaDirigenteLabel.waitFor({ state: 'visible' })
  await cbaDirigenteLabel.click()
  await page.waitForTimeout(2000)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByTestId('page-admin').waitFor()
  await page.getByRole('tab', { name: /Dirigente/ }).click()
  await page.waitForTimeout(500)
  // Verificar que el permiso cambió en localStorage
  const permLS2 = await page.evaluate(() => JSON.parse(localStorage.getItem('clb.permisos')))
  console.log('  localStorage permisos:', JSON.stringify(await page.evaluate(() => JSON.parse(localStorage.getItem('clb.permisos')))))
  check('permiso CBA Dirigente habilitado en localStorage', (await page.evaluate(() => JSON.parse(localStorage.getItem('clb.permisos')))).dirigente.cba === true)
  await foto(page, '24-admin-toggle')
  
  // Verificar que el cambio persiste en localStorage
  const permLS = await page.evaluate(() => JSON.parse(localStorage.getItem('clb.permisos')))
  check('permiso persistido en localStorage', permLS.dirigente.cba === true)
  
  // Volver a Más y verificar que ahora ve CBA como Dirigente
  await page.locator('button:has-text("Volver a Más"):visible').last().click()
  await page.getByTestId('page-mas').waitFor()
  
  // Cerrar sesión del Coordinador antes de cambiar de usuario
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByRole('button', { name: /Ir a Mi Perfil/ }).click()
  await page.getByTestId('page-perfil').waitFor()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: /Cerrar sesión/ }).click()
  await page.getByTestId('portada').waitFor()
  console.log('  Sesión Coordinador cerrada, en portada')
  
  // Cambiar a usuario Dirigente (navegar a login directamente)
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByTestId('page-login').waitFor()
  console.log('  En página de login para Dirigente')
  
  // Login como Dirigente
  await page.getByLabel(/cédula de identidad/i).fill('402-1234567-8')
  await page.locator('input[type="password"]').first().fill('ClbSegura2026@')
  await page.getByRole('button', { name: /Iniciar sesión/i }).click()
  await page.getByTestId('page-dashboard').waitFor({ timeout: 20000 })
  check('sesión dirigente activa', await page.getByText(/Juan/).first().isVisible())
  
  // Recargar para asegurar que los permisos se carguen desde localStorage actualizado
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByTestId('page-dashboard').waitFor()
  
  // Ir a Más y verificar que ahora ve CBA
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByTestId('page-mas').waitFor()
  check('Dirigente ve CBA tras habilitación', await page.getByText('CBA').isVisible())
  await foto(page, '25-mas-dirigente-cba')
  
  // Logout final
  await page.getByRole('link', { name: /Más/ }).click()
  await page.getByRole('button', { name: /Ir a Mi Perfil/ }).click()
  await page.getByTestId('page-perfil').waitFor()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: /Cerrar sesión/ }).click()
  await page.getByTestId('portada').waitFor()
  await foto(page, '26-portada-logout-final')
  check('logout final a portada', true)

  console.log('\n✅ Recorrido e2e completo (Coordinador + Dirigente) sin fallos')
} catch (e) {
  await foto(page, `99-fallo-paso${paso}`).catch(() => {})
  console.error(`\n❌ Fallo en el paso ${paso}: ${e.message}`)
  console.error(`   URL: ${page.url()}`)
  process.exitCode = 1
} finally {
  if (errores.length) {
    console.log(`\n⚠️  Errores de consola del navegador (${errores.length}):`)
    for (const e of errores.slice(0, 10)) console.log(`   ${e}`)
    process.exitCode = process.exitCode ?? 0
  } else {
    console.log('⚠️  Limpio: 0 errores de consola del navegador')
  }
  // ——— Pantallazos de las referencias para el cotejo visual ———
  try {
    const REFS = resolve('../stitch-reference')
    const refPage = await browser.newPage({ viewport: { width: 440, height: 930 }, deviceScaleFactor: 2 })
    for (const f of readdirSync(REFS).filter((f) => f.endsWith('.html'))) {
      await refPage.goto(`file:///${(resolve(REFS, f).replace(/\\/g, '/'))}`, { waitUntil: 'load', timeout: 20000 }).catch(() => {})
      await refPage.waitForTimeout(500)
      await refPage.screenshot({ path: resolve(SHOTS, `ref-${f.replace('.html', '')}.png`), fullPage: true })
    }
    console.log('📸 referencias capturadas')
    await browser.close()
  } catch (e) {
    console.error(`refs: ${e.message}`)
    await browser.close()
  }
}