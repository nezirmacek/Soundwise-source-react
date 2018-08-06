module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/server.js',
      env: {
        NODE_ENV: 'dev',
      },
      env_staging: {
        NODE_ENV: 'dev',
        // it's moved to a separate env variable to not break legacy code
        STAGING_ENV: true,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
