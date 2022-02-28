"use strict";
exports.__esModule = true;
var rollup_plugin_typescript2_1 = require("rollup-plugin-typescript2");
var plugin_node_resolve_1 = require("@rollup/plugin-node-resolve");
var plugin_commonjs_1 = require("@rollup/plugin-commonjs");
var plugin_json_1 = require("@rollup/plugin-json");
var rollup_plugin_node_globals_1 = require("rollup-plugin-node-globals");
var rollup_plugin_node_builtins_1 = require("rollup-plugin-node-builtins");
var path = require("path");
var fs = require("fs");
var _ = require("lodash");
/**
 * Since Rollup runs inside each package we can just get the current
 * package we are bundling.
 */
var pkg = require(path.join(process.cwd(), "package.json"));
/**
 * and dig out its name.
 */
var name = pkg.name;
/**
 * to construct a copyright banner
 */
var copyright = "/* @preserve\n* ".concat(pkg.name, " - v").concat(pkg.version, " - ").concat(pkg.license, "\n* Copyright (c) 2018-").concat(new Date().getFullYear(), " Esri, Inc.\n* ").concat(new Date().toString(), "\n*\n* Licensed under the Apache License, Version 2.0 (the \"License\");\n* you may not use this file except in compliance with the License.\n* You may obtain a copy of the License at\n*\n*    http://www.apache.org/licenses/LICENSE-2.0\n*\n* Unless required by applicable law or agreed to in writing, software\n* distributed under the License is distributed on an \"AS IS\" BASIS,\n* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n* See the License for the specific language governing permissions and\n* limitations under the License.\n*/");
/**
 * The module name will be the name of the global variable used in UMD builds.
 * All exported members of each package will be attached to this global.
 */
var moduleName = "arcgisSolution";
var arcgisRestModuleName = 'arcgisRest';
var hubModuleName = 'arcgisHub';
/**
 * Now we need to discover all the `@esri/solution-*` package names so we can create
 * the `globals` and `externals` to pass to Rollup.
 */
var packageNames = fs
    .readdirSync(path.join(__dirname, "packages"))
    .filter(function (p) { return p[0] !== "."; })
    .map(function (p) {
    return require(path.join(__dirname, "packages", p, "package.json")).name;
}, {});
/**
 * Now we need to discover all the `@esri/arcgis-rest-*` package names so we can create
 * the `globals` and `externals` to pass to Rollup.
 */
var peerDependencies = pkg.peerDependencies || [];
var arcgisRestJsPackageNames = Object.keys(peerDependencies)
    .filter(function (key) { return /@esri\/arcgis-rest/.test(key); });
var hubJsPackageNames = Object.keys(peerDependencies)
    .filter(function (key) { return /@esri\/hub-/.test(key); });
/**
 * Rollup will use this map to determine where to lookup modules on the global
 * window object when neither AMD or CommonJS is being used. This configuration
 * will cause Rollup to lookup all imports from our packages on a single global
 * `arcgisSolution` object.
 */
var globals = packageNames.reduce(function (globals, p) {
    globals[p] = moduleName;
    return globals;
}, {});
/**
* now we tell Rollup to lookup all imports from arcgis-rest-js on a single global
* `arcgisRest` object.
*/
arcgisRestJsPackageNames.reduce(function (globals, p) {
    globals[p] = arcgisRestModuleName;
    return globals;
}, globals);
hubJsPackageNames.reduce(function (globals, p) {
    globals[p] = hubModuleName;
    return globals;
}, globals);
/**
 * Now we can export the Rollup config!
 */
exports["default"] = {
    input: "./src/index.ts",
    output: {
        file: "./dist/umd/".concat(name.replace("@esri/solution-", ""), ".umd.js"),
        sourcemap: true,
        banner: copyright,
        format: "umd",
        name: moduleName,
        globals: globals,
        extend: true // causes this module to extend the global specified by `moduleName`
    },
    context: "window",
    external: packageNames.concat(arcgisRestJsPackageNames, hubJsPackageNames),
    plugins: [
        (0, rollup_plugin_typescript2_1["default"])(),
        (0, plugin_node_resolve_1["default"])({ preferBuiltins: true, browser: true }),
        (0, plugin_commonjs_1["default"])(),
        (0, plugin_json_1["default"])(),
        (0, rollup_plugin_node_globals_1["default"])(),
        (0, rollup_plugin_node_builtins_1["default"])()
    ]
};
