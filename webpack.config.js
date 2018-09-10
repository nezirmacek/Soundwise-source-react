const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

const env =
  dotenv.config({
    path: path.resolve(
      process.cwd(),
      `client-${
        process.env.NODE_ENV === 'dev' ? 'development' : 'production'
      }.env`
    ),
  }) || {};

const envKeys = Object.keys(env).reduce(
  (prev, next) => ({
    ...prev,
    [next]: JSON.stringify(env[next]),
  }),
  {}
);

module.exports = {
  mode: 'development',
  // devtool: 'source-map',
  context: __dirname,
  node: {
    // console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  entry: ['babel-polyfill', './client/index.js'],
  output: {
    path: path.resolve(__dirname, 'client/'),
    publicPath: '/',
    filename: 'bundle.js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        exclude: [/node_modules/],
        loader: 'json-loader',
      },
      {
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-1'],
        },
      },
      {
        test: /\.(jpg|png)$/,
        loader: 'url-loader?mimetype=image/png',
      },
      {
        test: /\.css$/,
        exclude: /Draft\.css$/,
        loaders: ['style-loader', 'css-loader?modules'],
      },
      {
        test: /Draft\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'url-loader',
      },
    ],
  },
  // optimization: {
  //   minimizer: [new UglifyJsPlugin()],
  // },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      videojs: 'video.js',
      WaveSurfer: 'wavesurfer.js',
    },
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './client',
  },
  plugins: [
    // new webpack.SourceMapDevToolPlugin({
    //   filename: '[file].map',
    // }),
    new webpack.ProvidePlugin({
      videojs: 'video.js/dist/video.cjs.js',
      'window.videojs': 'video.js/dist/video.cjs.js',
      RecordRTC: 'recordrtc',
      'window.RecordRTC': 'recordrtc',
    }),
    new webpack.DefinePlugin({
      'process.env': envKeys,
    }),
  ],
};
