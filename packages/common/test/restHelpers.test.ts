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

import * as auth from "@esri/arcgis-rest-auth";
import * as fetchMock from "fetch-mock";
import * as generalHelpers from "../src/generalHelpers";
import * as interfaces from "../src/interfaces";
import * as mockItems from "../test/mocks/agolItems";
import * as polyfills from "../src/polyfills";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../src/restHelpers";
import * as restHelpersGet from "../src/restHelpersGet";
import * as templates from "../test/mocks/templates";
import * as utils from "./mocks/utils";
import { encodeParam } from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;
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

      // tslint:disable-next-line: no-floating-promises
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

      // tslint:disable-next-line: no-floating-promises
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

      // tslint:disable-next-line: no-floating-promises
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

      // tslint:disable-next-line: no-floating-promises
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
  });

  describe("createFeatureService", () => {
    it("can handle failure", done => {
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
        properties
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
      const sessionWithMockedTime: interfaces.UserSession = utils.createRuntimeMockUserSession(
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
        properties
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

    // Files are only available in the browser
    if (typeof window !== "undefined") {
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
          polyfills.new_File([utils.getSampleImage()], "image.png")
        ];
        const access = "org";

        fetchMock
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
          .then(
            response => (response.success ? done() : done.fail()),
            done.fail
          );
      });

      it("can create an item with a resource in a subfolder", done => {
        const itemInfo: any = {};
        const folderId: string = null as string; // default is top level
        const itemThumbnailUrl: string = null as string;
        const dataFile: File = null as File;
        const metadataFile: File = null as File;
        const resourcesFiles: File[] = [
          polyfills.new_File(
            [utils.getSampleImage()],
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
          .then(
            response => (response.success ? done() : done.fail()),
            done.fail
          );
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
          .then(() => done.fail(), done);
      });
    }

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
        .then(() => done.fail(), done);
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
        .then(() => done.fail(), done);
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
        .then(() => done.fail(), done);
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
        .then(_extent => {
          done.fail();
        }, done);
    });

    it("can handle unmatched wkid and failure on findTransformations", done => {
      fetchMock
        .post(
          geometryServiceUrl + "/findTransformations",
          mockItems.get400Failure()
        )
        .post(geometryServiceUrl + "/findTransformations/rest/info", "{}")
        .post(geometryServiceUrl + "/project/rest/info", "{}");

      restHelpers
        .convertExtent(extent, serviceSR, geometryServiceUrl, MOCK_USER_SESSION)
        .then(_extent => {
          done.fail();
        }, done);
    });
  });

  describe("convertExtentWithFallback", () => {
    if (typeof window !== "undefined") {
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
            mockItems.get400Failure(),
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
          .then(done.fail, done);
      });
    }
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

      const args: interfaces.IPostProcessArgs = {
        message: "refresh",
        objects: objects,
        itemTemplate: itemTemplate,
        authentication: MOCK_USER_SESSION
      };

      const updates: any[] = restHelpers.getLayerUpdates(args);

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

  describe("removeListOfItemsOrGroups", () => {
    it("handles failure to remove all of a list of items", done => {
      const itemIds = ["itm1234567890"];

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
          "/content/users/casey/items/" +
          itemIds[0] +
          "/delete",
          utils.getFailureResponse()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
          "/community/groups/" +
          itemIds[0] +
          "/delete",
          utils.getFailureResponse()
        );

      // tslint:disable-next-line: no-floating-promises
      restHelpers
        .removeListOfItemsOrGroups(itemIds, MOCK_USER_SESSION)
        .then(() => done());
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

  describe("searchGroupContents", () => {
    it("can handle no results from searching group contents", done => {
      const groupId: string = "grp1234567890";
      const query: string = "My Group";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
        `/content/groups/${groupId}/search?f=json&q=My%20Group&token=fake-token`,
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
        `/content/groups/${groupId}/search?f=json&q=My%20Group&token=fake-token`,
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
        .shareItem(groupId, id, MOCK_USER_SESSION)
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
          "public"
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
        "folderId": "fld0",
        "itmA": {
          "itemId": "itm1"
        },
        "itmB": {
          "itemId": "itm2"
        }
      };

      const fetchedItemBase: interfaces.IItem = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "{{itmA.itemId}}",
        key2: "{{folderId}}"
      }
      const expectedItemBaseUpdate = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "itm1",
        key2: "fld0"
      };

      const fetchedItemData = {
        "map": "{{itmB.itemId}}"
      };
      const expectedItemDataUpdate = {
        "map": "itm2"
      };

      spyOn(restHelpersGet, "getItemBase").and.callFake(() => Promise.resolve(fetchedItemBase));
      spyOn(restHelpersGet, "getItemDataAsJson").and.callFake(() => Promise.resolve(fetchedItemData));

      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/update";
      const updateResponse = utils.getSuccessResponse({ "id": "itm1234567890" });
      fetchMock.post(updateUrl, updateResponse);
      restHelpers.updateItemTemplateFromDictionary("itm1234567890", templateDictionary, MOCK_USER_SESSION)
        .then(
          result => {
            expect(result).toEqual(updateResponse);

            const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
            expect(callBody).toEqual(
              "f=json&text=%7B%22map%22%3A%22itm2%22%7D&created=0&id=itm1234567890&modified=0&numViews=0&owner=&size=0&tags=&title=&type=Web%20Map&key1=itm1&key2=fld0&token=fake-token"
            );
            done();
          },
          done.fail
        );
    });

    it("should handle failure", done => {
      const templateDictionary = {
        "folderId": "fld0",
        "itmA": {
          "itemId": "itm1"
        },
        "itmB": {
          "itemId": "itm2"
        }
      };

      const fetchedItemBase: interfaces.IItem = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "{{itmA.itemId}}",
        key2: "{{folderId}}"
      }
      const expectedItemBaseUpdate = {
        ...templates.getEmptyItem(),
        id: "itm1234567890",
        type: "Web Map",
        key1: "itm1",
        key2: "fld0"
      };

      const fetchedItemData = {
        "map": "{{itmB.itemId}}"
      };
      const expectedItemDataUpdate = {
        "map": "itm2"
      };

      spyOn(restHelpersGet, "getItemBase").and.callFake(() => Promise.resolve(fetchedItemBase));
      spyOn(restHelpersGet, "getItemDataAsJson").and.callFake(() => Promise.resolve(fetchedItemData));

      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/itm1234567890/update";
      const updateResponse = mockItems.get400SuccessFailure();
      fetchMock.post(updateUrl, updateResponse);
      restHelpers.updateItemTemplateFromDictionary("itm1234567890", templateDictionary, MOCK_USER_SESSION)
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
      // tslint:disable-next-line: no-empty
      spyOn(console, "warn").and.callFake(() => { });

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
      // tslint:disable-next-line: no-empty
      spyOn(console, "error").and.callFake(() => { });

      restHelpers._updateItemURL("0", url, MOCK_USER_SESSION, 2).then(
        () => done.fail(),
        () => done()
      );
    });
  });

  describe("_addItemDataFile", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
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
    }
  });

  describe("_addItemMetadataFile", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
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
    }
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
      const userSession: interfaces.UserSession = new interfaces.UserSession({
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
            params: {},
            authentication: userSession
          });
          done();
        }, done.fail);
    });

    it("can get options for PORTAL empty service", done => {
      const userSession: interfaces.UserSession = new interfaces.UserSession({
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
      const userSession: interfaces.UserSession = new interfaces.UserSession({
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

    it("can get options for PORTAL service with values and unsupported capabilities", done => {
      const userSession: interfaces.UserSession = new interfaces.UserSession({
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
      const userSession: interfaces.UserSession = new interfaces.UserSession({
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
      const userSession: interfaces.UserSession = new interfaces.UserSession({
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
        .post(
          geometryServiceUrl + "/findTransformations",
          mockItems.get400Failure()
        )
        .post(
          "http://utility/geomServer/findTransformations/rest/info",
          '{"error":{"code":403,"message":"Access not allowed request","details":[]}}'
        );
      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(done.fail, done);
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

  // ================================================================================================================== //
  // === patch to updateItem in C:\Users\mike6491\ag\arcgis-rest-js\packages\arcgis-rest-portal\src\items\update.ts === //

  describe("Authenticated methods", () => {
    // setup a UserSession to use in all these tests
    const MOCK_USER_REQOPTS = {
      authentication: MOCK_USER_SESSION
    };

    it("should update an item, including data", done => {
      fetchMock.once("*", utils.getSuccessResponse({ id: "3efakeitemid0000" }));
      const fakeItem = {
        id: "5bc",
        owner: "dbouwman",
        title: "my fake item",
        description: "yep its fake",
        snipped: "so very fake",
        type: "Web Mapping Application",
        typeKeywords: ["fake", "kwds"],
        tags: ["fakey", "mcfakepants"],
        properties: {
          key: "somevalue"
        },
        data: {
          values: {
            key: "value"
          }
        }
      };
      restHelpers
        .portalUpdateItem({ item: fakeItem, ...MOCK_USER_REQOPTS })
        .then(() => {
          expect(fetchMock.called()).toEqual(true);
          const lastCall: fetchMock.MockCall = fetchMock.lastCall("*");
          expect(fetchMock.lastUrl()).toEqual(
            "https://www.arcgis.com/sharing/rest/content/users/dbouwman/items/5bc/update"
          );
          expect(fetchMock.lastOptions().method).toBe("POST");
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("f", "json")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("owner", "dbouwman")
          );
          // ensure the array props are serialized into strings
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("typeKeywords", "fake,kwds")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("tags", "fakey,mcfakepants")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("text", JSON.stringify(fakeItem.data))
          );
          done();
        })
        .catch(e => {
          fail(e);
        });
    });

    it("should update an item with custom params", done => {
      fetchMock.once("*", utils.getSuccessResponse({ id: "3efakeitemid0000" }));
      const fakeItem = {
        id: "5bc",
        owner: "dbouwman",
        title: "my fake item",
        description: "yep its fake",
        snipped: "so very fake",
        type: "Web Mapping Application",
        typeKeywords: ["fake", "kwds"],
        tags: ["fakey", "mcfakepants"],
        properties: {
          key: "somevalue"
        },
        data: {
          values: {
            key: "value"
          }
        }
      };
      restHelpers
        .portalUpdateItem({
          item: fakeItem,
          authentication: MOCK_USER_SESSION,
          params: {
            clearEmptyFields: true
          }
        })
        .then(response => {
          expect(fetchMock.called()).toEqual(true);
          const lastCall: fetchMock.MockCall = fetchMock.lastCall("*");
          expect(fetchMock.lastUrl()).toEqual(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/dbouwman/items/5bc/update"
          );
          expect(fetchMock.lastOptions().method).toBe("POST");
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("f", "json")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("token", "fake-token")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("owner", "dbouwman")
          );
          // ensure the array props are serialized into strings
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("typeKeywords", "fake,kwds")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("tags", "fakey,mcfakepants")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("text", JSON.stringify(fakeItem.data))
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("clearEmptyFields", true)
          );
          done();
        })
        .catch(e => {
          fail(e);
        });
    });

    it("should update an item, including data and service proxy params", done => {
      fetchMock.once("*", utils.getSuccessResponse({ id: "3efakeitemid0000" }));
      const fakeItem = {
        id: "5bc",
        owner: "dbouwman",
        title: "my fake item",
        description: "yep its fake",
        snipped: "so very fake",
        type: "Web Mapping Application",
        typeKeywords: ["fake", "kwds"],
        tags: ["fakey", "mcfakepants"],
        properties: {
          key: "somevalue"
        },
        serviceProxyParams: {
          hitsPerInterval: 2,
          intervalSeconds: 60,
          referrers: ["http://<servername>"]
        },
        data: {
          values: {
            key: "value"
          }
        }
      };

      restHelpers
        .portalUpdateItem({
          item: fakeItem,
          folderId: "aFolder",
          params: { foo: "bar" },
          ...MOCK_USER_REQOPTS
        })
        .then(response => {
          expect(fetchMock.called()).toEqual(true);
          const lastCall: fetchMock.MockCall = fetchMock.lastCall("*");
          expect(fetchMock.lastUrl()).toEqual(
            "https://www.arcgis.com/sharing/rest/content/users/dbouwman/aFolder/items/5bc/update"
          );
          expect(fetchMock.lastOptions().method).toBe("POST");
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("f", "json")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("owner", "dbouwman")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("foo", "bar")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam(
              "serviceProxyParams",
              '{"hitsPerInterval":2,"intervalSeconds":60,"referrers":["http://<servername>"]}'
            )
          );
          // ensure the array props are serialized into strings
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("typeKeywords", "fake,kwds")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("tags", "fakey,mcfakepants")
          );
          expect(fetchMock.lastOptions().body).toContain(
            encodeParam("text", JSON.stringify(fakeItem.data))
          );
          done();
        })
        .catch(e => {
          fail(e);
        });
    });
  }); // auth requests

  // ================================================================================================================== //
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
