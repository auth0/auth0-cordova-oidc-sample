const path = require('path');
const webpack = require('webpack');

const config = {

  context: __dirname,

  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, './www'),
    filename: 'index.js'
  },

  devtool: 'source-map',

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
