/** @license
 * Copyright 2018 Esri
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

/**
 * Provides tests for common functions involving the management of item and group resources.
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as webmap from "../src/webmap";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webmap`: manages the creation and deployment of web map item types", () => {
  // Set up a UserSession to use in all of these tests
  const MOCK_USER_SESSION = new auth.UserSession({
    clientId: "clientId",
    redirectUri: "https://example-app.com/redirect-uri",
    token: "fake-token",
    tokenExpires: TOMORROW,
    refreshToken: "refreshToken",
    refreshTokenExpires: TOMORROW,
    refreshTokenTTL: 1440,
    username: "casey",
    password: "123456",
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe("convertItemToTemplate", () => {
    it("converts without data", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers"
        } as any,
        data: null as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{itm1234567890.id}}"
        } as any,
        data: null as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmap.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
    it("converts with empty data", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers"
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{itm1234567890.id}}"
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmap.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
    it("converts with layer data", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "layer1",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            },
            {
              itemId: "layer2",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            },
            {
              itemId: null
            },
            {
              itemId: "layer4",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{itm1234567890.id}}"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "{{layer1.id}}",
              url: "{{layer1.layer4.url}}"
            },
            {
              itemId: "{{layer2.id}}",
              url: "{{layer2.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{layer4.id}}",
              url: "{{layer4.layer4.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: ["layer1", "layer2", "layer4"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmap.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
    it("converts with table data", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [],
          tables: [
            {
              itemId: "table1",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            },
            {
              itemId: null
            },
            {
              itemId: "table3",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{itm1234567890.id}}"
        } as any,
        data: {
          operationalLayers: [],
          tables: [
            {
              itemId: "{{table1.id}}",
              url: "{{table1.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{table3.id}}",
              url: "{{table3.layer4.url}}"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: ["table1", "table3"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmap.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
    it("converts with layer and table data", () => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: null
            },
            {
              itemId: "layer2",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            },
            {
              itemId: null
            },
            {
              itemId: "layer4",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            }
          ],
          tables: [
            {
              itemId: "table1",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            },
            {
              itemId: null
            },
            {
              itemId: "table3",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.id}}",
          title: "Voting Centers",
          url:
            "{{organization.portalBaseUrl}}/home/webmap/viewer.html?webmap={{itm1234567890.id}}"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: null
            },
            {
              itemId: "{{layer2.id}}",
              url: "{{layer2.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{layer4.id}}",
              url: "{{layer4.layer4.url}}"
            }
          ],
          tables: [
            {
              itemId: "{{table1.id}}",
              url: "{{table1.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{table3.id}}",
              url: "{{table3.layer4.url}}"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: ["layer2", "layer4", "table1", "table3"],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const actual = webmap.convertItemToTemplate(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("_extractDependencies", () => {
    xit("_extractDependencies", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getWebmapLayerIds", () => {
    xit("_getWebmapLayerIds", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeWebmapLayerIdsAndUrls", () => {
    xit("_templatizeWebmapLayerIdsAndUrls", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});
