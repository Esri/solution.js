[![npm status][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![Coverage status][coverage-img]][coverage-url]
[![Apache 2.0 licensed][license-img]][license-url]

[npm-img]: https://img.shields.io/npm/v/@esri/solution-common.svg?style=round-square&color=blue
[npm-url]: https://www.npmjs.com/package/@esri/solution-common
[travis-img]: https://img.shields.io/travis/Esri/solution.js/develop.svg
[travis-url]: https://travis-ci.org/Esri/solution.js
[coverage-img]: https://coveralls.io/repos/github/Esri/solution.js/badge.svg
[coverage-url]: https://coveralls.io/github/Esri/solution.js
[license-img]: https://img.shields.io/badge/license-Apache%202.0-blue.svg
[license-url]: #license

## Solution.js

### Table of Contents

- [API Overview](#api-overview)
- [Instructions](#instructions)
- [Frequently Asked Questions](#frequently-asked-questions)
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

* `common`, which contains common helper functions for the other packages
* `creator`, which contains functions for transforming items into templates
* `deployer`, which contains functions for deploying item templates into items in a destination organization
* `feature-layer`, which contains functions for Feature Service items
* `group`, which contains functions for Groups
* `simple-types`, which contains functions for the simpler item types Dashboard, Form, Web Map, Web Mapping Application, and Workforce Project
* `storymap`, which contains functions for Storymap items
* `viewer`, which contains functions to support displaying Solution items

#### Additional information

The API documentation is published at https://esri.github.io/solution.js/ ([source code](./docs/src)).

#### Supported ArcGIS Online Item Types

Currently, the item types that can be converted into a template are:

* Dashboard
* Feature Collection
* Feature Service (Hosted only and Hosted Feature Layer Views)
* Web Map
* Web Mapping Application

Planned item types are:

* ArcGIS Pro Add In
* Code Attachment
* Code Sample
* Desktop Add In
* Desktop Application Template
* Document Link
* Form
* Geoprocessing Package
* Geoprocessing Sample
* Layer Package
* Map Template
* Operation View
* Pro Map
* Project Package
* Project Template
* Storymap
* Workforce Project

### Instructions

You can install dependencies by cloning the repository and running:

```
npm install
```

Afterward, for a list of all available commands run `npm run`.

Some useful commands include:

* building
  * `npm run build` creates symlinks among packages and creates node, umd, and esm outputs for each package
  * `npm run clean` runs `clean:src` and `clean:dist`
    * `npm run clean:src` deletes `.d.ts`, `.js`, and `.js.map` files
    * `npm run clean:dist` deletes `.rpt2_cache` and `dist` folders
  * `npm run lint` lints the TypeScript files
  * `npm run lint:fix` lints the TypeScript files and fixes
  * `npm run prettify` beautifies TypeScript files

* testing
  * `npm run test` lints, then runs tests `test:node` and `test:chrome` to confirm that the API is functioning as expected
  * `npm run test:chrome` runs karma in the Chrome browser
  * `npm run test:chrome:ci` runs karma in the ChromeHeadlessCI browser
  * `npm run test:chrome:debug` runs karma in the Chrome browser and leaves the browser open for debugging tests
  * `npm run test:firefox` runs karma in the Firefox browser
  * `npm run test:node` runs jasmine
  * `npm run test:node:debug` runs jasmine in debug mode
  * `npm run test:ci` lints, then runs `test:node`, `test:chrome:ci`, `test:firefox`, and `coveralls` from a bash window
  * `npm run test:ci:win` lints, then runs `test:node`, `test:chrome:ci`, `test:firefox`, and `coveralls:win` from a Windows window
  * `npm run test:all` runs `test:node` and `test:chrome`
  * `npm run coveralls` updates code coverage info from a bash window
  * `npm run coveralls:win` updates code coverage info from a Windows window

* publishing doc
  * `npm run docs:build` _(requires bash console)_
    * `npm run docs:typedoc`
    * `npm run docs:build:acetate`
    * `npm run docs:build:sass`
    * `npm run docs:build:images`
    * `npm run docs:build:js`
  * `npm run docs:build:dev` _(requires bash console)_
    * `npm run docs:dev:typedoc`
    * `npm run docs:dev:acetate`
    * `npm run docs:dev:sass`
    * `npm run docs:dev:images`
    * `npm run docs:dev:js`
  * `npm run docs:serve` runs `docs:build` and hosts the documentation website on localhost:3000 _(requires bash console)_
  * `npm run docs:deploy` runs `docs:build` and pushes the documentation to the repository's gh-pages
  * `npm run docs:srihash`

* publishing code _(requires bash window)_
  * `npm run prerelease:prepare` fetch, clean, link packages, and test
  * `npm run release:prepare` prepares for publication and creates a changelog
  * `npm run release:review` assembles git changes _(use arrow keys to put cursor on line_ above _desired version)_
  * `npm run release:publish` publishes a version

* lifecycle
  * postinstall runs `bootstrap`
  * bootstrap
  * precommit



### Frequently Asked Questions

* [Is this a supported Esri product?](docs/FAQ.md#is-this-a-supported-esri-product)
* [Why TypeScript?](docs/FAQ.md#why-typescript) What if I prefer [VanillaJS](https://stackoverflow.com/questions/20435653/what-is-vanillajs)?

### Issues

Found a bug or want to request a new feature? Please take a look at [previously logged issues](https://github.com/Esri/solution.js/issues);
if you don't see your concern, please let us know by [submitting an issue](https://github.com/Esri/solution.js/issues/new).

### [Changelog](https://github.com/Esri/solution.js/blob/develop/CHANGELOG.md)

##### Versioning

For transparency into the release cycle and in striving to maintain backward compatibility, @esri/solution.js is maintained under Semantic Versioning guidelines and will adhere to these rules whenever possible. For more information on SemVer, please visit <http://semver.org/>.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](CONTRIBUTING.md).

### License

Copyright &copy; 2018-2019 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [LICENSE](./LICENSE) file.
