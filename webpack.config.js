const path = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const webpack = require('webpack');

module.exports = {
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
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        exclude: /node_modules/,
        loader: 'babel',
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
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
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
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
    }),
    new webpack.ProvidePlugin({
      videojs: 'video.js/dist/video.cjs.js',
      'window.videojs': 'video.js/dist/video.cjs.js',
      RecordRTC: 'recordrtc',
      'window.RecordRTC': 'recordrtc',
    }),
    // new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_PRIVATE_KEY_ID: JSON.stringify(
          process.env.FIREBASE_PRIVATE_KEY_ID
        ),
        FIREBASE_PRIVATE_KEY: JSON.stringify(process.env.FIREBASE_PRIVATE_KEY),
        FIREBASE_CLIENT_ID: JSON.stringify(process.env.FIREBASE_CLIENT_ID),
        FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
        FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(
          process.env.FIREBASE_MESSAGING_SENDER_ID
        ),
        STRIPE_KEY_LIVE: JSON.stringify(process.env.STRIPE_KEY_LIVE),
        STRIPE_KEY_TEST: JSON.stringify(process.env.STRIPE_KEY_TEST),
        AWS_ACCESS_KEY_ID: JSON.stringify(process.env.AWS_ACCESS_KEY_ID),
        AWS_SECRET_ACCESS_KEY: JSON.stringify(
          process.env.AWS_SECRET_ACCESS_KEY
        ),
        SENDIN_BLUE_API_KEY: JSON.stringify(process.env.SENDIN_BLUE_API_KEY),
        SEND_GRID_API_KEY: JSON.stringify(process.env.SEND_GRID_API_KEY),
        PAYPAL_CLIENT_ID: JSON.stringify(process.env.PAYPAL_CLIENT_ID),
        PAYPAL_CLIENT_SECRET: JSON.stringify(process.env.PAYPAL_CLIENT_SECRET),
        ALGOLIA_APP_ID: JSON.stringify(process.env.ALGOLIA_APP_ID),
        ALGOLIA_API_KEY: JSON.stringify(process.env.ALGOLIA_API_KEY),
      },
    }),
  ],
};
