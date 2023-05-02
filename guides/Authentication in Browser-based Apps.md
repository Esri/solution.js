# Authentication in Browser-based Apps

In the [Node.js](https://github.com/Esri/solution.js/blob/master/guides/node.md) guide we explained how to instantiate an [`ApplicationSession`](/solution.js/api/auth/ApplicationSession/) with hardcoded credentials. In the browser, you need to use [OAuth 2.0](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/signing-in-arcgis-online-users/) and have users sign directly into [ArcGIS Online](https://www.arcgis.com) or ArcGIS Enterprise.

![browser based login](https://developers.arcgis.com/documentation/static/c67ea902cb272c599159996a52182a35/4cdf7/arcgis-identity.png)


### Resources

* [Implementing Named User Login](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/signing-in-arcgis-online-users/)
* [Browser-based Named User Login](https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/browser-based-user-logins/)

```js
// register your own app to create a unique clientId
const clientId = "abc123"

UserSession.beginOAuth2({
  clientId,
  redirectUri: 'https://yourapp.com/authenticate.html'
})
  .then(session)
```

After the user has logged in, the `session` will keep track of individual `trustedServers` that are known to be federated and pass a token through when making requests.

```js
request(url, { authentication: session })
```
