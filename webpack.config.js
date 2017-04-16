var path = require('path');
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: [
    'babel-polyfill',
    './client/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'client/'),
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
        minify: false,
        stripPrefix: 'client/',
        navigateFallback: 'index.html',
        staticFileGlobs: [
          'client/index.html',
          'client/css/**.css',
          'client/bundle.js'
        ],
        // mergeStaticsConfig: true,
        // runtimeCaching: [{
        //   handler: 'cacheFirst',
        //   urlPattern: '/',
        //   options: {
        //     cache: {
        //       name: 'audio-cache'
        //     }
        //   }
        // }],
      }
    ),
  ]
};
