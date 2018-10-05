const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotEnvPlugin = require('webpack-dotenv-plugin');
const Dotenv = require('dotenv-webpack');

const context = path.resolve(__dirname, 'src');

console.log('Building App!');

module.exports = {
  context,
  entry: {
    app: [
      './index',
    ],
  },
  target: 'web',
  devServer: {
    host: 'localhost',
    port: '3000',
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  devtool: 'source-maps',
  output: {
    filename: 'stageplayer-embed.bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
        }],
      },
    ],
  },
  externals: {
    marin: 'marin',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Marin - StagePlayer',
      template: path.resolve(__dirname, 'src/index.ejs'),
    }),
    new DotEnvPlugin({
      sample: './.env.default',
      path: './.env',
    }),
  ],
};
