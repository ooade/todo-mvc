/* eslint-disable global-require */

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  graphql: {
    url: process.env.APP_URL || 'http://localhost:3001',
    port: 3001
  }
};

export default config;
