const API_BASE_URL = 'http://localhost:3001/api';
const USE_API = true;

async function apiRequest(method, endpoint, data = null) {
  if (!USE_API) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const token = localStorage.getItem('clb.token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('clb.session');
        localStorage.removeItem('clb.token');
        window.location.href = '/login';
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.warn('API request failed, falling back to localStorage:', error.message);
    return null;
  }
}

export const api = {
  login: (cedula, password) => apiRequest('POST', '/auth/login', { cedula, password }),
  getElectores: () => apiRequest('GET', '/electores'),
  addElector: (data) => apiRequest('POST', '/electores', data),
  updateElector: (id, data) => apiRequest('PUT', `/electores/${id}`, data),
  deleteElector: (id) => apiRequest('DELETE', `/electores/${id}`),
  getComites: () => apiRequest('GET', '/comites'),
  addComite: (data) => apiRequest('POST', '/comites', data),
  updateComite: (id, data) => apiRequest('PUT', `/comites/${id}`, data),
  deleteComite: (id) => apiRequest('DELETE', `/comites/${id}`),
  getLlamadas: () => apiRequest('GET', '/llamadas'),
  addLlamada: (data) => apiRequest('POST', '/llamadas', data),
  getUsuarios: () => apiRequest('GET', '/usuarios'),
  getPermisos: (rol) => apiRequest('GET', `/usuarios/permisos/${rol}`),
  updatePermiso: (rol, modulo, valor) => apiRequest('PUT', `/usuarios/permisos/${rol}/${modulo}`, { habilitado: valor }),
};

export default api;