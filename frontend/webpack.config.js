const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require('path');
const Dotenv = require('dotenv-webpack');

const deps = require("./package.json").dependencies;

const printCompilationMessage = require('./compilation.config.js');

module.exports = (_, argv) => ({
  output: {
    publicPath: "http://localhost:3000/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  devServer: {
    port: 3000,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src')],
    onListening: function (devServer) {
      const port = devServer.server.address().port

      printCompilationMessage('compiling', port)

      devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
        setImmediate(() => {
          if (stats.hasErrors()) {
            printCompilationMessage('failure', port)
          } else {
            printCompilationMessage('success', port)
          }
        })
      })
    }
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(gif|svg|jpg|png)$/,
        dependency: { not: ['url'] },
        loader: "file-loader",
      }
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "frontend",
      filename: "remoteEntry.js",
      remotes: {
        'auth': 'auth_microfrontend@http://localhost:8081/remoteEntry.js',
        'profile': 'profile_microfrontend@http://localhost:8082/remoteEntry.js',
        'card_add': 'card_add_microfrontend@http://localhost:8083/remoteEntry.js',
        'card_del': 'card_del_microfrontend@http://localhost:8084/remoteEntry.js',
        'card_like': 'card_like_microfrontend@http://localhost:8085/remoteEntry.js',
      },
      exposes: {},
      shared: {
        ...deps,
        react: {
          eager: true,
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          eager: true,
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
        "react-router-dom": {
          eager: true,
          singleton: true,
          requiredVersion: deps["react-router-dom"],
        },
      },
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      favicon: "./public/favicon.ico",
      manifest: "./public/manifest.json"
    }),
    new Dotenv()
  ],
});
