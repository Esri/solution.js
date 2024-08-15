[![npm status][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![Coverage status][coverage-img]][coverage-url]
[![Apache 2.0 licensed][license-img]][license-url]

[npm-img]: https://img.shields.io/npm/v/@esri/solution-common.svg?style=round-square&color=blue
[npm-url]: https://www.npmjs.com/package/@esri/solution-common
[travis-img]: https://img.shields.io/travis/com/Esri/solution.js/develop.svg
[travis-url]: https://app.travis-ci.com/github/Esri/solution.js
[coverage-img]: https://codecov.io/gh/Esri/solution.js/branch/develop/graph/badge.svg?token=3SMwRL1AO5
[coverage-url]: https://codecov.io/gh/Esri/solution.js
[license-img]: https://img.shields.io/badge/license-Apache%202.0-blue.svg
[license-url]: #license

## Solution.js
> TypeScript wrappers running in Node.js and modern browsers for transferring ArcGIS Online items from one organization to another. [Video introduction](https://youtu.be/esmUmIf3hcI) from the 2020 Developer Summit.

### Table of Contents

- [API Overview](#api-overview)
- [Instructions](#instructions)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Guides](#guides)
- [Issues](#issues)
- [Versioning](#versioning)
- [Contributing](#contributing)
- [License](#license)

---

### API Overview

#### Common terms

An ArcGIS Online (AGO) `item` is transformed into a `template` that contains all of its defining information. If the item depends on other items, those items are also transformed into templates.

A `Solution Item` can contain either

* a list of Item Templates
* a list of references to deployed items

When it contains Item Templates, it can be used for organizing and distributing Solutions, e.g., for displaying in a gallery of Solutions.

When a Solution is deployed into an organization, a new Solution is created that contains references to the items deployed into the organization; it serves as a table of contents for the deployment.

#### Packages

The API is divided into packages to make it easier to use just the parts that you want:

* `common` contains common helper functions for the other packages
* `creator` contains functions for transforming items into templates
* `deployer` contains functions for deploying item templates into items in a destination organization
* `feature-layer` contains functions for Feature Service items
* `file` contains functions for items that contain files
* `form` contains functions for form items
* `group` contains functions for Groups
* `hub-types` contains functions supporting ArcGIS Hub Sites and Initiatives
* `simple-types` contains functions for the simpler item types Dashboard, Form, Web Map, Web Mapping Application, and Workforce Project
* `storymap` contains functions for Storymap items
* `velocity` contains functions to support ArcGIS Velocity items
* `viewer` contains functions to support displaying Solution items
* `web-experience` contains functions for Experience Builder items
* `web-tool` contains functions for Web Tool Geoprocessing Service items
* `workflow` contains functions for Workflow items

#### Additional information

The API documentation is published at https://esri.github.io/solution.js/

#### Supported ArcGIS Online Item Types

Currently, the ArcGIS Online item types that can be converted into a template are:

* **App types:** Dashboard, Data Pipeline, Form, Hub Page, Hub Site Application, Insights Model, Notebook, Oriented Imagery Catalog, QuickCapture Project, Site Application, Site Page, StoryMap, Web Experience, Web Mapping Application, Workforce Project

* **Map types:** Web Map, Web Scene

* **Layer types:** Big Data Analytic, Feature Collection, Feature Service, Feed, Geoprocessing Service, Map Service, Real Time Analytic, Vector Tile Service

* **File types:** 360 VR Experience, AppBuilder Extension, AppBuilder Widget Package, Application Configuration, ArcGIS Pro Add In, ArcGIS Pro Configuration, ArcPad Package, Basemap Package, CAD Drawing, CityEngine Web Scene, Code Sample, Color Set, Compact Tile Package, CSV Collection, CSV, Deep Learning Package, Desktop Add In, Desktop Application Template, Desktop Style, Document Link, Explorer Add In, Explorer Layer, Explorer Map, Feature Collection Template, File Geodatabase, GeoJson, GeoPackage, Geoprocessing Package, Geoprocessing Sample, Globe Document, Image Collection, Image, iWork Keynote, iWork Numbers, iWork Pages, KML Collection, Layer Package, Layer Template, Layer, Layout, Locator Package, Map Document, Map Package, Map Template, Microsoft Excel, Microsoft Powerpoint, Microsoft Word, Mobile Basemap Package, Mobile Map Package, Mobile Scene Package, Native Application, Native Application Installer, Native Application Template, netCDF, Operation View, Operations Dashboard Add In, Operations Dashboard Extension, PDF, Pro Layer Package, Pro Layer, Pro Map Package, Pro Map, Pro Report, Project Package, Project Template, Published Map, Raster function template, Report Template, Rule Package, Scene Document, Scene Package, Service Definition, Shapefile, Statistical Data Collection, Style, Survey123 Add In, Symbol Set, Task File, Tile Package, Toolbox Package, Vector Tile Package, Viewer Configuration, Visio Document, Window Mobile Package, Windows Mobile Package, Windows Viewer Add In, Windows Viewer Configuration, Workflow, Workflow Manager Package

*You can use the `implementedTypes` demo to get the latest version of these lists; the demo generates its lists from the source code.*


### Instructions

#### Setup

The repository can be built using the Windows batch file `build.bat` or the bash command shell `build.sh`. These files run `npm install`, build the library and its demos, and run the unit tests.


#### npm commands

For a list of all available commands run `npm run`.

These commands are

* building
  * `npm run build` Creates esm and cjs outputs for each package
  * `npm run build:esm` Creates esm outputs for each package
  * `npm run build:cjs` Creates cjs outputs for each package
  * `npm run clean` runs `clean:src` and `clean:dist` _(requires bash console)_
    * `npm run clean:src` deletes `.d.ts`, `.js`, and `.js.map` files
    * `npm run clean:dist` deletes `.rpt2_cache` and `dist` folders
  * `npm run deepclean` deletes node_modules and runs `clean`
  * `npm run lint` lints the TypeScript files
  * `npm run lint:fix` lints the TypeScript files and fixes what it can
  * `npm run prettify` beautifies TypeScript files
  * `npm run getupdates` modifies package.json with npm updates to packages

* testing
  * `npm run test` lints, then runs `test:chrome` tests to confirm that the API is functioning as expected
  * `npm run test:chrome` runs karma in the Chrome browser
  * `npm run test:chrome:ci` runs karma in the ChromeHeadlessCI browser
  * `npm run test:chrome:debug` runs karma in the Chrome browser and leaves the browser open for debugging tests
  * `npm run test:firefox` runs karma in the Firefox browser
  * `npm run test:firefox:ci` runs karma in the FirefoxHeadless browser
  * `npm run test:all` runs `test:chrome` and `test:firefox`

* publishing doc
  * `npm run docs:build` builds the documentation ___(note that this script creates a `docs` folder, deleting any existing one)___
  * `npm run docs:deploy` pushes the documentation to the repository's gh-pages
  * `npm run docs:srihash` generates the srihashes

* publishing code
  * `npm run release:prepare` to set up the publish and to pick a new version number
  * `npm run release:review` shows summary of git changes
  * `npm run release:publish-git` publishes a version to GitHub _(requires bash shell)_
  * `npm run release:publish-npm` publishes a version to npm _(requires Windows shell)_
  * `npm run release:publish-retry` is for retrying to publish npm; it does not update the git tag

* lifecycle
  * precommit lints staged files


### Frequently Asked Questions

* [What browsers are supported?](https://github.com/Esri/solution.js/blob/master/guides/FAQ.md#what-browsers-are-supported)
* [What is the development workflow?](https://github.com/Esri/solution.js/blob/master/guides/FAQ.md#what-is-the-development-workflow)


### Guides

* [Package Overview](https://github.com/Esri/solution.js/blob/master/guides/Package%20Overview.md)
* [Getting Started](https://github.com/Esri/solution.js/blob/master/guides/Getting%20Started.md)
* [Publishing to npmjs](https://github.com/Esri/solution.js/blob/master/guides/Publishing%20to%20npmjs.md)
* [Adding a Demo](https://github.com/Esri/solution.js/blob/master/guides/Adding%20a%20Demo.md)


### Issues

Found a bug or want to request a new feature? Please take a look at [previously logged issues](https://github.com/Esri/solution.js/issues);
if you don't see your concern, please let us know by [submitting an issue](https://github.com/Esri/solution.js/issues/new).


### Versioning

For transparency into the release cycle and in striving to maintain backward compatibility, @esri/solution.js is maintained under Semantic Versioning guidelines and will adhere to these rules whenever possible. For more information on SemVer, please visit <http://semver.org/>.


## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/Esri/solution.js/blob/master/CONTRIBUTING.md).


### License

Copyright &copy; 2018 Esri

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

A copy of the license is available in the repository's [LICENSE](https://github.com/Esri/solution.js/blob/master/LICENSE) file.

__[Third-Party Licenses](https://github.com/Esri/solution.js/blob/master/Third-Party%20Licenses.md)__
