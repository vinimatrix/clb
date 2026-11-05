import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clb.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('clb.session');
      localStorage.removeItem('clb.token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  async login(cedula, password) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { cedula, password });
    return response.data;
  },

  async register(userData) {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  },

  // Electores
  async getElectores(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/electores`, { params });
    return response.data;
  }

  async getElector(id) {
    const response = await axios.get(`${API_BASE_URL}/electores/${id}`);
    return response.data;
  }

  async createElector(data) {
    const response = await axios.post(`${API_BASE_URL}/electores`, data);
    return response.data;
  }

  async updateElector(id, data) {
    const response = await axios.put(`${API_BASE_URL}/electores/${id}`, data);
    return response.data;
  }

  async deleteElector(id) {
    const response = await axios.delete(`${API_BASE_URL}/electores/${id}`);
    return response.data;
  }

  // Comités
  async getComites(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/comites`, { params });
    return response.data;
  }

  async createComite(data) {
    const response = await axios.post(`${API_BASE_URL}/comites`, data);
    return response.data;
  }

  async updateComite(id, data) {
    const response = await axios.put(`${API_BASE_URL}/comites/${id}`, data);
    return response.data;
  }

  async deleteComite(id) {
    const response = await axios.delete(`${API_BASE_URL}/comites/${id}`);
    return response.data;
  }

  // Llamadas
  async getLlamadas(params = {}) {
    const response = await axios.get(`${API_BASE_URL}/llamadas`, { params });
    return response.data;
  }

  async createLlamada(data) {
    const response = await axios.post(`${API_BASE_URL}/llamadas`, data);
    return response.data;
  }

  async updateLlamada(id, data) {
    const response = await axios.put(`${API_BASE_URL}/llamadas/${id}`, data);
    return response.data;
  }

  // Usuarios
  async getUsuarios() {
    const response = await axios.get(`${API_BASE_URL}/usuarios`);
    return response.data;
  }

  async getPermisos(rol) {
    const response = await axios.get(`${API_BASE_URL}/usuarios/permisos/${rol}`);
    return response.data;
  }

  async updatePermiso(rol, modulo, habilitado) {
    const response = await axios.put(`${API_BASE_URL}/usuarios/permisos/${rol}/${modulo}`, { habilitado });
    return response.data;
  }
};

export default api;