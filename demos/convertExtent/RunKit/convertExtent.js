/** @license
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// @esri/solution-common convertExtent RunKit example

var fetch = require("node-fetch");
var FormData = require("isomorphic-form-data");
var Promise = require("promise");

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
    fetch: fetch
  }
).then(
  response => {
    console.log("spatialReference: " + response.spatialReference.wkid);
    console.log("xmax: " + response.xmax);
    console.log("xmin: " + response.xmin);
    console.log("ymax: " + response.ymax);
    console.log("ymin: " + response.ymin);
  },
  response => console.error(response)
);
