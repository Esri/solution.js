[![Build status][travis-img]][travis-url]
[![Coverage status][coverage-img]][coverage-url]
[![Apache 2.0 licensed][license-img]][license-url]

[travis-img]: https://img.shields.io/travis/Esri/solution.js/develop.svg
[travis-url]: https://travis-ci.org/Esri/solution.js
[coverage-img]: https://coveralls.io/repos/github/Esri/solution.js/badge.svg
[coverage-url]: https://coveralls.io/github/Esri/solution.js
[license-img]: https://img.shields.io/badge/license-Apache%202.0-green.svg
[license-url]: #license

## Solution.js

### Table of Contents

- [API Overview](#api-overview)
- [Instructions](#instructions)
- [FAQ](#frequently-asked-questions)
- [Issues](#issues)
- [Versioning](#versioning)
- [Contributing](#contributing)
- [License](#license)

---

### API Overview

#### Common terms

An ArcGIS Online (AGO) `item` is transformed into a `template` that contains all of its defining information (except its thumbnail and resources; see [background info](./docs/Background.md)). If the item depends on other items, those items are also transformed into templates.

A `Solution Item` can contain either

* a list of Item Templates
* a list of references to deployed items

When it contains Item Templates, it can be used for organizing and distributing Solutions, e.g., for displaying in a gallery of Solutions.

When a Solution is deployed into an organization, a new Solution is created that contains references to the items deployed into the organization; it serves as a table of contents for the deployment.

#### Modules

The API contains two primary modules:

* `solution`, which contains functions for transforming items into templates, deploying item templates into items, and creating & using Solution Items.
* `viewing`, which contains functions to support displaying Solution Items.

#### Additional information

The API documentation is published at https://esri.github.io/arcgis-clone-js/ ([source code](./docs/src)).

Background information about the library is available in [background info](./docs/Background.md)).

#### Supported ArcGIS Online Item Types

Currently, the item types that can be converted into a template are:

* Dashboard
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
* Feature Collection
* Form
* Geoprocessing Package
* Geoprocessing Sample
* Layer Package
* Map Template
* Operation View
* Pro Map
* Project Package
* Project Template
* Workforce Project

### Instructions

You can install dependencies by cloning the repository and running:

```
npm install
```

Afterward, for a list of all available commands run `npm run`.

Some useful commands include:

* `lerna run build` creates node, umd, and esm output for each package
* `npm run lint` to lint the TypeScript files
* `npm test` runs tests test:node and test:chrome to confirm that the API is functioning as expected.
* `npm run test:chrome` runs karma in the ChromeHeadlessCI browser
* `npm run test:firefox` runs karma in the Firefox browser
* `npm run test:node` runs ts-node and jasmine
* `npm run docs:serve` creates documentation about the API and its internal functions

### Frequently Asked Questions

* [Is this a _supported_ Esri product?](docs/FAQ.md#is-this-a-supported-esri-product)
* [Why TypeScript?](docs/FAQ.md#why-typescript) What if I prefer [VanillaJS](https://stackoverflow.com/questions/20435653/what-is-vanillajs)?

### Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue.

### Contributing

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
