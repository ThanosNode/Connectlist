module.exports = {
  apps: [
    {
      name: 'connectlist',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Restart options
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '60s',
      
      // Logging
      log_file: 'logs/app.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // Environment-specific settings
      merge_logs: true,
      autorestart: true,
      watch: false,
      
      // Health monitoring
      health_check_grace_period: 3000
    }
  ]
};