import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { App } from '../src/server.js';

describe('API - Autenticación', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    server = createServer(App);
    await new Promise((resolve) => server.listen(0, resolve));
    const addr = server.address();
    baseUrl = `http://localhost:${addr.port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('debe registrar un nuevo usuario', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: '402-1234567-99',
        username: 'testuser',
        password: 'ClbTest123@',
        nombres: 'Test',
        apellidos: 'User',
        role: 'dirigente'
      })
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeTruthy();
    expect(data.user.username).toBe('testuser');
    expect(data.user.role).toBe('dirigente');
  });

  it('debe rechazar usuario duplicado', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: '402-1234567-99',
        username: 'testuser',
        password: 'ClbTest123@',
        nombres: 'Test',
        apellidos: 'User'
      })
    });
    expect(res.status).toBe(409);
  });

  it('debe iniciar sesión con credenciales correctas', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: '402-1234567-99',
        password: 'ClbTest123@'
      })
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeTruthy();
    expect(data.user.username).toBe('testuser');
  });

  it('debe rechazar credenciales incorrectas', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: '402-1234567-99',
        password: 'WrongPassword!'
      })
    });
    expect(res.status).toBe(401);
  });
});