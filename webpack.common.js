const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const PWAManifestPlugin = require('webpack-pwa-manifest');

module.exports = {
  entry: {
    app: './src/index.tsx'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, "dist")
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  plugins: [
    new CleanPlugin(['dist']),
    new HTMLPlugin({
      title: 'Cellular Automaton',
      template: './src/index.template.ejs'
    }),
    new PWAManifestPlugin({
      name: 'Cellular Automaton',
      short_name: 'Cellular Automaton',
      description: 'A Cellular Automaton simulator',
      background_color: '#000000',
      theme_color: '#000000'
    }),
    new webpack.WatchIgnorePlugin([
      /css\.d\.ts$/
    ])
  ],
  module: {
    rules: [{
        test: /\.tsx?$/,
        use: [
          {loader: 'babel-loader'},
          {loader: 'ts-loader'}
        ]
      },
      {
        enforce: 'pre',
        test: /\.js?$/,
        loader: 'source-map-loader'
      },
      {
        test: /.css$/,
        use:[
          {loader: 'style-loader'},
          {loader: 'typings-for-css-modules-loader?modules&namedExport&camelCase&localIdentName[name]__[local]--[hash:base64:5]'},
          {loader: 'postcss-loader'}
        ]
      }
    ]
  }
}