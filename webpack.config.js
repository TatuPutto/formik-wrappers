/* eslint-disable */
'use strict'
const path = require('path')

module.exports = {
  devtool: 'source-map',
  mode: 'development',
  entry: path.resolve(__dirname, 'example/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'example'),
    inline: true,
    host: '192.168.8.103',
    port: 3031,
    disableHostCheck: true,
    stats: 'errors-only'
  }
}
