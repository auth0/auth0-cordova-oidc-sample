const path = require('path');
const webpack = require('webpack');

const config = {

  context: __dirname,

  entry: {
    'auth0-cordova.min': './index.js',
    'auth0-cordova': './index.js'
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    library: 'Auth0Cordova',
    libraryTarget: 'umd',
    filename: '[name].js'
  },

  devtool: 'source-map',

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      compress: true,
    }),
    new webpack.ProgressPlugin((prog) => {
        if(prog === 0) console.log("[webpack]: Bundle is now invalid.");
        if(prog === 1) console.log("[webpack]: Bundle is now valid.");
    })
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }
    ]
  }
}
module.exports = config;