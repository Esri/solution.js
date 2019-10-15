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

import * as auth from "@esri/arcgis-rest-auth";
import * as generalHelpers from "../src/generalHelpers";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpersGet from "../src/restHelpersGet";

import * as utils from "./mocks/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../test/mocks/agolItems";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

// Set up a auth.UserSession to use in all these tests
const MOCK_USER_SESSION = new auth.UserSession({
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

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://www.arcgis.com",
  authInfo: {}
};

afterEach(() => {
  fetchMock.restore();
});

describe("Module `restHelpersGet`: common REST fetch functions shared across packages", () => {
  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("getBlob", () => {
      it("can get a blob from a URL", done => {
        const url: string = "https://myserver/images/thumbnail.png";

        const getUrl = "https://myserver/images/thumbnail.png";
        const expectedServerInfo = SERVER_INFO;
        const expected = mockItems.getAnImageResponse();
        fetchMock
          .post("https://www.arcgis.com/sharing/rest/info", expectedServerInfo)
          .post(getUrl + "/rest/info", expectedServerInfo)
          .post(getUrl, expected, { sendAsJson: false });

        restHelpersGet.getBlob(url, MOCK_USER_SESSION).then(response => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
      });
    });
  }

  describe("getBlobAsFile", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("should ignore ignorable error", done => {
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token";
        fetchMock.post(url, {
          error: {
            code: 400,
            messageCode: "CONT_0004",
            message: "Item does not exist or is inaccessible.",
            details: []
          }
        });
        restHelpersGet
          .getBlobAsFile(url, "myFile.png", MOCK_USER_SESSION, [400])
          .then(file => {
            expect(file).toBeUndefined();
            done();
          }, done.fail);
      });

      it("should use supplied filename", done => {
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token";
        fetchMock.post(url, mockItems.getAnImageResponse(), {
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
    }
  });

  describe("getBlobCheckForError", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("should pass through an image file", done => {
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token";
        fetchMock.post(url, mockItems.getAnImageResponse(), {
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token";
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
        restHelpersGet
          .getBlobCheckForError(url, MOCK_USER_SESSION)
          .then(blob => {
            expect(blob).not.toBeUndefined();
            expect(blob.type).toEqual("application/json");
            done();
          }, done.fail);
      });

      it("should handle bad JSON by passing it through", done => {
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token";
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token";
        fetchMock.post(url, {
          error: {
            code: 400,
            messageCode: "CONT_0004",
            message: "Item does not exist or is inaccessible.",
            details: []
          }
        });
        restHelpersGet
          .getBlobCheckForError(url, MOCK_USER_SESSION, [400])
          .then(blob => {
            expect(blob).toBeUndefined();
            done();
          }, done.fail);
      });

      it("should return significant error", done => {
        const url =
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token";
        fetchMock.post(url, {
          error: {
            code: 400,
            messageCode: "CONT_0004",
            message: "Item does not exist or is inaccessible.",
            details: []
          }
        });
        restHelpersGet.getBlobCheckForError(url, MOCK_USER_SESSION, [500]).then(
          () => done.fail(),
          response => {
            expect(response).not.toBeUndefined();
            expect(response.error.code).toEqual(400);
            done();
          }
        );
      });
    }
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token",
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
            portal: "https://myorg.maps.arcgis.com/sharing/rest",
            tokenDuration: 20160,
            redirectUri: "https://example-app.com/redirect-uri",
            refreshTokenTTL: 1440
          },
          headers: {}
        }
      };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890?f=json&token=fake-token",
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
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("handles item without a data section", done => {
        const itemId = "itm1234567890";
        const url = restHelpersGet.getItemDataBlobUrl(
          itemId,
          MOCK_USER_SESSION
        );
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
          .then((json: any) => {
            expect(json).toBeUndefined();
            done();
          }, done.fail);
      });

      it("gets data section that's an image", done => {
        const itemId = "itm1234567890";
        const url = restHelpersGet.getItemDataBlobUrl(
          itemId,
          MOCK_USER_SESSION
        );
        fetchMock.post(url, mockItems.getAnImageResponse(), {
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
    }
  });

  describe("getItemDataAsJson", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("handles item without a data section", done => {
        const itemId = "itm1234567890";
        const url = restHelpersGet.getItemDataBlobUrl(
          itemId,
          MOCK_USER_SESSION
        );
        fetchMock.post(url, {
          error: {
            code: 500,
            messageCode: "CONT_0004",
            message: "Item does not exist or is inaccessible.",
            details: []
          }
        });
        restHelpersGet
          .getItemDataAsJson(itemId, MOCK_USER_SESSION)
          .then((json: any) => {
            expect(json).toBeUndefined();
            done();
          }, done.fail);
      });

      it("get data section that's JSON", done => {
        const itemId = "itm1234567890";
        const url = restHelpersGet.getItemDataBlobUrl(
          itemId,
          MOCK_USER_SESSION
        );
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
        restHelpersGet
          .getItemDataAsJson(itemId, MOCK_USER_SESSION)
          .then(json => {
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
          url:
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data",
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
              portal: "https://myorg.maps.arcgis.com/sharing/rest",
              tokenDuration: 20160,
              redirectUri: "https://example-app.com/redirect-uri",
              refreshTokenTTL: 1440
            },
            headers: {}
          }
        };

        fetchMock.post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data",
          expected
        );
        restHelpersGet
          .getItemDataAsJson(itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            done();
          }, done.fail);
      });
    }
  });

  describe("getItemDataBlobUrl", () => {
    it("gets the data blob url from the authentication", () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemDataBlobUrl(itemId, MOCK_USER_SESSION);
      expect(url).toEqual(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data"
      );
    });
  });

  describe("getItemMetadataAsFile", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("handles item without metadata", done => {
        const itemId = "itm1234567890";
        const url = restHelpersGet.getItemMetadataBlobUrl(
          itemId,
          MOCK_USER_SESSION
        );
        fetchMock.post(url, {
          error: {
            code: 400,
            messageCode: "CONT_0004",
            message: "Item does not exist or is inaccessible.",
            details: []
          }
        });
        restHelpersGet
          .getItemMetadataAsFile(itemId, MOCK_USER_SESSION)
          .then((json: any) => {
            expect(json).toBeUndefined();
            done();
          }, done.fail);
      });

      it("gets metadata", done => {
        const itemId = "itm1234567890";
        const url = restHelpersGet.getItemMetadataBlobUrl(
          itemId,
          MOCK_USER_SESSION
        );
        fetchMock.post(url, utils.getSampleMetadata(), {
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
    }
  });

  describe("getItemMetadataBlobUrl", () => {
    it("gets the metadata blob url from the authentication", () => {
      const itemId = "itm1234567890";
      const url = restHelpersGet.getItemMetadataBlobUrl(
        itemId,
        MOCK_USER_SESSION
      );
      expect(url).toEqual(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/info/metadata/metadata.xml"
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/relatedItems" +
          "?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/relatedItems" +
          "?f=json&direction=reverse&relationshipTypes=Survey2Service%2CService2Service&token=fake-token",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/relatedItems" +
          "?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
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
  });

  describe("getItemResourcesFiles", () => {
    it("handles an inaccessible item", done => {
      const itemId = "itm1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.post(
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
        {
          error: {
            code: 400,
            messageCode: "CONT_0001",
            message: "Item does not exist or is inaccessible.",
            details: []
          }
        }
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

    // File is only available in the browser
    if (typeof window !== "undefined") {
      it("handles an item with no resources", done => {
        const itemId = "itm1234567890";
        const pagingParams: portal.IPagingParams = {
          start: 1, // one-based
          num: 10
        };

        fetchMock.post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Jackson%20Lake.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          );
        restHelpersGet
          .getItemResourcesFiles(itemId, MOCK_USER_SESSION)
          .then((ok: File[]) => {
            expect(ok.length).toEqual(1);
            done();
          }, done.fail);
      });
    }
  });

  describe("getItemThumbnail", () => {
    it("handle missing thumbnail for an item", done => {
      restHelpersGet
        .getItemThumbnail("itm1234567890", null, false, MOCK_USER_SESSION)
        .then((ok: Blob) => {
          expect(ok).toBeUndefined();
          done();
        }, done.fail);
    });

    // Function atob is only available in the browser
    if (typeof window !== "undefined") {
      it("get thumbnail for an item", done => {
        fetchMock.post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/info/thumbnail/ago_downloaded.png",
          utils.getSampleImage(),
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
    }
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/info/thumbnail/ago_downloaded.png"
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
        "https://myorg.maps.arcgis.com/sharing/rest/community/groups/grp1234567890/info/thumbnail/ago_downloaded.png"
      );
    });
  });

  describe("getPortalSharingUrlFromAuth", () => {
    it("gets a default portal sharing url with authentication but no portal", () => {
      const mockUserSession = new auth.UserSession({
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
      ).toEqual("https://myorg.maps.arcgis.com/sharing/rest");
    });
  });

  describe("getPortalUrlFromAuth", () => {
    it("gets a default portal url with authentication but no portal", () => {
      const mockUserSession = new auth.UserSession({
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

  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
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
        const testBlob = utils.getSampleImage();
        restHelpersGet._fixTextBlobType(testBlob).then((ok: Blob) => {
          expect(ok.type).toEqual(testBlobType);
          done();
        }, done.fail);
      });

      it("should pass text/xml blobs through unchanged", done => {
        const testBlobType = "text/xml";
        const testBlob = utils.getSampleMetadata();
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
        const testBlob = utils.getSampleMetadata(testBlobType);
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
  }

  describe("_getGroupContentsTranche", () => {
    it("handles an inaccessible group", done => {
      const groupId = "grp1234567890";
      const pagingParams: portal.IPagingParams = {
        start: 1, // one-based
        num: 10
      };

      fetchMock.get(
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=10&token=fake-token",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=2&token=fake-token",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=3&num=2&token=fake-token",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=1&num=2&token=fake-token",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=3&num=2&token=fake-token",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890?f=json&start=5&num=2&token=fake-token",
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
        {
          error: {
            code: 400,
            messageCode: "CONT_0001",
            message: "Item does not exist or is inaccessible.",
            details: []
          }
        }
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
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
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

    // Function atob is only available in the browser
    if (typeof window !== "undefined") {
      it("handles an item with one resource", done => {
        const itemId = "itm1234567890";
        const pagingParams: portal.IPagingParams = {
          start: 1, // one-based
          num: 10
        };

        fetchMock
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Jackson%20Lake.png",
            utils.getSampleImage(),
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Bradley%20&%20Taggart%20Lakes.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Jackson%20Lake.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Jenny%20Lake.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Leigh%20Lake.png",
            utils.getSampleImage(),
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources",
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Bradley%20&%20Taggart%20Lakes.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Jackson%20Lake.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Jenny%20Lake.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          )
          .post(
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/resources/Leigh%20Lake.png",
            utils.getSampleImage(),
            { sendAsJson: false }
          );
        restHelpersGet
          ._getItemResourcesTranche(itemId, pagingParams, MOCK_USER_SESSION)
          .then((ok: Array<Promise<File>>) => {
            expect(ok.length).toEqual(4);
            Promise.all(ok).then(rsrcResponses => done(), done.fail);
          }, done.fail);
      });
    }
  });
});

// ------------------------------------------------------------------------------------------------------------------ //
