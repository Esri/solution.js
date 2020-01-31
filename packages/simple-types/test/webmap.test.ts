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

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webmap`: manages the creation and deployment of web map item types", () => {
  // Set up a UserSession to use in all of these tests
  const MOCK_USER_SESSION = new common.UserSession({
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
        circularDependencies: [] as string[],
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
        circularDependencies: [] as string[],
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
        circularDependencies: [] as string[],
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
        circularDependencies: [] as string[],
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
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
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
        circularDependencies: [] as string[],
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
        data: {
          operationalLayers: [
            {
              itemId: "{{layer1.layer4.itemId}}",
              url: "{{layer1.layer4.url}}"
            },
            {
              itemId: "{{layer2.layer4.itemId}}",
              url: "{{layer2.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{layer4.layer4.itemId}}",
              url: "{{layer4.layer4.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: ["layer1", "layer2", "layer4"],
        circularDependencies: [] as string[],
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
    it("converts with table data", done => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
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
        circularDependencies: [] as string[],
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
        data: {
          operationalLayers: [],
          tables: [
            {
              itemId: "{{table1.layer4.itemId}}",
              url: "{{table1.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{table3.layer4.itemId}}",
              url: "{{table3.layer4.url}}"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: ["table1", "table3"],
        circularDependencies: [] as string[],
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
    it("converts with layer and table data", done => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
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
        circularDependencies: [] as string[],
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
        data: {
          operationalLayers: [
            {
              itemId: null
            },
            {
              itemId: "{{layer2.layer4.itemId}}",
              url: "{{layer2.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{layer4.layer4.itemId}}",
              url: "{{layer4.layer4.url}}"
            }
          ],
          tables: [
            {
              itemId: "{{table1.layer4.itemId}}",
              url: "{{table1.layer4.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{table3.layer4.itemId}}",
              url: "{{table3.layer4.url}}"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: ["layer2", "layer4", "table1", "table3"],
        circularDependencies: [] as string[],
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
    it("converts with layer and table data from same service", done => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
          title: "Voting Centers"
        } as any,
        data: {
          operationalLayers: [
            {
              itemId: null
            },
            {
              itemId: "theItemID",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/0"
            },
            {
              itemId: null
            },
            {
              itemId: "theItemID",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
            }
          ],
          tables: [
            {
              itemId: "theItemID",
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/2"
            },
            {
              itemId: null
            },
            {
              itemId: "theItemID",
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
        circularDependencies: [] as string[],
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
        data: {
          operationalLayers: [
            {
              itemId: null
            },
            {
              itemId: "{{theItemID.layer0.itemId}}",
              url: "{{theItemID.layer0.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{theItemID.layer1.itemId}}",
              url: "{{theItemID.layer1.url}}"
            }
          ],
          tables: [
            {
              itemId: "{{theItemID.layer2.itemId}}",
              url: "{{theItemID.layer2.url}}"
            },
            {
              itemId: null
            },
            {
              itemId: "{{theItemID.layer3.itemId}}",
              url: "{{theItemID.layer3.url}}"
            },
            {
              itemId: null
            }
          ]
        } as any,
        resources: [] as any[],
        dependencies: ["theItemID"],
        circularDependencies: [] as string[],
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
    it("handles error with fetching layer", done => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
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
        circularDependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };
      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
          mockItems.get400Failure()
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
          '{"token":"fake-token"}'
        );

      webmap.convertItemToTemplate(model, MOCK_USER_SESSION).then(
        () => {
          done.fail();
        },
        e => done()
      );
    });

    it("can fetch layer without itemId", done => {
      const model = {
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
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
        circularDependencies: [] as string[],
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
        data: {
          operationalLayers: [
            {
              itemId: "{{layer1.layer4.itemId}}",
              url: "{{layer1.layer4.url}}"
            },
            {
              itemId: "{{layer2.layer4.itemId}}",
              url: "{{layer2.layer4.url}}"
            },
            {
              url: "{{layer3.layer3.url}}"
            },
            {
              itemId: "{{layer4.layer4.itemId}}",
              url: "{{layer4.layer4.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: ["layer1", "layer2", "layer4", "layer3"],
        circularDependencies: [] as string[],
        properties: {} as any,
        estimatedDeploymentCostFactor: 0
      };

      const layer3: any = {
        serviceItemId: "layer3",
        id: 3
      };

      fetchMock
        .post("https://fake.com/arcgis/rest/info", {})
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/generateToken",
          '{"token":"fake-token"}'
        )
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
          layer3
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
        itemId: "itm1234567890",
        type: "Web Map",
        key: "abcdefgh",
        item: {
          id: "{{itm1234567890.itemId}}",
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
              url:
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
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
        circularDependencies: [] as string[],
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
        data: {
          operationalLayers: [
            {
              itemId: "{{layer1.layer4.itemId}}",
              url: "{{layer1.layer4.url}}"
            },
            {
              itemId: "{{layer2.layer4.itemId}}",
              url: "{{layer2.layer4.url}}"
            },
            {
              url: "{{layer3.layer3.url}}"
            },
            {
              itemId: "{{layer3.layer3.itemId}}",
              url: "{{layer3.layer3.url}}"
            }
          ],
          tables: []
        } as any,
        resources: [] as any[],
        dependencies: ["layer1", "layer2", "layer3"],
        circularDependencies: [] as string[],
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

  describe("_getAnalysisLayerIds", () => {
    it("handles no analysis layers", done => {
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
      const dependencies = ["layer1", "layer2", "layer4"];

      fetchMock.post(
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
        { serviceItemId: "layer3", id: 3 }
      );

      webmap
        ._getAnalysisLayerIds(layerList, dependencies, MOCK_USER_SESSION)
        .then(
          updatedDependencies => {
            const expectedUpdate = {
              dependencies: ["layer1", "layer2", "layer4"],
              urlHash: {}
            };
            expect(updatedDependencies).toEqual(expectedUpdate);
            done();
          },
          e => {
            done.fail();
          }
        );
    });

    it("handles an analysis layer amidst other layers", done => {
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
      const dependencies = ["layer1", "layer2", "layer4"];

      fetchMock.post(
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
        { serviceItemId: "layer3", id: 3 }
      );

      webmap
        ._getAnalysisLayerIds(layerList, dependencies, MOCK_USER_SESSION)
        .then(
          updatedDependencies => {
            const expectedUpdate = {
              dependencies: ["layer1", "layer2", "layer4", "layer3"],
              urlHash: {
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3":
                  "layer3"
              }
            };
            expect(updatedDependencies).toEqual(expectedUpdate);
            done();
          },
          e => {
            done.fail();
          }
        );
    });

    it("handles an analysis layer without a serviceItemId", done => {
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
      const dependencies = ["layer1"];

      fetchMock.post(
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
        { id: 3 }
      );

      webmap
        ._getAnalysisLayerIds(layerList, dependencies, MOCK_USER_SESSION)
        .then(
          updatedDependencies => {
            const expectedUpdate = {
              dependencies: ["layer1"],
              urlHash: {}
            };
            expect(updatedDependencies).toEqual(expectedUpdate);
            done();
          },
          e => {
            done.fail();
          }
        );
    });

    it("handles case where analysis layer is already in dependencies", done => {
      const layerList = [
        {
          itemId: "layer1",
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/1"
        },
        {
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
        },
        {
          url:
            "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3"
        }
      ];
      const dependencies = ["layer1"];

      fetchMock.post(
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3",
        { serviceItemId: "layer3", id: 3 }
      );

      webmap
        ._getAnalysisLayerIds(layerList, dependencies, MOCK_USER_SESSION)
        .then(
          updatedDependencies => {
            const expectedUpdate = {
              dependencies: ["layer1", "layer3"],
              urlHash: {
                "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService/FeatureServer/3":
                  "layer3"
              }
            };
            expect(updatedDependencies).toEqual(expectedUpdate);
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
