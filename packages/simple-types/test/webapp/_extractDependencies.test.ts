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
import { _extractDependencies } from "../../src/webapp/_extractDependencies";
describe("webapp :: _extractDependencies :: ", () => {
  it("handles no keywords", () => {
    const model = {
      data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
    };
    const expected = ["myMapId"];
    const actual = _extractDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles no WAB keywords", () => {
    const model = {
      typeKeywords: ["Web Map"],
      data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
    };
    const expected = ["myMapId"];
    const actual = _extractDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles WAB2D", () => {
    const model = {
      typeKeywords: ["WAB2D"],
      data: { map: { itemId: "abc" } }
    };
    const expected = ["abc"];
    const actual = _extractDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles Web AppBuilder", () => {
    const model = {
      typeKeywords: ["Government", "Web AppBuilder"],
      data: { map: { itemId: "abc" } }
    };
    const expected = ["abc"];
    const actual = _extractDependencies(model);
    expect(actual).toEqual(expected);
  });

  it("handles external data sources", () => {
    const model = {
      typeKeywords: ["Government", "Web AppBuilder"],
      data: {
        map: {
          itemId: "abc"
        },
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              itemId: "2ea59a64b34646f8972a71c7d536e4a3",
              isDynamic: false,
              label: "Point layer",
              url: "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
            }
          },
          settings: {}
        }
      }
    };
    const expected = ["abc", "2ea59a64b34646f8972a71c7d536e4a3"];
    const actual = _extractDependencies(model);
    expect(actual).toEqual(expected);
  });
});
