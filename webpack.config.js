const path = require('path');
const destination = path.resolve(__dirname, 'dist');

module.exports = [{
  entry: './dist/umd/arcgis-clone.umd.js',
  mode: 'production',
  output: {
    library: 'arcgis_clone_js',
    filename: 'arcgis-clone-js.js',
    path: destination
  }
}];
