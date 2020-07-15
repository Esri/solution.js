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
import { _getSortOrder } from "../../src/webapp/_getSortOrder";
import * as common from "@esri/solution-common";
describe("webapp:: _getSortOrder :: ", () => {
  it("sorts url and layer id first", () => {
    const datasourceInfo: common.IDatasourceInfo = {
      basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
      itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
      layerId: 1,
      ids: [],
      url: "{{934a9ef8efa7448fa8ddf7b13cef0240.url}}",
      fields: [],
      relationships: [],
      adminLayerInfo: {
        geometryField: {
          name: "Shape"
        }
      }
    };
    const testString =
      "nam tincidunt sagittis arcu vestibulum" +
      "{{934a9ef8efa7448fa8ddf7b13cef0240.layer1.url}}" +
      "in at tincidunt lectus. Curabitur vitae lorem mollis";

    const expected = 1;

    const actual = _getSortOrder(datasourceInfo, testString);
    expect(actual).toEqual(expected);
  });

  it("sorts datasource ids first", () => {
    const datasourceInfo: common.IDatasourceInfo = {
      basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
      itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
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
    const testString =
      "nam tincidunt sagittis arcu vestibulum" +
      "456" +
      "in at tincidunt lectus. Curabitur vitae lorem mollis";

    const expected = 1;

    const actual = _getSortOrder(datasourceInfo, testString);
    expect(actual).toEqual(expected);
  });

  it("sorts base service url second", () => {
    const datasourceInfo: common.IDatasourceInfo = {
      basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
      itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
      layerId: undefined,
      ids: [],
      url: "{{934a9ef8efa7448fa8ddf7b13cef0240}}",
      fields: [],
      relationships: [],
      adminLayerInfo: {
        geometryField: {
          name: "Shape"
        }
      }
    };
    const testString =
      "nam tincidunt sagittis arcu vestibulum" +
      "{{934a9ef8efa7448fa8ddf7b13cef0240}}" +
      "in at tincidunt lectus. Curabitur vitae lorem mollis";

    const expected = 2;

    const actual = _getSortOrder(datasourceInfo, testString);
    expect(actual).toEqual(expected);
  });

  it("sorts AGOL item id reference third", () => {
    const datasourceInfo: common.IDatasourceInfo = {
      basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
      itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
      layerId: 1,
      ids: [],
      url: "",
      fields: [],
      relationships: [],
      adminLayerInfo: {
        geometryField: {
          name: "Shape"
        }
      }
    };
    const testString =
      "nam tincidunt sagittis arcu vestibulum" +
      "{{934a9ef8efa7448fa8ddf7b13cef0240}}" +
      "in at tincidunt lectus. Curabitur vitae lorem mollis";

    const expected = 3;

    const actual = _getSortOrder(datasourceInfo, testString);
    expect(actual).toEqual(expected);
  });

  it("defaults sort to fourth", () => {
    const datasourceInfo: common.IDatasourceInfo = {
      basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer1.fields",
      itemId: "",
      layerId: 1,
      ids: [],
      url: "",
      fields: [],
      relationships: [],
      adminLayerInfo: {
        geometryField: {
          name: "Shape"
        }
      }
    };
    const testString =
      "nam tincidunt sagittis arcu vestibulum" +
      "{{934a9ef8efa7448fa8ddf7b13cef0240}}" +
      "in at tincidunt lectus. Curabitur vitae lorem mollis";

    const expected = 4;

    const actual = _getSortOrder(datasourceInfo, testString);
    expect(actual).toEqual(expected);
  });
});
