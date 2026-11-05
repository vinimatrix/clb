/**
 * ecosystem.config.js - Configuración de PM2 para producción en Windows Server 2025.
 * Ejecutar con: pm2 start ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'clb-api',
      script: './dist/cluster.entry.js', // Usar el entry point con cluster
      cwd: './',
      instances: 'max',      // Un worker por núcleo CPU
      exec_mode: 'cluster',  // Modo cluster de PM2
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G', // Reiniciar si usa más de 1 GB de RAM
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        WORKER_COUNT: 0, // 0 = usar todos los núcleos
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      pid_file: './logs/pm2.pid',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
