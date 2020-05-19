---
title: Using Solution.js from a CDN
navTitle: From a CDN
description: Learn how to use Solution.js from a CDN.
order: 20
group: 1-get-started
---

# Get Started using a CDN

Solution.js is hosted on [unpkg](https://unpkg.com/). You can find URLs for individual packages in the [API reference](../../api).

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Solution.js</title>
</head>
<body>
  Open your console to see the demo.
</body>
  <!-- require polyfills for fetch and Promise from https://polyfill.io -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es5%2Cfetch%2CPromise"></script>

  <!-- require supporting arcgis-rest-js libraries from https://unpkg.com; available via arcgisRest global -->
  <script src="https://unpkg.com/@esri/arcgis-rest-portal/dist/umd/portal.umd.min.js"></script>
  <script src="https://unpkg.com/@esri/arcgis-rest-request/dist/umd/request.umd.min.js"></script>
  <script src="https://unpkg.com/@esri/arcgis-rest-service-admin/dist/umd/service-admin.umd.min.js"></script>

  <!-- require Solution.js `common` library from https://unpkg.com; available via arcgisSolution global -->
  <script src="https://unpkg.com/@esri/solution-common/dist/umd/common.umd.min.js"></script>

  <script>
    var originalExtent = {
      xmin: -9821384,
      ymin: 5117339,
      xmax: -9797228,
      ymax: 5137789,
      spatialReference: { wkid: 102100 }
    };
    var desiredSpatialRef = { wkid: 4326 };

    arcgisSolution.convertExtent(
      originalExtent,
      desiredSpatialRef,
      "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer"
    ).then(
      response => console.log(JSON.stringify(response, null, 2)),
      response => console.error(JSON.stringify(response, null, 2))
    );
  </script>
</html>
```