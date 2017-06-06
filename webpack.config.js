const path = require('path')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const webpack = require('webpack')

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
        importScripts: ['custom-handler.js'],
        runtimeCaching: [{
            urlPattern: /^https:\/\/maxcdn\.bootstrapcdn\.com\//,
            handler: 'cacheFirst'
          },
          // {
          //   handler: 'cacheFirst',
          //   urlPattern: /[.]jpg$/,
          // },
          // {
          //   handler: 'cacheFirst',
          //   urlPattern: /[.]png$/,
          // }
        ],
        staticFileGlobs: [
          'client/index.html',
          'client/css/**.css',
          'client/bundle.js',
          // 'client/js/jquery.min.js',
          // 'client/images/header_img4.jpg',
          'client/images/soundwiselogo_white.svg',
          'client/images/soundwiselogo.svg',
          'client/fonts/**.woff',
          'client/fonts/**.woff2',
          'client/fonts/**.svg',
          'client/fonts/**.eot',
          'client/fonts/**.otf',
          'client/fonts/**.ttf',
          // 'client/images/section2_background.png',
          'client/images/smiley_face.jpg',
          // 'client/images/entrepreneur-logo.png',
          // 'client/images/huffington-post-logo.png',
          // 'client/images/section2_sm_img.png'
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
    // new webpack.optimize.UglifyJsPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify('production')
    //   }
    // })
  ]
};
