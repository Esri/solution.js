import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import globalsPlugin from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";

const path = require("path");
const fs = require("fs");
const _ = require("lodash");

/**
 * Since Rollup runs inside each package we can just get the current
 * package we are bundling.
 */
const pkg = require(path.join(process.cwd(), "package.json"));

/**
 * and dig out its name.
 */
const { name } = pkg;

/**
 * to construct a copyright banner
 */

const copyright = `/* @preserve
* ${pkg.name} - v${pkg.version} - ${pkg.license}
* Copyright (c) 2018-${new Date().getFullYear()} Esri, Inc.
* ${new Date().toString()}
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/`;


/**
 * The module name will be the name of the global variable used in UMD builds.
 * All exported members of each package will be attached to this global.
 */
const moduleName = "arcgisSolution";
const arcgisRestModuleName = 'arcgisRest'
const hubModuleName = 'arcgisHub'

/**
 * Now we need to discover all the `@esri/solution-*` package names so we can create
 * the `globals` and `externals` to pass to Rollup.
 */
const packageNames = fs
  .readdirSync(path.join(__dirname, "packages"))
  .filter(p => p[0] !== ".")
  .map(p => {
    return require(path.join(__dirname, "packages", p, "package.json")).name;
  }, {});

/**
 * Now we need to discover all the `@esri/arcgis-rest-*` package names so we can create
 * the `globals` and `externals` to pass to Rollup.
 */
const peerDependencies = pkg.peerDependencies || [];

const arcgisRestJsPackageNames = Object.keys(peerDependencies)
  .filter(key => /@esri\/arcgis-rest/.test(key));

const hubJsPackageNames = Object.keys(peerDependencies)
  .filter(key => /@esri\/hub-/.test(key));

/**
 * Rollup will use this map to determine where to lookup modules on the global
 * window object when neither AMD or CommonJS is being used. This configuration
 * will cause Rollup to lookup all imports from our packages on a single global
 * `arcgisSolution` object.
 */
const globals = packageNames.reduce((globals, p) => {
  globals[p] = moduleName;
  return globals;
}, {});

/**
* now we tell Rollup to lookup all imports from arcgis-rest-js on a single global
* `arcgisRest` object.
*/
arcgisRestJsPackageNames.reduce((globals, p) => {
  globals[p] = arcgisRestModuleName;
  return globals;
}, globals);

hubJsPackageNames.reduce((globals, p) => {
  globals[p] = hubModuleName;
  return globals;
}, globals);

/**
 * Now we can export the Rollup config!
 */
export default {
  input: "./src/index.ts",
  output: {
    file: `./dist/umd/${name.replace("@esri/solution-", "")}.umd.js`,
    sourcemap: true,
    banner: copyright,
    format: "umd",
    name: moduleName,
    globals,
    extend: true // causes this module to extend the global specified by `moduleName`
  },
  context: "window",
  external: packageNames.concat(arcgisRestJsPackageNames, hubJsPackageNames),
  plugins: [
    typescript(),
    resolve({ preferBuiltins: true, browser: true }),
    commonjs(),
    json(),
    globalsPlugin(),
    builtins()
  ]
};
