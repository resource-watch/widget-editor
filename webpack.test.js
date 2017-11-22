const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  entry: ['babel-polyfill', './test.js'],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.js'
  },

  resolve: {
    modules: ['.', 'node_modules']
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Test WidgetEditor'
    })
  ]
});
