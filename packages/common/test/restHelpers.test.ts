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

import * as admin from "@esri/arcgis-rest-feature-service";
import * as fetchMock from "fetch-mock";
import * as generalHelpers from "../src/generalHelpers";
import * as interfaces from "../src/interfaces";
import * as mockItems from "../test/mocks/agolItems";
import * as polyfills from "../src/polyfills";
import * as portal from "@esri/arcgis-rest-portal";
import * as request from "@esri/arcgis-rest-request";
import * as restHelpers from "../src/restHelpers";
import * as restHelpersGet from "../src/restHelpersGet";
import * as templates from "../test/mocks/templates";
import * as utils from "./mocks/utils";
import * as sinon from "sinon";
import { IPagingParams } from "@esri/arcgis-rest-portal";


// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.ArcGISIdentityManager;
let itemTemplate: interfaces.IItemTemplate;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

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
    item: {
      id: "",
      type: ""
    },
    data: {},
    estimatedDeploymentCostFactor: 0,
    resources: [],
    dependencies: [],
    groups: []
  };
});

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://myorg.maps.arcgis.com",
  authInfo: {}
};

afterEach(() => {
  fetchMock.restore();
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const portalSR: any = {
  wkid: 1
};
const serviceSR: any = {
  wkid: 2
};

const extent: any = {
  xmin: -131,
  ymin: 16,
  xmax: -57,
  ymax: 58,
  spatialReference: portalSR
};

const expectedExtent: any = {
  xmin: -131,
  ymin: 16,
  xmax: -57,
  ymax: 58,
  spatialReference: serviceSR
};

const geometryServiceUrl: string =
  "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer";

const projectedGeometries: any[] = [
  {
    x: -131,
    y: 16
  },
  {
    x: -57,
    y: 58
  }
];

const organization: any = utils.getPortalsSelfResponse();

const solutionItemExtent: any = [
  [0, 0],
  [1, 1]
];

describe("Module `restHelpers`: common REST utility functions shared across packages", () => {

  describe("ArcGISIdentityManager constructor-by-function", () => {
    it("handles defaulting all options", () => {
      const userSession = restHelpers.getUserSession();
      const expectedUserSession = new interfaces.ArcGISIdentityManager({});
      expect(userSession.username).toEqual(expectedUserSession.username);
      expect(userSession.password).toEqual(expectedUserSession.password);
      expect(userSession.portal).toEqual(expectedUserSession.portal);
    });

    it("handles username & password options", () => {
      const options = {
        username: "Fred",
        password: "Astaire"
      };
      const userSession = restHelpers.getUserSession(options);
      const expectedUserSession = new interfaces.ArcGISIdentityManager(options);
      expect(userSession.username).toEqual(expectedUserSession.username);
      expect(userSession.password).toEqual(expectedUserSession.password);
      expect(userSession.portal).toEqual(expectedUserSession.portal);
    });
  });

  describe("searchItems passthru", () => {
    it("can handle simple search", done => {
      fetchMock.get(
        "https://www.arcgis.com/sharing/rest/search?f=json&q=q%3Dredlands%2Bmap",
        {
          query: "redlands map",
          total: 10738,
          start: 1,
          num: 0,
          nextStart: -1,
          results: []
        }
      );

      restHelpers.searchItems("q=redlands+map").then(
        results => {
          expect(results.query).toEqual("redlands map");
          expect(results.num).toEqual(0);
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("addForwardItemRelationship", () => {
    it("can add a relationship", done => {
      const originItemId: string = "itm1234567890";
      const destinationItemId: string = "itm1234567891";
      const relationshipType: interfaces.ItemRelationshipType =
        "Survey2Service";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship",
        { success: true }
      );

      restHelpers
        .addForwardItemRelationship(
          originItemId,
          destinationItemId,
          relationshipType,
          MOCK_USER_SESSION
        )
        .then((result: interfaces.IStatusResponse) => {
          expect(result.success).toBeTruthy();
          expect(result.itemId).toEqual(originItemId);
          done();
        }, done.fail);
    });

    it("can handle a failure to add a relationship via success property", done => {
      const originItemId: string = "itm1234567890";
      const destinationItemId: string = "itm1234567891";
      const relationshipType: interfaces.ItemRelationshipType =
        "Survey2Service";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship",
        { success: false }
      );

      restHelpers
        .addForwardItemRelationship(
          originItemId,
          destinationItemId,
          relationshipType,
          MOCK_USER_SESSION
        )
        .then((result: interfaces.IStatusResponse) => {
          expect(result.success).toBeFalsy();
          expect(result.itemId).toEqual(originItemId);
          done();
        }, done.fail);
    });

    it("can handle a failure to add a relationship via 500", done => {
      const originItemId: string = "itm1234567890";
      const destinationItemId: string = "itm1234567891";
      const relationshipType: interfaces.ItemRelationshipType =
        "Survey2Service";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship",
        500
      );

      restHelpers
        .addForwardItemRelationship(
          originItemId,
          destinationItemId,
          relationshipType,
          MOCK_USER_SESSION
        )
        .then((result: interfaces.IStatusResponse) => {
          expect(result.success).toBeFalsy();
          expect(result.itemId).toEqual(originItemId);
          done();
        }, done.fail);
    });
  });

  describe("addForwardItemRelationships", () => {
    it("can handle an empty set of relationships", done => {
      const originItemId: string = "itm1234567890";
      const destinationRelationships: interfaces.IRelatedItems[] = [];

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      restHelpers
        .addForwardItemRelationships(
          originItemId,
          destinationRelationships,
          MOCK_USER_SESSION
        )
        .then((result: interfaces.IStatusResponse[]) => {
          expect(result).toEqual([] as interfaces.IStatusResponse[]);
          done();
        });
    });

    it("can add a single relationship", done => {
      const originItemId: string = "itm1234567890";
      const destinationRelationships: interfaces.IRelatedItems[] = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["itm1234567891"]
        }
      ];

      const addRelationshipUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship";
      fetchMock.post(addRelationshipUrl, { success: true });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      restHelpers
        .addForwardItemRelationships(
          originItemId,
          destinationRelationships,
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IStatusResponse[]) => {
          expect(results).toEqual([
            {
              success: true,
              itemId: "itm1234567890"
            }
          ]);

          const options: fetchMock.MockOptions = fetchMock.lastOptions(
            addRelationshipUrl
          );
          const fetchBody = (options as fetchMock.MockResponseObject).body;
          expect(fetchBody).toEqual(
            "f=json&originItemId=itm1234567890&destinationItemId=itm1234567891&relationshipType=Survey2Service&token=fake-token"
          );

          done();
        });
    });

    it("can add a set of relationships", done => {
      const originItemId: string = "itm1234567890";
      const destinationRelationships: interfaces.IRelatedItems[] = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["itm1234567891"]
        },
        {
          relationshipType: "Survey2Data",
          relatedItemIds: ["itm1234567891", "itm1234567892"]
        }
      ];

      const addRelationshipUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship";
      fetchMock.post(addRelationshipUrl, { success: true });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      restHelpers
        .addForwardItemRelationships(
          originItemId,
          destinationRelationships,
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IStatusResponse[]) => {
          expect(results.map(result => result.success)).toEqual(
            Array(3).fill(true)
          );
          expect(results.map(result => result.itemId)).toEqual(
            Array(3).fill("itm1234567890")
          );

          const calls = fetchMock.calls(addRelationshipUrl);
          expect(calls.map(call => call[1].body)).toEqual([
            "f=json&originItemId=itm1234567890&destinationItemId=itm1234567891&relationshipType=Survey2Service&token=fake-token",
            "f=json&originItemId=itm1234567890&destinationItemId=itm1234567891&relationshipType=Survey2Data&token=fake-token",
            "f=json&originItemId=itm1234567890&destinationItemId=itm1234567892&relationshipType=Survey2Data&token=fake-token"
          ]);

          done();
        });
    });

    it("can add a set of relationships with mixed success", done => {
      const originItemId: string = "itm1234567890";
      const destinationRelationships: interfaces.IRelatedItems[] = [
        {
          relationshipType: "Survey2Service",
          relatedItemIds: ["itm1234567891"]
        },
        {
          relationshipType: "Survey2Data",
          relatedItemIds: ["itm1234567891", "itm1234567892"]
        }
      ];

      const addRelationshipUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addRelationship";
      let callNum = 0;
      fetchMock.post(
        addRelationshipUrl,
        () => ({ success: ++callNum % 2 === 0 }) // alternate successes and fails
      );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      restHelpers
        .addForwardItemRelationships(
          originItemId,
          destinationRelationships,
          MOCK_USER_SESSION
        )
        .then((results: interfaces.IStatusResponse[]) => {
          expect(results.map(result => result.success)).toEqual([
            false,
            true,
            false
          ]);
          expect(results.map(result => result.itemId)).toEqual(
            Array(3).fill("itm1234567890")
          );

          const calls = fetchMock.calls(addRelationshipUrl);
          expect(calls.map(call => call[1].body)).toEqual([
            "f=json&originItemId=itm1234567890&destinationItemId=itm1234567891&relationshipType=Survey2Service&token=fake-token",
            "f=json&originItemId=itm1234567890&destinationItemId=itm1234567891&relationshipType=Survey2Data&token=fake-token",
            "f=json&originItemId=itm1234567890&destinationItemId=itm1234567892&relationshipType=Survey2Data&token=fake-token"
          ]);

          done();
        });
    });
  });

  describe("addTokenToUrl", () => {
    it("can handle failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const token = "tok1234567890";
      const getTokenSpy = spyOn(MOCK_USER_SESSION, "getToken").and.resolveTo(
        token
      );
      restHelpers.addTokenToUrl(url, MOCK_USER_SESSION).then(updatedUrl => {
        expect(getTokenSpy.calls.count()).toEqual(1);
        expect(getTokenSpy.calls.argsFor(0)[0]).toBe(url);
        expect(updatedUrl).toEqual(url + "?token=" + token);
        done();
      }, done.fail);
    });
  });

  describe("addToServiceDefinition", () => {
    it("can handle failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";

      fetchMock.post(adminUrl + "/addToDefinition", mockItems.get400Failure());

      restHelpers.addToServiceDefinition(url, {}).then(
        () => done.fail(),
        error => {
          expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(true);
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

      restHelpers.addToServiceDefinition(url, {}).then(
        () => done(),
        () => done.fail()
      );
    });

    it("will retry on first failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";

      spyOn(admin, "addToServiceDefinition").and.returnValues(
        Promise.reject({ success: false } as any),
        Promise.resolve({ success: true })
      );
      restHelpers.addToServiceDefinition(url, {}).then(
        () => done(),
        () => done.fail()
      );
    });

    xit("can async add, default", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";
      const statusURL = adminUrl + "/abc123";

      fetchMock.post(adminUrl + "/addToDefinition", { statusURL: statusURL });

      spyOn(request, "request").and.returnValues(
        Promise.resolve({ status: "Completed" })
      );

      restHelpers
        .addToServiceDefinition(url, { authentication: MOCK_USER_SESSION })
        .then(
          () => done(),
          () => done.fail()
        );
    });

    xit("can async add reject, default", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";
      const statusURL = adminUrl + "/abc123";

      fetchMock.post(adminUrl + "/addToDefinition", { statusURL: statusURL });
      fetchMock.post(statusURL, mockItems.get400Failure());

      restHelpers
        .addToServiceDefinition(url, { authentication: MOCK_USER_SESSION })
        .then(
          () => done.fail(),
          () => done()
        );
    });

    it("can async add, specifying async", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";
      const statusURL = adminUrl + "/abc123";

      fetchMock.post(adminUrl + "/addToDefinition", { statusURL: statusURL });

      spyOn(request, "request").and.returnValues(
        Promise.resolve({ status: "Completed" })
      );

      restHelpers
        .addToServiceDefinition(url, {
          params: { async: true },
          authentication: MOCK_USER_SESSION
        })
        .then(
          () => done(),
          () => done.fail()
        );
    });

    it("can async add reject, specifying async", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0";
      const statusURL = adminUrl + "/abc123";

      fetchMock.post(adminUrl + "/addToDefinition", { statusURL: statusURL });
      fetchMock.post(statusURL, mockItems.get400Failure());

      restHelpers
        .addToServiceDefinition(url, {
          params: { async: true },
          authentication: MOCK_USER_SESSION
        })
        .then(
          () => done.fail(),
          () => done()
        );
    });
  });

  describe("convertToISearchOptions", () => {
    it("can convert a search string", () => {
      const search = "my search";
      const expectedOptions = {
        q: search,
        start: 1,
        num: 100
      } as portal.ISearchOptions;
      const constructedOptions = restHelpers.convertToISearchOptions(search);
      expect(constructedOptions).toEqual(expectedOptions);
    });

    it("can handle an ISearchOptions", () => {
      const q = "my search";
      const search = {
        q,
        start: 1,
        num: 50
      } as portal.ISearchOptions;
      const expectedOptions = {
        q,
        start: 1,
        num: 50
      } as portal.ISearchOptions;
      const constructedOptions = restHelpers.convertToISearchOptions(search);
      expect(constructedOptions).toEqual(expectedOptions);
    });

    it("can handle an ISearchOptions with defaults", () => {
      const q = "my search";
      const search = {
        q
      } as portal.ISearchOptions;
      const expectedOptions = {
        q,
        start: 1,
        num: 100
      } as portal.ISearchOptions;
      const constructedOptions = restHelpers.convertToISearchOptions(search);
      expect(constructedOptions).toEqual(expectedOptions);
    });

    it("can handle a SearchQueryBuilder", () => {
      const q = "my search";
      const search = new portal.SearchQueryBuilder().match(q)
      const expectedOptions = {
        q: `"${q}"`, // SearchQueryBuilder returns this query in double quotes
        start: 1,
        num: 100
      } as portal.ISearchOptions;
      const constructedOptions = restHelpers.convertToISearchOptions(search);
      expect(constructedOptions).toEqual(expectedOptions);
    });
  });

  describe("createFeatureService", () => {
    it("can handle failure to get service options due to failure to convert extent", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", SERVER_INFO)
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/aabb123456/createService",
          mockItems.get400Failure()
        )
        .post(
          "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/findTransformations",
          mockItems.get400Failure()
        );

      const properties: any = {
        service: {
          somePropNotInItem: true,
          isView: true,
          capabilities: "Query",
          spatialReference: {
            wkid: -1
          }
        },
        layers: [
          {
            fields: []
          }
        ],
        tables: []
      };

      const template: any = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        item: {
          id: "0",
          name: "A"
        },
        data: {},
        properties,
        dependencies: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      restHelpers
        .createFeatureService(template, MOCK_USER_SESSION, templateDictionary)
        .then(
          () => done.fail(),
          error => {
            expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(
              true
            );
            done();
          }
        );
    });

    it("can handle failure to create service", done => {
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/aabb123456/createService",
        mockItems.get400Failure()
      );

      const properties: any = {
        service: {
          somePropNotInItem: true,
          isView: true,
          capabilities: "Query",
          spatialReference: {
            wkid: 102100
          }
        },
        layers: [
          {
            fields: []
          }
        ],
        tables: []
      };

      const template: any = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        item: {
          id: "0",
          name: "A"
        },
        data: {},
        properties,
        dependencies: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      restHelpers
        .createFeatureService(template, MOCK_USER_SESSION, templateDictionary)
        .then(
          () => done.fail(),
          error => {
            expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(
              true
            );
            done();
          }
        );
    });

    it("can create a service", done => {
      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: interfaces.ArcGISIdentityManager = utils.createRuntimeMockUserSession(
        utils.setMockDateTime(now)
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/aabb123456/createService",
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
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}'
        );

      const properties: any = {
        service: {
          somePropNotInItem: true,
          isView: true,
          capabilities: "Query",
          spatialReference: {
            wkid: 102100
          }
        },
        layers: [
          {
            fields: []
          }
        ],
        tables: []
      };

      const template: any = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        item: {
          id: "0",
          name: "A"
        },
        data: {},
        properties,
        dependencies: []
      };
      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      restHelpers
        .createFeatureService(
          template,
          sessionWithMockedTime,
          templateDictionary
        )
        .then(
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

  describe("createFullItem", () => {
    it("can create a minimal item", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string = null as string;
      const dataFile: File = null as File;
      const metadataFile: File = null as File;
      const resourcesFiles: File[] = null as File[];
      const access = undefined as string; // default is "private"

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/" +
          (folderId ? folderId + "/addItem" : "addItem"),
        {
          success: true,
          id: "itm1234567980",
          folder: folderId
        }
      );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(response => (response.success ? done() : done.fail()), done.fail);
    });

    it("can create a minimal public item", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string = null as string;
      const dataFile: File = null as File;
      const metadataFile: File = null as File;
      const resourcesFiles: File[] = null as File[];
      const access = "public";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/" +
            (folderId ? folderId + "/addItem" : "addItem"),
          {
            success: true,
            id: "itm1234567980",
            folder: folderId
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567980/share",
          {
            notSharedWith: [] as string[],
            itemId: "itm1234567980"
          }
        );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(response => (response.success ? done() : done.fail()), done.fail);
    });

    it("can create an org item with goodies", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string =
        "https://myserver/thumbnail/thumbnail.png";
      const dataFile: File = polyfills.new_File(
        [utils.getSampleJsonAsBlob()],
        "data.json"
      );
      const metadataFile: File = utils.getSampleMetadataAsFile();
      const resourcesFiles: File[] = [
        polyfills.new_File([utils.getSampleImageAsBlob()], "image.png")
      ];
      const access = "org";

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post(itemThumbnailUrl + "/rest/info", "{}")
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/" +
            (folderId ? folderId + "/addItem" : "addItem"),
          {
            success: true,
            id: "itm1234567980",
            folder: folderId
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567980/share",
          {
            notSharedWith: [] as string[],
            itemId: "itm1234567980"
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567980/update",
          utils.getSuccessResponse({ id: "itm1234567980" })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567980/addResources",
          utils.getSuccessResponse({
            itemId: "itm1234567980",
            owner: MOCK_USER_SESSION.username,
            folder: null
          })
        );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(response => (response.success ? done() : done.fail()), done.fail);
    });

    it("can create an item with a resource in a subfolder", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string = null as string;
      const dataFile: File = null as File;
      const metadataFile: File = null as File;
      const resourcesFiles: File[] = [
        polyfills.new_File(
          [utils.getSampleImageAsBlob()],
          "resourceFolder/image.png"
        )
      ];
      const access = undefined as string; // default is "private"

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/" +
            (folderId ? folderId + "/addItem" : "addItem"),
          {
            success: true,
            id: "itm1234567980",
            folder: folderId
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567980/addResources",
          utils.getSuccessResponse({
            itemId: "itm1234567980",
            owner: MOCK_USER_SESSION.username,
            folder: "resourceFolder"
          })
        );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(response => (response.success ? done() : done.fail()), done.fail);
    });

    it("can handle failure to add metadata to item, hard error", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string = null as string;
      const dataFile: File = null as File;
      const metadataFile: File = utils.getSampleMetadataAsFile();
      const resourcesFiles: File[] = null as File[];
      const access = undefined as string; // default is "private"

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/" +
            (folderId ? folderId + "/addItem" : "addItem"),
          {
            success: true,
            id: "itm1234567980",
            folder: folderId
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567980/update",
          500
        );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(
          () => done.fail(),
          () => done()
        );
    });

    it("can handle failure to create an item", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string = null as string;
      const dataFile: File = null as File;
      const metadataFile: File = null as File;
      const resourcesFiles: File[] = null as File[];
      const access = undefined as string; // default is "private"

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/" +
          (folderId ? folderId + "/addItem" : "addItem"),
        {
          success: false,
          id: "itm1234567980",
          folder: folderId
        }
      );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(
          () => done.fail(),
          () => done()
        );
    });

    it("can handle failure to create an item, hard error", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string = null as string;
      const dataFile: File = null as File;
      const metadataFile: File = null as File;
      const resourcesFiles: File[] = null as File[];
      const access = undefined as string; // default is "private"

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/" +
          (folderId ? folderId + "/addItem" : "addItem"),
        500
      );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(
          () => done.fail(),
          () => done()
        );
    });

    it("can handle failure to create a public item, hard error", done => {
      const itemInfo: any = {};
      const folderId: string = null as string; // default is top level
      const itemThumbnailUrl: string = null as string;
      const dataFile: File = null as File;
      const metadataFile: File = null as File;
      const resourcesFiles: File[] = null as File[];
      const access = "public";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/" +
            (folderId ? folderId + "/addItem" : "addItem"),
          {
            success: true,
            id: "itm1234567980",
            folder: folderId
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567980/share",
          500
        );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
          MOCK_USER_SESSION,
          dataFile,
          metadataFile,
          resourcesFiles,
          access
        )
        .then(
          () => done.fail(),
          () => done()
        );
    });
  });

  describe("createItemWithData", () => {
    it("can handle private specification", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "private";

      const createUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      fetchMock.post(createUrl, expectedCreate);

      restHelpers
        .createItemWithData(
          itemInfo,
          dataInfo,
          MOCK_USER_SESSION,
          folderId,
          access
        )
        .then(
          (response: portal.ICreateItemResponse) => {
            expect(response).toEqual(expectedCreate);
            done();
          },
          () => done.fail()
        );
    });

    it("can handle org specification", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "org";

      const createUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567980/share";
      const expectedShare = {
        notSharedWith: [] as string[],
        itemId: expectedCreate.id
      };
      fetchMock.post(createUrl, expectedCreate).post(shareUrl, expectedShare);

      restHelpers
        .createItemWithData(
          itemInfo,
          dataInfo,
          MOCK_USER_SESSION,
          folderId,
          access
        )
        .then(
          (response: portal.ICreateItemResponse) => {
            expect(response).toEqual(expectedCreate);
            done();
          },
          () => done.fail()
        );
    });

    it("can handle public specification", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "public";

      const createUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567980/share";
      const expectedShare = {
        notSharedWith: [] as string[],
        itemId: expectedCreate.id
      };
      fetchMock.post(createUrl, expectedCreate).post(shareUrl, expectedShare);

      restHelpers
        .createItemWithData(
          itemInfo,
          dataInfo,
          MOCK_USER_SESSION,
          folderId,
          access
        )
        .then(
          (response: portal.ICreateItemResponse) => {
            expect(response).toEqual(expectedCreate);
            done();
          },
          () => done.fail()
        );
    });

    it("can handle failure to change created item's access", done => {
      const itemInfo: any = {};
      const dataInfo: any = {};
      const folderId = "fld1234567890";
      const access = "public";

      const createUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567980/share";
      const expectedShare = mockItems.get400Failure();
      fetchMock.post(createUrl, expectedCreate).post(shareUrl, expectedShare);

      restHelpers
        .createItemWithData(
          itemInfo,
          dataInfo,
          MOCK_USER_SESSION,
          folderId,
          access
        )
        .then(
          () => done.fail(),
          response => {
            expect(response.success).toEqual(false);
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
      const user: any = {
        folders: []
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
        JSON.stringify(expectedSuccess)
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, { user }, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("initial version of folder exists", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 1;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );
      const user: any = {
        folders: [folderTitleRoot]
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
        () => {
          return successfulFolderCreation(folderTitleRoot, expectedSuffix);
        }
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, { user }, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("two versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 2;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );

      const user: any = {
        folders: ["folder name", "folder name 1"]
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
        () => {
          return JSON.stringify(
            successfulFolderCreation(folderTitleRoot, expectedSuffix)
          );
        }
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, { user }, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("three versions of folder exist", done => {
      const folderTitleRoot = "folder name";
      const expectedSuffix = 3;
      const expectedSuccess = successfulFolderCreation(
        folderTitleRoot,
        expectedSuffix
      );
      const user: any = {
        folders: ["folder name", "folder name 1", "folder name 2"]
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
        () => {
          return JSON.stringify(
            successfulFolderCreation(folderTitleRoot, expectedSuffix)
          );
        }
      );
      restHelpers
        .createUniqueFolder(folderTitleRoot, { user }, MOCK_USER_SESSION)
        .then((response: portal.IAddFolderResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("can handle abbreviated error", done => {
      const folderTitleRoot = "My Folder";
      const userSession = MOCK_USER_SESSION;
      const user: any = {
        folders: []
      };

      const createUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder";
      const expectedCreate = {
        error: {
          code: 400,
          message: "Unable to create folder.",
          details: [] as any[]
        }
      };
      fetchMock.post(createUrl, expectedCreate);

      restHelpers
        .createUniqueFolder(folderTitleRoot, { user }, userSession)
        .then(
          () => done.fail(),
          response => {
            expect(response.success).toBeUndefined();
            expect(response.message).toEqual("400: Unable to create folder.");
            done();
          }
        );
    });

    it("can handle extended error", done => {
      const folderTitleRoot = "My Folder";
      const userSession = MOCK_USER_SESSION;

      const createUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder";
      const expectedCreate = failedFolderCreation(folderTitleRoot, 0);
      fetchMock.post(createUrl, expectedCreate);

      restHelpers.createUniqueFolder(folderTitleRoot, {}, userSession).then(
        () => done.fail(),
        response => {
          expect(response.success).toBeUndefined();
          expect(response.message).toEqual("400: Unable to create folder.");
          done();
        }
      );
    });
  });

  describe("createUniqueGroup", () => {
    it("group doesn't already exist", done => {
      const groupTitleRoot = "group name";
      const groupItem = utils.getSampleGroupToAdd(groupTitleRoot);
      const suffix = 0;
      const expectedSuccess = successfulGroupCreation(groupTitleRoot, suffix);
      const user: any = {
        groups: []
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/community/createGroup",
        JSON.stringify(expectedSuccess)
      );
      restHelpers
        .createUniqueGroup(
          groupTitleRoot,
          groupItem,
          { user },
          MOCK_USER_SESSION
        )
        .then((response: interfaces.IAddGroupResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("initial version of group exists", done => {
      const groupTitleRoot = "group name";
      const groupItem = utils.getSampleGroupToAdd(groupTitleRoot);
      const expectedSuffix = 1;
      const expectedSuccess = successfulGroupCreation(
        groupTitleRoot,
        expectedSuffix
      );
      const user: any = {
        groups: [groupTitleRoot]
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/community/createGroup",
        () => {
          return successfulGroupCreation(groupTitleRoot, expectedSuffix);
        }
      );
      restHelpers
        .createUniqueGroup(
          groupTitleRoot,
          groupItem,
          { user },
          MOCK_USER_SESSION
        )
        .then((response: interfaces.IAddGroupResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("two versions of group exist", done => {
      const groupTitleRoot = "group name";
      const groupItem = utils.getSampleGroupToAdd(groupTitleRoot);
      const expectedSuffix = 2;
      const expectedSuccess = successfulGroupCreation(
        groupTitleRoot,
        expectedSuffix
      );

      const user: any = {
        groups: ["group name", "group name 1"]
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/community/createGroup",
        () => {
          return JSON.stringify(
            successfulGroupCreation(groupTitleRoot, expectedSuffix)
          );
        }
      );
      restHelpers
        .createUniqueGroup(
          groupTitleRoot,
          groupItem,
          { user },
          MOCK_USER_SESSION
        )
        .then((response: interfaces.IAddGroupResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("three versions of group exist", done => {
      const groupTitleRoot = "group name";
      const groupItem = utils.getSampleGroupToAdd(groupTitleRoot);
      const expectedSuffix = 3;
      const expectedSuccess = successfulGroupCreation(
        groupTitleRoot,
        expectedSuffix
      );
      const user: any = {
        groups: ["group name", "group name 1", "group name 2"]
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/community/createGroup",
        () => {
          return JSON.stringify(
            successfulGroupCreation(groupTitleRoot, expectedSuffix)
          );
        }
      );
      restHelpers
        .createUniqueGroup(
          groupTitleRoot,
          groupItem,
          { user },
          MOCK_USER_SESSION
        )
        .then((response: interfaces.IAddGroupResponse) => {
          expect(response).toEqual(expectedSuccess);
          done();
        }, done.fail);
    });

    it("can handle abbreviated error", done => {
      const groupTitleRoot = "My Group";
      const groupItem = utils.getSampleGroupToAdd(groupTitleRoot);
      const userSession = MOCK_USER_SESSION;
      const user: any = {
        groups: []
      };

      const createUrl = utils.PORTAL_SUBSET.restUrl + "/community/createGroup";
      const expectedCreate = {
        error: {
          code: 400,
          message: "Unable to create group.",
          details: [] as any[]
        }
      };
      fetchMock.post(createUrl, expectedCreate);

      restHelpers
        .createUniqueGroup(groupTitleRoot, groupItem, { user }, userSession)
        .then(
          () => done.fail(),
          response => {
            expect(response.success).toBeUndefined();
            expect(response.message).toEqual("400: Unable to create group.");
            done();
          }
        );
    });

    it("can handle extended error", done => {
      const groupTitleRoot = "My Group";
      const groupItem = utils.getSampleGroupToAdd(groupTitleRoot);
      const userSession = MOCK_USER_SESSION;
      const user: any = {
        groups: []
      };

      const createUrl = utils.PORTAL_SUBSET.restUrl + "/community/createGroup";
      const expectedCreate = failedGroupCreation(groupTitleRoot, 0);
      fetchMock.post(createUrl, expectedCreate);

      restHelpers
        .createUniqueGroup(groupTitleRoot, groupItem, { user }, userSession)
        .then(
          () => done.fail(),
          response => {
            expect(response.success).toBeUndefined();
            expect(response.message).toEqual("400: Unable to create group.");
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
      restHelpers.extractDependencies(itemTemplate, MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(true);
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
      restHelpers.extractDependencies(itemTemplate, MOCK_USER_SESSION).then(
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
      restHelpers.extractDependencies(itemTemplate, MOCK_USER_SESSION).then(
        dependencies => {
          expect(dependencies).toEqual(expected);
          done();
        },
        e => fail(e)
      );
    });

    it("should handle workforce service", done => {
      const template = templates.getItemTemplateSkeleton();
      template.properties.service = {};
      template.item.properties = {
        workforceProjectGroupId: "733f169eddb3451a9901abc8bd3d4ad4",
        workforceProjectVersion: "2.0.0",
        workforceDispatcherMapId: "af20c97da8864abaaa35a6fcfebcfaa4",
        workforceWorkerMapId: "686c1f6b308e4fa7939257811c604be1"
      };
      template.item.typeKeywords = ["Workforce Project"];

      template.properties.workforceInfos = {};
      template.properties.workforceInfos["assignmentIntegrationInfos"] = [
        {
          appid: "arcgis-navigator",
          GlobalID: "5dc678db-9115-49de-b7e2-6efb80d032c1",
          prompt: "Navigate to Assignment",
          urltemplate:
            "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
          dependencies: [],
          assignmenttype: null
        },
        {
          appid: "arcgis-collector",
          GlobalID: "b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7",
          prompt: "Collect at Assignment",
          urltemplate:
            "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}",
          dependencies: ["79625fd36f30420a8b961df47dae8bbf"],
          assignmenttype: "72832e11-2f1c-42c2-809b-b1108b5c625d"
        },
        {
          appid: "arcgis-collector",
          GlobalID: "c7889194-b3a7-47d3-899b-a3f72017f845",
          prompt: "Collect at Assignment",
          urltemplate:
            "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{8e1397c8f8ec45f69ff13b2fbf6b58a7.layer0.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
          dependencies: ["79625fd36f30420a8b961df47dae8bbf"],
          assignmenttype: "0db1c114-7221-4cf1-9df9-a37801fb2896"
        }
      ];

      const expected = [
        {
          id: "af20c97da8864abaaa35a6fcfebcfaa4",
          name: ""
        },
        {
          id: "733f169eddb3451a9901abc8bd3d4ad4",
          name: ""
        },
        {
          id: "686c1f6b308e4fa7939257811c604be1",
          name: ""
        },
        {
          id: "79625fd36f30420a8b961df47dae8bbf",
          name: ""
        }
      ];

      restHelpers
        .extractDependencies(template, MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("convertExtent", () => {
    it("can handle undefined out SR", done => {
      restHelpers
        .convertExtent(extent, undefined, geometryServiceUrl, MOCK_USER_SESSION)
        .then(_extent => {
          expect(_extent).toEqual(extent);
          done();
        }, done.fail);
    });

    it("can handle unmatched wkid", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              wkid: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(_extent => {
          expect(_extent).toEqual(expectedExtent);
          done();
        }, done.fail);
    });

    it("can handle unmatched wkid and geoTransforms", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              geoTransforms: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(_extent => {
          expect(_extent).toEqual(expectedExtent);
          done();
        }, done.fail);
    });

    it("can handle unmatched wkid and no transformations", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(geometryServiceUrl + "/findTransformations", {})
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(_extent => {
          expect(_extent).toEqual(expectedExtent);
          done();
        }, done.fail);
    });

    it("can handle unmatched wkid and unexpected transformations", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [{}]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: projectedGeometries
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(_extent => {
          expect(_extent).toEqual(expectedExtent);
          done();
        }, done.fail);
    });

    it("can handle unmatched wkid and no geom in response", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              wkid: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", {
          geometries: []
        })
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      const expected: any = undefined;

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(_extent => {
          expect(_extent).toEqual(expected);
          done();
        }, done.fail);
    });

    it("can handle unmatched wkid and failure on project", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(geometryServiceUrl + "/findTransformations", {
          transformations: [
            {
              wkid: 3
            }
          ]
        })
        .post(geometryServiceUrl + "/project", mockItems.get400Failure())
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
    });

    it("can handle unmatched wkid and failure on findTransformations", done => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(
          geometryServiceUrl + "/findTransformations",
          mockItems.get400Failure()
        )
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
    });
  });

  describe("convertExtentWithFallback", () => {
    it("can handle NaN", done => {
      // "NaN" extent values are returned when you try to project this to 102100
      const ext: interfaces.IExtent = {
        xmax: 180,
        xmin: -180,
        ymax: 90,
        ymin: -90,
        spatialReference: {
          wkid: 4326
        }
      };

      const NaNGeoms = [
        {
          x: "NaN",
          y: "NaN"
        },
        {
          x: "NaN",
          y: "NaN"
        }
      ];

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", SERVER_INFO)
        .post(geometryServiceUrl + "/findTransformations", {})
        .postOnce(
          geometryServiceUrl + "/project",
          {
            geometries: NaNGeoms
          },
          { overwriteRoutes: false }
        )
        .postOnce(
          geometryServiceUrl + "/project",
          {
            geometries: projectedGeometries
          },
          { overwriteRoutes: false }
        );

      restHelpers
        .convertExtentWithFallback(
          ext,
          undefined,
          serviceSR,
          geometryServiceUrl,
          MOCK_USER_SESSION
        )
        .then(actual => {
          expect(actual).toEqual(expectedExtent);
          done();
        }, done.fail);
    });

    it("can handle NaN with defaultExtent", done => {
      // "NaN" extent values are returned when you try to project this to 102100
      const ext: interfaces.IExtent = {
        xmax: 180,
        xmin: -180,
        ymax: 90,
        ymin: -90,
        spatialReference: {
          wkid: 4326
        }
      };

      const NaNGeoms = [
        {
          x: "NaN",
          y: "NaN"
        },
        {
          x: "NaN",
          y: "NaN"
        }
      ];

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", SERVER_INFO)
        .post(geometryServiceUrl + "/findTransformations", {})
        .postOnce(
          geometryServiceUrl + "/project",
          {
            geometries: NaNGeoms
          },
          { overwriteRoutes: false }
        );

      restHelpers
        .convertExtentWithFallback(
          ext,
          expectedExtent,
          serviceSR,
          geometryServiceUrl,
          MOCK_USER_SESSION
        )
        .then(actual => {
          expect(actual).toEqual(expectedExtent);
          done();
        }, done.fail);
    });

    it("can handle error on failover", done => {
      const ext: interfaces.IExtent = {
        xmax: 180,
        xmin: -180,
        ymax: 90,
        ymin: -90,
        spatialReference: {
          wkid: 4326
        }
      };

      const NaNGeoms = [
        {
          x: "NaN",
          y: "NaN"
        },
        {
          x: "NaN",
          y: "NaN"
        }
      ];

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", SERVER_INFO)
        .post(geometryServiceUrl + "/findTransformations", {})
        .postOnce(
          geometryServiceUrl + "/project",
          {
            geometries: NaNGeoms
          },
          { overwriteRoutes: false }
        )
        .postOnce(geometryServiceUrl + "/project", mockItems.get400Failure(), {
          overwriteRoutes: false
        });

      restHelpers
        .convertExtentWithFallback(
          ext,
          undefined,
          serviceSR,
          geometryServiceUrl,
          MOCK_USER_SESSION
        )
        .then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
    });
  });

  describe("getLayers", () => {
    it("can handle success", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = url;

      fetchMock.post(
        adminUrl + "/0?f=json",
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")
      );
      restHelpers
        .getLayers(url, [{ id: 0 }], MOCK_USER_SESSION)
        .then(result => {
          expect(result).toEqual([
            mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")
          ]);
          done();
        }, done.fail);
    });

    it("can handle error", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = url;

      fetchMock.post(adminUrl + "/0?f=json", mockItems.get400Failure());
      restHelpers.getLayers(url, [{ id: 0 }], MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("can handle empty layer list", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      restHelpers.getLayers(url, [], MOCK_USER_SESSION).then(result => {
        expect(result).toEqual([]);
        done();
      }, done.fail);
    });
  });

  describe("getLayerUpdates", () => {
    it("can get updates", () => {
      const url: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      const adminUrl: string =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/";

      itemTemplate.item.url = url;
      itemTemplate.properties.layers = [{
        id: 0
      }];

      const relationships: any[] = [{ relationshipMock: "A", id: 0 }];

      const contingentValues = {
        "contingentValuesDefinition": {
          "fieldGroups": [{
            "name": "Tree Type",
            "restrictive": false,
            "fields": [{
              "id": 0,
              "name": "commonname",
              "fieldType": "esriFieldTypeString"
            }],
            "domains": { "commonname": "CommonName", "genus": "Genus", "species": "Species" },
            "contingentValues": [{
              "id": 1, "types": [3, 3, 3],
              "values": [0, 0, 0]
            }],
            "stringDicts": [{
              "domain": "CommonName",
              "entries": ["Norway Maple"]
            }]
          }, {
            "name": "Space Info",
            "restrictive": false,
            "fields": [{
              "id": 0, "name": "spacestatus", "fieldType": "esriFieldTypeString"
            }],
            "domains": {
              "spacestatus": "SpaceStatus", "spacetype": "SpaceType"
            },
            "contingentValues": [{
              "id": 9, "types": [3, 3, 3], "values": [0, 0, 0]
            }]
          }]
        }
      };

      const objects: any = {
        0: {
          a: "a",
          type: "A",
          id: 0,
          relationships,
          deleteFields: ["A", "B"],
          contingentValues
        }
      };

      const args: interfaces.IPostProcessArgs = {
        message: "refresh",
        objects: objects,
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION
      };

      const updates: any[] = restHelpers.getLayerUpdates(args, false);

      const _object: any = Object.assign({}, objects[0]);
      delete _object.type;
      delete _object.id;
      delete _object.relationships;
      delete _object.deleteFields;

      const expected: any[] = [
        {
          url: adminUrl + "refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "0/deleteFromDefinition",
          params: {
            deleteFromDefinition: {
              fields: objects[0].deleteFields
            }
          },
          args: args
        },
        {
          url: adminUrl + "refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "addToDefinition",
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
          url: adminUrl + "refresh",
          params: {
            f: "json"
          },
          args
        },
        {
          url: adminUrl + "0/addToDefinition",
          params: {
            addToDefinition: {
              contingentValuesDefinition: contingentValues.contingentValuesDefinition
            }
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

      const args: interfaces.IPostProcessArgs = {
        message: "refresh",
        objects: [],
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: interfaces.IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/refresh",
        params: {},
        args: args
      };

      fetchMock.post(
        baseAdminSvcURL + "/FeatureServer/refresh",
        '{"success":true}'
      );

      restHelpers.getRequest(update).then(
        () => done(),
        error => done.fail(error)
      );
    });

    it("should handle error", done => {
      itemTemplate.key = "123456";

      const args: interfaces.IPostProcessArgs = {
        message: "refresh",
        objects: [],
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: interfaces.IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/refresh",
        params: {},
        args: args
      };

      fetchMock.post(
        baseAdminSvcURL + "/FeatureServer/refresh",
        mockItems.get400Failure()
      );

      restHelpers.getRequest(update).then(
        () => done.fail(),
        error => {
          expect(error.name).toEqual("ArcGISRequestError");
          done();
        }
      );
    });

    it("will retry on first failure", done => {
      itemTemplate.key = "123456";

      const args: interfaces.IPostProcessArgs = {
        message: "deleteFromDefinition",
        objects: [],
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: interfaces.IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/deleteFromDefinition",
        params: {},
        args: args
      };

      spyOn(request, "request").and.returnValues(
        Promise.reject({ success: false }),
        Promise.resolve({ success: true })
      );

      restHelpers.getRequest(update).then(
        () => done(),
        () => done.fail()
      );
    });

    it("should get async request successfully", done => {
      itemTemplate.key = "123456";

      const args: interfaces.IPostProcessArgs = {
        message: "addToDefinition",
        objects: [],
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: interfaces.IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/addToDefinition",
        params: {},
        args: args
      };
      const statusURL = update.url + "/123abc";

      spyOn(request, "request").and.returnValues(
        Promise.resolve({ statusURL: statusURL }),
        Promise.resolve({ status: "Completed" })
      );

      restHelpers.getRequest(update).then(
        () => done(),
        error => done.fail(error)
      );
    });

    it("should get async request reject", done => {
      itemTemplate.key = "123456";

      const args: interfaces.IPostProcessArgs = {
        message: "addToDefinition",
        objects: [],
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION
      };

      const baseAdminSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment";

      const update: interfaces.IUpdate = {
        url: baseAdminSvcURL + "/FeatureServer/addToDefinition",
        params: {},
        args: args
      };
      const statusURL = update.url + "/123abc";

      fetchMock.post(update.url, { statusURL: statusURL });
      fetchMock.post(statusURL, mockItems.get400Failure());

      restHelpers.getRequest(update).then(
        () => done.fail(),
        () => done()
      );
    });
  });

  describe("getServiceLayersAndTables", () => {
    it("can handle failure to fetch service", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", mockItems.get400Failure());
      restHelpers
        .getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION)
        .then(
          () => done.fail(),
          error => {
            expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(
              true
            );
            done();
          }
        );
    });

    it("can handle failure to fetch layer", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const serviceResponse = mockItems.getAGOLService([
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer", [{}])
      ]);

      itemTemplate.item.url = url;
      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(); // layers and tables have been moved up a level
      expected.properties.service.cacheMaxAge =
        expected.properties.service.adminServiceInfo.cacheMaxAge;
      expected.properties.layers = [
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer", [{}])
      ];
      expected.properties.layers[0].extent = null;

      fetchMock.post(adminUrl + "?f=json", mockItems.get400Failure());
      restHelpers
        .getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION)
        .then(
          () => done.fail(),
          error => {
            expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(
              true
            );
            done();
          }
        );
    });

    it("can fetch layers", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const serviceResponse = mockItems.getAGOLService([
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")
      ]);

      itemTemplate.item.url = url;
      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(); // layers and tables have been moved up a level
      expected.properties.service.cacheMaxAge =
        expected.properties.service.adminServiceInfo.cacheMaxAge;
      expected.properties.layers = [
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")
      ];
      expected.properties.layers[0].extent = null;

      fetchMock.post(adminUrl + "?f=json", serviceResponse);
      restHelpers
        .getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION)
        .then(
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

      const serviceResponse = mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")],
        [mockItems.getAGOLLayerOrTable(1, "B", "Table")]
      );

      itemTemplate.item.url = url;
      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(); // layers and tables have been moved up a level
      expected.properties.service.cacheMaxAge =
        expected.properties.service.adminServiceInfo.cacheMaxAge;
      expected.properties.layers = [
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")
      ];
      expected.properties.layers[0].extent = null;
      expected.properties.tables = [
        mockItems.getAGOLLayerOrTable(1, "B", "Table")
      ];
      expected.properties.tables[0].extent = null;

      fetchMock.post(adminUrl + "?f=json", serviceResponse);
      restHelpers
        .getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION)
        .then(
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

      const serviceResponse = mockItems.getAGOLService(
        [mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer", [{}])],
        [mockItems.getAGOLLayerOrTable(1, "B", "Table", [{}])]
      );

      itemTemplate.item.url = url;
      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService(); // layers and tables have been moved up a level
      expected.properties.service.cacheMaxAge =
        expected.properties.service.adminServiceInfo.cacheMaxAge;
      expected.properties.layers = [
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer", [{}])
      ];
      expected.properties.layers[0].extent = null;
      expected.properties.tables = [
        mockItems.getAGOLLayerOrTable(1, "B", "Table", [{}])
      ];
      expected.properties.tables[0].extent = null;

      fetchMock.post(adminUrl + "?f=json", serviceResponse);
      restHelpers
        .getServiceLayersAndTables(itemTemplate, MOCK_USER_SESSION)
        .then(
          template => {
            expect(template).toEqual(expected);
            done();
          },
          () => done.fail()
        );
    });

    it("handles the absence of a url in the item", done => {
      const template = templates.getItemTemplateSkeleton();
      restHelpers
        .getServiceLayersAndTables(
          generalHelpers.cloneObject(template),
          MOCK_USER_SESSION
        )
        .then(updatedTemplate => {
          expect(updatedTemplate).toEqual(template);
          done();
        }, done.fail);
    });
  });

  describe("getFeatureServiceProperties", () => {
    it("checkes that the cacheMaxAge property is copied out of a service's adminServiceInfo", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const serviceResponse = mockItems.getAGOLService([
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer", [{}])
      ]);
      fetchMock.post(adminUrl + "?f=json", serviceResponse);

      restHelpers
        .getFeatureServiceProperties(url, MOCK_USER_SESSION)
        .then(response => {
          expect(response.service.cacheMaxAge).toEqual(60);
          done();
        }, done.fail);
    });

    it("handles the absence of a service's adminServiceInfo", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

      const serviceResponse = mockItems.getAGOLService([
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer", [{}])
      ]);
      delete serviceResponse.adminServiceInfo;
      serviceResponse.cacheMaxAge = 90;
      fetchMock.post(adminUrl + "?f=json", serviceResponse);

      restHelpers
        .getFeatureServiceProperties(url, MOCK_USER_SESSION)
        .then(response => {
          expect(response.service.cacheMaxAge).toEqual(90);
          done();
        }, done.fail);
    });

    it("handles error on getting contingent values", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";
      const adminUrl =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
      const lyr = mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer", [{}], false);
      lyr.hasContingentValuesDefinition = true;
      const serviceResponse = mockItems.getAGOLService([
        lyr
      ], [], false);
      serviceResponse.cacheMaxAge = 90;
      fetchMock
        .post(adminUrl + "?f=json", serviceResponse)
        .post(adminUrl + '/0/contingentValues?f=json', mockItems.get400Failure());

      restHelpers
        .getFeatureServiceProperties(url, MOCK_USER_SESSION)
        .then(
          () => done.fail(),
          () => done()
        );
    });

    it("handles workforce project service", done => {
      const props: interfaces.IFeatureServiceProperties = {
        service: {},
        layers: [],
        tables: []
      };

      const assignmentIntegrations = {
        objectIdFieldName: "OBJECTID",
        uniqueIdField: { name: "OBJECTID", isSystemMaintained: true },
        globalIdFieldName: "GlobalID",
        fields: [
          {
            name: "OBJECTID",
            type: "esriFieldTypeOID",
            alias: "OBJECTID",
            sqlType: "sqlTypeInteger"
          },
          {
            name: "GlobalID",
            type: "esriFieldTypeGlobalID",
            alias: "GlobalID",
            sqlType: "sqlTypeOther",
            length: 38
          },
          {
            name: "appid",
            type: "esriFieldTypeString",
            alias: "App ID",
            sqlType: "sqlTypeVarchar",
            length: 255
          },
          {
            name: "prompt",
            type: "esriFieldTypeString",
            alias: "Prompt",
            sqlType: "sqlTypeVarchar",
            length: 255
          },
          {
            name: "urltemplate",
            type: "esriFieldTypeString",
            alias: "URL Template",
            sqlType: "sqlTypeVarchar",
            length: 4000
          },
          {
            name: "assignmenttype",
            type: "esriFieldTypeGUID",
            alias: "Assignment Type",
            sqlType: "sqlTypeOther",
            length: 38
          },
          {
            name: "CreationDate",
            type: "esriFieldTypeDate",
            alias: "CreationDate",
            sqlType: "sqlTypeOther",
            length: 8
          }
        ],
        features: [
          {
            attributes: {
              OBJECTID: 2,
              GlobalID: "5dc678db-9115-49de-b7e2-6efb80d032c1",
              appid: "arcgis-navigator",
              prompt: "Navigate to Assignment",
              urltemplate:
                "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
              assignmenttype: null,
              CreationDate: 1598295988457
            }
          },
          {
            attributes: {
              OBJECTID: 3,
              GlobalID: "b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7",
              appid: "arcgis-collector",
              prompt: "Collect at Assignment",
              urltemplate:
                "https://collector.arcgis.app?itemID=79625fd36f30420a8b961df47dae8bbf&center=${assignment.latitude},${assignment.longitude}",
              assignmenttype: "72832e11-2f1c-42c2-809b-b1108b5c625d",
              CreationDate: 1598295988457
            }
          },
          {
            attributes: {
              OBJECTID: 4,
              GlobalID: "c7889194-b3a7-47d3-899b-a3f72017f845",
              appid: "arcgis-collector",
              prompt: "Collect at Assignment",
              urltemplate:
                "https://collector.arcgis.app?itemID=79625fd36f30420a8b961df47dae8bbf&center=${assignment.latitude},${assignment.longitude}&featureSourceURL=https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_483ff5d0f06d42fba56b479147b4422d/FeatureServer/0&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
              assignmenttype: "0db1c114-7221-4cf1-9df9-a37801fb2896",
              CreationDate: 1598295988457
            }
          }
        ]
      };
      const assignmentTypes = {
        objectIdFieldName: "OBJECTID",
        uniqueIdField: { name: "OBJECTID", isSystemMaintained: true },
        globalIdFieldName: "GlobalID",
        fields: [
          {
            name: "OBJECTID",
            type: "esriFieldTypeOID",
            alias: "OBJECTID",
            sqlType: "sqlTypeInteger"
          },
          {
            name: "description",
            type: "esriFieldTypeString",
            alias: "Description",
            sqlType: "sqlTypeVarchar",
            length: 255
          },
          {
            name: "GlobalID",
            type: "esriFieldTypeGlobalID",
            alias: "GlobalID",
            sqlType: "sqlTypeOther",
            length: 38
          },
          {
            name: "CreationDate",
            type: "esriFieldTypeDate",
            alias: "CreationDate",
            sqlType: "sqlTypeOther",
            length: 8
          }
        ],
        features: [
          {
            attributes: {
              OBJECTID: 1,
              description: "Verify Address",
              GlobalID: "72832e11-2f1c-42c2-809b-b1108b5c625d",
              CreationDate: 1598295988210
            }
          },
          {
            attributes: {
              OBJECTID: 2,
              description: "Collect New Address",
              GlobalID: "0db1c114-7221-4cf1-9df9-a37801fb2896",
              CreationDate: 1598295988210
            }
          }
        ]
      };

      const urlNonAdmin =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/workforce_733f169eddb3451a9901abc8bd3d4ad4/FeatureServer";
      const url =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/admin/services/workforce_733f169eddb3451a9901abc8bd3d4ad4/FeatureServer";
      const fetchUrl =
        "https://services6.arcgis.com/Pu6Fai10JE2L2xUd/arcgis/rest/services/ProposedSiteAddress_field_483ff5d0f06d42fba56b479147b4422d/FeatureServer/0";

      fetchMock
        .post(url + "?f=json", {})
        .get(
          urlNonAdmin +
            "/3/query?f=json&where=1%3D1&outFields=*&token=fake-token",
          assignmentTypes
        )
        .get(
          urlNonAdmin +
            "/4/query?f=json&where=1%3D1&outFields=*&token=fake-token",
          assignmentIntegrations
        )
        .post(fetchUrl, { serviceItemId: "8e1397c8f8ec45f69ff13b2fbf6b58a7" });

      const expected: interfaces.IFeatureServiceProperties = {
        service: {},
        layers: [],
        tables: [],
        workforceInfos: {
          assignmentTypeInfos: [
            {
              description: "Verify Address",
              GlobalID: "{72832e11-2f1c-42c2-809b-b1108b5c625d}"
            },
            {
              description: "Collect New Address",
              GlobalID: "{0db1c114-7221-4cf1-9df9-a37801fb2896}"
            }
          ],
          assignmentIntegrationInfos: [
            {
              appid: "arcgis-navigator",
              GlobalID: "{5dc678db-9115-49de-b7e2-6efb80d032c1}",
              prompt: "Navigate to Assignment",
              urltemplate:
                "https://navigator.arcgis.app?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce",
              dependencies: [],
              assignmenttype: null
            },
            {
              appid: "arcgis-collector",
              GlobalID: "{b2eabaf6-9c4d-4cd2-88f2-84eb2e1e94d7}",
              prompt: "Collect at Assignment",
              urltemplate:
                "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}",
              dependencies: ["79625fd36f30420a8b961df47dae8bbf"],
              assignmenttype: "{72832e11-2f1c-42c2-809b-b1108b5c625d}"
            },
            {
              appid: "arcgis-collector",
              GlobalID: "{c7889194-b3a7-47d3-899b-a3f72017f845}",
              prompt: "Collect at Assignment",
              urltemplate:
                "https://collector.arcgis.app?itemID={{79625fd36f30420a8b961df47dae8bbf.itemId}}&center=${assignment.latitude},${assignment.longitude}&featureSourceURL={{8e1397c8f8ec45f69ff13b2fbf6b58a7.layer0.url}}&featureAttributes=%7B%22placename%22:%22${assignment.location}%22%7D",
              dependencies: [
                "79625fd36f30420a8b961df47dae8bbf",
                "8e1397c8f8ec45f69ff13b2fbf6b58a7"
              ],
              assignmenttype: "{0db1c114-7221-4cf1-9df9-a37801fb2896}"
            }
          ]
        }
      };

      restHelpers
        .getFeatureServiceProperties(url, MOCK_USER_SESSION, true)
        .then(actual => {
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("removeFolder", () => {
    it("removes a folder", done => {
      const folderId: string = "ABC123";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/" +
          folderId +
          "/delete",
        utils.getSuccessResponse({
          folder: { username: "casey", id: folderId }
        })
      );
      restHelpers.removeFolder(folderId, MOCK_USER_SESSION).then(actual => {
        expect(actual.success).toEqual(true);
        done();
      }, done.fail);
    });

    it("fails to remove a folder", done => {
      const folderId: string = "ABC123";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/" +
          folderId +
          "/delete",
        utils.getFailureResponse({
          folder: { username: "casey", id: folderId }
        })
      );
      restHelpers.removeFolder(folderId, MOCK_USER_SESSION).then(
        () => done.fail(),
        actual => {
          expect(actual.success).toEqual(false);
          done();
        }
      );
    });
  });

  describe("removeGroup", () => {
    it("removes a group", done => {
      const groupId: string = "ABC123";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/community/groups/" +
          groupId +
          "/delete",
        utils.getSuccessResponse({ groupId })
      );
      restHelpers.removeGroup(groupId, MOCK_USER_SESSION).then(actual => {
        expect(actual.success).toEqual(true);
        done();
      }, done.fail);
    });

    it("fails to remove a group", done => {
      const groupId: string = "ABC123";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/community/groups/" +
          groupId +
          "/delete",
        utils.getFailureResponse({ groupId })
      );
      restHelpers.removeGroup(groupId, MOCK_USER_SESSION).then(
        () => done.fail(),
        actual => {
          expect(actual.success).toEqual(false);
          done();
        }
      );
    });
  });

  describe("removeItem", () => {
    it("removes an item", done => {
      const itemId: string = "ABC123";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/" +
          itemId +
          "/delete",
        utils.getSuccessResponse({ itemId })
      );
      restHelpers.removeItem(itemId, MOCK_USER_SESSION).then(actual => {
        expect(actual.success).toEqual(true);
        done();
      }, done.fail);
    });

    it("fails to remove an item", done => {
      const itemId: string = "ABC123";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/" +
          itemId +
          "/delete",
        utils.getFailureResponse({ itemId })
      );
      restHelpers.removeItem(itemId, MOCK_USER_SESSION).then(
        () => done.fail(),
        actual => {
          expect(actual.success).toEqual(false);
          done();
        }
      );
    });
  });

  describe("removeItemOrGroup", () => {
    it("removes an item", done => {
      const itemId: string = "ABC123";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/" +
          itemId +
          "/delete",
        utils.getSuccessResponse({ itemId })
      );
      restHelpers.removeItemOrGroup(itemId, MOCK_USER_SESSION).then(actual => {
        expect(actual.success).toEqual(true);
        done();
      }, done.fail);
    });

    it("removes a group", done => {
      const itemId: string = "ABC123";
      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            itemId +
            "/delete",
          utils.getFailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/" +
            itemId +
            "/delete",
          utils.getSuccessResponse({ itemId })
        );
      restHelpers.removeItemOrGroup(itemId, MOCK_USER_SESSION).then(actual => {
        expect(actual.success).toEqual(true);
        done();
      }, done.fail);
    });

    it("fails to remove an id", done => {
      const itemId: string = "ABC123";
      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            itemId +
            "/delete",
          utils.getFailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/" +
            itemId +
            "/delete",
          utils.getFailureResponse()
        );
      restHelpers.removeItemOrGroup(itemId, MOCK_USER_SESSION).then(
        () => done.fail(),
        actual => {
          expect(actual.success).toEqual(false);
          done();
        }
      );
    });
  });

  describe("searchAllItems", () => {
    it("can handle no results from searching for items", done => {
      const query: string = "My Item";

      fetchMock.get(
        "https://www.arcgis.com/sharing/rest/search?f=json&q=My%20Item",
        //                        q    s   #    x  t  r
        utils.getSearchResponse(query, 1, 100, -1, 0, 0)
      );

      restHelpers.searchAllItems(query).then(
        itemResponse => {
          expect(itemResponse.results.length).toEqual(0);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch a single tranche", done => {
      const query: string = "My Item";

      fetchMock.get(
        "https://www.arcgis.com/sharing/rest/search?f=json&q=My%20Item",
        //                        q    s   #    x  t  r
        utils.getSearchResponse(query, 1, 100, -1, 4, 4)
      );

      restHelpers.searchAllItems(query).then(
        itemResponse => {
          expect(itemResponse.results.length).toEqual(4);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch more than one tranche", done => {
      const query: string = "My Item";

      fetchMock
        .get(
          "https://www.arcgis.com/sharing/rest/search?f=json&q=My%20Item",
          //                        q    s   #    x    t    r
          utils.getSearchResponse(query, 1, 100, 101, 120, 100)
        )
        .get(
          "https://www.arcgis.com/sharing/rest/search?f=json&q=My%20Item&num=100&start=101",
          //                        q     s    #    x   t    r
          utils.getSearchResponse(query, 101, 100, -1, 120, 20)
        );

      restHelpers.searchAllItems(query).then(
        itemResponse => {
          expect(itemResponse.results.length).toEqual(120);
          done();
        },
        () => done.fail()
      );
    });

    it("can handle a failure", done => {
      const query: string = "My Item";

      fetchMock.get(
        "https://www.arcgis.com/sharing/rest/search?f=json&q=My%20Item",
        mockItems.get400Failure()
      );

      restHelpers.searchAllItems(query).then(
        () => done.fail(),
        response => {
          expect(response.message).toEqual("CONT_0001: Item does not exist or is inaccessible.");
          done();
        }
      );
    });
  });

  describe("searchGroups", () => {
    it("can handle no results from searching groups", done => {
      const query: string = "My Group";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/community/groups?f=json&q=My%20Group&token=fake-token",
        utils.getGroupResponse(query, false)
      );

      restHelpers.searchGroups(query, MOCK_USER_SESSION).then(
        groupResponse => {
          expect(groupResponse.results.length).toEqual(0);
          done();
        },
        () => done.fail()
      );
    });

    it("can handle a result", done => {
      const query: string = "My Group";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/community/groups?f=json&q=My%20Group&token=fake-token",
        utils.getGroupResponse(query, true)
      );

      restHelpers.searchGroups(query, MOCK_USER_SESSION).then(
        groupResponse => {
          expect(groupResponse.results.length).toEqual(1);
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("searchAllGroups", () => {
    it("can fetch more than one tranche", done => {
      const query: string = "Fred";
      const pagingParams: IPagingParams = { start: 1, num: 5 };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups?f=json&sortField=title&sortOrder=asc&start=1&num=5&q=Fred&token=fake-token",
          utils.getSearchResponse(query, 1, 5, 6, 9, 5)
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups?f=json&sortField=title&sortOrder=asc&start=6&num=5&q=Fred&token=fake-token",
          utils.getSearchResponse(query, 6, 5, -1, 9, 4)
        );

      restHelpers.searchAllGroups(query, MOCK_USER_SESSION, null, pagingParams).then(
        response => {
          expect(response.length).toEqual(9);
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("searchGroupAllContents", () => {
    it("can handle no results from searching group contents", done => {
      const groupId: string = "grp1234567890";
      const query: string = "Fred";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          `/content/groups/${groupId}/search?f=json&num=100&q=${query}&token=fake-token`,
        //                        q    s   #    x  t  r
        utils.getSearchResponse(query, 1, 100, -1, 0, 0)
      );

      restHelpers.searchGroupAllContents(groupId, query, MOCK_USER_SESSION).then(
        response => {
          expect(response.query).withContext("query").toEqual(query);
          expect(response.start).withContext("start").toEqual(1);
          expect(response.num).withContext("num").toEqual(0);
          expect(response.nextStart).withContext("nextStart").toEqual(-1);
          expect(response.total).withContext("total").toEqual(0);
          expect(response.results.length).withContext("results.length").toEqual(0);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch a single tranche", done => {
      const groupId: string = "grp1234567890";
      const query: string = "Fred";
      const additionalSearchOptions: interfaces.IAdditionalGroupSearchOptions = { num: 5 };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          `/content/groups/${groupId}/search?f=json&num=5&q=${query}&token=fake-token`,
        //                        q    s  #   x  t  r
        utils.getSearchResponse(query, 1, 5, -1, 4, 4)
      );

      restHelpers.searchGroupAllContents(groupId, query, MOCK_USER_SESSION, additionalSearchOptions).then(
        response => {
          expect(response.query).withContext("query").toEqual(query);
          expect(response.start).withContext("start").toEqual(1);
          expect(response.num).withContext("num").toEqual(4);
          expect(response.nextStart).withContext("nextStart").toEqual(-1);
          expect(response.total).withContext("total").toEqual(4);
          expect(response.results.length).withContext("results.length").toEqual(4);
          done();
        },
        () => done.fail()
      );
    });

    it("can fetch more than one tranche", done => {
      const groupId: string = "grp1234567890";
      const query: string = "Fred";
      const additionalSearchOptions: interfaces.IAdditionalGroupSearchOptions = { num: 5 };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            `/content/groups/${groupId}/search?f=json&num=5&q=${query}&token=fake-token`,
          //                        q    s  #  x  t  r
          utils.getSearchResponse(query, 1, 5, 6, 9, 5)
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            `/content/groups/${groupId}/search?f=json&num=5&start=6&q=${query}&token=fake-token`,
            //                        q    s  #   x  t  r
            utils.getSearchResponse(query, 1, 5, -1, 9, 4)
        );

      restHelpers.searchGroupAllContents(groupId, query, MOCK_USER_SESSION, additionalSearchOptions).then(
        response => {
          expect(response.query).withContext("query").toEqual(query);
          expect(response.start).withContext("start").toEqual(1);
          expect(response.num).withContext("num").toEqual(9);
          expect(response.nextStart).withContext("nextStart").toEqual(-1);
          expect(response.total).withContext("total").toEqual(9);
          expect(response.results.length).withContext("results.length").toEqual(9);
          done();
        },
        () => done.fail()
      );
    });

    it("can handle a failure", done => {
      const groupId: string = "grp1234567890";
      const query: string = "Fred";
      const additionalSearchOptions: interfaces.IAdditionalGroupSearchOptions = { num: 5 };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          `/content/groups/${groupId}/search?f=json&num=5&q=${query}&token=fake-token`,
        mockItems.get400Failure()
      );

      restHelpers.searchGroupAllContents(groupId, query, MOCK_USER_SESSION, additionalSearchOptions).then(
        () => done.fail(),
        response => {
          expect(response.message).toEqual("CONT_0001: Item does not exist or is inaccessible.");
          done();
        }
      );
    });
  });

  describe("searchGroupContents", () => {
    it("can handle no results from searching group contents", done => {
      const groupId: string = "grp1234567890";
      const query: string = "My Group";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          `/content/groups/${groupId}/search?f=json&num=100&q=My%20Group&token=fake-token`,
        utils.getGroupResponse(query, false)
      );

      restHelpers.searchGroupContents(groupId, query, MOCK_USER_SESSION).then(
        groupResponse => {
          expect(groupResponse.results.length).toEqual(0);
          done();
        },
        () => done.fail()
      );
    });

    it("can handle a result", done => {
      const groupId: string = "grp1234567890";
      const query: string = "My Group";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          `/content/groups/${groupId}/search?f=json&num=100&q=My%20Group&token=fake-token`,
        utils.getGroupResponse(query, true)
      );

      restHelpers.searchGroupContents(groupId, query, MOCK_USER_SESSION).then(
        groupResponse => {
          expect(groupResponse.results.length).toEqual(1);
          done();
        },
        () => done.fail()
      );
    });

    it("can handle a categories search", done => {
      const groupId: string = "grp1234567890";
      const additionalSearchOptions: interfaces.IAdditionalGroupSearchOptions = {
        categories: [
          "a,b", // a or b
          // and
          "c,d" // c or d
        ]
      };

      const expectedUrl =
        utils.PORTAL_SUBSET.restUrl +
        `/content/groups/${groupId}/search?f=json&num=100&categories=a%2Cb&categories=c%2Cd&token=fake-token`;
      fetchMock.get(expectedUrl, {});

      restHelpers
        .searchGroupContents(
          groupId,
          null,
          MOCK_USER_SESSION,
          additionalSearchOptions
        )
        .then(response => {
          expect(fetchMock.calls(expectedUrl).length).toBe(1);
          const [url, options] = fetchMock.lastCall(expectedUrl);
          expect(options.method).toBe("GET");
          expect(url).toEqual(expectedUrl);
          done();
        })
        .catch(e => {
          fail(e);
        });
    });

    it("will not override the num passed in additionalSearchOptions", done => {
      const groupId: string = "grp1234567890";
      const additionalSearchOptions: interfaces.IAdditionalGroupSearchOptions = {
        categories: [
          "a,b", // a or b
          // and
          "c,d" // c or d
        ],
        num: 24
      };

      const expectedUrl =
        utils.PORTAL_SUBSET.restUrl +
        `/content/groups/${groupId}/search?f=json&num=24&categories=a%2Cb&categories=c%2Cd&token=fake-token`;
      fetchMock.get(expectedUrl, {});

      restHelpers
        .searchGroupContents(
          groupId,
          null,
          MOCK_USER_SESSION,
          additionalSearchOptions
        )
        .then(response => {
          expect(fetchMock.calls(expectedUrl).length).toBe(1);
          const [url, options] = fetchMock.lastCall(expectedUrl);
          expect(options.method).toBe("GET");
          expect(url).toEqual(expectedUrl);
          done();
        })
        .catch(e => {
          fail(e);
        });
    });
  });

  describe("_setItemProperties", () => {
    it("will remove null initialExtent", () => {
      const serviceInfo = {
        service: {
          capabilities: ""
        }
      };
      const item: any = {
        initialExtent: null
      };
      const expected = {
        capabilities: ""
      };

      const actual = restHelpers._setItemProperties(
        item,
        itemTemplate,
        serviceInfo,
        {},
        true
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("shareItem ::", () => {
    it("shared the item", done => {
      const groupId: string = "grp1234567890";
      const id: string = "itm1234567890";
      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/search", {
          query: {
            q: `id: itm1234567890 AND group: grp1234567890`,
            start: 1,
            num: 10,
            sortField: "title"
          },
          total: 0,
          start: 1,
          nextStart: -1,
          results: []
        })
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890?f=json&token=fake-token",
          mockItems.getAGOLItem("Group")
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/users/casey?f=json&token=fake-token",
          mockItems.getAGOLUser(MOCK_USER_SESSION.username)
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567890/share",
          {
            itemId: "itm1234567980",
            notSharedWith: []
          }
        );
      restHelpers
        .shareItem(groupId, id, MOCK_USER_SESSION, MOCK_USER_SESSION.username)
        .then(() => done())
        .catch(ex => {
          done.fail();
        });
    });
    it("can handle error on shareItem", done => {
      const groupId: string = "grp1234567890";
      const id: string = "itm1234567890";
      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/search", {
          query: {
            q: `id: itm1234567890 AND group: grp1234567890`,
            start: 1,
            num: 10,
            sortField: "title"
          },
          total: 0,
          start: 1,
          nextStart: -1,
          results: []
        })
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/grp1234567890?f=json&token=fake-token",
          mockItems.getAGOLItem("Group")
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/users/casey?f=json&token=fake-token",
          mockItems.getAGOLUser(MOCK_USER_SESSION.username)
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/itm1234567890/share",
          {
            notSharedWith: [groupId] as string[],
            itemId: "itm1234567980"
          }
        );
      restHelpers.shareItem(groupId, id, MOCK_USER_SESSION).then(
        () => done.fail(),
        () => done()
      );
    });
  });

  describe("updateItem", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("handles additional parameters", done => {
      const itemInfo: interfaces.IItemUpdate = {
        id: "itm1234567890"
      };
      const additionalParams: any = {
        data: "fred"
      };
      const updateItemFnStub = sinon
        .stub(portal, "updateItem")
        .resolves(utils.getSuccessResponse());
      restHelpers
        .updateItem(itemInfo, MOCK_USER_SESSION, null, additionalParams)
        .then(response => {
          const updateItemFnCall = updateItemFnStub.getCall(0);
          expect(updateItemFnCall.args[0]).toEqual({
            item: {
              id: "itm1234567890"
            },
            folderId: null,
            authentication: MOCK_USER_SESSION,
            params: {
              data: "fred"
            }
          });
          done();
        }, done.fail);
    });
  });

  describe("updateGroup", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("handles failure", done => {
      const grp = templates.getGroupTemplatePart().item;

      sinon
        .stub(portal, "updateGroup")
        .rejects(utils.getFailureResponse());

      restHelpers
        .updateGroup(grp, MOCK_USER_SESSION)
        .then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
    });

    it("uses supplied additional parameters", done => {
      const grp = templates.getGroupTemplatePart().item;
      const additionalParams = { extra: "value" };

      const updateStub = sinon
        .stub(portal, "updateGroup")
        .resolves(utils.getSuccessResponse());

      restHelpers
        .updateGroup(grp, MOCK_USER_SESSION, additionalParams)
        .then(
          () => {
            const updateFnCall = updateStub.getCall(0);
            expect(updateFnCall.args[0].params).toEqual(additionalParams);
            done();
          },
          () => {
            done.fail();
          }
        );
    });
  });

  describe("updateItemExtended", () => {
    it("can handle failure", done => {
      itemTemplate.item.id = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update",
        mockItems.get400Failure()
      );
      restHelpers
        .updateItemExtended(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          undefined
        )
        .then(
          () => done.fail(),
          error => {
            expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(
              true
            );
            done();
          }
        );
    });

    it("without data", done => {
      itemTemplate.item.id = "itm1234567890";
      itemTemplate.data = null;
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      restHelpers
        .updateItemExtended(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          undefined
        )
        .then(
          () => {
            done();
          },
          () => done.fail()
        );
    });

    it("without share", done => {
      itemTemplate.item.id = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      restHelpers
        .updateItemExtended(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          undefined
        )
        .then(
          () => {
            done();
          },
          () => done.fail()
        );
    });

    it("with public share", done => {
      itemTemplate.item.id = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/share",
        '{"success":true}'
      );
      restHelpers
        .updateItemExtended(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          null,
          "public"
        )
        .then(
          () => {
            done();
          },
          () => done.fail()
        );
    });

    it("with tracker share", done => {
      itemTemplate.item.id = "itm1234567890";
      itemTemplate.item.typeKeywords = ["Location Tracking View"];
      itemTemplate.item.properties = {
        trackViewGroup: "grp123"
      };
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/LocationTrackingServiceOwner/items/itm1234567890/update",
        '{"success":true}'
      );
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/share",
        '{"success":true}'
      );
      restHelpers
        .updateItemExtended(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          null,
          "public",
          { locationTracking: { owner: "LocationTrackingServiceOwner"} }
        )
        .then(
          () => {
            done();
          },
          () => done.fail()
        );
    });

    it("with org share", done => {
      itemTemplate.item.id = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/share",
        '{"success":true}'
      );
      restHelpers
        .updateItemExtended(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          null,
          "org"
        )
        .then(
          () => {
            done();
          },
          () => done.fail()
        );
    });

    it("can handle share failure", done => {
      itemTemplate.item.id = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/itm1234567890/share",
        mockItems.get400Failure()
      );
      restHelpers
        .updateItemExtended(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          null,
          "org"
        )
        .then(
          () => done.fail(),
          error => {
            expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(
              true
            );
            done();
          }
        );
    });
  });

  describe("updateItemTemplateFromDictionary", () => {
    it("should update template", done => {
      const templateDictionary = {
        folderId: "fld0",
        itmA: {
          itemId: "itm1"
        },
        itmB: {
          itemId: "itm2"
        }
      };

      const fetchedItemBase: interfaces.IItem = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "{{itmA.itemId}}",
        key2: "{{folderId}}"
      };
      const expectedItemBaseUpdate = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "itm1",
        key2: "fld0"
      };

      const fetchedItemData = {
        map: "{{itmB.itemId}}"
      };
      const expectedItemDataUpdate = {
        map: "itm2"
      };

      spyOn(restHelpersGet, "getItemBase").and.callFake(() =>
        Promise.resolve(fetchedItemBase)
      );
      spyOn(restHelpersGet, "getItemDataAsJson").and.callFake(() =>
        Promise.resolve(fetchedItemData)
      );

      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/update";
      const updateResponse = utils.getSuccessResponse({ id: "itm1234567890" });
      fetchMock.post(updateUrl, updateResponse);
      restHelpers
        .updateItemTemplateFromDictionary(
          "itm1234567890",
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toEqual(updateResponse);

          const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
          expect(callBody).toEqual(
            "f=json&text=%7B%22map%22%3A%22itm2%22%7D&created=0&id=itm1234567890&modified=0&numViews=0&owner=&size=0&tags=&title=&type=Web%20Map&key1=itm1&key2=fld0&token=fake-token"
          );
          done();
        }, done.fail);
    });

    it("should handle failure", done => {
      const templateDictionary = {
        folderId: "fld0",
        itmA: {
          itemId: "itm1"
        },
        itmB: {
          itemId: "itm2"
        }
      };

      const fetchedItemBase: interfaces.IItem = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "{{itmA.itemId}}",
        key2: "{{folderId}}"
      };
      const expectedItemBaseUpdate = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "itm1",
        key2: "fld0"
      };

      const fetchedItemData = {
        map: "{{itmB.itemId}}"
      };
      const expectedItemDataUpdate = {
        map: "itm2"
      };

      spyOn(restHelpersGet, "getItemBase").and.callFake(() =>
        Promise.resolve(fetchedItemBase)
      );
      spyOn(restHelpersGet, "getItemDataAsJson").and.callFake(() =>
        Promise.resolve(fetchedItemData)
      );

      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/itm1234567890/update";
      const updateResponse = mockItems.get400SuccessFailure();
      fetchMock.post(updateUrl, updateResponse);
      restHelpers
        .updateItemTemplateFromDictionary(
          "itm1234567890",
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(
          () => done.fail(),
          result => {
            expect(result).toEqual(updateResponse);

            const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
            expect(callBody).toEqual(
              "f=json&text=%7B%22map%22%3A%22itm2%22%7D&created=0&id=itm1234567890&modified=0&numViews=0&owner=&size=0&tags=&title=&type=Web%20Map&key1=itm1&key2=fld0&token=fake-token"
            );
            done();
          }
        );
    });
  });

  describe("updateItemURL", () => {
    it("should handle failure", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/apps/CrowdsourcePolling/index.html?appid=wma1234567890";

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/update",
          mockItems.get400Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/0?f=json&token=fake-token",
          templates.getItemTemplate("Web Mapping Application", [], url)
        );

      restHelpers.updateItemURL("0", url, MOCK_USER_SESSION).then(
        () => done.fail(),
        error => {
          expect(utils.checkForArcgisRestSuccessRequestError(error)).toBe(true);
          done();
        }
      );
    });

    it("should return update item id", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/apps/CrowdsourcePolling/index.html?appid=wma1234567890";

      const updatedItem = mockItems.getAGOLItem("Web Mapping Application", url);

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/update",
          '{"success":true}'
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/0?f=json&token=fake-token",
          updatedItem
        );

      restHelpers._updateItemURL("0", url, MOCK_USER_SESSION).then(
        id => {
          expect(id).toEqual("0");
          done();
        },
        () => done.fail()
      );
    });

    it("should handle error on first attempt to update a URL", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/apps/CrowdsourcePolling/index.html?appid=wma1234567890";

      const originalItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        url + "{0}"
      );

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/update",
        utils.getFailureResponse()
      );

      restHelpers._updateItemURL("0", url, MOCK_USER_SESSION, 2).then(
        () => done.fail(),
        () => done()
      );
    });

    it("should handle no-op on first attempt to update a URL", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/apps/CrowdsourcePolling/index.html?appid=wma1234567890";

      const originalItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        url + "{0}"
      );
      const updatedItem = mockItems.getAGOLItem("Web Mapping Application", url);

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/update",
          utils.getSuccessResponse()
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/0?f=json&token=fake-token",
          utils.returnOnNthCall(2, updatedItem, originalItem)
        );
      spyOn(console, "warn").and.callFake(() => {});

      restHelpers._updateItemURL("0", url, MOCK_USER_SESSION, 2).then(
        id => {
          expect(id).toEqual("0");
          done();
        },
        () => done.fail()
      );
    });

    it("should handle error attempting to check if item got updated", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/apps/CrowdsourcePolling/index.html?appid=wma1234567890";

      const originalItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        url + "0"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/update",
          utils.getSuccessResponse()
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/0?f=json&token=fake-token",
          500
        );

      restHelpers._updateItemURL("0", url, MOCK_USER_SESSION, 2).then(
        () => done.fail(),
        () => done()
      );
    });

    it("should handle no-op on all attempts to update a URL", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/apps/CrowdsourcePolling/index.html?appid=wma1234567890";

      const originalItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        url + "0"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/update",
          utils.getSuccessResponse()
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/0?f=json&token=fake-token",
          originalItem
        );
      spyOn(console, "error").and.callFake(() => {});

      restHelpers._updateItemURL("0", url, MOCK_USER_SESSION, 2).then(
        () => done.fail(),
        () => done()
      );
    });
  });

  describe("_addItemDataFile", () => {
    it("should add text/plain data", done => {
      const itemId = "itm1234567890";
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/" +
        itemId +
        "/update";
      fetchMock.post(url, '{"success":true}');
      restHelpers
        ._addItemDataFile(
          itemId,
          utils.getSampleTextAsBlob() as File,
          MOCK_USER_SESSION
        )
        .then(response => {
          expect(response.success).toBeTruthy();
          const options: fetchMock.MockOptions = fetchMock.lastOptions(url);
          const fetchBody = (options as fetchMock.MockResponseObject).body;
          expect(fetchBody).toEqual(
            "f=json&id=itm1234567890&text=this%20is%20some%20text&token=fake-token"
          );
          done();
        }, done.fail);
    });

    it("should add application/json data", done => {
      const itemId = "itm1234567890";
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/" +
        itemId +
        "/update";
      fetchMock.post(url, '{"success":true}');
      restHelpers
        ._addItemDataFile(
          itemId,
          utils.getSampleJsonAsBlob() as File,
          MOCK_USER_SESSION
        )
        .then(response => {
          expect(response.success).toBeTruthy();
          const options: fetchMock.MockOptions = fetchMock.lastOptions(url);
          const fetchBody = (options as fetchMock.MockResponseObject).body;
          expect(fetchBody).toEqual(
            "f=json&id=itm1234567890&text=%7B%22a%22%3A%22a%22%2C%22b%22%3A1%2C%22c%22%3A%7B%22d%22%3A%22d%22%7D%7D&token=fake-token"
          );
          done();
        }, done.fail);
    });

    it("should add text data that's not text/plain or application/json", done => {
      // With Microsoft Legacy Edge, we have potential date mismatches because of Edge's lack of support for
      // the File constructor, so we'll have Date return the same value each time it is called for this test
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      utils.setMockDateTime(date.getTime());

      const itemId = "itm1234567890";
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/" +
        itemId +
        "/update";
      fetchMock.post(url, '{"success":true}');
      restHelpers
        ._addItemDataFile(
          itemId,
          utils.getSampleMetadataAsFile(),
          MOCK_USER_SESSION
        )
        .then(response => {
          expect(response.success)
            .withContext("response.success")
            .toBeTruthy();
          const options: fetchMock.MockOptions = fetchMock.lastOptions(url);
          const fetchBody = (options as fetchMock.MockResponseObject).body;
          (fetchBody as FormData).forEach(
            (value: FormDataEntryValue, key: string) => {
              switch (key) {
                case "f":
                  expect(value.toString())
                    .withContext("key = f")
                    .toEqual("json");
                  break;
                case "id":
                  expect(value.toString())
                    .withContext("key = id")
                    .toEqual(itemId);
                  break;
                case "file":
                  expect(value.valueOf())
                    .withContext("key = file")
                    .toEqual(utils.getSampleMetadataAsFile());
                  break;
                case "token":
                  expect(value.toString())
                    .withContext("key = token")
                    .toEqual("fake-token");
                  break;
              }
            }
          );
          jasmine.clock().uninstall();
          done();
        }, done.fail);
    });
  });

  describe("_addItemMetadataFile", () => {
    it("should update metadata", done => {
      const itemId = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/" +
          itemId +
          "/update",
        '{"success":true}'
      );
      restHelpers
        ._addItemMetadataFile(
          itemId,
          utils.getSampleMetadataAsFile(),
          MOCK_USER_SESSION
        )
        .then(response => {
          expect(response.success).toBeTruthy();
          done();
        }, done.fail);
    });

    it("should handle failure to update metadata", done => {
      const itemId = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/" +
          itemId +
          "/update",
        '{"success":false}'
      );
      restHelpers
        ._addItemMetadataFile(
          itemId,
          utils.getSampleMetadataAsFile(),
          MOCK_USER_SESSION
        )
        .then(response => {
          expect(response.success).toBeFalsy();
          done();
        }, done.fail);
    });
  });

  describe("_countRelationships", () => {
    it("can handle empty layer array", () => {
      const layers: any[] = [];
      expect(restHelpers._countRelationships(layers)).toEqual(0);
    });

    it("can handle layer with missing relationships", () => {
      const layers: any[] = [
        {
          relationships: null
        }
      ];
      expect(restHelpers._countRelationships(layers)).toEqual(0);
    });

    it("can handle layer with no relationships", () => {
      const layers: any[] = [
        {
          relationships: []
        }
      ];
      expect(restHelpers._countRelationships(layers)).toEqual(0);
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
      expect(restHelpers._countRelationships(layers)).toEqual(3);
    });
  });

  describe("_getCreateServiceOptions", () => {
    it("can get options for HOSTED empty service", done => {
      const userSession: interfaces.ArcGISIdentityManager = new interfaces.ArcGISIdentityManager({
        username: "jsmith",
        password: "123456"
      });

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      itemTemplate.item.name = "A";
      itemTemplate.item.title = "A";
      itemTemplate.item.thumbnail = "thumbnail/image.png";
      itemTemplate.properties.service.spatialReference = {
        wkid: 102100
      };
      itemTemplate.itemId = "ab766cba0dd44ec080420acc10990282";

      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(options => {
          expect(options).toEqual({
            item: {
              name: "A",
              title: "A",
              capabilities: [],
              spatialReference: {
                wkid: 102100
              },
              preserveLayerIds: true
            },
            folderId: "aabb123456",
            params: {
              thumbnail: "thumbnail/image.png"
            },
            authentication: userSession
          });
          done();
        }, done.fail);
    });

    it("can get options for PORTAL empty service", done => {
      const userSession: interfaces.ArcGISIdentityManager = new interfaces.ArcGISIdentityManager({
        username: "jsmith",
        password: "123456"
      });

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      itemTemplate.itemId = "ab766cba0dd44ec080420acc10990282";

      itemTemplate.properties.service.spatialReference = {
        wkid: 102100
      };

      fetchMock.post(geometryServiceUrl + "/findTransformations", "{}");

      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(options => {
          expect(options).toEqual({
            item: {
              capabilities: "",
              spatialReference: {
                wkid: 102100
              },
              title: undefined,
              name: undefined,
              preserveLayerIds: true
            },
            folderId: "aabb123456",
            params: {},
            authentication: userSession
          });
          done();
        }, done.fail);
    });

    it("can get options for HOSTED service with values", done => {
      const userSession: interfaces.ArcGISIdentityManager = new interfaces.ArcGISIdentityManager({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"], // should be added to item and params
            spatialReference: {
              wkid: 102100
            }
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
          id: "",
          type: "",
          name: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        groups: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(options => {
          expect(options).toEqual({
            item: {
              name: "A",
              title: undefined,
              somePropNotInItem: true,
              capabilities: ["Query"],
              spatialReference: {
                wkid: 102100
              },
              hasViews: true,
              preserveLayerIds: true
            },
            folderId: "aabb123456",
            params: {},
            authentication: userSession
          });
          done();
        }, done.fail);
    });

    it("can get tracker options for HOSTED service with values", done => {
      const userSession: interfaces.ArcGISIdentityManager = new interfaces.ArcGISIdentityManager({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"], // should be added to item and params
            spatialReference: {
              wkid: 102100
            }
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
          id: "",
          type: "",
          name: "A",
          typeKeywords: ["Location Tracking View"],
          properties: {
            trackViewGroup: "grp123"
          }
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        groups: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent,
        locationTracking: {
          owner: "LocationTrackingServiceOwner"
        }
      };

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(options => {
          expect(options).toEqual({
            item: {
              name: "A",
              title: undefined,
              preserveLayerIds: true,
              owner: "LocationTrackingServiceOwner",
              isView: true
            },
            params: {
              isView: true,
              outputType: "locationTrackingService"
            },
            owner: "LocationTrackingServiceOwner",
            authentication: userSession
          });
          done();
        }, done.fail);
    });

    it("can get options for PORTAL service with values and unsupported capabilities", done => {
      const userSession: interfaces.ArcGISIdentityManager = new interfaces.ArcGISIdentityManager({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            isView: true,
            capabilities: "Query,CanEatWithChopsticks", // should be added to item and params
            spatialReference: {
              wkid: 102100
            }
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
          id: "",
          type: ""
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        groups: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: true,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(options => {
          expect(options).toEqual({
            item: {
              name: options.item.name,
              title: undefined,
              somePropNotInItem: true,
              capabilities: "Query",
              isView: true,
              spatialReference: {
                wkid: 102100
              },
              preserveLayerIds: true
            },
            folderId: "aabb123456",
            params: {
              isView: true
            },
            authentication: userSession
          });
          done();
        }, done.fail);
    });

    it("can get options for HOSTED service with values when name contains guid", done => {
      const userSession: interfaces.ArcGISIdentityManager = new interfaces.ArcGISIdentityManager({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"], // should be added to item and params
            spatialReference: {
              wkid: 102100
            }
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
          id: "",
          type: "",
          name: "A_0a25612a2fc54f6e8828c679e2300a49",
          title: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        groups: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      fetchMock.post(
        "http://utility/geomServer/findTransformations/rest/info",
        '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
      );
      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(options => {
          expect(options).toEqual({
            item: {
              name: "A_0a25612a2fc54f6e8828c679e2300a49",
              title: "A",
              somePropNotInItem: true,
              capabilities: ["Query"],
              spatialReference: {
                wkid: 102100
              },
              hasViews: true,
              preserveLayerIds: true
            },
            folderId: "aabb123456",
            params: {},
            authentication: userSession
          });
          done();
        }, done.fail);
    });

    it("can get options for HOSTED service with values and handle error on convertExtent", done => {
      const userSession: interfaces.ArcGISIdentityManager = new interfaces.ArcGISIdentityManager({
        username: "jsmith",
        password: "123456"
      });

      itemTemplate = {
        itemId: "ab766cba0dd44ec080420acc10990282",
        key: "",
        properties: {
          service: {
            somePropNotInItem: true, // should be added to item and params
            hasViews: true, // should be skipped
            capabilities: ["Query"], // should be added to item and params
            spatialReference: {
              wkid: 3857
            }
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
          id: "",
          type: "",
          name: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        groups: []
      };

      const templateDictionary: any = {
        folderId: "aabb123456",
        isPortal: false,
        solutionItemId: "sol1234567890",
        ab766cba0dd44ec080420acc10990282: {},
        organization: organization,
        solutionItemExtent: solutionItemExtent
      };

      fetchMock
        .post("https://www.arcgis.com/sharing/rest/generateToken", mockItems.get400Failure())
        .get(
          "https://www.arcgis.com/sharing/rest/portals/self?f=json",
          utils.getPortalsSelfResponse()
        )
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          utils.getPortalsSelfResponse()
        )
        .post("https://utility.arcgisonline.com/arcgis/rest/info", utils.getPortalsSelfResponse())
        .post(geometryServiceUrl + "/findTransformations", mockItems.get400Failure())
        .post(
          "http://utility/geomServer/findTransformations/rest/info",
          '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
        );
      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
    });
  });

  describe("_getFallbackExtent", () => {
    it("will handle missing defaultExtent", () => {
      const serviceInfo: any = {
        service: {
          spatialReference: {
            wkid: 1234
          }
        }
      };
      const templateDictionary: any = {};
      const expected: any = undefined;

      const actual: any = restHelpers._getFallbackExtent(
        serviceInfo,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });

    it("will handle customDefaultExtent", () => {
      const serviceInfo: any = {
        service: {
          spatialReference: {
            wkid: 1234
          }
        }
      };
      const templateDictionary: any = {
        params: {
          defaultExtent: {
            xmax: 1
          }
        }
      };
      const expected: any = {
        xmax: 1
      };

      const actual: any = restHelpers._getFallbackExtent(
        serviceInfo,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });

    it("will handle missing customDefaultExtent", () => {
      const serviceInfo: any = {
        defaultExtent: {
          xmax: 1
        },
        service: {
          spatialReference: {
            wkid: 1234
          }
        }
      };
      const templateDictionary: any = {};
      const expected: any = {
        xmax: 1
      };

      const actual: any = restHelpers._getFallbackExtent(
        serviceInfo,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });

    it("will handle matching wkid", () => {
      const serviceInfo: any = {
        defaultExtent: {
          xmax: 1,
          spatialReference: {
            wkid: 1234
          }
        },
        service: {
          spatialReference: {
            wkid: 1234
          }
        }
      };
      const templateDictionary: any = {};
      const expected: any = {
        xmax: 1,
        spatialReference: {
          wkid: 1234
        }
      };

      const actual: any = restHelpers._getFallbackExtent(
        serviceInfo,
        templateDictionary
      );
      expect(actual).toEqual(expected);
    });
  });

  describe("_parseAdminServiceData", () => {
    it("will add tables from layers array as tables", () => {
      const adminData: any = {
        layers: [
          {
            type: "Feature Layer"
          },
          {
            type: "Table"
          }
        ]
      };
      const expected: any = {
        layers: [
          {
            type: "Feature Layer"
          }
        ],
        tables: [
          {
            type: "Table"
          }
        ]
      };
      const actual: any = restHelpers._parseAdminServiceData(adminData);
      expect(actual).toEqual(expected);
    });

    it("will handle a tables array", () => {
      const adminData: any = {
        tables: [
          {
            type: "Table"
          }
        ]
      };
      const expected: any = {
        layers: [],
        tables: [
          {
            type: "Table"
          }
        ]
      };
      const actual: any = restHelpers._parseAdminServiceData(adminData);
      expect(actual).toEqual(expected);
    });
  });

  describe("_lowercaseDomain", () => {
    it("handles empty or undefined URL", () => {
      expect(restHelpers._lowercaseDomain("")).toEqual("");
      expect(restHelpers._lowercaseDomain(undefined)).toEqual(undefined);
    });

    it("lowercases a domain", () => {
      const origUrl = "https://2AF1D56F411C4DDFAE10A992656FC86D.Esri.com/gis/rest/services?a=BCDefg&H=IJKlmn";
      const expectedUrl = "https://2af1d56f411c4ddfae10a992656fc86d.esri.com/gis/rest/services?a=BCDefg&H=IJKlmn";
      expect(restHelpers._lowercaseDomain(origUrl)).toEqual(expectedUrl);
    });
  });

  describe("_reportVariablesInItem", () => {
    it("is silent when there are no unresolved variables", () => {
      const messages = [] as string[];
      spyOn(console, "log").and.callFake((message: string) => {
        messages.push(message);
      });

      const base: any = {};
      const data: any = {};
      restHelpers._reportVariablesInItem(
        "itm1234567890",
        "Web Map",
        base,
        data
      );

      expect(messages.length).toEqual(0);
    });

    it("reports unresolved variables", () => {
      const messages = [] as string[];
      spyOn(console, "log").and.callFake((message: string) => {
        messages.push(message);
      });

      const base: any = {
        id: "{{38c1943d2dc844c0bc0524dc98cb9a83.itemId}}"
      };
      const data: any = {
        url: "{{54ad3c7b51264171aaee6ff86dabb2d9.layer6.url}}"
      };
      restHelpers._reportVariablesInItem(
        "itm1234567890",
        "Web Map",
        base,
        data
      );

      expect(messages).toEqual([
        'itm1234567890 (Web Map) contains variables in base: ["{{38c1943d2dc844c0bc0524dc98cb9a83.itemId}}"]',
        'itm1234567890 (Web Map) contains variables in data: ["{{54ad3c7b51264171aaee6ff86dabb2d9.layer6.url}}"]'
      ]);
    });
  });

  describe("_setItemProperties", () => {
    it("can get options for HOSTED empty service", () => {
      const item: any = {
        isMultiServicesView: true,
        editorTrackingInfo: {
          enableEditorTracking: true
        }
      };
      const serviceInfo: any = {
        service: {
          capabilities: "Create"
        }
      };
      const params: any = {};

      const updatedItem: any = restHelpers._setItemProperties(
        item,
        itemTemplate,
        serviceInfo,
        params,
        false
      );
      expect(updatedItem).toEqual({
        isMultiServicesView: true,
        editorTrackingInfo: {
          enableEditorTracking: false
        },
        capabilities: "Create"
      });
      expect(params).toEqual({
        editorTrackingInfo: {
          enableEditorTracking: false
        }
      });
    });
  });

  describe("_updateRelationships", () => {
    it("will update indexes", () => {
      const serviceInfo: any = {
        layers: [
          {
            relationships: [
              {
                role: "esriRelRoleOrigin",
                keyField: "a"
              },
              {
                role: "esriRelRoleNotOrigin",
                keyField: "b"
              }
            ],
            indexes: [
              {
                fields: "a",
                isUnique: false
              },
              {
                fields: "b",
                isUnique: false
              },
              {
                fields: "Pa",
                isUnique: false
              }
            ]
          }
        ],
        tables: []
      };

      const expected: any[] = [
        {
          fields: "a",
          isUnique: true
        },
        {
          fields: "b",
          isUnique: false
        },
        {
          fields: "Pa",
          isUnique: false
        }
      ];
      restHelpers._updateIndexesForRelationshipKeyFields(serviceInfo);
      expect(serviceInfo.layers[0].indexes).toEqual(expected);
    });

    it("will not fail with missing layers and tables", () => {
      const serviceInfo: any = {};
      restHelpers._updateIndexesForRelationshipKeyFields(serviceInfo);
      const expected: any = {};
      expect(serviceInfo).toEqual(expected);
    });
  });

  describe("_validateExtent", () => {
    it("will not change valid SR", () => {
      const expected = {
        xmin: -9821384.714217981,
        ymin: 5117339.123090005,
        xmax: -9797228.384715842,
        ymax: 5137789.39951188,
        spatialReference: {
          wkid: 102100
        }
      };
      const actual = restHelpers._validateExtent({
        xmin: -9821384.714217981,
        ymin: 5117339.123090005,
        xmax: -9797228.384715842,
        ymax: 5137789.39951188,
        spatialReference: {
          wkid: 102100
        }
      });
      expect(actual).toEqual(expected);
    });

    it("will return default extent for invalid input", () => {
      const expected = {
        xmin: -179,
        ymin: -89,
        xmax: 179,
        ymax: 89,
        spatialReference: {
          wkid: 4326
        }
      };
      const actual = restHelpers._validateExtent({
        xmin: undefined,
        ymin: 5117339.123090005,
        xmax: -9797228.384715842,
        ymax: 5137789.39951188,
        spatialReference: {
          wkid: 102100
        }
      });
      expect(actual).toEqual(expected);
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

function successfulGroupCreation(groupTitleRoot: string, suffix: number): any {
  const groupName =
    groupTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    success: true,
    group: {
      id: "grp1234567890",
      title: groupName,
      isInvitationOnly: false,
      owner: "casey",
      description: "",
      snippet: "",
      tags: ["test"],
      phone: null,
      sortField: null,
      sortOrder: null,
      isViewOnly: false,
      thumbnail: "thumbnail.png",
      created: 1586548922651,
      modified: 1586548922947,
      access: "private",
      capabilities: [],
      isFav: false,
      isReadOnly: false,
      protected: false,
      autoJoin: false,
      notificationsEnabled: false,
      provider: null,
      providerGroupName: null,
      leavingDisallowed: false,
      hiddenMembers: false,
      displaySettings: {
        itemTypes: ""
      }
    }
  };
}

function failedGroupCreation(groupTitleRoot: string, suffix: number): any {
  const groupName =
    groupTitleRoot + (suffix > 0 ? " " + suffix.toString() : "");
  return {
    error: {
      code: 400,
      message: "Unable to create group.",
      details: [
        "You already have a group named '" +
          groupName +
          "'. Try a different name."
      ]
    }
  };
}
