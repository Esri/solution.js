/** @license
 * Copyright 2020 Esri
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
import * as common from "@esri/solution-common";
import { _prioritizedTests } from "../../src/webapp/_prioritizedTests";
import { cloneObject } from "@esri/hub-common";

describe("webapp :: _prioritizedTests :: ", () => {
  const defaultDatasourceInfo: common.IDatasourceInfo = {
    basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
    itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
    // fullUrl: 'https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/LayerForDashboardExteternal/FeatureServer/1',
    url: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer1.url}}",
    layerId: 1,
    ids: ["123", "456", "789"],
    fields: [],
    relationships: [],
    adminLayerInfo: {
      geometryField: {
        name: "Shape"
      }
    }
  };
  it("handles missing layer url", () => {
    const datasourceInfo = cloneObject(defaultDatasourceInfo);
    delete datasourceInfo.url;
    const obj = { val: "this is the string" };
    const actual = _prioritizedTests(obj, [datasourceInfo], false);
    expect(actual).toEqual(obj, "should return obj unchanged if no url");
  });
  it("handles missing layer id", () => {
    const datasourceInfo = cloneObject(defaultDatasourceInfo);
    delete datasourceInfo.layerId;
    const obj = { val: "this is the string" };
    const actual = _prioritizedTests(obj, [datasourceInfo], false);
    expect(actual).toEqual(obj, "should return obj unchanged if no layerId");
  });
  it("handles no layer ids", () => {
    const datasourceInfo = cloneObject(defaultDatasourceInfo);
    datasourceInfo.ids = [];
    const obj = { val: "this is the string" };
    const actual = _prioritizedTests(obj, [datasourceInfo], false);
    expect(actual).toEqual(obj, "should return obj unchanged if no layerId");
  });
  it("handles non-numeric layer id", () => {
    const datasourceInfo = cloneObject(defaultDatasourceInfo);
    // Typescript prevents this as a direct assignment, but setProp can :)
    common.setProp(datasourceInfo, "layerId", "invalid as a string");
    const obj = { val: "this is the string" };
    const actual = _prioritizedTests(obj, [datasourceInfo], false);
    expect(actual).toEqual(obj, "should return null if non-numeric layerId");
  });
  it("returns unchanged if string does not have url or layer id", () => {
    const datasourceInfo = cloneObject(defaultDatasourceInfo);
    datasourceInfo.url =
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/LayerForDashboardExteternal/FeatureServer/1";
    const obj = { val: `this has nothing in it` };
    const actual = _prioritizedTests(obj, [datasourceInfo], false);
    expect(actual.val).toBe(obj.val, "should not change the string");
  });
  it("templates layerids", () => {
    const datasourceInfo = cloneObject(defaultDatasourceInfo);
    datasourceInfo.url =
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/LayerForDashboardExteternal/FeatureServer/1";
    const obj = { val: `this has 123 and 456 in it` };
    const actual = _prioritizedTests(obj, [datasourceInfo], false);
    expect(actual.val).toBe(obj.val, "should not change the string");
  });
});
