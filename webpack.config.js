const path = require('path');
const destination = path.resolve(__dirname, 'dist');

/*
module.exports = {
  entry: './dist/src/index.js',
  mode: 'production',
  output: {
    library: 'arcgis_clone_js',
    filename: 'arcgis_clone_js.js',
    path: destination
  }
};
*/

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
  }
}, {
  entry: '../arcgis-rest-js/packages/arcgis-rest-auth/dist/umd/auth.umd.min.js',
  mode: 'production',
  output: {
    library: 'arcgis_rest_auth',
    filename: 'arcgis-rest-auth.js',
    path: destination
  }
}, {
  entry: '../arcgis-rest-js/packages/arcgis-rest-feature-service-admin/dist/umd/feature-service-admin.umd.min.js',
  mode: 'production',
  output: {
    library: 'arcgis_rest_feature_service_admin',
    filename: 'arcgis-rest-feature-service-admin.js',
    path: destination
  }
}, {
  entry: '../arcgis-rest-js/packages/arcgis-rest-groups/dist/umd/groups.umd.min.js',
  mode: 'production',
  output: {
    library: 'arcgis_rest_groups',
    filename: 'arcgis-rest-groups.js',
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
}, {
  entry: '../arcgis-rest-js/packages/arcgis-rest-sharing/dist/umd/sharing.umd.min.js',
  mode: 'production',
  output: {
    library: 'arcgis_rest_sharing',
    filename: 'arcgis-rest-sharing.js',
    path: destination
  }
}];
