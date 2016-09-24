/* eslint-disable no-console, no-shadow */
import path from 'path';
import webpack from 'webpack';
import express from 'express';
import mongoose from 'mongoose';
import graphQLHTTP from 'express-graphql';
import WebpackDevServer from 'webpack-dev-server';
import historyApiFallback from 'connect-history-api-fallback';
import chalk from 'chalk';
import webpackConfig from '../webpack.config';
import config from './config';
import { getSchema } from './schemas';

import Todo from './models/todo';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/todo-mvc');

const schema = getSchema([Todo]);

if (process.env.NODE_ENV === 'development') {
  // Launch GraphQL
  const graphql = express();
  graphql.disable('x-powered-by');
  graphql.use('/', graphQLHTTP({
    graphiql: true,
    pretty: true,
    schema
  }));
  const graphQLServer = graphql.listen(config.graphql.port, () => console.log(chalk.green(`GraphQL is listening on port ${config.graphql.port}`)));

  // Launch Relay by using webpack.config.js
  const app = new WebpackDevServer(
    webpack(webpackConfig), {
      contentBase: '/build/',
      proxy: {
        '/graphql': config.graphql.url
      },
      stats: {
        colors: true
      },
      hot: true,
      historyApiFallback: true
    }
  );
  // Serve static resources
  app.use('/', express.static(path.join(__dirname, '../client')));
  app.listen(config.port, () => console.log(chalk.green(`Relay is listening on port ${config.port}`)));
} else {
  var app = express();

  app.use('/graphql', graphQLHTTP({
    schema,
    graphiql: true
  }));

  app.use('/', express.static(path.join(__dirname, '../build')));
  app.disable('x-powered-by');
  app.listen(config.port);
  console.log('GraphQL Sandbox started on port: 3000');
}
