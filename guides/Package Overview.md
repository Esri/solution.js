# Why `@esri/solution.js`?

`@esri/solution.js` simplifies making requests about Solutions to ArcGIS Online and Enterprise in browsers.

There's no better way to explain what that means than comparing an `@esri/solution.js` call to the same web request made using the [@esri/arcgis-rest-js library](https://esri.github.io/arcgis-rest-js/), which is an ever bigger simplification over plain old JavaScript.

### @esri/solution.js

```html
<!-- require supporting arcgis-rest-js libraries from https://unpkg.com; available via arcgisRest global -->
<script src="https://unpkg.com/@esri/arcgis-rest-auth/dist/umd/auth.umd.min.js"></script>
<script src="https://unpkg.com/@esri/arcgis-rest-portal/dist/umd/portal.umd.min.js"></script>
<script src="https://unpkg.com/@esri/arcgis-rest-request/dist/umd/request.umd.min.js"></script>

<!-- require Solution.js `common` library from https://unpkg.com; available via arcgisSolution global -->
<script src="https://unpkg.com/@esri/solution-common/dist/umd/common.umd.min.js"></script>
<script>
// Pass in an item id and get back information about the item and its data, thumbnail, metadata,
// resources, and related item ids
arcgisSolution.getCompleteItem("a67c8d5e25b644419316efcb1f70c291", arcgisSolution.getUserSession())
.then(response => {
  // response contains the properties (with their MIME types)
  //   (base: IItem)  text/plain JSON
  //   (data: File)  */*
  //   (thumbnail: File)  image/*
  //   (metadata: File)  application/xml
  //   (resources: File[])  list of */*
  //   (fwdRelatedItems: IRelatedItems[])  list of forward relationshipType/relatedItems[] pairs
  //   (revRelatedItems: IRelatedItems[])  list of reverse relationshipType/relatedItems[] pairs
  });
</script>
```

### vs. @esri/arcgis-rest-js

```html
<!-- require supporting arcgis-rest-js libraries from https://unpkg.com; available via arcgisRest global -->
<script src="https://unpkg.com/@esri/arcgis-rest-auth/dist/umd/auth.umd.min.js"></script>
<script src="https://unpkg.com/@esri/arcgis-rest-portal/dist/umd/portal.umd.min.js"></script>
<script src="https://unpkg.com/@esri/arcgis-rest-request/dist/umd/request.umd.min.js"></script>

<!-- require Solution.js `common` library from https://unpkg.com; available via arcgisSolution global -->
<script src="https://unpkg.com/@esri/solution-common/dist/umd/common.umd.min.js"></script>
<script>
  // Pass in an item id and get back information about the item and its data, thumbnail, metadata,
  // resources, and related item ids
  Promise.all([
    arcgisRest.getItem("a67c8d5e25b644419316efcb1f70c291", {}),  // item
    arcgisRest.request("https://www.arcgis.com/sharing/rest/content/items/a67c8d5e25b644419316efcb1f70c291/data", {}),  // data
    arcgisRest.request("https://www.arcgis.com/sharing/rest/content/items/a67c8d5e25b644419316efcb1f70c291/info/thumbnail/ago_downloaded.jpg", {rawResponse: true}),  // thumbnail
    arcgisRest.request("https://www.arcgis.com/sharing/rest/content/items/a67c8d5e25b644419316efcb1f70c291/resources", {rawResponse: true}),  // resources
    arcgisRest.request("https://www.arcgis.com/sharing/rest/content/items/a67c8d5e25b644419316efcb1f70c291/relatedItems?f=json&direction=forward&relationshipType=APIKey2Item", {}),  // related items in forward direction
              // Repeat previous call for additional 25 relationship types
    arcgisRest.request("https://www.arcgis.com/sharing/rest/content/items/a67c8d5e25b644419316efcb1f70c291/relatedItems?f=json&direction=reverse&relationshipType=APIKey2Item", {})  // related items in reverse direction
              // Repeat previous call for additional 25 relationship types
  ])
  .then(responses => {
    // responses array contains (with their MIME types)
    //   (base: IItem)  text/plain JSON
    //   (data: File)  */*
    //   (thumbnail: File)  image/*
    //   (metadata: File)  application/xml
    //   (resources: File[])  list of * /*
    //   (fwdRelatedItems: IRelatedItems)  forward relationshipType/relatedItems[] pairs for APIKey2Item
    //   (revRelatedItems: IRelatedItems)  reverse relationshipType/relatedItems[] pairs for APIKey2Item

    // Metadata must be requested separately because if the item doesn't contain metadata, an ignorable error might be thrown
    arcgisRest.request("https://www.arcgis.com/sharing/rest/content/items/a67c8d5e25b644419316efcb1f70c291/info/metadata/metadata.xml", {rawResponse: true})
    .then(
      metadata => {
        // Check that `metadata` isn't a JSON error structure
      },
      noMetadata => {}
    );
  });
</script>
```


# Package Overview

The library is a collection of packages that are framework agnostic and make a variety of ArcGIS Solution-related tasks more convenient.

* [`@esri/solution-common`](https://github.com/Esri/solution.js/tree/master/packages/common): Provides general helper functions for @esri/solution.js.
* [`@esri/solution-creator`](https://github.com/Esri/solution.js/tree/master/packages/creator): Manages the creation of a Solution item for @esri/solution.js.
* [`@esri/solution-deployer`](https://github.com/Esri/solution.js/tree/master/packages/deployer): Manages the deployment of a Solution for @esri/solution.js.
* [`@esri/solution-feature-layer`](https://github.com/Esri/solution.js/tree/master/packages/feature-layer): Manages the creation and deployment of feature layers and services for @esri/solution.js.
* [`@esri/solution-file`](https://github.com/Esri/solution.js/tree/master/packages/file): Manages the creation and deployment of item types that contain files for @esri/solution.js.
* [`@esri/solution-form`](https://github.com/Esri/solution.js/tree/master/packages/form): Manages the creation and deployment of form item types for @esri/solution.js.
* [`@esri/solution-group`](https://github.com/Esri/solution.js/tree/master/packages/group): Manages the creation and deployment of group item types for @esri/solution.js.
* [`@esri/solution-hub-types`](https://github.com/Esri/solution.js/tree/master/packages/hub-types): Manages the creation and deployment of Hub Site and Hub Page item types for @esri/solution.js.
* [`@esri/solution-simple-types`](https://github.com/Esri/solution.js/tree/master/packages/simple-types): Manages the creation and deployment of simple item types for @esri/solution.js.
* [`@esri/solution-storymap`](https://github.com/Esri/solution.js/tree/master/packages/storymap): Manages the creation and deployment of Story Map item types for @esri/solution.js.
* [`@esri/solution-velocity`](https://github.com/Esri/solution.js/tree/master/packages/velocity): Manages the creation and deployment of Velocity item types for @esri/solution.js.
* [`@esri/solution-viewer`](https://github.com/Esri/solution.js/tree/master/packages/viewer): Simplifies access to @esri/solution.js.
* [`@esri/solution-web-experience`](https://github.com/Esri/solution.js/tree/master/packages/web-experience): Manages the creation and deployment of Web Experience item types for @esri/solution.js.
