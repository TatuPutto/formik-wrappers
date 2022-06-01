/* eslint-disable */
'use strict'
const path = require('path')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  // plugins: [
  //   new BundleAnalyzerPlugin(),
  // ],
  optimization: {
    minimize: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }
    ]
  },
  externals: {
    'react': 'commonjs react',
    'formik': 'commonjs formik',
    'lodash': 'commonjs lodash',
    'moment': 'commonjs moment'
  }
}
