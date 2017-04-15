var path = require('path');
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    './client/index.js'
  ],
  output: {
    path: __dirname+'/client/',
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015', 'stage-1']
      }
    },
    {
      test: /\.(jpg|png)$/,
      loader: 'url-loader?mimetype=image/png'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './client'
  },
  plugins: [
    new SWPrecacheWebpackPlugin(
      {
        cacheId: 'Soundwise',
        filename: 'service-worker.js',
        maximumFileSizeToCacheInBytes: 10485760, //10mb
        minify: true,
        runtimeCaching: [{
          handler: 'cacheFirst',
          urlPattern: /[.]mp3$/,
          options: {
            cache: {
              name: 'audio-cache'
            }
          }
        }],
      }
    ),
  ]
};
