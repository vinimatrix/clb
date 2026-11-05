import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const PUBLIC_DIR = resolve(__dirname, '..', '..', 'public')

describe('PWA - Service Worker y Manifest', () => {
  it('manifiesto existe y tiene name, start_url, display', () => {
    const manifestPath = resolve(PUBLIC_DIR, 'manifest.json')
    expect(() => readFileSync(manifestPath, 'utf8')).not.toThrow()
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    expect(manifest.name).toBeTruthy()
    expect(manifest.start_url).toBeTruthy()
    expect(manifest.display).toBe('standalone')
  })

  it('service worker sw.js existe', () => {
    const swPath = resolve(__dirname, '..', 'sw.js')
    expect(() => readFileSync(swPath, 'utf8')).not.toThrow()
    const swContent = readFileSync(swPath, 'utf8')
    expect(swContent).toContain('self.addEventListener')
    expect(swContent).toContain('caches.open')
  })

  it('registerSW existe y registra el service worker', () => {
    const swPath = resolve(__dirname, '..', 'registerSW.jsx')
    expect(() => readFileSync(swPath, 'utf8')).not.toThrow()
    const content = readFileSync(swPath, 'utf8')
    expect(content).toContain('navigator.serviceWorker')
  })

  it('index.html incluye link al manifest', () => {
    const indexPath = resolve(__dirname, '..', '..', 'index.html')
    const indexContent = readFileSync(indexPath, 'utf8')
    expect(indexContent).toContain('manifest.json')
  })
})