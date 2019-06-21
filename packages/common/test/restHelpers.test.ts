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
 * Provides tests for functions involving the arcgis-rest-js library.
 */

import {
  createFeatureService,
  _getCreateServiceOptions,
  _setItemProperties,
  addToServiceDefinition,
  createItemWithData,
  getGroupContents,
  getGroupContentsTranche,
  updateItemURL,
  updateItem,
  getServiceLayersAndTables,
  _countRelationships,
  getLayers,
  extractDependencies,
  getLayerUpdates,
  _getUpdate,
  getRequest,
  _getRelationshipUpdates,
  createUniqueFolder
} from "../src/restHelpers";
import {
  TOMORROW,
  createRuntimeMockUserSession,
  setMockDateTime,
  checkForArcgisRestSuccessRequestError
} from "../test/mocks/utils";
import { IItemTemplate, IPostProcessArgs, IUpdate } from "../src/interfaces";
import * as fetchMock from "fetch-mock";
import { IUserRequestOptions, UserSession } from "@esri/arcgis-rest-auth";
import * as mockItems from "../test/mocks/agolItems";
import * as portal from "@esri/arcgis-rest-portal";

let itemTemplate: IItemTemplate;

beforeEach(() => {
  itemTemplate = {
    itemId: "",
    key: "",
    properties: {
      service: {},
      layers: [
        {
          fields: []
        }
      ],
      tables: []
    },
    type: "",
    item: {},
    data: {},
    estimatedDeploymentCostFactor: 0,
    resources: [],
    dependencies: []
  };
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new UserSession({
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

const MOCK_USER_REQOPTS: IUserRequestOptions = {
  authentication: MOCK_USER_SESSION
};

afterEach(() => {
  fetchMock.restore();
});

describe("Module `restHelpers`: common REST utility functions shared across packages", () => {
  describe("createFeatureService", () => {
    it("can handle failure", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
        mockItems.get400Failure()
      );

      const properties: any = {
        service: {
          somePropNotInItem: true,
          isView: true,
          capabilities: "Query"
        },
        layers: [
          {
            fields: []
          }
        ],
        tables: []
      };

      const item: any = {
        id: "0",
        name: "A"
      };

      createFeatureService(
        item,
        {},
        properties,
        MOCK_USER_REQOPTS,
        "aabb123456",
        true,
        "sol1234567890"
      ).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can create a service", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createService",
          '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
            "ROWPermits_publiccomment_" +
            now +
            '/FeatureServer","itemId":"svc1234567890",' +
            '"name":"ROWPermits_publiccomment_' +
            now +
            '","serviceItemId":"svc1234567890",' +
            '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
            now +
            '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}'
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}'
        );

      const properties: any = {
        service: {
          somePropNotInItem: true,
          isView: true,
          capabilities: "Query"
        },
        layers: [
          {
            fields: []
          }
        ],
        tables: []
      };

      createFeatureService(
        {
          id: "0",
          name: "A"
        },
        {},
        properties,
        sessionWithMockedTime,
        "aabb123456",
        true,
        "sol1234567890"
      ).then(
        () => {
          jasmine.clock().uninstall();
          done();
        },
        () => {
          jasmine.clock().uninstall();
          done.fail();
        }
      );
    });
  });

  describe("_getCreateServiceOptions", () => {
    it("can get options for HOSTED empty service", () => {
      const requestOptions: IUserRequestOptions = {
        authentication: new UserSession({
          username: "jsmith",
          password: "123456"
        })
      };
      itemTemplate.item.name = "A";
      const options: any = _getCreateServiceOptions(
        itemTemplate.item,
        itemTemplate.data,
        itemTemplate.properties,
        "aabb123456",
        false,
        requestOptions,
        "sol1234567890"
      );

      expect(options).toEqual({
        item: {
          name: "A_sol1234567890",
          title: "A",
          capabilities: [],
          data: {},
          text: {}
        },
        folderId: "aabb123456",
        params: {
          preserveLayerIds: true
        },
        preserveLayerIds: true,
        ...requestOptions
      });
    });

    it("can get options for PORTAL empty service", () => {
      const requestOptions: IUserRequestOptions = {
        authentication: new UserSession({
          username: "jsmith",
          password: "123456"
        })
      };

      const options: any = _getCreateServiceOptions(
        itemTemplate.item,
        itemTemplate.data,
        itemTemplate.properties,
        "aabb123456",
        true,
        requestOptions,
        "sol1234567890"
      );

      expect(options).toEqual({
        item: {
          name: "undefined_sol1234567890",
          title: undefined,
          capabilities: "",
          data: {},
          text: {}
        },
        folderId: "aabb123456",
        params: {
          preserveLayerIds: true
        },
        preserveLayerIds: true,
        ...requestOptions
      });
    });

    it("can get options for HOSTED service with values", () => {
      const requestOptions: IUserRequestOptions = {
        authentication: new UserSession({
          username: "jsmith",
          password: "123456"
        })
      };

      itemTemplate = {
        itemId: "",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"] // should be added to item and params
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          name: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: []
      };

      const options: any = _getCreateServiceOptions(
        itemTemplate.item,
        itemTemplate.data,
        itemTemplate.properties,
        "aabb123456",
        false,
        requestOptions,
        "sol1234567890"
      );

      expect(options).toEqual({
        item: {
          name: "A_sol1234567890",
          title: "A",
          somePropNotInItem: true,
          capabilities: ["Query"],
          data: {},
          text: {}
        },
        folderId: "aabb123456",
        params: {
          somePropNotInItem: true,
          preserveLayerIds: true
        },
        preserveLayerIds: true,
        ...requestOptions
      });
    });

    it("can get options for PORTAL service with values and unsupported capabilities", () => {
      const requestOptions: IUserRequestOptions = {
        authentication: new UserSession({
          username: "jsmith",
          password: "123456"
        })
      };

      itemTemplate = {
        itemId: "",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            isView: true,
            capabilities: "Query,CanEatWithChopsticks" // should be added to item and params
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {},
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: []
      };

      const options: any = _getCreateServiceOptions(
        itemTemplate.item,
        itemTemplate.data,
        itemTemplate.properties,
        "aabb123456",
        true, // isPortal
        requestOptions,
        "sol1234567890"
      );

      expect(options).toEqual({
        item: {
          name: options.item.name,
          title: undefined,
          somePropNotInItem: true,
          capabilities: "Query",
          data: {},
          text: {},
          isView: true
        },
        folderId: "aabb123456",
        params: {
          somePropNotInItem: true,
          preserveLayerIds: true,
          isView: true
        },
        preserveLayerIds: true,
        ...requestOptions
      });
    });

    it("can get options for HOSTED service with values when name contains quid", () => {
      const requestOptions: IUserRequestOptions = {
        authentication: new UserSession({
          username: "jsmith",
          password: "123456"
        })
      };

      itemTemplate = {
        itemId: "",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"] // should be added to item and params
          },
          layers: [
            {
              fields: []
            }
          ],
          tables: []
        },
        type: "",
        item: {
          name: "A_0a25612a2fc54f6e8828c679e2300a49",
          title: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: []
      };

      const options: any = _getCreateServiceOptions(
        itemTemplate.item,
        itemTemplate.data,
        itemTemplate.properties,
        "aabb123456",
        false,
        requestOptions,
        "1b25612a2fc54f6e8828c679e2300a49"
      );

      expect(options).toEqual({
        item: {
          name: "A_1b25612a2fc54f6e8828c679e2300a49",
          title: "A",
          somePropNotInItem: true,
          capabilities: ["Query"],
          data: {},
          text: {}
        },
        folderId: "aabb123456",
        params: {
          somePropNotInItem: true,
          preserveLayerIds: true
        },
        preserveLayerIds: true,
        ...requestOptions
      });
    });
  });

  describe("addToServiceDefinition", () => {
    it("can handle failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";

      fetchMock.post(adminUrl + "/addToDefinition", mockItems.get400Failure());

      addToServiceDefinition(url, {}).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can add", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";

      fetchMock.post(adminUrl + "/addToDefinition", '{"success": true}');

      addToServiceDefinition(url, {}).then(
        () => {
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("updateItemURL", () => {
    it("should handle failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/0/update",
        mockItems.get400Failure()
      );

      updateItemURL("0", url, MOCK_USER_REQOPTS).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("should return update item id", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/0/update",
        '{"success":true}'
      );

      updateItemURL("0", url, MOCK_USER_REQOPTS).then(
        id => {
          expect(id).toEqual("0");
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("updateItem", () => {
    it("can handle failure", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        mockItems.get400Failure()
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        MOCK_USER_REQOPTS,
        undefined,
        progressTickCallback
      ).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("without share", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        MOCK_USER_REQOPTS,
        undefined,
        progressTickCallback
      ).then(
        () => {
          done();
        },
        () => done.fail()
      );
    });

    it("with public share", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        MOCK_USER_REQOPTS,
        "public",
        progressTickCallback
      ).then(
        () => {
          done();
        },
        () => done.fail()
      );
    });

    it("with org share", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        MOCK_USER_REQOPTS,
        "org",
        progressTickCallback
      ).then(
        () => {
          done();
        },
        () => done.fail()
      );
    });

    it("can handle share failure", done => {
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/undefined/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        mockItems.get400Failure()
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      updateItem(
        "svc1234567890",
        itemTemplate.item,
        MOCK_USER_REQOPTS,
        "org",
        progressTickCallback
      ).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });
  });

  describe("getServiceLayersAndTables", () => {
    it("can handle failure to fetch service", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", mockItems.get400Failure());
      getServiceLayersAndTables(itemTemplate, MOCK_USER_REQOPTS).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can handle failure to fetch layer", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService([{ id: 0 }], []);
      expected.properties.service.layers[0].name = "A";
      expected.properties.layers[0] = expected.properties.service.layers[0];
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 1;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(adminUrl + "/0?f=json", mockItems.get400Failure());
      getServiceLayersAndTables(itemTemplate, MOCK_USER_REQOPTS).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can fetch layers", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService([{ id: 0 }], []);
      expected.properties.service.layers[0].name = "A";
      expected.properties.layers[0] = expected.properties.service.layers[0];
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 1;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(
        adminUrl + "/0?f=json",
        expected.properties.service.layers[0]
      );
      getServiceLayersAndTables(itemTemplate, MOCK_USER_REQOPTS).then(
        template => {
          expect(template).toEqual(expected);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch layers and tables", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(
        [{ id: 0 }],
        [{ id: 1 }]
      );
      expected.properties.service.layers[0].name = "A";
      expected.properties.service.tables[0].name = "B";
      expected.properties.layers[0] = expected.properties.service.layers[0];
      expected.properties.tables[0] = expected.properties.service.tables[0];
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 2;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(
        adminUrl + "/0?f=json",
        expected.properties.service.layers[0]
      );
      fetchMock.post(
        adminUrl + "/1?f=json",
        expected.properties.service.tables[0]
      );
      getServiceLayersAndTables(itemTemplate, MOCK_USER_REQOPTS).then(
        template => {
          expect(template).toEqual(expected);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch layers and tables with a relationship", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(
        [{ id: 0 }],
        [{ id: 1 }]
      );
      expected.properties.service.layers[0].name = "A";
      expected.properties.service.tables[0].name = "B";
      expected.properties.layers[0] = mockItems.getAGOLLayerOrTable(
        0,
        "A",
        "Feature Layer",
        [{}]
      );
      expected.properties.tables[0] = mockItems.getAGOLLayerOrTable(
        1,
        "B",
        "Table",
        [{}]
      );
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 4;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(adminUrl + "/0?f=json", expected.properties.layers[0]);
      fetchMock.post(adminUrl + "/1?f=json", expected.properties.tables[0]);
      getServiceLayersAndTables(itemTemplate, MOCK_USER_REQOPTS).then(
        template => {
          expect(template).toEqual(expected);
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("_countRelationships", () => {
    it("can handle empty layer array", () => {
      const layers: any[] = [];
      expect(_countRelationships(layers)).toEqual(0);
    });

    it("can handle layer with no relationships", () => {
      const layers: any[] = [
        {
          relationships: []
        }
      ];
      expect(_countRelationships(layers)).toEqual(0);
    });

    it("can handle layers with relationships", () => {
      const layers: any[] = [
        {
          relationships: [{}, {}]
        },
        {
          relationships: [{}]
        }
      ];
      expect(_countRelationships(layers)).toEqual(3);
    });
  });

  describe("getLayers", () => {
    it("can handle error", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = url;

      fetchMock.post(adminUrl + "/0?f=json", mockItems.get400Failure());
      getLayers(url, [{ id: 0 }], MOCK_USER_REQOPTS).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });
  });

  describe("extractDependencies", () => {
    it("should handle error", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = baseSvcURL;
      itemTemplate.properties.service.isView = true;

      fetchMock.post(baseSvcURL + "/sources?f=json", mockItems.get400Failure());
      extractDependencies(itemTemplate, MOCK_USER_REQOPTS).then(
        () => done.fail(),
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("should get empty array when the service is not a view", () => {
      const expected: any[] = [];
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = baseSvcURL;
      itemTemplate.properties.service.isView = false;

      fetchMock.post(
        baseSvcURL + "/sources?f=json",
        mockItems.getAGOLServiceSources()
      );
      extractDependencies(itemTemplate, MOCK_USER_REQOPTS).then(
        dependencies => {
          expect(dependencies).toEqual(expected);
        },
        () => fail()
      );
    });

    it("should get array of dependencies for a view", done => {
      const expected: any[] = [
        {
          id: "svc1234567890",
          name: "OtherSourceServiceName"
        }
      ];
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = baseSvcURL;
      itemTemplate.properties.service.isView = true;

      fetchMock.post(
        itemTemplate.item.url + "/sources?f=json",
        mockItems.getAGOLServiceSources()
      );
      extractDependencies(itemTemplate, MOCK_USER_REQOPTS).then(
        dependencies => {
          expect(dependencies).toEqual(expected);
          done();
        },
        e => fail(e)
      );
    });
  });

  describe("getLayerUpdates", () => {
    it("can get updates", () => {
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      itemTemplate.item.url = url;

      const relationships: any[] = [{ relationshipMock: "A" }];

      const objects: any = {
        0: {
          a: "a",
          type: "A",
          id: 0,
          relationships: relationships,
          deleteFields: ["A", "B"]
        }
      };

      const args: IPostProcessArgs = {
        message: "refresh",
        objects: objects,
        itemTemplate: itemTemplate,
        requestOptions: MOCK_USER_REQOPTS,
        progressTickCallback: function(opts: any) {
          return opts;
        }
      };

      const updates: any[] = getLayerUpdates(args);

      const _object: any = Object.assign({}, objects[0]);
      delete _object.type;
      delete _object.id;
      delete _object.relationships;
      delete _object.deleteFields;

      const expected: any[] = [
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "/0/deleteFromDefinition",
          params: {
            deleteFromDefinition: {
              fields: objects[0].deleteFields
            }
          },
          args: args
        },
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "/0/updateDefinition",
          params: {
            updateDefinition: _object
          },
          args: args
        },
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "/addToDefinition",
          params: {
            addToDefinition: {
              layers: [
                {
                  id: 0,
                  relationships: relationships
                }
              ]
            }
          },
          args
        },
        {
          url: adminUrl + "/refresh",
          params: {
            f: "json"
          },
          args
        }
      ];
      expect(updates).toEqual(expected);
    });
  });

  describe("getRequest", () => {
    it("should get request successfully", done => {
      itemTemplate.key = "123456";

      const args: IPostProcessArgs = {
        message: "refresh",
        objects: [],
        itemTemplate: itemTemplate,
        requestOptions: MOCK_USER_REQOPTS,
        progressTickCallback: function(opts: any) {
          return opts;
        }
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/refresh",
        params: {},
        args: args
      };

      fetchMock.post(
        baseAdminSvcURL + "/FeatureServer/refresh",
        '{"success":true}'
      );

      getRequest(update).then(() => done(), error => done.fail(error));
    });

    it("should handle error", done => {
      itemTemplate.key = "123456";

      const args: IPostProcessArgs = {
        message: "refresh",
        objects: [],
        itemTemplate: itemTemplate,
        requestOptions: MOCK_USER_REQOPTS,
        progressTickCallback: function(opts: any) {
          return opts;
        }
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/refresh",
        params: {},
        args: args
      };

      fetchMock.post(
        baseAdminSvcURL + "/FeatureServer/refresh",
        mockItems.get400Failure()
      );

      getRequest(update).then(
        () => done.fail(),
        error => {
          expect(error.name).toEqual("ArcGISRequestError");
          done();
        }
      );
    });
  });

  describe("createUniqueFolder", () => {
    it("folder doesn't already exist", done => {
      const folderTitleRoot = "folder name";
      const suffix = 0;
      const expectedSuccess = successfulFolderCreation(folderTitleRoot, suffix);

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        JSON.stringify(expectedSuccess)
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });

    it("initial version of folder exists", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 1;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });

    it("two versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 2;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });

    it("three versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 3;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      let suffix = 0;
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
        () => {
          const response =
            suffix === expectedSuffix
              ? JSON.stringify(
                  successfulFolderCreation(folderTitleRoot, suffix)
                )
              : JSON.stringify(failedFolderCreation(folderTitleRoot, suffix));
          ++suffix;
          return response;
        }
      );
      createUniqueFolder(folderTitleRoot, MOCK_USER_SESSION).then(
        (response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        },
        done.fail
      );
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //

function successfulFolderCreation(
  folderTitleRoot: string,
  suffix: number
): any {
  const folderName =
    folderTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    success: true,
    folder: {
      id: "fld1234567890",
      title: folderName,
      username: "casey"
    }
  };
}

function failedFolderCreation(folderTitleRoot: string, suffix: number): any {
  const folderName =
    folderTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    error: {
      code: 400,
      message: "Unable to create folder.",
      details: ["Folder title '" + folderName + "' not available."]
    }
  };
}
