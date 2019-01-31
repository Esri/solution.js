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
}, {
  entry: '../adlib/dist/adlib.js',
  mode: 'production',
  output: {
    library: 'adlib',
    filename: 'adlib.js',
    path: destination
  }}, {
  entry: '../arcgis-rest-js/packages/arcgis-rest-auth/dist/umd/auth.umd.min.js',
  mode: 'production',
  output: {
    library: 'arcgis_rest_auth',
    filename: 'arcgis-rest-auth.js',
    path: destination
  }
}, {
  entry: '../arcgis-rest-js/packages/arcgis-rest-items/dist/umd/items.umd.min.js',
  mode: 'production',
  output: {
    library: 'arcgis_rest_items',
    filename: 'arcgis-rest-items.js',
    path: destination
  }
}, {
  entry: '../arcgis-rest-js/packages/arcgis-rest-request/dist/umd/request.umd.min.js',
  mode: 'production',
  output: {
    library: 'arcgis_rest_request',
    filename: 'arcgis-rest-request.js',
    path: destination
  }
}];
