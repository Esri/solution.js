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
import * as fetchMock from "fetch-mock";
import { templatizeDatasources } from "../../src/webapp/templatizeDatasources";

let MOCK_USER_SESSION: common.UserSession;
describe("webapp :: templatizeDatasources :: ", () => {
  it("handles different flavors of data source", done => {
    const itemTemplate: common.IItemTemplate = {
      itemId: "abc0cab401af4828a25cc6eaeb59fb69",
      type: "Web Mapping Application",
      key: "r0rtxyja",
      item: {
        id: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        type: "Web Mapping Application",
        extent: "{{solutionItemExtent}}",
        title: "Voting Centers",
        url:
          "{{portalBaseUrl}}/home/item.html?id={{abc0cab401af4828a25cc6eaeb59fb69.itemId}}"
      },
      data: {
        appItemId: "{{abc0cab401af4828a25cc6eaeb59fb69.itemId}}",
        values: {
          webmap: "{{myMapId.itemId}}"
        },
        map: {
          appProxy: {
            mapItemId: "{{mapItemId.itemId}}"
          },
          itemId: "{{mapItemId.itemId}}"
        },
        folderId: "{{folderId}}",
        dataSource: {
          dataSources: {
            external_123456789: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              itemId: "2ea59a64b34646f8972a71c7d536e4a3",
              isDynamic: false,
              label: "Point layer",
              url: "https://fake.com/arcgis/rest/services/test/FeatureServer/0"
            },
            external_987654321: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              itemId: "56465ad54b4646f8972a71c7d536e4a3",
              isDynamic: false,
              label: "Point layer"
            },
            external_123498765: {
              type: "source type",
              portalUrl: "https://fake.maps.arcgis.com/",
              isDynamic: false,
              label: "Point layer"
            }
          },
          settings: {}
        }
      },
      resources: [],
      dependencies: ["myMapId"],
      groups: [],
      properties: {},
      estimatedDeploymentCostFactor: 2
    };
    const expectedItemTemplate: common.IItemTemplate = common.cloneObject(
      itemTemplate
    );
    expectedItemTemplate.data.dataSource.dataSources = {
      external_123456789: {
        type: "source type",
        portalUrl: "{{portalBaseUrl}}",
        itemId: "{{2ea59a64b34646f8972a71c7d536e4a3.layer0.itemId}}",
        isDynamic: false,
        label: "Point layer",
        url: "{{2ea59a64b34646f8972a71c7d536e4a3.layer0.url}}"
      },
      external_987654321: {
        type: "source type",
        portalUrl: "{{portalBaseUrl}}",
        itemId: "{{56465ad54b4646f8972a71c7d536e4a3.itemId}}",
        isDynamic: false,
        label: "Point layer"
      },
      external_123498765: {
        type: "source type",
        portalUrl: "{{portalBaseUrl}}",
        isDynamic: false,
        label: "Point layer"
      }
    };
    const portalUrl: string = "https://fake.maps.arcgis.com";

    fetchMock
      .post("https://fake.com/arcgis/rest/info", {})
      .post("https://fake.com/arcgis/rest/services/test/FeatureServer/0", {
        serviceItemId: "2ea59a64b34646f8972a71c7d536e4a3",
        id: 0
      });

    templatizeDatasources(itemTemplate, MOCK_USER_SESSION, portalUrl).then(
      (updatedItemTemplate: common.IItemTemplate) => {
        expect(updatedItemTemplate).toEqual(expectedItemTemplate);
        done();
      },
      e => done.fail()
    );
  });
});
