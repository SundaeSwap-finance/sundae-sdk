const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const util = require("util");
const path = require("path");

require("dotenv").config();

const config = {
  entry: path.resolve(__dirname, "./src/index.tsx"),
  devtool: "source-map",
  devServer: {
    static: path.resolve(process.cwd(), "dist"),
    devMiddleware: {
      publicPath: path.resolve(process.cwd(), "dist"),
      writeToDisk: true,
    },
  },
  mode: process.env.NODE_ENV,
  output: {
    publicPath: "./",
    webassemblyModuleFilename: "static/wasm/[modulehash].wasm",
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              sourceMap: true,
            },
          },
          "postcss-loader",
        ],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        resolve: {
          fullySpecified: false,
        },
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              target: "es2020",
              transform: {
                react: {
                  runtime: "automatic",
                },
              },
              parser: {
                syntax: "typescript",
                tsx: true,
                dynamicImport: true,
                useBuiltIns: true,
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    new FilterWarningsPlugin({
      exclude:
        /Critical dependency: the request of a dependency is an expression/,
    }),
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve("./src/index.ejs"),
      templateParameters: {
        appConfig: {
          envName: "local",
          apiUrls: {},
          blockfrostAPIPreview: process.env.BLOCKFROST_API_KEY_PREVIEW,
          blockfrostAPIMainnet: process.env.BLOCKFROST_API_KEY_MAINNET,
        },
      },
    }),
    new ForkTsCheckerWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  resolve: {
    extensions: [".tsx", ".js", ".jsx", ".ts", ".css"],
    fallback: {
      process: require.resolve("process/browser"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("crypto-browserify"),
      vm: require.resolve("vm-browserify"),
      path: require.resolve("path-browserify"),
      fs: false,
    },
  },
  experiments: {
    topLevelAwait: true,
    asyncWebAssembly: true,
  },
};

// eslint-disable-next-line no-console
console.log(util.inspect(config, false, Infinity, true));

module.exports = config;
