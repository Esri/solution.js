---
title: Using Solution.js in Node.js
navTitle: Node.js
description: Learn how to integrate the Solution.js library into a Node.js app.
order: 50
group: 1-get-started
---

# Get Started with Node.js

Make sure you have polyfills for [`fetch`](https://github.com/lquixada/cross-fetch) and [`FormData`](https://github.com/form-data/isomorphic-form-data) installed before using any Solution.js library. You can find `npm install` commands for all packages in the [API reference](/solution.js/api).

```bash
npm install @esri/arcgis-rest-request @esri/arcgis-rest-auth cross-fetch isomorphic-form-data
```

Require `cross-fetch` and `isomorphic-form-data` before using any of the Solution.js methods.
```js
// ensures fetch is available as a global
require("cross-fetch/polyfill");
require("isomorphic-form-data");

const { request } = require("@esri/arcgis-rest-request");

request("https://www.arcgis.com/sharing/rest/info")
  .then(response);
```

You can also pass through your own named `fetch` implementation.

```js
const fetch = require("node-fetch")
const {
  request,
  setDefaultRequestOptions
} = require("@esri/arcgis-rest-request");

// one by one
request("https://www.arcgis.com/sharing/rest/info", { fetch })

// or in *every* request
setDefaultRequestOptions({ fetch })
```

#### Demo - [Express](https://github.com/Esri/solution.js/tree/master/demos/express)

## Authentication

To access premium content and services without asking for user credentials, using a [Proxy Service](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/working-with-proxies/) or [App Login](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/accessing-arcgis-online-services/) is typically the best approach.

Proxy Service
```js
// no auth required
request(`https://utility.arcgis.com/usrsvcs/appservices/{unique}/rest/services/World/Route/NAServer/Route_World/solve`)
```
App Login
```js
const { ApplicationSession } = require("@esri/arcgis-rest-auth");

const authentication = new ApplicationSession({
  clientId: "public",
  clientSecret: "secret"
})

// url not accessible to anonymous users
const url = `https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World`

// token will be appended by rest-js
request(url, {
  authentication
})
```

#### Demo - [batch geocoding](https://github.com/Esri/solution.js/tree/master/demos/batch-geocoder-node)

Applications cannot [create, share, access or modify items](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/limitations-of-application-authentication/) in ArcGIS Online or ArcGIS Enterprise. For this, a [`UserSession`](/solution.js/api/auth/UserSession/) is more appropriate.

```js
const { UserSession } = require("@esri/arcgis-rest-auth");

// hardcoded username / password
const authentication = new UserSession({
  username: "jsmith",
  password: "123456"
})
```
See the [Browser Authentication](../browser-authentication/) for more information about implementing OAuth 2.0.
