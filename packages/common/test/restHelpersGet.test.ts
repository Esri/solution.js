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

import { ISearchResult, IGroup, IItem, UserSession } from "../src/arcgisRestJS";
import * as generalHelpers from "../src/generalHelpers";
import * as interfaces from "../src/interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as request from "@esri/arcgis-rest-request";
import * as restHelpers from "../src/restHelpers";
import * as restHelpersGet from "../src/restHelpersGet";

import * as utils from "./mocks/utils";
const fetchMock = require("fetch-mock");
import * as mockItems from "../test/mocks/agolItems";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

const noRelatedItemsResponse: portal.IGetRelatedItemsResponse = {
  total: 0,
  relatedItems: [],
};

const noResourcesResponse: interfaces.IGetResourcesResponse = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: [],
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
    it("can get the username from the authentication", async () => {
      const communitySelfResponse: any = utils.getUserResponse();
      communitySelfResponse.username = "casey";
      fetchMock.get(utils.PORTAL_SUBSET.restUrl + "/community/self?f=json&token=fake-token", communitySelfResponse);

      const username = await restHelpersGet.getUsername(MOCK_USER_SESSION);
      expect(username).toEqual(MOCK_USER_SESSION.username);
    });
  });

  describe("getFoldersAndGroups", () => {
    it("can handle an exception on get user content", async () => {
      fetchMock
        .get(utils.PORTAL_SUBSET.restUrl + "/content/users/casey?f=json&token=fake-token", mockItems.get500Failure())
        .get(utils.PORTAL_SUBSET.restUrl + "/community/users/casey?f=json&token=fake-token", mockItems.get500Failure());

      return restHelpersGet.getFoldersAndGroups(MOCK_USER_SESSION).then(
        () => fail(),
        () => Promise.resolve(),
      );
    });

    it("can handle undefined folders or groups", async () => {
      const response: any = utils.getSuccessResponse();
      fetchMock
        .get(utils.PORTAL_SUBSET.restUrl + "/content/users/casey?f=json&token=fake-token", response)
        .get(utils.PORTAL_SUBSET.restUrl + "/community/users/casey?f=json&token=fake-token", response);
      const expectedFolders: any = [];
      const expectedGroups: any = [];

      const actual = await restHelpersGet.getFoldersAndGroups(MOCK_USER_SESSION);
      expect(actual.folders).toEqual(expectedFolders);
      expect(actual.groups).toEqual(expectedGroups);
    });
  });

  describe("getBlobAsFile", () => {
    it("should ignore ignorable error", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());

      const file = await restHelpersGet.getBlobAsFile(url, "myFile.png", MOCK_USER_SESSION, [400]);
      expect(file).toBeNull();
    });

    it("should use supplied filename", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, utils.getSampleImageAsBlob(), {
        sendAsJson: false,
      });

      const file = await restHelpersGet.getBlobAsFile(url, "myFile.png", MOCK_USER_SESSION, [400]);
      expect(file).not.toBeUndefined();
      expect(file.type).toEqual("image/png");
      expect(file.name).toEqual("myFile.png");
    });
  });

  describe("getBlobCheckForError", () => {
    it("should pass through an image file", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, utils.getSampleImageAsBlob(), {
        sendAsJson: false,
      });

      const blob = await restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION, [400]);
      expect(blob).not.toBeUndefined();
      expect(blob.type).toEqual("image/png");
    });

    it("should pass through non-error JSON", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      const testBlobContents = JSON.stringify({
        a: "a",
        b: 1,
        c: {
          d: "d",
        },
      });
      const testBlob = new Blob([testBlobContents], {
        type: "application/json",
      });
      fetchMock.post(url, testBlob, { sendAsJson: false });

      const blob = await restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION);
      expect(blob).not.toBeUndefined();
      expect(blob.type).toEqual("application/json");
    });

    it("should handle bad JSON by passing it through", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      const testBlob = new Blob(["badJson:{"], { type: "application/json" });
      fetchMock.post(url, testBlob, { sendAsJson: false });

      const blob = await restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION, [500]);
      expect(blob).not.toBeUndefined();
      expect(blob.type).toEqual("application/json");
    });

    it("should ignore ignorable error", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());

      const blob = await restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION, [400]);
      expect(blob).toBeNull();
    });

    it("should return significant error", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());

      return restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION, [500]).then(
        () => fail(),
        (response) => {
          expect(response).not.toBeUndefined();
          expect(response.error.code).toEqual(400);
        },
      );
    });
  });

  describe("getEnterpriseServers", () => {
    it("fetches the servers", async () => {
      const portalRestUrl = utils.PORTAL_SUBSET.restUrl;

      const serversJSON = {
        servers: [
          {
            id: "abc",
            name: "serverABC.esri.com:11443",
            adminUrl: "https://serverABC.esri.com:11443/arcgis",
            url: "https://serverABC.ags.esri.com/gis",
            isHosted: false,
            serverType: "ARCGIS_NOTEBOOK_SERVER",
            serverRole: "FEDERATED_SERVER",
            serverFunction: "NotebookServer",
          },
          {
            id: "def",
            name: "serverDEF.ags.esri.com",
            adminUrl: "https://serverDEF.ags.esri.com/video",
            url: "https://serverDEF.ags.esri.com/video",
            isHosted: false,
            serverType: "ARCGIS_VIDEO_SERVER",
            serverRole: "FEDERATED_SERVER",
            serverFunction: "VideoServer",
          },
          {
            id: "ghi",
            name: "serverGHI.esri.com:6443",
            adminUrl: "https://serverGHI.esri.com:6443/arcgis",
            url: "https://serverGHI.ags.esri.com/server",
            isHosted: true,
            serverType: "ArcGIS",
            serverRole: "HOSTING_SERVER",
            serverFunction: "WorkflowManager",
          },
        ],
      };
      const getServersSpy = spyOn(request, "request").and.resolveTo(serversJSON);

      const actual = await restHelpersGet.getEnterpriseServers(portalRestUrl, MOCK_USER_SESSION);

      expect(getServersSpy.calls.first().args[0]).toEqual(`${portalRestUrl}/portals/self/servers`);
      expect(actual).toEqual([
        {
          id: "abc",
          name: "serverABC.esri.com:11443",
          adminUrl: "https://serverABC.esri.com:11443/arcgis",
          url: "https://serverABC.ags.esri.com/gis",
          isHosted: false,
          serverType: "ARCGIS_NOTEBOOK_SERVER",
          serverRole: "FEDERATED_SERVER",
          serverFunction: "NotebookServer",
        },
        {
          id: "def",
          name: "serverDEF.ags.esri.com",
          adminUrl: "https://serverDEF.ags.esri.com/video",
          url: "https://serverDEF.ags.esri.com/video",
          isHosted: false,
          serverType: "ARCGIS_VIDEO_SERVER",
          serverRole: "FEDERATED_SERVER",
          serverFunction: "VideoServer",
        },
        {
          id: "ghi",
          name: "serverGHI.esri.com:6443",
          adminUrl: "https://serverGHI.esri.com:6443/arcgis",
          url: "https://serverGHI.ags.esri.com/server",
          isHosted: true,
          serverType: "ArcGIS",
          serverRole: "HOSTING_SERVER",
          serverFunction: "WorkflowManager",
        },
      ]);
    });
  });

  describe("getFilenameFromUrl", () => {
    it("extract name from url without query params", () => {
      const url = "https://myorg.arcgis.com//resources/image.png";
      const expectedFilename = "image.png";
      expect(restHelpersGet.getFilenameFromUrl(url)).toEqual(expectedFilename);
    });

    it("extract name from url with query params", () => {
      const url = "https://myorg.arcgis.com//resources/image.png?w=400&token=fake-token";
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
    it("should return group's category schema", async () => {
      const groupId = "grp1234567890";

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/community/groups/grp1234567890/categorySchema?f=json&token=fake-token",
        mockItems.getAGOLGroupCategorySchema(),
      );

      const schema = await restHelpersGet.getGroupCategorySchema(groupId, MOCK_USER_SESSION);
      expect(schema).toEqual(mockItems.getAGOLGroupCategorySchema());
    });
  });

  describe("getItemBase", () => {
    it("item doesn't allow access to item", async () => {
      const itemId = "itm1234567890";
      const expected: any = {
        name: "ArcGISAuthError",
        message: "GWM_0003: You do not have permissions to access this resource or perform this operation.",
        originalMessage: "You do not have permissions to access this resource or perform this operation.",
        code: "GWM_0003",
        response: {
          error: {
            code: 403,
            messageCode: "GWM_0003",
            message: "You do not have permissions to access this resource or perform this operation.",
            details: [] as any[],
          },
        },
        url: utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token",
        options: {
          httpMethod: "GET",
          params: {
            f: "json",
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
            refreshTokenTTL: 1440,
          },
          headers: {},
        },
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token",
        JSON.stringify(expected),
      );

      const response = await restHelpersGet.getItemBase(itemId, MOCK_USER_SESSION);
      expect(response).toEqual(expected);
    });

    it("item is accessible", async () => {
      const itemId = "itm1234567890";
      const expected: any = { values: { a: 1, b: "c" } };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token",
        JSON.stringify(expected),
      );

      const response = await restHelpersGet.getItemBase(itemId, MOCK_USER_SESSION);
      expect(response).toEqual(expected);
    });
  });

  describe("getItemDataAsFile", () => {
    it("handles item without a data section", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, {
        error: {
          code: 500,
          messageCode: "CONT_0004",
          message: "Item does not exist or is inaccessible.",
          details: [],
        },
      });

      return restHelpersGet.getItemDataAsFile(itemId, "myFile.png", MOCK_USER_SESSION).then(
        () => Promise.resolve(),
        () => fail(),
      );
    });

    it("gets data section that's an image", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, utils.getSampleImageAsBlob(), {
        sendAsJson: false,
      });

      const file = await restHelpersGet.getItemDataAsFile(itemId, "myFile.png", MOCK_USER_SESSION);
      expect(file).not.toBeUndefined();
      expect(file.type).toEqual("image/png");
      expect(file.name).toEqual("myFile.png");
    });
  });

  describe("getItemDataAsJson", () => {
    it("handles item without a data section", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, {
        error: {
          code: 500,
          messageCode: "CONT_0004",
          message: "Item does not exist or is inaccessible.",
          details: [],
        },
      });

      return restHelpersGet.getItemDataAsJson(itemId, MOCK_USER_SESSION);
    });

    it("get data section that's JSON", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      const testBlobContents = {
        a: "a",
        b: 1,
        c: {
          d: "d",
        },
      };
      const testBlob = new Blob([JSON.stringify(testBlobContents)], {
        type: "application/json",
      });
      fetchMock.post(url, testBlob, { sendAsJson: false });

      const json = await restHelpersGet.getItemDataAsJson(itemId, MOCK_USER_SESSION);
      expect(json).not.toBeUndefined();
      expect(json).toEqual(testBlobContents);
    });

    it("handles item that doesn't allow access to data", async () => {
      const itemId = "itm1234567890";
      const expected: any = {
        name: "ArcGISAuthError",
        message: "GWM_0003: You do not have permissions to access this resource or perform this operation.",
        originalMessage: "You do not have permissions to access this resource or perform this operation.",
        code: "GWM_0003",
        response: {
          error: {
            code: 403,
            messageCode: "GWM_0003",
            message: "You do not have permissions to access this resource or perform this operation.",
            details: [] as any[],
          },
        },
        url: utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data",
        options: {
          httpMethod: "GET",
          params: {
            f: "json",
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
            refreshTokenTTL: 1440,
          },
          headers: {},
        },
      };

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data", expected);

      const response = await restHelpersGet.getItemDataAsJson(itemId, MOCK_USER_SESSION);
      expect(response).toEqual(expected);
    });
  });

  describe("getItemDataBlob", () => {
    it("handles odd error code", async () => {
      const itemId = "itm1234567890";
      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data", { error: { code: 505 } });

      return restHelpersGet.getItemDataBlob(itemId, MOCK_USER_SESSION).then(
        () => Promise.resolve(),
        () => Promise.resolve(),
      );
    });
  });

  describe("getItemDataBlobUrl", () => {
    it("gets the data blob url from the authentication", () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      expect(url).toEqual(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/data");
    });
  });

  describe("getItemMetadataAsFile", () => {
    it("handles item without metadata", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, mockItems.get400Failure());

      const json = await restHelpersGet.getItemMetadataAsFile(itemId, MOCK_USER_SESSION);
      expect(json).toBeNull();
    });

    it("handles server error", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, mockItems.get500Failure());

      const json = await restHelpersGet.getItemMetadataAsFile(itemId, MOCK_USER_SESSION);
      expect(json).toBeNull();
    });

    it("handles general error", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, { value: "fred" });

      const json = await restHelpersGet.getItemMetadataAsFile(itemId, MOCK_USER_SESSION);
      expect(json).toBeNull();
    });

    it("gets metadata", async () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(itemId, MOCK_USER_SESSION);
      fetchMock.post(url, utils.getSampleMetadataAsFile(), {
        sendAsJson: false,
      });

      const file = await restHelpersGet.getItemMetadataAsFile(itemId, MOCK_USER_SESSION);
      expect(file).not.toBeUndefined();
      expect(file.type).toEqual("text/xml");
    });
  });

  describe("getItemMetadataBlobUrl", () => {
    it("gets the metadata blob url from the authentication", () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(itemId, MOCK_USER_SESSION);
      expect(url).toEqual(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/info/metadata/metadata.xml");
    });
  });

  describe("getItemRelatedItems", () => {
    it("item doesn't have related items of a single type", async () => {
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
          "&start=1&num=100&relationshipType=" +
          relationshipType +
          "&token=fake-token",
        {
          aggregations: { total: { count: 0, name: "total" } },
          nextkey: null,
          num: 100,
          ...expected,
        } as interfaces.IGetRelatedItemsResponseFull,
      );

      const response = await restHelpersGet.getItemRelatedItems(itemId, relationshipType, direction, MOCK_USER_SESSION);
      expect(response).toEqual(expected);
    });

    it("item doesn't have related items of multiple types", async () => {
      const itemId = "itm1234567890";
      const relationshipType: portal.ItemRelationshipType[] = ["Survey2Service", "Service2Service"];
      const direction = "reverse";
      const expected = { total: 0, relatedItems: [] as any[] };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems" +
          "?f=json&direction=" +
          direction +
          "&start=1&num=100&relationshipTypes=" +
          relationshipType.join("%2C") +
          "&token=fake-token",
        {
          aggregations: { total: { count: 0, name: "total" } },
          nextkey: null,
          num: 100,
          ...expected,
        } as interfaces.IGetRelatedItemsResponseFull,
      );

      const response = await restHelpersGet.getItemRelatedItems(itemId, relationshipType, direction, MOCK_USER_SESSION);
      expect(response).toEqual(expected);
    });

    it("item has one related item", async () => {
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
              "Hosted Service",
            ],
            description: "Suspected drug activity reported by the general public.",
            tags: [
              "Opioids",
              "Public Safety",
              "Drug Activity",
              "Community Policing",
              "Drug Tips",
              "Police",
              "Law Enforcement",
            ],
            snippet: "Suspected drug activity reported by the general public.",
            thumbnail: "thumbnail/Drug-Activity-Reporter.png",
            documentation: null as any,
            extent: [
              [-131.83000000020434, 16.22999999995342],
              [-57.119999999894105, 58.49999999979133],
            ],
            categories: [] as string[],
            spatialReference: null as any,
            accessInformation: "Esri",
            licenseInfo: null as any,
            culture: "",
            properties: null as any,
            url: "https://services7.arcgis.com/piPfTFmr/arcgis/rest/services/service_75b7efa1d3cf/FeatureServer",
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
            groupDesignations: null as any,
          },
        ],
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems" +
          "?f=json&direction=" +
          direction +
          "&start=1&num=100&relationshipType=" +
          relationshipType +
          "&token=fake-token",
        {
          aggregations: { total: { count: 1, name: "total" } },
          nextkey: null,
          num: 100,
          ...expected,
        } as interfaces.IGetRelatedItemsResponseFull,
      );

      const response = await restHelpersGet.getItemRelatedItems(itemId, relationshipType, direction, MOCK_USER_SESSION);
      expect(response).toEqual(expected);
    });

    it("can handle an exception from the REST endpoint portal.getRelatedItems", async () => {
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
          "&start=1&num=100&relationshipType=" +
          relationshipType +
          "&token=fake-token",
        mockItems.get500Failure(),
      );

      const response = await restHelpersGet.getItemRelatedItems(itemId, relationshipType, direction, MOCK_USER_SESSION);
      expect(response).toEqual(noRelatedItemsResponse);
    });

    it("handles multiple batches of requests for related items", async () => {
      const itemId = "itm1234567890";
      const expected: any = {
        total: 7,
        relatedItems: [
          { id: "471e7500ab364db5a4f074c704962650" },
          { id: "db5962011a394e3e9952dd4ba4ad84ef" },
          { id: "f11985a2217e49c8989c392adc63e27a" },
          { id: "5a7ca139565349e7813a7ed309717485" },
          { id: "7495ad9c27aa43bf860b9d0a5dab58ab" },
          { id: "6e5fb5d0f59b463cb17588caca8df246" },
          { id: "cce1be82652e4238804c29f9cf2ea417" },
        ],
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems?f=json&direction=forward&start=1&num=3&relationshipType=Survey2Service&token=fake-token",
        {
          aggregations: { total: { count: 3, name: "total" } },
          nextkey: "fred",
          num: 3,
          total: 3,
          relatedItems: [
            { id: "471e7500ab364db5a4f074c704962650" },
            { id: "db5962011a394e3e9952dd4ba4ad84ef" },
            { id: "f11985a2217e49c8989c392adc63e27a" },
          ],
        } as interfaces.IGetRelatedItemsResponseFull,
      );

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems?f=json&direction=forward&start=4&num=3&relationshipType=Survey2Service&nextkey=fred&token=fake-token",
        {
          aggregations: { total: { count: 3, name: "total" } },
          nextkey: "ginger",
          num: 3,
          total: 3,
          relatedItems: [
            { id: "5a7ca139565349e7813a7ed309717485" },
            { id: "7495ad9c27aa43bf860b9d0a5dab58ab" },
            { id: "6e5fb5d0f59b463cb17588caca8df246" },
          ],
        } as interfaces.IGetRelatedItemsResponseFull,
      );

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/content/items/" +
          itemId +
          "/relatedItems?f=json&direction=forward&start=7&num=3&relationshipType=Survey2Service&nextkey=ginger&token=fake-token",
        {
          aggregations: { total: { count: 1, name: "total" } },
          nextkey: null,
          num: 3,
          total: 1,
          relatedItems: [{ id: "cce1be82652e4238804c29f9cf2ea417" }],
        } as interfaces.IGetRelatedItemsResponseFull,
      );

      const response = await restHelpersGet.getItemRelatedItems(
        itemId,
        "Survey2Service",
        "forward",
        MOCK_USER_SESSION,
        3, // items per request
      );
      expect(response).toEqual(expected);
    });
  });

  describe("getItemRelatedItemsInSameDirection", () => {
    it("gets the data blob url from the authentication", async () => {
      const itemId = "itm1234567890";
      const relationshipTypes = [
        // from ItemRelationshipType
        "APIKey2Item",
        "Area2CustomPackage",
        "Area2Package",
        "Item2Attachment",
        "Item2Report",
        "Listed2Provisioned",
        "Map2AppConfig",
        "Map2Area",
        "Map2FeatureCollection",
        "Map2Service",
        "MobileApp2Code",
        "Service2Data",
        "Service2Layer",
        "Service2Route",
        "Service2Service",
        "Service2Style",
        "Solution2Item",
        "Style2Style",
        "Survey2Data",
        "Survey2Service",
        "SurveyAddIn2Data",
        "Theme2Story",
        "TrackView2Map",
        "WebStyle2DesktopStyle",
        "WMA2Code",
        "WorkforceMap2FeatureService",
      ];

      relationshipTypes.forEach((relationshipType) => {
        const response =
          relationshipType === "Survey2Data"
            ? ({
                aggregations: { total: { count: 1, name: "total" } },
                nextkey: null,
                num: 100,
                total: 1,
                relatedItems: [{ id: "srv1234567890" }, { id: "abc1234567890" }],
              } as interfaces.IGetRelatedItemsResponseFull)
            : ({
                aggregations: { total: { count: 0, name: "total" } },
                nextkey: null,
                num: 100,
                total: 0,
                relatedItems: [],
              } as interfaces.IGetRelatedItemsResponseFull);
        fetchMock.get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemId +
            "/relatedItems" +
            "?f=json&direction=forward&start=1&num=100&relationshipType=" +
            relationshipType +
            "&token=fake-token",
          response,
        );
      });

      const response = await restHelpersGet.getItemRelatedItemsInSameDirection(itemId, "forward", MOCK_USER_SESSION);
      expect(response).toEqual([
        {
          relationshipType: "Survey2Data",
          relatedItemIds: ["srv1234567890", "abc1234567890"],
        },
      ]);
    });
  });

  describe("getItemResources", () => {
    it("can handle a 500 error from the REST endpoint portal.getItemResources", async () => {
      const itemId = "itm1234567890";

      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/" + itemId + "/resources",
        mockItems.get500Failure(),
      );

      const response = await restHelpersGet.getItemResources(itemId, MOCK_USER_SESSION);
      expect(response).toEqual(noResourcesResponse);
    });
  });

  describe("getItemResourcesFiles", () => {
    it("handles an inaccessible item", async () => {
      const itemId = "itm1234567890";

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", mockItems.get400Failure());

      return restHelpersGet.getItemResourcesFiles(itemId, MOCK_USER_SESSION).then(
        () => fail(),
        (ok) => {
          expect(ok.message).toEqual("CONT_0001: Item does not exist or is inaccessible.");
          return Promise.resolve();
        },
      );
    });

    it("handles an item with no resources", async () => {
      const itemId = "itm1234567890";

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", {
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: [],
      });

      const ok: File[] = await restHelpersGet.getItemResourcesFiles(itemId, MOCK_USER_SESSION);
      expect(ok.length).toEqual(0);
    });

    it("handles an item with one resource", async () => {
      const itemId = "itm1234567890";
      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", {
          total: 1,
          start: 1,
          num: 1,
          nextStart: -1,
          resources: [
            {
              resource: "Jackson Lake.png",
              created: 1568662976000,
              size: 1231,
            },
          ],
        })
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        );

      const ok: File[] = await restHelpersGet.getItemResourcesFiles(itemId, MOCK_USER_SESSION);
      expect(ok.length).toEqual(1);
    });
  });

  describe("getItemsRelatedToASolution", () => {
    it("gets items", async () => {
      const solutionId = "sol1234567890";
      const getItemRelatedItemsSpy = spyOn(portal, "getRelatedItems").and.resolveTo({
        aggregations: {
          total: {
            count: 1,
            name: "total",
          },
        },
        nextkey: null,
        num: 100,
        relatedItems: [mockItems.getAGOLItem("Web Map")],
        total: 1,
      } as interfaces.IGetRelatedItemsResponseFull);

      const response: IItem[] = await restHelpersGet.getItemsRelatedToASolution(
        solutionId,
        MOCK_USER_SESSION,
      );
      expect(response).toEqual([mockItems.getAGOLItem("Web Map")]);
      expect(getItemRelatedItemsSpy.calls.count()).toEqual(1);
      expect(getItemRelatedItemsSpy.calls.first().args).toEqual([
        {
          id: solutionId,
          relationshipType: "Solution2Item",
          authentication: MOCK_USER_SESSION,
          params: { direction: "forward", start: 1, num: 100 },
        } as portal.IItemRelationshipOptions,
      ]);
    });
  });

  describe("getItemThumbnail", () => {
    it("handle missing thumbnail for an item", async () => {
      const ok: Blob = await restHelpersGet.getItemThumbnail("itm1234567890", null, false, MOCK_USER_SESSION);
      expect(ok).toBeNull();
    });

    it("get thumbnail for an item", async () => {
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/info/thumbnail/ago_downloaded.png",
        utils.getSampleImageAsBlob(),
        { sendAsJson: false },
      );

      const ok: Blob = await restHelpersGet.getItemThumbnail(
        "itm1234567890",
        "thumbnail/ago_downloaded.png",
        false,
        MOCK_USER_SESSION,
      );
      expect(ok.type).toEqual("image/png");
    });
  });

  describe("getItemThumbnailAsFile", () => {
    it("get thumbnail for an item", async () => {
      fetchMock.post(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/info/thumbnail/ago_downloaded.png",
        utils.getSampleImageAsBlob(),
        { sendAsJson: false },
      );

      const ok: File = await restHelpersGet.getItemThumbnailAsFile(
        "itm1234567890",
        "thumbnail/ago_downloaded.png",
        false,
        MOCK_USER_SESSION,
      );
      expect(ok.type).toEqual("image/png");
    });

    it("handles missing thumbnail info", async () => {
      const ok: File = await restHelpersGet.getItemThumbnailAsFile("itm1234567890", null, false, MOCK_USER_SESSION);
      expect(ok).toBeNull();
    });
  });

  describe("getItemThumbnailUrl", () => {
    it("get thumbnail url for an item", () => {
      expect(
        restHelpersGet.getItemThumbnailUrl("itm1234567890", "thumbnail/ago_downloaded.png", false, MOCK_USER_SESSION),
      ).toEqual(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/info/thumbnail/ago_downloaded.png");
    });

    it("get thumbnail url for a group", () => {
      expect(
        restHelpersGet.getItemThumbnailUrl("grp1234567890", "thumbnail/ago_downloaded.png", true, MOCK_USER_SESSION),
      ).toEqual(utils.PORTAL_SUBSET.restUrl + "/community/groups/grp1234567890/info/thumbnail/ago_downloaded.png");
    });
  });

  describe("getJson", () => {
    it("get JSON without authentication", async () => {
      fetchMock
        .post("http://site.com/some.json/rest/info", {})
        .get("https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token", {})
        .get("http://site.com/some.json?f=json", utils.getSampleJsonAsBlob(), {
          sendAsJson: false,
        });
      const json = await restHelpersGet.getJson("http://site.com/some.json", MOCK_USER_SESSION);
      expect(json).toEqual(utils.getSampleJson());
    });

    it("get JSON without authentication", async () => {
      fetchMock
        .get("https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token", {})
        .get("http://site.com/some.json?f=json", utils.getSampleJsonAsBlob(), {
          sendAsJson: false,
        });

      const json = await restHelpersGet.getJson("http://site.com/some.json");
      expect(json).toEqual(utils.getSampleJson());
    });

    it("handles non-JSON", async () => {
      fetchMock
        .get("https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token", {})
        .get("http://site.com/some.json?f=json", utils.getSampleImageAsBlob(), {
          sendAsJson: false,
        });

      const json = await restHelpersGet.getJson("http://site.com/some.json");
      expect(json).toEqual(null);
    });

    it("handles error", async () => {
      fetchMock
        .get("https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token", {})
        .get("http://site.com/some.json?f=json", mockItems.get400Failure());

      const json = await restHelpersGet.getJson("http://site.com/some.json");
      expect(json).toEqual(mockItems.get400Failure());
    });
  });

  describe("getPortalSharingUrlFromAuth", () => {
    it("gets a default portal sharing url when there's no authentication", () => {
      expect(restHelpersGet.getPortalSharingUrlFromAuth(undefined)).toEqual("https://www.arcgis.com/sharing/rest");
    });

    it("gets a default portal sharing url with authentication but no portal", () => {
      const mockUserSession = new UserSession({
        clientId: "clientId",
        redirectUri: "https://example-app.com/redirect-uri",
        token: "fake-token",
        tokenExpires: utils.TOMORROW,
        refreshToken: "refreshToken",
        refreshTokenExpires: utils.TOMORROW,
        refreshTokenTTL: 1440,
        username: "casey",
        password: "123456",
      });

      expect(restHelpersGet.getPortalSharingUrlFromAuth(mockUserSession)).toEqual(
        "https://www.arcgis.com/sharing/rest",
      );
    });

    it("gets portal sharing url from authentication", () => {
      expect(restHelpersGet.getPortalSharingUrlFromAuth(MOCK_USER_SESSION)).toEqual(utils.PORTAL_SUBSET.restUrl);
    });
  });

  describe("getPortalUrlFromAuth", () => {
    it("gets a default portal url with authentication but no portal", () => {
      const mockUserSession = new UserSession({
        clientId: "clientId",
        redirectUri: "https://example-app.com/redirect-uri",
        token: "fake-token",
        tokenExpires: utils.TOMORROW,
        refreshToken: "refreshToken",
        refreshTokenExpires: utils.TOMORROW,
        refreshTokenTTL: 1440,
        username: "casey",
        password: "123456",
      });
      expect(restHelpersGet.getPortalUrlFromAuth(mockUserSession)).toEqual("https://www.arcgis.com");
    });

    it("gets portal url from authentication", () => {
      expect(restHelpersGet.getPortalUrlFromAuth(MOCK_USER_SESSION)).toEqual("https://myorg.maps.arcgis.com");
    });
  });

  describe("getPortalUrls", () => {
    it("handles failure to fetch", async () => {
      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/portals/self/urls?f=json&token=fake-token",
        mockItems.get400Failure(),
      );

      return restHelpersGet.getPortalUrls(MOCK_USER_SESSION);
    });
  });

  describe("getSolutionsRelatedToAnItem", () => {
    it("gets solutions", async () => {
      const solutionId = "sol1234567890";
      const getItemRelatedItemsSpy = spyOn(portal, "getRelatedItems").and.resolveTo({
        aggregations: {
          total: {
            count: 1,
            name: "total",
          },
        },
        nextkey: null,
        num: 100,
        relatedItems: [mockItems.getAGOLItem("Solution")],
        total: 1,
      } as interfaces.IGetRelatedItemsResponseFull);

      const response = await restHelpersGet.getSolutionsRelatedToAnItem(solutionId, MOCK_USER_SESSION);
      expect(response).toEqual(["sol1234567890"]);
      expect(getItemRelatedItemsSpy.calls.count()).toEqual(1);
      expect(getItemRelatedItemsSpy.calls.first().args).toEqual([
        {
          id: solutionId,
          relationshipType: "Solution2Item",
          authentication: MOCK_USER_SESSION,
          params: { direction: "reverse", start: 1, num: 100 },
        } as portal.IItemRelationshipOptions,
      ]);
    });
  });

  describe("getThumbnailFile", () => {
    it("should handle error", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, mockItems.get400Failure());

      const file = await restHelpersGet.getThumbnailFile(url, "sampleImage", MOCK_USER_SESSION);
      expect(file).toBeNull();
    });

    it("should get file", async () => {
      const url = utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token";
      fetchMock.post(url, utils.getSampleImageAsFile(), {
        sendAsJson: false,
      });

      const file = await restHelpersGet.getThumbnailFile(url, "sampleImage", MOCK_USER_SESSION);
      expect(file).not.toBeUndefined();
      expect(file.type).toEqual("image/png");
      expect(file.name).toEqual("sampleImage");
    });
  });

  describe("_fixTextBlobType", () => {
    it("should pass application/json blobs through unchanged", async () => {
      const testBlobType = "application/json";
      const testBlobContents = JSON.stringify({
        a: "a",
        b: 1,
        c: {
          d: "d",
        },
      });
      const testBlob = new Blob([testBlobContents], { type: testBlobType });

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(testBlobType);

      const text: string = await generalHelpers.blobToText(ok);
      expect(text).toEqual(testBlobContents);
    });

    it("should pass image blobs through unchanged", async () => {
      const testBlobType = "image/png";
      const testBlob = utils.getSampleImageAsBlob();

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(testBlobType);
    });

    it("should pass text/xml blobs through unchanged", async () => {
      const testBlobType = "text/xml";
      const testBlob = utils.getSampleMetadataAsBlob();

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(testBlobType);

      const resultBlobContents = await generalHelpers.blobToText(ok);
      const testBlobContents = await generalHelpers.blobToText(testBlob);
      expect(resultBlobContents).toEqual(testBlobContents);
    });

    it("should pass truly text blobs through unchanged", async () => {
      const testBlobType = "text/plain";
      const testBlobContents = "This is a block of text";
      const testBlob = new Blob([testBlobContents], { type: testBlobType });

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(testBlobType);

      const text: string = await generalHelpers.blobToText(ok);
      expect(text).toEqual(testBlobContents);
    });

    it("should handle blob MIME text types with character-set suffix", async () => {
      const testBlobType = "text/plain; charset=utf-8";
      const testBlobContents = "This is a block of UTF8 text";
      const testBlob = new Blob([testBlobContents], { type: testBlobType });

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(testBlobType);

      const text: string = await generalHelpers.blobToText(ok);
      expect(text).toEqual(testBlobContents);
    });

    it("should re-type application/json blobs claiming to be text/plain", async () => {
      const testBlobType = "text/plain";
      const realBlobType = "application/json";
      const testBlobContents = JSON.stringify({
        a: "a",
        b: 1,
        c: {
          d: "d",
        },
      });
      const testBlob = new Blob([testBlobContents], { type: testBlobType });

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(realBlobType);

      const text: string = await generalHelpers.blobToText(ok);
      expect(text).toEqual(testBlobContents);
    });

    it("should re-type text/xml blobs claiming to be text/plain", async () => {
      const testBlobType = "text/plain";
      const realBlobType = "text/xml";
      const testBlob = utils.getSampleMetadataAsBlob(testBlobType);

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(realBlobType);

      const resultBlobContents = await generalHelpers.blobToText(ok);
      const testBlobContents = await generalHelpers.blobToText(testBlob);
      expect(resultBlobContents).toEqual(testBlobContents);
    });

    it("should re-type application/zip blobs claiming to be text/plain", async () => {
      const testBlobType = "text/plain";
      const realBlobType = "application/zip";
      const testBlob = utils.getSampleZip(testBlobType);

      const ok: Blob = await restHelpersGet._fixTextBlobType(testBlob);
      expect(ok.type).toEqual(realBlobType);

      const resultBlobContents = await generalHelpers.blobToText(ok);
      const testBlobContents = await generalHelpers.blobToText(testBlob);
      expect(resultBlobContents).toEqual(testBlobContents);
    });
  });

  describe("_getGroupContentsTranche", () => {
    it("handles an inaccessible group", async () => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10,
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
        {
          error: {
            code: 400,
            messageCode: "CONT_0006",
            message: "Group does not exist or is inaccessible.",
            details: [],
          },
        },
      );

      return restHelpersGet._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION).then(
        () => fail(),
        (ok) => {
          expect(ok.message).toEqual("CONT_0006: Group does not exist or is inaccessible.");
          return Promise.resolve();
        },
      );
    });

    it("handles an empty group", async () => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10,
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
        {
          total: 0,
          start: 1,
          num: 0,
          nextStart: -1,
          items: [],
        },
      );

      const ok: string[] = await restHelpersGet._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION);
      expect(ok.length).toEqual(0);
    });

    it("handles a group where contents can be retrieved via a single fetch", async () => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10,
      };

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
        {
          total: 2,
          start: 1,
          num: 2,
          nextStart: -1,
          items: [
            {
              id: "itm1234567890",
            },
            {
              id: "itm1234567891",
            },
          ],
        },
      );

      const ok: string[] = await restHelpersGet._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION);
      expect(ok.length).toEqual(2);
      expect(ok).toEqual(["itm1234567890", "itm1234567891"]);
    });

    it("handles a group where contents require two fetches", async () => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 2,
      };

      fetchMock
        .get(utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=1&num=2&token=fake-token", {
          total: 4,
          start: 1,
          num: 2,
          nextStart: 3,
          items: [
            {
              id: "itm1234567890",
            },
            {
              id: "itm1234567891",
            },
          ],
        })
        .get(utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=3&num=2&token=fake-token", {
          total: 4,
          start: 3,
          num: 2,
          nextStart: -1,
          items: [
            {
              id: "itm1234567892",
            },
            {
              id: "itm1234567893",
            },
          ],
        });

      const ok: string[] = await restHelpersGet._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION);
      expect(ok.length).toEqual(4);
      expect(ok).toEqual(["itm1234567890", "itm1234567891", "itm1234567892", "itm1234567893"]);
    });

    it("handles a group where contents require multiple fetches", async () => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 2,
      };

      fetchMock
        .get(utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=1&num=2&token=fake-token", {
          total: 5,
          start: 1,
          num: 2,
          nextStart: 3,
          items: [
            {
              id: "itm1234567890",
            },
            {
              id: "itm1234567891",
            },
          ],
        })
        .get(utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=3&num=2&token=fake-token", {
          total: 5,
          start: 3,
          num: 2,
          nextStart: 5,
          items: [
            {
              id: "itm1234567892",
            },
            {
              id: "itm1234567893",
            },
          ],
        })
        .get(utils.PORTAL_SUBSET.restUrl + "/content/groups/grp1234567890?f=json&start=5&num=2&token=fake-token", {
          total: 5,
          start: 5,
          num: 1,
          nextStart: -1,
          items: [
            {
              id: "itm1234567894",
            },
          ],
        });

      const ok: string[] = await restHelpersGet._getGroupContentsTranche(groupId, pagingParams, MOCK_USER_SESSION);
      expect(ok.length).toEqual(5);
      expect(ok).toEqual(["itm1234567890", "itm1234567891", "itm1234567892", "itm1234567893", "itm1234567894"]);
    });
  });

  describe("_getItemResourcesTranche", () => {
    it("handles an inaccessible item", async () => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10,
      };

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", mockItems.get400Failure());

      return restHelpersGet._getItemResourcesTranche(itemId, pagingParams, MOCK_USER_SESSION).then(
        () => fail(),
        (ok) => {
          expect(ok.message).toEqual("CONT_0001: Item does not exist or is inaccessible.");
          return Promise.resolve();
        },
      );
    });

    it("handles an item with no resources", async () => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10,
      };

      fetchMock.post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", {
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: [],
      });

      const ok: Array<Promise<File>> = await restHelpersGet._getItemResourcesTranche(
        itemId,
        pagingParams,
        MOCK_USER_SESSION,
      );
      expect(ok.length).toEqual(0);
    });

    it("handles an item with one resource", async () => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10,
      };

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", {
          total: 1,
          start: 1,
          num: 1,
          nextStart: -1,
          resources: [
            {
              resource: "Jackson Lake.png",
              created: 1568662976000,
              size: 1231,
            },
          ],
        })
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        );

      const ok: Array<Promise<File>> = await restHelpersGet._getItemResourcesTranche(
        itemId,
        pagingParams,
        MOCK_USER_SESSION,
      );
      expect(ok.length).toEqual(1);

      return Promise.all(ok);
    });

    it("handles an item with multiple resources where they can be retrieved via a single fetch", async () => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10,
      };

      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", {
          total: 4,
          start: 1,
          num: 4,
          nextStart: -1,
          resources: [
            {
              resource: "Bradley & Taggart Lakes.png",
              created: 1568662976000,
              size: 1231,
            },
            {
              resource: "Jackson Lake.png",
              created: 1568662976000,
              size: 1231,
            },
            {
              resource: "Jenny Lake.png",
              created: 1568662968000,
              size: 1231,
            },
            {
              resource: "Leigh Lake.png",
              created: 1568662960000,
              size: 1231,
            },
          ],
        })
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Bradley%20&%20Taggart%20Lakes.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Jenny%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Leigh%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        );

      const ok: Array<Promise<File>> = await restHelpersGet._getItemResourcesTranche(
        itemId,
        pagingParams,
        MOCK_USER_SESSION,
      );
      expect(ok.length).toEqual(4);

      return Promise.all(ok);
    });

    it("handles an item with multiple resources where they require multiple fetches", async () => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 1,
      };

      const filenames = ["Bradley & Taggart Lakes.png", "Jackson Lake.png", "Jenny Lake.png", "Leigh Lake.png"];
      let imageNum = 0;
      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources", () => {
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
                size: 1231,
              },
            ],
          };
        })
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Bradley%20&%20Taggart%20Lakes.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Jackson%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Jenny%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890/resources/Leigh%20Lake.png",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false },
        );

      const ok: Array<Promise<File>> = await restHelpersGet._getItemResourcesTranche(
        itemId,
        pagingParams,
        MOCK_USER_SESSION,
      );
      expect(ok.length).toEqual(4);

      return Promise.all(ok);
    });
  });

  describe("getPortalDefaultBasemap", function () {
    const basemapGalleryGroupQuery = `title:"United States Basemaps" AND owner:Esri_cy_US`;
    const basemapTitle = "Topographic";
    let searchGroupsResponse: ISearchResult<IGroup>;
    let searchGroupContentsResponse: ISearchResult<IItem>;

    beforeEach(() => {
      searchGroupsResponse = utils.getGroupResponse(
        `title:"United States Basemaps" AND owner:Esri_cy_US`,
        true,
      ) as ISearchResult<IGroup>;
      searchGroupContentsResponse = {
        results: [
          {
            id: "14dba3d96cd94b358dff421661300286",
          },
        ],
      } as ISearchResult<IItem>;
    });

    it("should query for the default basemap group and default basemap", async () => {
      const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(searchGroupsResponse);
      const searchGroupContentsSpy = spyOn(restHelpers, "searchGroupContents").and.resolveTo(
        searchGroupContentsResponse,
      );

      const results = await restHelpersGet.getPortalDefaultBasemap(
        basemapGalleryGroupQuery,
        basemapTitle,
        MOCK_USER_SESSION,
      );
      expect(searchGroupsSpy.calls.count()).toEqual(1);
      expect(searchGroupsSpy.calls.first().args).toEqual([basemapGalleryGroupQuery, MOCK_USER_SESSION, { num: 1 }]);
      expect(searchGroupContentsSpy.calls.count()).toEqual(1);
      expect(searchGroupContentsSpy.calls.first().args).toEqual([
        searchGroupsResponse.results[0].id,
        `title:${basemapTitle}`,
        MOCK_USER_SESSION,
        { num: 1 },
      ]);
      const expected = searchGroupContentsResponse.results[0];
      expect(results).toEqual(expected);
    });

    it("should reject when no group is found", async () => {
      searchGroupsResponse.results = [];
      const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(searchGroupsResponse);

      return restHelpersGet
        .getPortalDefaultBasemap(basemapGalleryGroupQuery, basemapTitle, MOCK_USER_SESSION)
        .then(() => {
          fail("Should have rejected");
        })
        .catch((e) => {
          expect(searchGroupsSpy.calls.count()).toEqual(1);
          expect(searchGroupsSpy.calls.first().args).toEqual([basemapGalleryGroupQuery, MOCK_USER_SESSION, { num: 1 }]);
          expect(e.message).toEqual("No basemap group found");
          return Promise.resolve();
        });
    });

    it("should reject when no basemap is found", async () => {
      searchGroupContentsResponse.results = [];
      const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(searchGroupsResponse);
      const searchGroupContentsSpy = spyOn(restHelpers, "searchGroupContents").and.resolveTo(
        searchGroupContentsResponse,
      );

      return restHelpersGet
        .getPortalDefaultBasemap(basemapGalleryGroupQuery, basemapTitle, MOCK_USER_SESSION)
        .then(() => {
          fail("Should have rejected");
        })
        .catch((e) => {
          expect(searchGroupsSpy.calls.count()).toEqual(1);
          expect(searchGroupsSpy.calls.first().args).toEqual([basemapGalleryGroupQuery, MOCK_USER_SESSION, { num: 1 }]);
          expect(searchGroupContentsSpy.calls.count()).toEqual(1);
          expect(searchGroupContentsSpy.calls.first().args).toEqual([
            searchGroupsResponse.results[0].id,
            `title:${basemapTitle}`,
            MOCK_USER_SESSION,
            { num: 1 },
          ]);
          expect(e.message).toEqual("No basemap found");
          return Promise.resolve();
        });
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //
