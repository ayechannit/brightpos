module.exports = {
  apps: [
    {
      name: 'linyaungthit-backend',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
