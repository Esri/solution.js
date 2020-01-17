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

import * as restHelpers from "../src/restHelpers";
import * as utils from "../test/mocks/utils";
import * as interfaces from "../src/interfaces";
import * as auth from "@esri/arcgis-rest-auth";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../test/mocks/agolItems";
import * as portal from "@esri/arcgis-rest-portal";

// ------------------------------------------------------------------------------------------------------------------ //

let itemTemplate: interfaces.IItemTemplate;

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
    dependencies: [],
    circularDependencies: []
  };
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// Set up a interfaces.UserSession to use in all these tests
const MOCK_USER_SESSION = new interfaces.UserSession({
  clientId: "clientId",
  redirectUri: "https://example-app.com/redirect-uri",
  token: "fake-token",
  tokenExpires: utils.TOMORROW,
  refreshToken: "refreshToken",
  refreshTokenExpires: utils.TOMORROW,
  refreshTokenTTL: 1440,
  username: "casey",
  password: "123456",
  portal: "https://myorg.maps.arcgis.com/sharing/rest"
});

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

const organization: any = utils.getPortalResponse();

const solutionItemExtent: any = [
  [0, 0],
  [1, 1]
];

afterEach(() => {
  fetchMock.restore();
});

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
          jasmine.clock().uninstall();
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
        () => {
          jasmine.clock().uninstall();
          done();
        },
        () => done.fail()
      );
    });
  });

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
          () => {
            jasmine.clock().uninstall();
            done.fail();
          },
          error => {
            jasmine.clock().uninstall();
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
      jasmine.clock().uninstall();
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: interfaces.UserSession = utils.createRuntimeMockUserSession(
        utils.setMockDateTime(now)
      );

      fetchMock
        .post(
          "https://www.arcgis.com/sharing/rest/content/users/casey/createService",
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
          "https://www.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/move",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
            (folderId ? folderId + "/addItem" : "addItem"),
          {
            success: true,
            id: "itm1234567980",
            folder: folderId
          }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share",
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
        const itemThumbnailUrl: string = "thumbnail/thumbnail.png";
        const dataFile: File = new File(
          [utils.getSampleJsonAsBlob()],
          "data.json"
        );
        const metadataFile: File = new File(
          [utils.getSampleMetadata()],
          "metadata.xml"
        );
        const resourcesFiles: File[] = [
          new File([utils.getSampleImage()], "image.png")
        ];
        const access = "org";

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
              (folderId ? folderId + "/addItem" : "addItem"),
            {
              success: true,
              id: "itm1234567980",
              folder: folderId
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share",
            {
              notSharedWith: [] as string[],
              itemId: "itm1234567980"
            }
          )
          .post(
            "https://www.arcgis.com/sharing/content/items/itm1234567980/info/thumbnail/thumbnail.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/update",
            utils.getSuccessResponse({ id: "itm1234567980" })
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/addResources",
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
          new File([utils.getSampleImage()], "resourceFolder/image.png")
        ];
        const access = undefined as string; // default is "private"

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
              (folderId ? folderId + "/addItem" : "addItem"),
            {
              success: true,
              id: "itm1234567980",
              folder: folderId
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/addResources",
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
        const metadataFile: File = new File(
          [utils.getSampleMetadata()],
          "metadata.xml"
        );
        const resourcesFiles: File[] = null as File[];
        const access = undefined as string; // default is "private"

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
              (folderId ? folderId + "/addItem" : "addItem"),
            {
              success: true,
              id: "itm1234567980",
              folder: folderId
            }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/update",
            500
          );

        restHelpers
          .createFullItem(
            itemInfo,
            folderId,
            MOCK_USER_SESSION,
            itemThumbnailUrl,
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
          (folderId ? folderId + "/addItem" : "addItem"),
        500
      );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/" +
            (folderId ? folderId + "/addItem" : "addItem"),
          {
            success: true,
            id: "itm1234567980",
            folder: folderId
          }
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share",
          500
        );

      restHelpers
        .createFullItem(
          itemInfo,
          folderId,
          MOCK_USER_SESSION,
          itemThumbnailUrl,
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share";
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share";
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/fld1234567890/addItem";
      const expectedCreate = {
        success: true,
        id: "itm1234567980",
        folder: folderId
      };
      const shareUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567980/share";
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder";
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
      const user: any = {
        folders: []
      };

      const createUrl =
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/createFolder";
      const expectedCreate = {
        error: {
          code: 400,
          message: "Unable to create folder.",
          details: ["Folder title '" + folderTitleRoot + "' not available."]
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

  describe("getLayers", () => {
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
        authentication: MOCK_USER_SESSION,
        progressTickCallback: function(opts: any) {
          return opts;
        }
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
        authentication: MOCK_USER_SESSION,
        progressTickCallback: function(opts: any) {
          return opts;
        }
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
        authentication: MOCK_USER_SESSION,
        progressTickCallback: function(opts: any) {
          return opts;
        }
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
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

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

      const expected: any = Object.assign({}, itemTemplate);
      expected.properties.service = mockItems.getAGOLService([{ id: 0 }], []);
      expected.properties.service.layers[0].name = "A";
      expected.properties.layers[0] = expected.properties.service.layers[0];
      expected.item.url = url;
      expected.estimatedDeploymentCostFactor = 1;

      itemTemplate.item.url = url;
      fetchMock.post(url + "?f=json", expected.properties.service);
      fetchMock.post(adminUrl + "/0?f=json", mockItems.get400Failure());
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
  });

  describe("removeItem", () => {
    it("removeItem", done => {
      const itemId: string = "ABC123";
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
          itemId +
          "/delete",
        utils.getSuccessResponse()
      );
      restHelpers.removeItem(itemId, MOCK_USER_SESSION).then(actual => {
        expect(actual.success).toEqual(true);
        done();
      }, done.fail);
    });
  });

  describe("searchGroups", () => {
    it("can handle no results", done => {
      const query: string = "My Group";

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=My%20Group&token=fake-token",
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
        "https://myorg.maps.arcgis.com/sharing/rest/community/groups?f=json&q=My%20Group&token=fake-token",
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

  describe("shareItem", () => {
    xit("shareItem", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("updateItem", () => {
    it("can handle failure", done => {
      itemTemplate.item.id = "itm1234567890";
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update",
        mockItems.get400Failure()
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      restHelpers
        .updateItemExtended(
          "svc1234567890",
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          undefined,
          progressTickCallback
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      restHelpers
        .updateItemExtended(
          "svc1234567890",
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          undefined,
          progressTickCallback
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      restHelpers
        .updateItemExtended(
          "svc1234567890",
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          "public",
          progressTickCallback
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        '{"success":true}'
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      restHelpers
        .updateItemExtended(
          "svc1234567890",
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          "org",
          progressTickCallback
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/itm1234567890/update",
        '{"success":true}'
      );
      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/share",
        mockItems.get400Failure()
      );
      const progressTickCallback: any = function(opts: any) {
        return opts;
      };
      restHelpers
        .updateItemExtended(
          "svc1234567890",
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_SESSION,
          "org",
          progressTickCallback
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

  describe("updateItemURL", () => {
    it("should handle failure", done => {
      const url =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/0/update",
        mockItems.get400Failure()
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
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/0/update",
        '{"success":true}'
      );

      restHelpers.updateItemURL("0", url, MOCK_USER_SESSION).then(
        id => {
          expect(id).toEqual("0");
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("_addItemDataFile", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("should add text/plain data", done => {
        const itemId = "itm1234567890";
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
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
        const itemId = "itm1234567890";
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
          itemId +
          "/update";
        fetchMock.post(url, '{"success":true}');
        restHelpers
          ._addItemDataFile(
            itemId,
            utils.getSampleMetadata() as File,
            MOCK_USER_SESSION
          )
          .then(response => {
            expect(response.success).toBeTruthy();
            const options: fetchMock.MockOptions = fetchMock.lastOptions(url);
            const fetchBody = (options as fetchMock.MockResponseObject).body;
            (fetchBody as FormData).forEach(
              (value: FormDataEntryValue, key: string) => {
                switch (key) {
                  case "f":
                    expect(value.toString()).toEqual("json");
                    break;
                  case "id":
                    expect(value.toString()).toEqual(itemId);
                    break;
                  case "file":
                    expect(value.valueOf()).toEqual(
                      new File([utils.getSampleMetadata()], "file")
                    );
                    break;
                  case "token":
                    expect(value.toString()).toEqual("fake-token");
                    break;
                }
              }
            );
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            itemId +
            "/update",
          '{"success":true}'
        );
        restHelpers
          ._addItemMetadataFile(
            itemId,
            utils.getSampleMetadata() as File,
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/" +
            itemId +
            "/update",
          '{"success":false}'
        );
        restHelpers
          ._addItemMetadataFile(
            itemId,
            utils.getSampleMetadata() as File,
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
      itemTemplate.properties.service.spatialReference = {
        wkid: 102100
      };
      itemTemplate.itemId = "ab766cba0dd44ec080420acc10990282";

      restHelpers
        ._getCreateServiceOptions(itemTemplate, userSession, templateDictionary)
        .then(options => {
          expect(options).toEqual({
            item: {
              name: "A_sol1234567890",
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
              name: "undefined_sol1234567890",
              title: undefined,
              capabilities: "",
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
          name: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        circularDependencies: []
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
              name: "A_sol1234567890",
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
        item: {},
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        circularDependencies: []
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
          name: "A_0a25612a2fc54f6e8828c679e2300a49",
          title: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        circularDependencies: []
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
              name: "A_sol1234567890",
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
              wkid: 4326
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
          name: "A"
        },
        data: {},
        resources: [],
        estimatedDeploymentCostFactor: 0,
        dependencies: [],
        circularDependencies: []
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

  describe("_getRelationshipUpdates", () => {
    xit("_getRelationshipUpdates", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getUpdate", () => {
    xit("_getUpdate", done => {
      console.warn("========== TODO ==========");
      done.fail();
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
