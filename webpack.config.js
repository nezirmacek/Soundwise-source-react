const path = require('path')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  context: __dirname,
  node: {
    // console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  entry: [
    'babel-polyfill',
    './client/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'client/'),
    publicPath: '/',
    filename: 'bundle.js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
  },
  module: {
      loaders: [
          {
              test: /\.json$/,
              loader: 'json-loader'
          },
          {
              exclude: /node_modules/,
              loader: 'babel',
              query: {
                  presets: ['react', 'es2015', 'stage-1']
              }
          },
          {
              test: /\.(jpg|png)$/,
              loader: 'url-loader?mimetype=image/png'
          },
          {
            test: /\.css$/,
            exclude: /Draft\.css$/,
            loaders: [
              'style-loader',
              'css-loader?modules'
            ]
          },
          {
            test: /Draft\.css$/,
            loader: 'style-loader!css-loader',
          },
          {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'url-loader'
          }
      ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './client'
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
       filename: '[file].map',
    }),
    new webpack.ProvidePlugin({
        videojs: 'video.js', 'window.videojs': 'video.js',
        RecordRTC: 'recordrtc', 'window.RecordRTC': 'recordrtc',
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
