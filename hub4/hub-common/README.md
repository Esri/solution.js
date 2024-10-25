[![npm version][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![gzip bundle size][gzip-image]][npm-url]
[![Coverage Status][coverage-img]][coverage-url]
[![apache licensed](https://img.shields.io/badge/license-Apache-green.svg?style=flat-square)](https://raw.githubusercontent.com/Esri/hub.js/master/LICENSE)

[npm-img]: https://img.shields.io/npm/v/@esri/hub-common.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@esri/hub-common
[travis-img]: https://img.shields.io/travis/Esri/hub.js/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/Esri/hub.js
[coverage-img]: https://codecov.io/gh/Esri/hub.js/branch/master/graph/badge.svg
[coverage-url]: https://codecov.io/gh/Esri/hub.js

# @esri/hub-common

> Common TypeScript types and utility functions for [`@esri/hub.js`](https://github.com/Esri/hub.js).

### Example

```bash
npm install @esri/hub-common
```

```ts
import { IIInitiativeItem } from "@esri/hub-common-types";

const myInitiative = {
  item: {
    id: "abc123",
    owner: "c@sey",
  },
} as IInitiativeItem;
```

### Issues

If something isn't working the way you expected, please take a look at [previously logged issues](https://github.com/Esri/hub.js/issues) first. Have you found a new bug? Want to request a new feature? We'd [**love**](https://github.com/Esri/hub.js/issues/new) to hear from you.

If you're looking for help you can also post issues on [GIS Stackexchange](http://gis.stackexchange.com/questions/ask?tags=esri-oss).

### Versioning

For transparency into the release cycle and in striving to maintain backward compatibility, @esri/hub.js is maintained under Semantic Versioning guidelines and will adhere to these rules whenever possible.

For more information on SemVer, please visit <http://semver.org/>.

### Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](CONTRIBUTING.md).

### License

Copyright &copy; 2022 Esri

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
