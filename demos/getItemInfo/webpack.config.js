const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const createDevAliases = () => ({
  '@esri/solution-common': path.resolve(__dirname, '../../packages/common/src/index.ts'),
  '@esri/solution-creator': path.resolve(__dirname, '../../packages/creator/src/index.ts'),
  '@esri/solution-deployer': path.resolve(__dirname, '../../packages/deployer/src/index.ts'),
  '@esri/solution-feature-layer': path.resolve(__dirname, '../../packages/feature-layer/src/index.ts'),
  '@esri/solution-file': path.resolve(__dirname, '../../packages/file/src/index.ts'),
  '@esri/solution-form': path.resolve(__dirname, '../../packages/form/src/index.ts'),
  '@esri/solution-group': path.resolve(__dirname, '../../packages/group/src/index.ts'),
  '@esri/solution-hub-types': path.resolve(__dirname, '../../packages/hub-types/src/index.ts'),
  '@esri/solution-simple-types': path.resolve(__dirname, '../../packages/simple-types/src/index.ts'),
  '@esri/solution-storymap': path.resolve(__dirname, '../../packages/storymap/src/index.ts'),
  '@esri/solution-velocity': path.resolve(__dirname, '../../packages/velocity/src/index.ts'),
  '@esri/solution-viewer': path.resolve(__dirname, '../../packages/viewer/src/index.ts'),
  '@esri/solution-web-experience': path.resolve(__dirname, '../../packages/web-experience/src/index.ts'),
  '@esri/solution-web-tool': path.resolve(__dirname, '../../packages/web-tool/src/index.ts'),
  '@esri/solution-workflow': path.resolve(__dirname, '../../packages/workflow/src/index.ts'),
});

const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
  module: {
    rules: [{
      test: /\.(ts|tsx)$/i,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: !isProduction,
        },
      },
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
    config.devtool = 'source-map';
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ...createDevAliases(),
    };
  }
  return config;
};
    ...config.experiments,
    topLevelAwait: true
  }

  return config;
};
