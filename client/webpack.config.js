const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const context = path.resolve(__dirname, 'src');

const proxy = {
  '/resources': {
    target: 'http://stageplayer/',
    pathRewrite: { '^/resources': '' },
  },
  [process.env.STAGE_ENDPOINT]: {
    target: `http://localhost:${process.env.SERVER_PORT}`,
    pathRewrite: { [`^/${process.env.STAGE_ENDPOINT}`]: '' },
  },
  [process.env.DATA_ENDPOINT]: {
    target: process.env.DATA_SERVER,
  },
  [process.env.SBF_DATA_ENDPOINT]: {
    target: process.env.SBF_DATA_SERVER,
  }
};

const devServer = process.env.NODE_ENV === 'development' ? {
  devServer: {
      host: '0.0.0.0',
      port: '3000',
      hot: true,
      contentBase: process.env.ASSET_ROOT || './public',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      proxy,
    }
} : {};

if(process.env.NODE_ENV === 'development') {
  console.log('Development server configuration = ', devServer);
}

module.exports = {
  context,
  entry: {
    app: ['./index'],
  },
  target: 'web',
  devServer,
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
        use: [
          {
            loader: 'babel-loader',
          },
        ],
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
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'ASSET_TEMPLATE': JSON.stringify(process.env.ASSET_TEMPLATE),
        'STAGE_ENDPOINT': JSON.stringify(process.env.STAGE_ENDPOINT),
        'DATA_ENDPOINT': JSON.stringify(process.env.DATA_ENDPOINT),
        'SBF_DATA_ENDPOINT': JSON.stringify(process.env.SBF_DATA_ENDPOINT),
      }
    })
  ],
};
