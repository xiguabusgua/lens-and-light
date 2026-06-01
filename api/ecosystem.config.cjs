module.exports = {
  apps: [{
    name: 'lens-api',
    script: 'dist/index.js',
    cwd: '/www/wwwroot/lens-and-light/api',
    interpreter: '/www/server/nvm/versions/node/v20.20.2/bin/node',
    env: {
      NODE_ENV: 'production'
    },
    autorestart: true,
    max_restarts: 10,
    min_uptime: 5000
  }]
};