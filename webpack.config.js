'use strict';

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const precss = require('precss');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let appEntry;
let devtool;
let plugins;

if (process.env.NODE_ENV === 'production') {
  appEntry = [path.join(__dirname, 'client/index.js')];
  devtool = 'cheap-module-source-map';
  plugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true
      }
    }),
    new HtmlWebpackPlugin({
      title: 'Relay Fullstack, Powered by Relay Fullstack',
      template: './client/index.html',
      mobile: true,
      inject: false
    })
  ];
} else {
  appEntry = [
    path.join(__dirname, 'client/index.js'),
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server'
  ];
  devtool = 'eval';
  plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true
    }),
    new HtmlWebpackPlugin({
      title: 'Relay Fullstack, Powered by Relay Fullstack',
      template: './client/index.html',
      inject: false
    })
  ];
}

module.exports = {
  entry: {
    app: appEntry,
    vendor: ['react', 'react-dom', 'react-relay', 'react-router', 'react-router-relay']
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].js'
  },
  devtool,
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }, {
      test: /\.scss$/,
      loaders: [
        'style',
        'css?modules&importLoaders=1' +
          '&localIdentName=[name]__[local]___[hash:base64:5]!postcss'
      ]
    }, {
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
      loader: 'url-loader?limit=10000&name=assets/[hash].[ext]'
    }]
  },
  postcss: () => [precss, autoprefixer],
  plugins
};
