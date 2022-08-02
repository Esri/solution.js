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
 * Provides tests for fetch functions involving the arcgis-rest-js library.
 */

import * as generalHelpers from "../src/generalHelpers";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpersGet from "../src/restHelpersGet";
import * as restHelpers from "../src/restHelpers";
import * as interfaces from "../src/interfaces";

import * as utils from "./mocks/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../test/mocks/agolItems";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: interfaces.ArcGISIdentityManager;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://myorg.maps.arcgis.com",
  authInfo: {}
};

const noRelatedItemsResponse: interfaces.IGetRelatedItemsResponse = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  relatedItems: []
};

const noResourcesResponse: interfaces.IGetResourcesResponse = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `restHelpersGet`: common REST fetch functions shared across packages", () => {
  describe("checkJsonForError", () => {
    it("should handle non-error JSON", () => {
      const json = { value: "a value" };
      expect(restHelpersGet.checkJsonForError(json)).toBeFalsy();
    });

    it("should handle non-JSON", () => {
      expect(restHelpersGet.checkJsonForError(null)).toBeFalsy();
    });

    it("should handle error JSON 1", () => {
      const json = mockItems.get400Failure();
      expect(restHelpersGet.checkJsonForError(json)).toBeTruthy();
    });

    it("should handle error JSON 2", () => {
      const json = mockItems.get400SuccessFailure();
      expect(restHelpersGet.checkJsonForError(json)).toBeTruthy();
    });

    it("should handle error JSON 3", () => {
      const json = mockItems.get500Failure();
      expect(restHelpersGet.checkJsonForError(json)).toBeTruthy();
    });
  });

  describe("getUsername", () => {
    it("can get the username from the authentication", done => {
      const communitySelfResponse: any = utils.getUserResponse();
      communitySelfResponse.username = "casey";
      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/community/self?f=json&token=fake-token",
        communitySelfResponse
      );
      restHelpersGet.getUsername(MOCK_USER_SESSION).then(
        username => {
          expect(username).toEqual(MOCK_USER_SESSION.username);
          done();
        },
        () => done.fail()
      );
    });
  });

  describe("getFoldersAndGroups", () => {
    it("can handle an exception on get user content", done => {
      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey?f=json&token=fake-token",
          mockItems.get500Failure()
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/users/casey?f=json&token=fake-token",
          mockItems.get500Failure()
        );
      restHelpersGet.getFoldersAndGroups(MOCK_USER_SESSION).then(
        () => done.fail(),
        () => done()
      );
    });

    it("can handle undefined folders or groups", done => {
      const response: any = utils.getSuccessResponse();
      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey?f=json&token=fake-token",
          response
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/community/users/casey?f=json&token=fake-token",
          response
        );
      const expectedFolders: any = [];
      const expectedGroups: any = [];
      restHelpersGet.getFoldersAndGroups(MOCK_USER_SESSION).then(actual => {
        expect(actual.folders).toEqual(expectedFolders);
        expect(actual.groups).toEqual(expectedGroups);
        done();
      }, done.fail);
    });
  });

  describe("getBlobAsFile", () => {
    it("should ignore ignorable error", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());
      restHelpersGet
        .getBlobAsFile(url, "myFile.png", MOCK_USER_SESSION, [400])
        .then(file => {
          expect(file).toBeNull();
          done();
        }, done.fail);
    });

    it("should use supplied filename", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, utils.getSampleImageAsBlob(), {
        sendAsJson: false
      });
      restHelpersGet
        .getBlobAsFile(url, "myFile.png", MOCK_USER_SESSION, [400])
        .then(file => {
          expect(file).not.toBeUndefined();
          expect(file.type).toEqual("image/png");
          expect(file.name).toEqual("myFile.png");
          done();
        }, done.fail);
    });
  });

  describe("getBlobCheckForError", () => {
    it("should pass through an image file", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, utils.getSampleImageAsBlob(), {
        sendAsJson: false
      });
      restHelpersGet
        .getBlobCheckForError(url, MOCK_USER_SESSION, [400])
        .then(blob => {
          expect(blob).not.toBeUndefined();
          expect(blob.type).toEqual("image/png");
          done();
        }, done.fail);
    });

    it("should pass through non-error JSON", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      const testBlobContents = JSON.stringify({
        a: "a",
        b: 1,
        c: {
          d: "d"
        }
      });
      const testBlob = new Blob([testBlobContents], {
        type: "application/json"
      });
      fetchMock.post(url, testBlob, { sendAsJson: false });
      restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION).then(blob => {
        expect(blob).not.toBeUndefined();
        expect(blob.type).toEqual("application/json");
        done();
      }, done.fail);
    });

    it("should handle bad JSON by passing it through", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      const testBlob = new Blob(["badJson:{"], { type: "application/json" });
      fetchMock.post(url, testBlob, { sendAsJson: false });
      restHelpersGet
        .getBlobCheckForError(url, MOCK_USER_SESSION, [500])
        .then(blob => {
          expect(blob).not.toBeUndefined();
          expect(blob.type).toEqual("application/json");
          done();
        }, done.fail);
    });

    it("should ignore ignorable error", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());
      restHelpersGet
        .getBlobCheckForError(url, MOCK_USER_SESSION, [400])
        .then(blob => {
          expect(blob).toBeNull();
          done();
        }, done.fail);
    });

    it("should return significant error", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());
      restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION, [500]).then(
        () => done.fail(),
        response => {
          expect(response).not.toBeUndefined();
          expect(response.error.code).toEqual(400);
          done();
        }
      );
    });
  });

  describe("getFilenameFromUrl", () => {
    it("extract name from url without query params", () => {
      const url = "https://myorg.arcgis.com//resources/image.png";
      const expectedFilename = "image.png";
      expect(restHelpersGet.getFilenameFromUrl(url)).toEqual(expectedFilename);
    });

    it("extract name from url with query params", () => {
      const url =
        "https://myorg.arcgis.com//resources/image.png?w=400&token=fake-token";
      const expectedFilename = "image.png";
      expect(restHelpersGet.getFilenameFromUrl(url)).toEqual(expectedFilename);
    });

    it("handles missing name in url without query params", () => {
      const url = "https://myorg.arcgis.com//resources/";
      const expectedFilename = "";
      expect(restHelpersGet.getFilenameFromUrl(url)).toEqual(expectedFilename);
    });

    it("handles missing name in url with query params", () => {
      const url = "https://myorg.arcgis.com//resources/?w=400&token=fake-token";
      const expectedFilename = "";
      expect(restHelpersGet.getFilenameFromUrl(url)).toEqual(expectedFilename);
    });

    it("handles empty url", () => {
      const url = "";
      const expectedFilename = "";
      expect(restHelpersGet.getFilenameFromUrl(url)).toEqual(expectedFilename);
    });
  });

  describe("getGroupCategorySchema", () => {
    it("should return group's category schema", done => {
      const groupId = "grp1234567890";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/community/groups/grp1234567890/categorySchema?f=json&token=fake-token",
        mockItems.getAGOLGroupCategorySchema()
      );

      restHelpersGet
        .getGroupCategorySchema(groupId, MOCK_USER_SESSION)
        .then(schema => {
          expect(schema).toEqual(mockItems.getAGOLGroupCategorySchema());
          done();
        }, done.fail);
    });
  });

  describe("getItemBase", () => {
    it("item doesn't allow access to item", done => {
      const itemId = "itm1234567890";
      const expected = {
        name: "ArcGISAuthError",
        message:
          "GWM_0003: You do not have permissions to access this resource or perform this operation.",
        originalMessage:
          "You do not have permissions to access this resource or perform this operation.",
        code: "GWM_0003",
        response: {
          error: {
            code: 403,
            messageCode: "GWM_0003",
            message:
              "You do not have permissions to access this resource or perform this operation.",
            details: [] as any[]
          }
        },
        url:
          utils.PORTAL_SUBSET.restUrl +
          "/content/items/itm1234567890?f=json&token=fake-token",
        options: {
          httpMethod: "GET",
          params: {
            f: "json"
          },
          authentication: {
            clientId: "clientId",
            refreshToken: "refreshToken",
            refreshTokenExpires: "2019-06-13T19:35:21.995Z",
            username: "casey",
            password: "123456",
            token: "fake-token",
            tokenExpires: "2019-06-13T19:35:21.995Z",
            portal: utils.PORTAL_SUBSET.restUrl,
            tokenDuration: 20160,
            redirectUri: "https://example-app.com/redirect-uri",
            refreshTokenTTL: 1440
          },
          headers: {}
        }
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/itm1234567890?f=json&token=fake-token",
        JSON.stringify(expected)
      );
      restHelpersGet
        .getItemBase(itemId, MOCK_USER_SESSION)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("item is accessible", done => {
      const itemId = "itm1234567890";
      const expected = { values: { a: 1, b: "c" } };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/itm1234567890?f=json&token=fake-token",
        JSON.stringify(expected)
      );
      restHelpersGet
        .getItemBase(itemId, MOCK_USER_SESSION)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("getItemDataAsFile", () => {
    it("handles item without a data section", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, {
        error: {
          code: 500,
          messageCode: "CONT_0004",
          message: "Item does not exist or is inaccessible.",
          details: []
        }
      });
      restHelpersGet
        .getItemDataAsFile(itemId, "myFile.png", MOCK_USER_SESSION)
        .then(
          () => done(),
          () => done.fail()
        );
    });

    it("gets data section that's an image", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, utils.getSampleImageAsBlob(), {
        sendAsJson: false
      });
      restHelpersGet
        .getItemDataAsFile(itemId, "myFile.png", MOCK_USER_SESSION)
        .then(file => {
          expect(file).not.toBeUndefined();
          expect(file.type).toEqual("image/png");
          expect(file.name).toEqual("myFile.png");
          done();
        }, done.fail);
    });
  });

  describe("getItemDataAsJson", () => {
    it("handles item without a data section", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, {
        error: {
          code: 500,
          messageCode: "CONT_0004",
          message: "Item does not exist or is inaccessible.",
          details: []
        }
      });
      restHelpersGet.getItemDataAsJson(itemId, MOCK_USER_SESSION).then(
        () => done(),
        () => done.fail()
      );
    });

    it("get data section that's JSON", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      const testBlobContents = {
        a: "a",
        b: 1,
        c: {
          d: "d"
        }
      };
      const testBlob = new Blob([JSON.stringify(testBlobContents)], {
        type: "application/json"
      });
      fetchMock.post(url, testBlob, { sendAsJson: false });
      restHelpersGet.getItemDataAsJson(itemId, MOCK_USER_SESSION).then(json => {
        expect(json).not.toBeUndefined();
        expect(json).toEqual(testBlobContents);
        done();
      }, done.fail);
    });

    it("handles item that doesn't allow access to data", done => {
      const itemId = "itm1234567890";
      const expected: any = {
        name: "ArcGISAuthError",
        message:
          "GWM_0003: You do not have permissions to access this resource or perform this operation.",
        originalMessage:
          "You do not have permissions to access this resource or perform this operation.",
        code: "GWM_0003",
        response: {
          error: {
            code: 403,
            messageCode: "GWM_0003",
            message:
              "You do not have permissions to access this resource or perform this operation.",
            details: [] as any[]
          }
        },
        url: utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data",
        options: {
          httpMethod: "GET",
          params: {
            f: "json"
          },
          authentication: {
            clientId: "clientId",
            refreshToken: "refreshToken",
            refreshTokenExpires: "2019-06-13T19:35:21.995Z",
            username: "casey",
            password: "123456",
            token: "fake-token",
            tokenExpires: "2019-06-13T19:35:21.995Z",
            portal: utils.PORTAL_SUBSET.restUrl,
            tokenDuration: 20160,
            redirectUri: "https://example-app.com/redirect-uri",
            refreshTokenTTL: 1440
          },
          headers: {}
        }
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data",
        expected
      );
      restHelpersGet
        .getItemDataAsJson(itemId, MOCK_USER_SESSION)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("getItemDataBlob", () => {
    it("handles odd error code", done => {
      const itemId = "itm1234567890";
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data",
        { error: { code: 505 } }
      );
      restHelpersGet.getItemDataBlob(itemId, MOCK_USER_SESSION).then(
        () => done(),
        () => done()
      );
    });
  });

  describe("getItemDataBlobUrl", () => {
    it("gets the data blob url from the authentication", () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      expect(url).toEqual(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data"
      );
    });
  });

  describe("getItemMetadataAsFile", () => {
    it("handles item without metadata", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(
        itemId,
        MOCK_USER_SESSION
      );
      fetchMock.post(url, mockItems.get400Failure());
      restHelpersGet
        .getItemMetadataAsFile(itemId, MOCK_USER_SESSION)
        .then((json: any) => {
          expect(json).toBeNull();
          done();
        }, done.fail);
    });

    it("handles server error", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(
        itemId,
        MOCK_USER_SESSION
      );
      fetchMock.post(url, mockItems.get500Failure());
      restHelpersGet
        .getItemMetadataAsFile(itemId, MOCK_USER_SESSION)
        .then((json: any) => {
          expect(json).toBeNull();
          done();
        }, done.fail);
    });

    it("handles general error", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(
        itemId,
        MOCK_USER_SESSION
      );
      fetchMock.post(url, { value: "fred" });
      restHelpersGet
        .getItemMetadataAsFile(itemId, MOCK_USER_SESSION)
        .then((json: any) => {
          expect(json).toBeNull();
          done();
        }, done.fail);
    });

    it("gets metadata", done => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(
        itemId,
        MOCK_USER_SESSION
      );
      fetchMock.post(url, utils.getSampleMetadataAsFile(), {
        sendAsJson: false
      });
      restHelpersGet
        .getItemMetadataAsFile(itemId, MOCK_USER_SESSION)
        .then(file => {
          expect(file).not.toBeUndefined();
          expect(file.type).toEqual("text/xml");
          done();
        }, done.fail);
    });
  });

  describe("getItemMetadataBlobUrl", () => {
    it("gets the metadata blob url from the authentication", () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(
        itemId,
        MOCK_USER_SESSION
      );
      expect(url).toEqual(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/itm1234567890/info/metadata/metadata.xml"
      );
    });
  });

  describe("getItemRelatedItems", () => {
    it("item doesn't have related items of a single type", done => {
      const itemId = "itm1234567890";
      const relationshipType = "Survey2Service";
      const direction = "forward";
      const expected = { total: 0, relatedItems: [] as any[] };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems" +
          "?f=json&direction=" +
          direction +
          "&relationshipType=" +
          relationshipType +
          "&token=fake-token",
        expected
      );
      restHelpersGet
        .getItemRelatedItems(
          itemId,
          relationshipType,
          direction,
          MOCK_USER_SESSION
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("item doesn't have related items of multiple types", done => {
      const itemId = "itm1234567890";
      const relationshipType: portal.ItemRelationshipType[] = [
        "Survey2Service",
        "Service2Service"
      ];
      const direction = "reverse";
      const expected = { total: 0, relatedItems: [] as any[] };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems" +
          "?f=json&direction=" +
          direction +
          "&relationshipTypes=" +
          relationshipType.join("%2C") +
          "&token=fake-token",
        expected
      );
      restHelpersGet
        .getItemRelatedItems(
          itemId,
          relationshipType,
          direction,
          MOCK_USER_SESSION
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("item has one related item", done => {
      const itemId = "itm1234567890";
      const relationshipType = "Survey2Service";
      const direction = "forward";
      const expected = {
        total: 1,
        relatedItems: [
          {
            id: "471e7500ab364db5a4f074c704962650",
            owner: "LocalGovDeployment",
            created: 1496669363000,
            modified: 1529597522000,
            guid: null as any,
            name: "service_75b7efa1d3cf4618b0508e66bc2539ae",
            title: "Drug Activity Reporter",
            type: "Feature Service",
            typeKeywords: [
              "ArcGIS Server",
              "Data",
              "Feature Access",
              "Feature Service",
              "Service",
              "Singlelayer",
              "source-010915baf8104a6e9103b4f625160581",
              "Hosted Service"
            ],
            description:
              "Suspected drug activity reported by the general public.",
            tags: [
              "Opioids",
              "Public Safety",
              "Drug Activity",
              "Community Policing",
              "Drug Tips",
              "Police",
              "Law Enforcement"
            ],
            snippet: "Suspected drug activity reported by the general public.",
            thumbnail: "thumbnail/Drug-Activity-Reporter.png",
            documentation: null as any,
            extent: [
              [-131.83000000020434, 16.22999999995342],
              [-57.119999999894105, 58.49999999979133]
            ],
            categories: [] as string[],
            spatialReference: null as any,
            accessInformation: "Esri",
            licenseInfo: null as any,
            culture: "",
            properties: null as any,
            url:
              "https://services7.arcgis.com/piPfTFmr/arcgis/rest/services/service_75b7efa1d3cf/FeatureServer",
            proxyFilter: null as any,
            access: "public",
            size: 180224,
            appCategories: [] as string[],
            industries: [] as string[],
            languages: [] as string[],
            largeThumbnail: null as any,
            banner: null as any,
            screenshots: [] as string[],
            listed: false,
            numComments: 0,
            numRatings: 0,
            avgRating: 0,
            numViews: 610,
            scoreCompleteness: 70,
            groupDesignations: null as any
          }
        ]
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems" +
          "?f=json&direction=" +
          direction +
          "&relationshipType=" +
          relationshipType +
          "&token=fake-token",
        expected
      );
      restHelpersGet
        .getItemRelatedItems(
          itemId,
          relationshipType,
          direction,
          MOCK_USER_SESSION
        )
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("can handle an exception from the REST endpoint portal.getRelatedItems", done => {
      const itemId = "itm1234567890";
      const relationshipType = "Survey2Service";
      const direction = "forward";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems" +
          "?f=json&direction=" +
          direction +
          "&relationshipType=" +
          relationshipType +
          "&token=fake-token",
        mockItems.get500Failure()
      );
      restHelpersGet
        .getItemRelatedItems(
          itemId,
          relationshipType,
          direction,
          MOCK_USER_SESSION
        )
        .then(
          response => {
            expect(response).toEqual(noRelatedItemsResponse);
            done();
          },
          (err: any) => done.fail(err)
        );
    });
  });

  describe("getItemResources", () => {
    it("can handle a 500 error from the REST endpoint portal.getItemResources", done => {
      const itemId = "itm1234567890";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/" + itemId + "/resources",
        mockItems.get500Failure()
      );
      restHelpersGet.getItemResources(itemId, MOCK_USER_SESSION).then(
        response => {
          expect(response).toEqual(noResourcesResponse);
          done();
        },
        (err: any) => done.fail(err)
      );
    });
  });

  describe("getItemResourcesFiles", () => {
    it("handles an inaccessible item", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources",
        mockItems.get400Failure()
      );
      restHelpersGet.getItemResourcesFiles(itemId, MOCK_USER_SESSION).then(
        () => done.fail(),
        ok => {
          expect(ok.message).toEqual(
            "CONT_0001: Item does not exist or is inaccessible."
          );
          done();
        }
      );
    });

    it("handles an item with no resources", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources",
        {
          total: 0,
          start: 1,
          num: 0,
          nextStart: -1,
          resources: []
        }
      );
      restHelpersGet
        .getItemResourcesFiles(itemId, MOCK_USER_SESSION)
        .then((ok: File[]) => {
          expect(ok.length).toEqual(0);
          done();
        }, done.fail);
    });

    it("handles an item with one resource", done => {
      const itemId = "itm1234567890";
      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources",
          {
            total: 1,
            start: 1,
            num: 1,
            nextStart: -1,
            resources: [
              {
                resource: "Jackson Lake.png",
                created: 1568662976000,
                size: 1231
              }
            ]
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        );
      restHelpersGet
        .getItemResourcesFiles(itemId, MOCK_USER_SESSION)
        .then((ok: File[]) => {
          expect(ok.length).toEqual(1);
          done();
        }, done.fail);
    });
  });

  describe("getItemsRelatedToASolution", () => {
    it("gets items", done => {
      const solutionId = "sol1234567890";
      const getItemRelatedItemsSpy = spyOn(
        portal,
        "getRelatedItems"
      ).and.resolveTo({
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        relatedItems: [mockItems.getAGOLItem("Web Map")]
      } as interfaces.IGetRelatedItemsResponse);
      restHelpersGet
        .getItemsRelatedToASolution(solutionId, MOCK_USER_SESSION)
        .then((response: interfaces.IItem[]) => {
          expect(response).toEqual([mockItems.getAGOLItem("Web Map")]);
          expect(getItemRelatedItemsSpy.calls.count()).toEqual(1);
          expect(getItemRelatedItemsSpy.calls.first().args).toEqual([
            {
              id: solutionId,
              relationshipType: "Solution2Item",
              direction: "forward",
              authentication: MOCK_USER_SESSION
            } as portal.IItemRelationshipOptions
          ]);
          done();
        }, done.fail);
    });
  });

  describe("getItemThumbnail", () => {
    it("handle missing thumbnail for an item", done => {
      restHelpersGet
        .getItemThumbnail("itm1234567890", null, false, MOCK_USER_SESSION)
        .then((ok: Blob) => {
          expect(ok).toBeNull();
          done();
        }, done.fail);
    });

    it("get thumbnail for an item", done => {
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/itm1234567890/info/thumbnail/ago_downloaded.png",
        utils.getSampleImageAsBlob(),
        { sendAsJson: false }
      );

      restHelpersGet
        .getItemThumbnail(
          "itm1234567890",
          "thumbnail/ago_downloaded.png",
          false,
          MOCK_USER_SESSION
        )
        .then((ok: Blob) => {
          expect(ok.type).toEqual("image/png");
          done();
        }, done.fail);
    });
  });

  describe("getItemThumbnailAsFile", () => {
    it("get thumbnail for an item", done => {
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/itm1234567890/info/thumbnail/ago_downloaded.png",
        utils.getSampleImageAsBlob(),
        { sendAsJson: false }
      );

      restHelpersGet
        .getItemThumbnailAsFile(
          "itm1234567890",
          "thumbnail/ago_downloaded.png",
          false,
          MOCK_USER_SESSION
        )
        .then((ok: File) => {
          expect(ok.type).toEqual("image/png");
          done();
        }, done.fail);
    });

    it("handles missing thumbnail info", done => {
      restHelpersGet
        .getItemThumbnailAsFile("itm1234567890", null, false, MOCK_USER_SESSION)
        .then((ok: File) => {
          expect(ok).toBeNull();
          done();
        }, done.fail);
    });
  });

  describe("getItemThumbnailUrl", () => {
    it("get thumbnail url for an item", () => {
      expect(
        restHelpersGet.getItemThumbnailUrl(
          "itm1234567890",
          "thumbnail/ago_downloaded.png",
          false,
          MOCK_USER_SESSION
        )
      ).toEqual(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/itm1234567890/info/thumbnail/ago_downloaded.png"
      );
    });

    it("get thumbnail url for a group", () => {
      expect(
        restHelpersGet.getItemThumbnailUrl(
          "grp1234567890",
          "thumbnail/ago_downloaded.png",
          true,
          MOCK_USER_SESSION
        )
      ).toEqual(
        utils.PORTAL_SUBSET.restUrl +
          "/community/groups/grp1234567890/info/thumbnail/ago_downloaded.png"
      );
    });
  });

  describe("getJson", () => {
    it("get JSON without authentication", () => {
      fetchMock
        .post("http://site.com/some.json/rest/info", {})
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          {}
        )
        .get("http://site.com/some.json?f=json", utils.getSampleJsonAsBlob(), {
          sendAsJson: false
        });
      return restHelpersGet
        .getJson("http://site.com/some.json", MOCK_USER_SESSION)
        .then(json => {
          expect(json).toEqual(utils.getSampleJson());
        });
    });

    it("get JSON without authentication", () => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          {}
        )
        .get("http://site.com/some.json?f=json", utils.getSampleJsonAsBlob(), {
          sendAsJson: false
        });
      return restHelpersGet.getJson("http://site.com/some.json").then(json => {
        expect(json).toEqual(utils.getSampleJson());
      });
    });

    it("handles non-JSON", () => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          {}
        )
        .get("http://site.com/some.json?f=json", utils.getSampleImageAsBlob(), {
          sendAsJson: false
        });
      return restHelpersGet
        .getJson("http://site.com/some.json")
        .then(json => expect(json).toEqual(null));
    });

    it("handles error", () => {
      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          {}
        )
        .get("http://site.com/some.json?f=json", mockItems.get400Failure());
      return restHelpersGet
        .getJson("http://site.com/some.json")
        .then(json => expect(json).toEqual(mockItems.get400Failure()));
    });
  });

  describe("getPortalSharingUrlFromAuth", () => {
    it("gets a default portal sharing url when there's no authentication", () => {
      expect(
        restHelpersGet.getPortalSharingUrlFromAuth(undefined)
      ).toEqual("https://www.arcgis.com/sharing/rest");
    });

    it("gets a default portal sharing url with authentication but no portal", () => {
      const mockUserSession = new interfaces.ArcGISIdentityManager({
        clientId: "clientId",
        redirectUri: "https://example-app.com/redirect-uri",
        token: "fake-token",
        tokenExpires: utils.TOMORROW,
        refreshToken: "refreshToken",
        refreshTokenExpires: utils.TOMORROW,
        refreshTokenTTL: 1440,
        username: "casey",
        password: "123456"
      });
      expect(
        restHelpersGet.getPortalSharingUrlFromAuth(mockUserSession)
      ).toEqual("https://www.arcgis.com/sharing/rest");
    });

    it("gets portal sharing url from authentication", () => {
      expect(
        restHelpersGet.getPortalSharingUrlFromAuth(MOCK_USER_SESSION)
      ).toEqual(utils.PORTAL_SUBSET.restUrl);
    });
  });

  describe("getPortalUrlFromAuth", () => {
    it("gets a default portal url with authentication but no portal", () => {
      const mockUserSession = new interfaces.ArcGISIdentityManager({
        clientId: "clientId",
        redirectUri: "https://example-app.com/redirect-uri",
        token: "fake-token",
        tokenExpires: utils.TOMORROW,
        refreshToken: "refreshToken",
        refreshTokenExpires: utils.TOMORROW,
        refreshTokenTTL: 1440,
        username: "casey",
        password: "123456"
      });
      expect(restHelpersGet.getPortalUrlFromAuth(mockUserSession)).toEqual(
        "https://www.arcgis.com"
      );
    });

    it("gets portal url from authentication", () => {
      expect(restHelpersGet.getPortalUrlFromAuth(MOCK_USER_SESSION)).toEqual(
        "https://myorg.maps.arcgis.com"
      );
    });
  });

  describe("getSolutionsRelatedToAnItem", () => {
    it("gets solutions", done => {
      const solutionId = "sol1234567890";
      const getItemRelatedItemsSpy = spyOn(
        portal,
        "getRelatedItems"
      ).and.resolveTo({
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        relatedItems: [mockItems.getAGOLItem("Solution")]
      } as interfaces.IGetRelatedItemsResponse);
      restHelpersGet
        .getSolutionsRelatedToAnItem(solutionId, MOCK_USER_SESSION)
        .then((response: string[]) => {
          expect(response).toEqual(["sol1234567890"]);
          expect(getItemRelatedItemsSpy.calls.count()).toEqual(1);
          expect(getItemRelatedItemsSpy.calls.first().args).toEqual([
            {
              id: solutionId,
              relationshipType: "Solution2Item",
              direction: "reverse",
              authentication: MOCK_USER_SESSION
            } as portal.IItemRelationshipOptions
          ]);
          done();
        }, done.fail);
    });
  });

  describe("getThumbnailFile", () => {
    it("should handle error", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());
      restHelpersGet
        .getThumbnailFile(url, "sampleImage", MOCK_USER_SESSION)
        .then(file => {
          expect(file).toBeNull();
          done();
        }, done.fail);
    });

    it("should get file", done => {
      const url =
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, utils.getSampleImageAsFile(), {
        sendAsJson: false
      });
      restHelpersGet
        .getThumbnailFile(url, "sampleImage", MOCK_USER_SESSION)
        .then(file => {
          expect(file).not.toBeUndefined();
          expect(file.type).toEqual("image/png");
          expect(file.name).toEqual("sampleImage");
          done();
        }, done.fail);
    });
  });

  describe("_fixTextBlobType", () => {
    it("should pass application/json blobs through unchanged", done => {
      const testBlobType = "application/json";
      const testBlobContents = JSON.stringify({
        a: "a",
        b: 1,
        c: {
          d: "d"
        }
      });
      const testBlob = new Blob([testBlobContents], { type: testBlobType });
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(testBlobType);
        generalHelpers.blobToText(ok).then((text: string) => {
          expect(text).toEqual(testBlobContents);
          done();
        }, done.fail);
      }, done.fail);
    });

    it("should pass image blobs through unchanged", done => {
      const testBlobType = "image/png";
      const testBlob = utils.getSampleImageAsBlob();
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(testBlobType);
        done();
      }, done.fail);
    });

    it("should pass text/xml blobs through unchanged", done => {
      const testBlobType = "text/xml";
      const testBlob = utils.getSampleMetadataAsBlob();
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(testBlobType);
        const resultBlobContentsDef = generalHelpers.blobToText(ok);
        const testBlobContentsDef = generalHelpers.blobToText(testBlob);
        Promise.all([resultBlobContentsDef, testBlobContentsDef]).then(
          results => {
            const [resultBlobContents, testBlobContents] = results;
            expect(resultBlobContents).toEqual(testBlobContents);
            done();
          },
          done.fail
        );
      }, done.fail);
    });

    it("should pass truly text blobs through unchanged", done => {
      const testBlobType = "text/plain";
      const testBlobContents = "This is a block of text";
      const testBlob = new Blob([testBlobContents], { type: testBlobType });
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(testBlobType);
        generalHelpers.blobToText(ok).then((text: string) => {
          expect(text).toEqual(testBlobContents);
          done();
        }, done.fail);
      }, done.fail);
    });

    it("should handle blob MIME text types with character-set suffix", done => {
      const testBlobType = "text/plain; charset=utf-8";
      const testBlobContents = "This is a block of UTF8 text";
      const testBlob = new Blob([testBlobContents], { type: testBlobType });
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(testBlobType);
        generalHelpers.blobToText(ok).then((text: string) => {
          expect(text).toEqual(testBlobContents);
          done();
        }, done.fail);
      }, done.fail);
    });

    it("should re-type application/json blobs claiming to be text/plain", done => {
      const testBlobType = "text/plain";
      const realBlobType = "application/json";
      const testBlobContents = JSON.stringify({
        a: "a",
        b: 1,
        c: {
          d: "d"
        }
      });
      const testBlob = new Blob([testBlobContents], { type: testBlobType });
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(realBlobType);
        generalHelpers.blobToText(ok).then((text: string) => {
          expect(text).toEqual(testBlobContents);
          done();
        }, done.fail);
      }, done.fail);
    });

    it("should re-type text/xml blobs claiming to be text/plain", done => {
      const testBlobType = "text/plain";
      const realBlobType = "text/xml";
      const testBlob = utils.getSampleMetadataAsBlob(testBlobType);
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(realBlobType);
        const resultBlobContentsDef = generalHelpers.blobToText(ok);
        const testBlobContentsDef = generalHelpers.blobToText(testBlob);
        Promise.all([resultBlobContentsDef, testBlobContentsDef]).then(
          results => {
            const [resultBlobContents, testBlobContents] = results;
            expect(resultBlobContents).toEqual(testBlobContents);
            done();
          },
          done.fail
        );
      }, done.fail);
    });

    it("should re-type application/zip blobs claiming to be text/plain", done => {
      const testBlobType = "text/plain";
      const realBlobType = "application/zip";
      const testBlob = utils.getSampleZip(testBlobType);
      restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
        expect(ok.type).toEqual(realBlobType);
        const resultBlobContentsDef = generalHelpers.blobToText(ok);
        const testBlobContentsDef = generalHelpers.blobToText(testBlob);
        Promise.all([resultBlobContentsDef, testBlobContentsDef]).then(
          results => {
            const [resultBlobContents, testBlobContents] = results;
            expect(resultBlobContents).toEqual(testBlobContents);
            done();
          },
          done.fail
        );
      }, done.fail);
    });
  });

  describe("_getGroupContentsTranche", () => {
    it("handles an inaccessible group", done => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
        {
          error: {
            code: 400,
            messageCode: "CONT_0006",
            message: "Group does not exist or is inaccessible.",
            details: []
          }
        }
      );
      restHelpersGet
        ._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION)
        .then(
          () => done.fail(),
          ok => {
            expect(ok.message).toEqual(
              "CONT_0006: Group does not exist or is inaccessible."
            );
            done();
          }
        );
    });

    it("handles an empty group", done => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
        {
          total: 0,
          start: 1,
          num: 0,
          nextStart: -1,
          items: []
        }
      );
      restHelpersGet
        ._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION)
        .then((ok: string[]) => {
          expect(ok.length).toEqual(0);
          done();
        }, done.fail);
    });

    it("handles a group where contents can be retrieved via a single fetch", done => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
        {
          total: 2,
          start: 1,
          num: 2,
          nextStart: -1,
          items: [
            {
              id: "itm1234567890"
            },
            {
              id: "itm1234567891"
            }
          ]
        }
      );
      restHelpersGet
        ._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION)
        .then((ok: string[]) => {
          expect(ok.length).toEqual(2);
          expect(ok).toEqual(["itm1234567890", "itm1234567891"]);
          done();
        }, done.fail);
    });

    it("handles a group where contents require two fetches", done => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 2
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=1&num=2&token=fake-token",
          {
            total: 4,
            start: 1,
            num: 2,
            nextStart: 3,
            items: [
              {
                id: "itm1234567890"
              },
              {
                id: "itm1234567891"
              }
            ]
          }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=3&num=2&token=fake-token",
          {
            total: 4,
            start: 3,
            num: 2,
            nextStart: -1,
            items: [
              {
                id: "itm1234567892"
              },
              {
                id: "itm1234567893"
              }
            ]
          }
        );
      restHelpersGet
        ._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION)
        .then((ok: string[]) => {
          expect(ok.length).toEqual(4);
          expect(ok).toEqual([
            "itm1234567890",
            "itm1234567891",
            "itm1234567892",
            "itm1234567893"
          ]);
          done();
        }, done.fail);
    });

    it("handles a group where contents require multiple fetches", done => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 2
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=1&num=2&token=fake-token",
          {
            total: 5,
            start: 1,
            num: 2,
            nextStart: 3,
            items: [
              {
                id: "itm1234567890"
              },
              {
                id: "itm1234567891"
              }
            ]
          }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=3&num=2&token=fake-token",
          {
            total: 5,
            start: 3,
            num: 2,
            nextStart: 5,
            items: [
              {
                id: "itm1234567892"
              },
              {
                id: "itm1234567893"
              }
            ]
          }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/groups/grp1234567890?f=json&start=5&num=2&token=fake-token",
          {
            total: 5,
            start: 5,
            num: 1,
            nextStart: -1,
            items: [
              {
                id: "itm1234567894"
              }
            ]
          }
        );
      restHelpersGet
        ._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION)
        .then((ok: string[]) => {
          expect(ok.length).toEqual(5);
          expect(ok).toEqual([
            "itm1234567890",
            "itm1234567891",
            "itm1234567892",
            "itm1234567893",
            "itm1234567894"
          ]);
          done();
        }, done.fail);
    });
  });

  describe("_getItemResourcesTranche", () => {
    it("handles an inaccessible item", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources",
        mockItems.get400Failure()
      );
      restHelpersGet
        ._getItemResourcesTranche(itemId, pagingParams, MOCK_USER_SESSION)
        .then(
          () => done.fail(),
          ok => {
            expect(ok.message).toEqual(
              "CONT_0001: Item does not exist or is inaccessible."
            );
            done();
          }
        );
    });

    it("handles an item with no resources", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources",
        {
          total: 0,
          start: 1,
          num: 0,
          nextStart: -1,
          resources: []
        }
      );
      restHelpersGet
        ._getItemResourcesTranche(itemId, pagingParams, MOCK_USER_SESSION)
        .then((ok: Array<Promise<File>>) => {
          expect(ok.length).toEqual(0);
          done();
        }, done.fail);
    });

    it("handles an item with one resource", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources",
          {
            total: 1,
            start: 1,
            num: 1,
            nextStart: -1,
            resources: [
              {
                resource: "Jackson Lake.png",
                created: 1568662976000,
                size: 1231
              }
            ]
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        );
      restHelpersGet
        ._getItemResourcesTranche(itemId, pagingParams, MOCK_USER_SESSION)
        .then((ok: Array<Promise<File>>) => {
          expect(ok.length).toEqual(1);
          Promise.all(ok).then(rsrcResponses => {
            done();
          }, done.fail);
        }, done.fail);
    });

    it("handles an item with multiple resources where they can be retrieved via a single fetch", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources",
          {
            total: 4,
            start: 1,
            num: 4,
            nextStart: -1,
            resources: [
              {
                resource: "Bradley & Taggart Lakes.png",
                created: 1568662976000,
                size: 1231
              },
              {
                resource: "Jackson Lake.png",
                created: 1568662976000,
                size: 1231
              },
              {
                resource: "Jenny Lake.png",
                created: 1568662968000,
                size: 1231
              },
              {
                resource: "Leigh Lake.png",
                created: 1568662960000,
                size: 1231
              }
            ]
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Bradley%20&%20Taggart%20Lakes.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Jenny%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Leigh%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        );
      restHelpersGet
        ._getItemResourcesTranche(itemId, pagingParams, MOCK_USER_SESSION)
        .then((ok: Array<Promise<File>>) => {
          expect(ok.length).toEqual(4);
          Promise.all(ok).then(rsrcResponses => done(), done.fail);
        }, done.fail);
    });

    it("handles an item with multiple resources where they require multiple fetches", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 1
      };

      const filenames = [
        "Bradley & Taggart Lakes.png",
        "Jackson Lake.png",
        "Jenny Lake.png",
        "Leigh Lake.png"
      ];
      let imageNum = 0;
      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources",
          () => {
            const i = imageNum++;
            return {
              total: 4,
              start: i + 1,
              num: 1,
              nextStart: i < 3 ? i + 2 : -1,
              resources: [
                {
                  resource: filenames[i],
                  created: 1568662976000,
                  size: 1231
                }
              ]
            };
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Bradley%20&%20Taggart%20Lakes.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Jenny%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/itm1234567890/resources/Leigh%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        );
      restHelpersGet
        ._getItemResourcesTranche(itemId, pagingParams, MOCK_USER_SESSION)
        .then((ok: Array<Promise<File>>) => {
          expect(ok.length).toEqual(4);
          Promise.all(ok).then(rsrcResponses => done(), done.fail);
        }, done.fail);
    });
  });

  describe("getPortalDefaultBasemap", function() {
    const basemapGalleryGroupQuery = `title:"United States Basemaps" AND owner:Esri_cy_US`;
    const basemapTitle = "Topographic";
    let searchGroupsResponse: interfaces.ISearchResult<interfaces.IGroup>;
    let searchGroupContentsResponse: interfaces.ISearchResult<interfaces.IItem>;

    beforeEach(() => {
      searchGroupsResponse = utils.getGroupResponse(
        `title:"United States Basemaps" AND owner:Esri_cy_US`,
        true
      ) as interfaces.ISearchResult<interfaces.IGroup>;
      searchGroupContentsResponse = {
        results: [
          {
            id: "14dba3d96cd94b358dff421661300286"
          }
        ]
      } as interfaces.ISearchResult<interfaces.IItem>;
    });

    it("should query for the default basemap group and default basemap", done => {
      const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(
        searchGroupsResponse
      );
      const searchGroupContentsSpy = spyOn(
        restHelpers,
        "searchGroupContents"
      ).and.resolveTo(searchGroupContentsResponse);
      restHelpersGet
        .getPortalDefaultBasemap(
          basemapGalleryGroupQuery,
          basemapTitle,
          MOCK_USER_SESSION
        )
        .then(results => {
          expect(searchGroupsSpy.calls.count()).toEqual(1);
          expect(searchGroupsSpy.calls.first().args).toEqual([
            basemapGalleryGroupQuery,
            MOCK_USER_SESSION,
            { num: 1 }
          ]);
          expect(searchGroupContentsSpy.calls.count()).toEqual(1);
          expect(searchGroupContentsSpy.calls.first().args).toEqual([
            searchGroupsResponse.results[0].id,
            `title:${basemapTitle}`,
            MOCK_USER_SESSION,
            { num: 1 }
          ]);
          const expected = searchGroupContentsResponse.results[0];
          expect(results).toEqual(expected);
          done();
        })
        .catch(done.fail);
    });

    it("should reject when no group is found", done => {
      searchGroupsResponse.results = [];
      const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(
        searchGroupsResponse
      );
      restHelpersGet
        .getPortalDefaultBasemap(
          basemapGalleryGroupQuery,
          basemapTitle,
          MOCK_USER_SESSION
        )
        .then(results => {
          done.fail("Should have rejected");
        })
        .catch(e => {
          expect(searchGroupsSpy.calls.count()).toEqual(1);
          expect(searchGroupsSpy.calls.first().args).toEqual([
            basemapGalleryGroupQuery,
            MOCK_USER_SESSION,
            { num: 1 }
          ]);
          expect(e.message).toEqual("No basemap group found");
          done();
        });
    });

    it("should reject when no basemap is found", done => {
      searchGroupContentsResponse.results = [];
      const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(
        searchGroupsResponse
      );
      const searchGroupContentsSpy = spyOn(
        restHelpers,
        "searchGroupContents"
      ).and.resolveTo(searchGroupContentsResponse);
      restHelpersGet
        .getPortalDefaultBasemap(
          basemapGalleryGroupQuery,
          basemapTitle,
          MOCK_USER_SESSION
        )
        .then(results => {
          done.fail("Should have rejected");
        })
        .catch(e => {
          expect(searchGroupsSpy.calls.count()).toEqual(1);
          expect(searchGroupsSpy.calls.first().args).toEqual([
            basemapGalleryGroupQuery,
            MOCK_USER_SESSION,
            { num: 1 }
          ]);
          expect(searchGroupContentsSpy.calls.count()).toEqual(1);
          expect(searchGroupContentsSpy.calls.first().args).toEqual([
            searchGroupsResponse.results[0].id,
            `title:${basemapTitle}`,
            MOCK_USER_SESSION,
            { num: 1 }
          ]);
          expect(e.message).toEqual("No basemap found");
          done();
        });
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //
