export const API_CONFIG = {
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001/api',
  useApi: true, // Cambiar a false para usar solo localStorage (modo offline)
};