# Get Started

Solutions.js can be deployed with a variety of build tools, including:

* [From a CDN](https://github.com/Esri/solution.js/blob/master/guides/from-a-cdn.md)
* [AMD (Require.js or Dojo)](https://github.com/Esri/solution.js/blob/master/guides/amd-requirejs-dojo.md)
* [Node.js](https://github.com/Esri/solution.js/blob/master/guides/node.md)

## Requirements

Solution.js takes advantage of web standards that are supported in all modern desktop browsers and most mobile browsers.

* [`Fetch` Support](https://caniuse.com/#feat=fetch)
* [`Promises` Support](https://caniuse.com/#feat=promises)
* [`FormData` Support](https://caniuse.com/#feat=xhr2)
* [`ECMAScript 6` Support](https://caniuse.com/#feat=es6)

## Browser Support

Solution.js is supported in

* Chrome
* Chromium Edge
* Firefox
* Safari 9 and later
* iOS Safari

## Node.js Support

Solution.js is supported in Node.js 16.x. It requires additional packages to polyfill `Fetch` and `FormData`.

We recommend the ones below:

* [`node-fetch`](https://github.com/bitinn/node-fetch) - to polyfill `Fetch`
* [`isomorphic-form-data`](https://github.com/form-data/isomorphic-form-data) - to polyfill `FormData`

```js
const fetch = require('node-fetch');
const { setDefaultRequestOptions, request } = require('@esri/arcgis-rest-request');

// use node-fetch for each request instead of relying on a global
setDefaultRequestOptions({ fetch })

request(url)
  .then(response)
```
Other versions of Node.js may also work with appropriate polyfills but we cannot guarantee support.