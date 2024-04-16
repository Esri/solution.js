const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: {
    main: './src/index.ts',
    authenticate: './src/authenticate.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'authenticate.html',
      template: 'authenticate.html',
      chunks: ['authenticate']
    }),
  ],
  module: {
    rules: [{
      test: /\.(ts|tsx)$/i,
      loader: 'ts-loader',
      exclude: ['/node_modules/'],
    },{
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    },{
      test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
      type: 'asset',
    },
      ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
