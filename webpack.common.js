const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const PWAManifestPlugin = require('webpack-pwa-manifest');
const OfflinePlugin = require('offline-plugin');

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
      title: 'Lifelike',
      template: './src/index.template.ejs',
      favicon: path.resolve(__dirname, 'src/assets/icons/favicon.png')
    }),
    new PWAManifestPlugin({
      name: 'Lifelike',
      short_name: 'Lifelike',
      description: 'A Life-like Cellular Automaton',
      background_color: '#000000',
      theme_color: '#000000',
      display: 'fullscreen',
      icons: [
        {
          src: path.resolve(__dirname, 'src/assets/icons/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512, 1024]
        }
      ]
    }),
    new webpack.WatchIgnorePlugin([
      /css\.d\.ts$/
    ]),
    new OfflinePlugin()
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