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
 * Provides tests for functions involving the creation and deployment of Webmap item types.
 */

import * as common from "@esri/solution-common";
import * as webmap from "../src/webmap";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as utils from "../../common/test/mocks/utils";

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://myorg.maps.arcgis.com",
  authInfo: {}
};

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webmap`: manages the creation and deployment of web map item types", () => {
  let MOCK_USER_SESSION: common.UserSession;

  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe("convertItemToTemplate", () => {
    it("converts without data", done => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
          title: "Voting Centers"
        } as any,
        data: null as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{itm1234567890.itemId}}"
        } as any,
        data: null as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("converts with empty data", done => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{itm1234567890.itemId}}"
        } as any,
        data: {} as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("converts with layer data", done => {
      const model = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "bada9ef8efa7448fa8ddf7b13cef0240",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            },
            {
              itemId: "badb9ef8efa7448fa8ddf7b13cef0240",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
            },
            {
              itemId: null
            },
            {
              itemId: "badc9ef8efa7448fa8ddf7b13cef0240",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "{{abca9ef8efa7448fa8ddf7b13cef0240.layer1.itemId}}",
              url: "{{abca9ef8efa7448fa8ddf7b13cef0240.layer1.url}}"
            },
            {
              itemId: "{{abcb9ef8efa7448fa8ddf7b13cef0240.layer2.itemId}}",
              url: "{{abcb9ef8efa7448fa8ddf7b13cef0240.layer2.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{abcc9ef8efa7448fa8ddf7b13cef0240.layer4.itemId}}",
              url: "{{abcc9ef8efa7448fa8ddf7b13cef0240.layer4.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [
          "abca9ef8efa7448fa8ddf7b13cef0240",
          "abcb9ef8efa7448fa8ddf7b13cef0240",
          "abcc9ef8efa7448fa8ddf7b13cef0240"
        ],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          { serviceItemId: "abca9ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2",
          { serviceItemId: "abcb9ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4",
          { serviceItemId: "abcc9ef8efa7448fa8ddf7b13cef0240" }
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("converts with table data", done => {
      const model = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [],
          tables: [
            {
              itemId: "table1",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            },
            {
              itemId: "abc29ef8efa7448fa8ddf7b13cef0240"
            },
            {
              itemId: "table3",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}"
        } as any,
        data: {
          operationalLayers: [],
          tables: [
            {
              itemId: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.itemId}}",
              url: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.url}}"
            },
            {
              itemId: "abc29ef8efa7448fa8ddf7b13cef0240"
            },
            {
              itemId: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.itemId}}",
              url: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.url}}"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: [
          "abc19ef8efa7448fa8ddf7b13cef0240",
          "abc39ef8efa7448fa8ddf7b13cef0240"
        ],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          { serviceItemId: "abc19ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
          { serviceItemId: "abc39ef8efa7448fa8ddf7b13cef0240" }
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("converts with layer and table data", done => {
      const model = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
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
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
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
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            },
            {
              itemId: null
            },
            {
              itemId: "table3",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: null
            },
            {
              itemId: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.itemId}}",
              url: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{abc49ef8efa7448fa8ddf7b13cef0240.layer4.itemId}}",
              url: "{{abc49ef8efa7448fa8ddf7b13cef0240.layer4.url}}"
            }
          ],
          tables: [
            {
              itemId: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.itemId}}",
              url: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.itemId}}",
              url: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.url}}"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: [
          "abc29ef8efa7448fa8ddf7b13cef0240",
          "abc49ef8efa7448fa8ddf7b13cef0240",
          "abc19ef8efa7448fa8ddf7b13cef0240",
          "abc39ef8efa7448fa8ddf7b13cef0240"
        ],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          { serviceItemId: "abc19ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2",
          { serviceItemId: "abc29ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
          { serviceItemId: "abc39ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4",
          { serviceItemId: "abc49ef8efa7448fa8ddf7b13cef0240" }
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("handles error with fetching layer", done => {
      const model = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "layer1",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            },
            {
              itemId: "layer2",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
            },
            {
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
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
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          mockItems.get400Failure()
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2",
          { serviceItemId: "abc29ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
          { serviceItemId: "abc39ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4",
          { serviceItemId: "abc49ef8efa7448fa8ddf7b13cef0240" }
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        () => {
          done.fail();
        },
        e => done()
      );
    });

    it("will update layers itemId if missing", done => {
      const model = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            },
            {
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
            },
            {
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
            },
            {
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.itemId}}",
              url: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.url}}"
            },
            {
              itemId: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.itemId}}",
              url: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.url}}"
            },
            {
              itemId: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.itemId}}",
              url: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.url}}"
            },
            {
              itemId: "{{abc49ef8efa7448fa8ddf7b13cef0240.layer4.itemId}}",
              url: "{{abc49ef8efa7448fa8ddf7b13cef0240.layer4.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [
          "abc19ef8efa7448fa8ddf7b13cef0240",
          "abc29ef8efa7448fa8ddf7b13cef0240",
          "abc39ef8efa7448fa8ddf7b13cef0240",
          "abc49ef8efa7448fa8ddf7b13cef0240"
        ],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          { serviceItemId: "abc19ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2",
          { serviceItemId: "abc29ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
          { serviceItemId: "abc39ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4",
          { serviceItemId: "abc49ef8efa7448fa8ddf7b13cef0240" }
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("will avoid fetching layer without itemId if it exists elsewhere in the map", done => {
      const model = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "layer1",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            },
            {
              itemId: "layer2",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
            },
            {
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
            },
            {
              itemId: "layer3",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [] as string[],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.itemId}}",
              url: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.url}}"
            },
            {
              itemId: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.itemId}}",
              url: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.url}}"
            },
            {
              itemId: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.itemId}}",
              url: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.url}}"
            },
            {
              itemId: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.itemId}}",
              url: "{{abc39ef8efa7448fa8ddf7b13cef0240.layer3.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [
          "abc19ef8efa7448fa8ddf7b13cef0240",
          "abc29ef8efa7448fa8ddf7b13cef0240",
          "abc39ef8efa7448fa8ddf7b13cef0240"
        ],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          { serviceItemId: "abc19ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2",
          { serviceItemId: "abc29ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
          { serviceItemId: "abc39ef8efa7448fa8ddf7b13cef0240" }
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });

    it("will not add layer as dependency if missing serviceItemId", done => {
      const model = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "layer1",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            },
            {
              itemId: "layer2",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
            },
            {
              itemId: "layer3",
              url: "http://myserver/arcgis/services/myService/FeatureServer/3"
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
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      const expected = {
        itemId: "A14a9ef8efa7448fa8ddf7b13cef0240",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}",
          title: "Voting Centers",
          url:
            "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{A14a9ef8efa7448fa8ddf7b13cef0240.itemId}}"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.itemId}}",
              url: "{{abc19ef8efa7448fa8ddf7b13cef0240.layer1.url}}"
            },
            {
              itemId: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.itemId}}",
              url: "{{abc29ef8efa7448fa8ddf7b13cef0240.layer2.url}}"
            },
            {
              itemId: "layer3",
              url: "http://myserver/arcgis/services/myService/FeatureServer/3"
            },
            {
              itemId: "{{abc49ef8efa7448fa8ddf7b13cef0240.layer4.itemId}}",
              url: "{{abc49ef8efa7448fa8ddf7b13cef0240.layer4.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: [
          "abc19ef8efa7448fa8ddf7b13cef0240",
          "abc29ef8efa7448fa8ddf7b13cef0240",
          "abc49ef8efa7448fa8ddf7b13cef0240"
        ],
        groups: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO)
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          { serviceItemId: "abc19ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2",
          { serviceItemId: "abc29ef8efa7448fa8ddf7b13cef0240" }
        )
        .post(
          "http://myserver/arcgis/services/myService/FeatureServer/3/rest/info",
          SERVER_INFO
        )
        .post("http://myserver/arcgis/services/myService/FeatureServer/3", {})
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4",
          { serviceItemId: "abc49ef8efa7448fa8ddf7b13cef0240" }
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => done.fail(e)
      );
    });
  });

  describe("_extractDependencies", () => {
    xit("_extractDependencies", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getLayerIds", () => {
    it("will get layer ids with url and construct url/id hash", done => {
      const layerList = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
        },
        {
          itemId: "layer2",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
        },
        {
          itemId: "layer4",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
        }
      ];
      const dependencies: string[] = [];

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1",
          { serviceItemId: "abc19ef8efa7448fa8ddf7b13cef0240", id: 1 }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2",
          { serviceItemId: "abc29ef8efa7448fa8ddf7b13cef0240", id: 2 }
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4",
          { serviceItemId: "abc49ef8efa7448fa8ddf7b13cef0240", id: 4 }
        );

      const expected = {
        dependencies: [
          "abc19ef8efa7448fa8ddf7b13cef0240",
          "abc29ef8efa7448fa8ddf7b13cef0240",
          "abc49ef8efa7448fa8ddf7b13cef0240"
        ],
        urlHash: {
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1":
            "abc19ef8efa7448fa8ddf7b13cef0240",
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2":
            "abc29ef8efa7448fa8ddf7b13cef0240",
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4":
            "abc49ef8efa7448fa8ddf7b13cef0240"
        }
      };

      webmap._getLayerIds(layerList, dependencies, MOCK_USER_SESSION).then(
        actual => {
          expect(actual).toEqual(expected);
          done();
        },
        e => {
          done.fail();
        }
      );
    });
  });

  describe("_templatizeWebmapLayerIdsAndUrls", () => {
    it("handles no analysis layers", () => {
      const layerList = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
        },
        {
          itemId: "layer2",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
        },
        {
          itemId: "layer4",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
        }
      ];
      const urlHash = {};

      webmap._templatizeWebmapLayerIdsAndUrls(layerList, urlHash);

      const expectedLayerListTemplate = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer1.layer1.url}}"
        },
        {
          itemId: "layer2",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer2.layer2.url}}"
        },
        {
          itemId: "layer4",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer4.layer4.url}}"
        }
      ];
    });

    it("handles an analysis layer amidst other layers", () => {
      const layerList = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
        },
        {
          itemId: "layer2",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
        },
        {
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
        },
        {
          itemId: "layer4",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/4"
        }
      ];
      const urlHash = {
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3":
          "layer3"
      };

      webmap._templatizeWebmapLayerIdsAndUrls(layerList, urlHash);

      const expectedLayerListTemplate = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer1.layer1.url}}"
        },
        {
          itemId: "layer2",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer2.layer2.url}}"
        },
        {
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer3.layer2.url}}"
        },
        {
          itemId: "layer4",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer4.layer4.url}}"
        }
      ];
    });

    it("handles an analysis layer without a serviceItemId", () => {
      const layerList = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
        },
        {
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
        }
      ];
      const urlHash = {};

      webmap._templatizeWebmapLayerIdsAndUrls(layerList, urlHash);

      const expectedLayerListTemplate = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/{{layer1.layer1.url}}"
        },
        {
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
        }
      ];
    });
  });

  describe("postProcessFieldReferences", () => {
    xit("postProcessFieldReferences", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_templatizeProperty", () => {
    xit("_templatizeProperty", done => {
      console.warn("========== TODO _templatizeProperty ==========");
      done.fail();
    });
  });

  describe("_templatize", () => {
    it("can templatize drawingInfo", () => {
      const drawingInfo: any = {
        renderer: {
          visualVariables: [
            {
              field: "A"
            }
          ],
          authoringInfo: {},
          type: "uniqueValue",
          field1: "A",
          defaultSymbol: {},
          uniqueValueInfos: []
        }
      };

      const objs: any[] = [
        {
          id: "TestLayerForDashBoardMap_632",
          layerDefinition: {
            drawingInfo: drawingInfo
          },
          field: {
            name: "A"
          }
        }
      ];
      const datasourceInfos: common.IDatasourceInfo[] = [
        {
          fields: [
            {
              name: "A"
            }
          ],
          ids: ["TestLayerForDashBoardMap_632"],
          adminLayerInfo: {},
          relationships: [],
          layerId: 0,
          itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
          basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields",
          url: "{{934a9ef8efa7448fa8ddf7b13cef0240.url}}"
        }
      ];

      const expectedDrawingInfo: any = {
        renderer: {
          visualVariables: [
            {
              field: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.a.name}}"
            }
          ],
          authoringInfo: {},
          type: "uniqueValue",
          field1: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.a.name}}",
          defaultSymbol: {},
          uniqueValueInfos: []
        }
      };

      const expected: any[] = [
        {
          id: "TestLayerForDashBoardMap_632",
          layerDefinition: {
            drawingInfo: expectedDrawingInfo
          },
          field: {
            name: "{{934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields.a.name}}"
          }
        }
      ];

      const actual: any[] = webmap._templatize(objs, datasourceInfos);
      expect(actual).toEqual(expected);
    });

    it("can handle missing drawingInfo", () => {
      const drawingInfo: any = {
        renderer: {
          visualVariables: [
            {
              field: "A"
            }
          ],
          authoringInfo: {},
          type: "uniqueValue",
          field1: "A",
          defaultSymbol: {},
          uniqueValueInfos: []
        }
      };

      const objs: any[] = [
        {
          id: "TestLayerForDashBoardMap_632",
          layerDefinition: {
            drawingInfo: drawingInfo
          },
          field: {
            name: "A"
          }
        }
      ];

      const datasourceInfos: common.IDatasourceInfo[] = [
        {
          fields: [
            {
              name: "A"
            }
          ],
          ids: ["TestLayerForDashBoardMap_123"],
          adminLayerInfo: {},
          relationships: [],
          layerId: 0,
          itemId: "934a9ef8efa7448fa8ddf7b13cef0240",
          basePath: "934a9ef8efa7448fa8ddf7b13cef0240.layer0.fields",
          url: "{{934a9ef8efa7448fa8ddf7b13cef0240.url}}"
        }
      ];

      const expectedObjs: any = common.cloneObject(objs);

      const actualTemplatizedObs: any[] = webmap._templatize(
        objs,
        datasourceInfos
      );
      expect(actualTemplatizedObs).toEqual(expectedObjs);
    });
  });

  describe("_getDatasourceInfo", () => {
    xit("_getDatasourceInfo", done => {
      console.warn("========== TODO _getDatasourceInfo ==========");
      done.fail();
    });
  });
});
