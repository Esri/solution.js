[![npm version][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
[![apache 2.0 licensed][license-img]][license-url]

[npm-img]: https://img.shields.io/npm/v/@esri/arcgis-clone-js.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@esri/arcgis-clone-js
[travis-img]: https://img.shields.io/travis/Esri/arcgis-clone-js/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/Esri/arcgis-clone-js
[coverage-img]: https://coveralls.io/repos/github/Esri/arcgis-clone-js/badge.svg
[coverage-url]: https://coveralls.io/github/Esri/arcgis-clone-js
[license-img]: https://img.shields.io/badge/license-Apache%202.0-orange.svg?style=flat-square
[license-url]: #license

# @esri/arcgis-clone-js

> JavaScript wrappers running in Node.js and modern browsers for transferring ArcGIS Online items from one organization to another.

## Table of Contents

- [Example](#example)
- [API Reference](#api-reference)
- [Instructions](#instructions)
- [FAQ](#frequently-asked-questions)
- [Issues](#issues)
- [Versioning](#versioning)
- [Contributing](#contributing)
- [Code of Conduct](/CODE_OF_CONDUCT.md)
- [License](#license)

### Supported ArcGIS Online Item Types

Currently, the item types that can be dependents of a solution item are:

* ArcGIS Pro Add In
* Code Attachment
* Code Sample
* Dashboard
* Desktop Add In
* Desktop Application Template
* Document Link
* Feature Collection
* Feature Service (Hosted only and Hosted Feature Layer Views)
* Form
* Geoprocessing Package
* Geoprocessing Sample
* Layer Package
* Map Template
* Operation View
* Pro Map
* Project Package
* Project Template
* Web Map
* Web Mapping Application
* Workforce Project

### API Reference

The documentation is published at https://arcgis.github.io/arcgis-clone-js/ (source code [here](/docs/src)).

### Instructions

You can install dependencies by cloning the repository and running:

```bash
npm install
```

Afterward, for a list of all available commands run `npm run`.

Some useful commands include:

* `npm test` runs tests test:node and test:chrome to confirm that the API is functioning as expected.
* `npm run test:chrome` runs karma in the ChromeHeadlessCI browser
* `npm run test:firefox` runs karma in the Firefox browser
* `npm run test:node` runs ts-node and jasmine

### Frequently Asked Questions

* [Is this a _supported_ Esri product?](docs/FAQ.md#is-this-a-supported-esri-product)
* [How does this project compare with the ArcGIS API for JavaScript?](docs/FAQ.md#comparison-with-the-arcgis-api-for-javascript)
* [Is this similar to the ArcGIS API for Python?](docs/FAQ.md#comparison-with-the-arcgis-api-for-python)
* [Why TypeScript?](docs/FAQ.md#why-typescript) What if I prefer [VanillaJS](https://stackoverflow.com/questions/20435653/what-is-vanillajs)?

### Issues

If something isn't working the way you expected, please take a look at [previously logged issues](https://github.com/Esri/arcgis-clone-js/issues) first.  Have you found a new bug?  Want to request a new feature?  We'd [**love**](https://github.com/Esri/arcgis-clone-js/issues/new) to hear from you.

If you're looking for help you can also post issues on [GIS Stackexchange](http://gis.stackexchange.com/questions/ask?tags=esri-oss).

### Versioning

For transparency into the release cycle and in striving to maintain backward compatibility, @esri/arcgis-clone-js is maintained under Semantic Versioning guidelines and will adhere to these rules whenever possible.

For more information on SemVer, please visit <http://semver.org/>.

### Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](CONTRIBUTING.md).

### License

Copyright &copy; 2018 Esri

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
