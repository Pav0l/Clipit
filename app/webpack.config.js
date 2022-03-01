const path = require("path");
const fs = require("fs");
const config = require("config");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isDevelopment = process.env["NODE_ENV"] === "development";
const mode = process.env["NODE_APP_INSTANCE"]; // app / extension

console.log(`Running Webpack in ${mode ?? "APP"} mode`);
console.log("App config:", config);

const appConfig = {
  entry: "./src/index.tsx",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "index.js",
    publicPath: "/", // react-router default path
  },
  devServer: {
    port: 3000,
    watchContentBase: true,
    historyApiFallback: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      process: require.resolve("process/browser"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /nodeModules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      favicon: "./src/assets/favicon.ico",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify({ ...config, isDevelopment }),
    }),
  ],
};

const extensionConfig = {
  entry: "./src/extension/index.tsx",
  output: {
    path: path.join(__dirname, "/ext-dist"),
    filename: "index.js",
    publicPath: "/", // react-router default path
  },
  devServer: {
    port: 3001,
    watchContentBase: true,
    historyApiFallback: true,
    https: {
      key: fs.readFileSync("./certs/key.pem"),
      cert: fs.readFileSync("./certs/cert.pem"),
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      process: require.resolve("process/browser"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /nodeModules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/extension/index.html",
      publicPath: "./",
    }),
    new HtmlWebpackPlugin({
      filename: "config.html",
      template: "./src/extension/public/config.html",
      publicPath: "./",
    }),
    new HtmlWebpackPlugin({
      filename: "panel.html",
      template: "./src/extension/public/panel.html",
      publicPath: "./",
    }),
    new HtmlWebpackPlugin({
      filename: "streamer.html",
      template: "./src/extension/public/streamer.html",
      publicPath: "./",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify({ ...config, isDevelopment }),
    }),
  ],
};

module.exports = mode === "extension" ? extensionConfig : appConfig;
