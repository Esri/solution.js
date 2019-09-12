[![npm status][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![gzip bundle size][gzip-img]][npm-url]
[![Coverage status][coverage-img]][coverage-url]
[![Apache 2.0 licensed][license-img]][license-url]

[npm-img]: https://img.shields.io/npm/v/@esri/solution-common.svg?style=round-square&color=blue
[npm-url]: https://www.npmjs.com/package/@esri/solution-common
[travis-img]: https://img.shields.io/travis/Esri/solution.js/develop.svg
[travis-url]: https://travis-ci.org/Esri/solution.js
[gzip-img]: https://img.badgesize.io/https://unpkg.com/@esri/solution-common/dist/umd/common.umd.min.js?compression=gzip
[coverage-img]: https://coveralls.io/repos/github/Esri/solution.js/badge.svg
[coverage-url]: https://coveralls.io/github/Esri/solution.js
[license-img]: https://img.shields.io/badge/license-Apache%202.0-blue.svg
[license-url]: #license

# @esri/solution-common

> Common helpers for [`@esri/solution-*`](https://github.com/Esri/solution.js) packages.

### Example

```js
var fetch = require('node-fetch');
var FormData = require('isomorphic-form-data');
var Promise = require('promise');

var auth = require("@esri/arcgis-rest-auth");
require("@esri/arcgis-rest-portal");
require("@esri/arcgis-rest-request");
require("@esri/arcgis-rest-service-admin");

var solutionCommon = require("@esri/solution-common");

var originalExtent = {
  xmin: -9821384,
  ymin: 5117339,
  xmax: -9797228,
  ymax: 5137789,
  spatialReference: { wkid: 102100 }
};
var desiredSpatialRef = { wkid: 4326 };

solutionCommon.convertExtent(
  originalExtent,
  desiredSpatialRef,
  "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer",
  {
    fetch: fetch,
    authentication: auth.UserSession({})
  }
).then(
  response => console.log(response),
  response => console.error(response)
);
```
Example is hosted in [RunKit](https://runkit.com/miketschudi/esri-solution-common/1.0.0); expected output:
```
Object
	spatialReference: Object {wkid: 4326}
	xmax: -88.0099965440373
	xmin: -88.22699358406922
	ymax: 41.84499732645768
	ymin: 41.70799917451703
```

### [API Reference](https://esri.github.io/solution.js/api/types/)

### Issues

Found a bug or want to request a new feature? Please take a look at [previously logged issues](https://github.com/Esri/solution.js/issues); if you don't see your concern, please let us know by [submitting an issue](https://github.com/Esri/solution.js/issues/new).

### Versioning

For transparency into the release cycle and in striving to maintain backward compatibility, @esri/solution.js is maintained under Semantic Versioning guidelines and will adhere to these rules whenever possible. For more information on SemVer, please visit <http://semver.org/>.

### Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](CONTRIBUTING.md).

### [Changelog](https://github.com/Esri/solution.js/blob/develop/CHANGELOG.md)

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
