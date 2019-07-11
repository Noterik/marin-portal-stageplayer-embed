const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const constants = require('../constants');
const context = path.resolve(__dirname, "src");

const devServer =
  process.env.NODE_ENV !== "production"
    ? {
        host: constants.CLIENT_HOST,
        port: constants.CLIENT_PORT,
        hot: true,
        contentBase: '/static',
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      }
    : {};

if (process.env.NODE_ENV !== "production") {
  console.log("Development server configuration = ", devServer);
}

module.exports = {
  context,
  entry: {
    app: ["./index"]
  },
  target: "web",
  mode: process.env.NODE_ENV || 'development',
  devServer,
  devtool: "source-maps",
  output: {
    filename: "stageplayer-embed.bundle.js",
    path: path.resolve(__dirname, "public")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  },
  externals: {
    marin: "marin"
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Marin - StagePlayer",
      template: path.resolve(__dirname, "src/index.ejs")
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'STAGEPLAYER_ENDPOINT': JSON.stringify(constants.STAGEPLAYER_ENDPOINT),
      }
    })
  ]
};
