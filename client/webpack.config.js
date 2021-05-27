const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const constants = require("../constants");

const context = path.resolve(__dirname, "src");

module.exports = env => {
  const isProduction = env && env.production;

  return {
    context,
    entry: {
      app: ["./index"]
    },
    target: "web",
    mode: isProduction ? "production" : "development",
    devServer: !isProduction
      ? {
          host: constants.CLIENT_HOST,
          port: constants.CLIENT_PORT,
          disableHostCheck: true,
          hot: true,
          contentBase: "/static",
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      : {},
    devtool: "source-maps",
    output: {
      filename: "stageplayer-embed.bundle.[hash].js",
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
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: "css-loader"
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
        "process.env": {
          STAGEPLAYER_ENDPOINT: JSON.stringify(constants.STAGEPLAYER_ENDPOINT)
        }
      })
    ]
  };
};
