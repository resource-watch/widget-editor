const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const PeerDepsExternalsPlugin = require('peer-deps-externals-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'widgetEditor',
    libraryTarget: 'umd'
  },

  devtool: 'source-map',

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new ExtractTextPlugin('styles.css'),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new PeerDepsExternalsPlugin(),
    process.env.ANALYZE ? new BundleAnalyzerPlugin() : null
  ].filter(p => !!p),

  externals: ['react', 'prop-types', 'react-redux']
});
