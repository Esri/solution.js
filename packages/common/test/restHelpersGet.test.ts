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
    xit("getBlobAsFile", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getBlobCheckForError", () => {
    xit("getBlobCheckForError", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItem", () => {
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
        .getItem(itemId, MOCK_USER_SESSION)
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
        .getItem(itemId, MOCK_USER_SESSION)
        .then((response: any) => {
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("getItemBase", () => {
    xit("getItemBase", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    describe("getItemData", () => {
      it("item doesn't allow access to data", done => {
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
            "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?token=fake-token",
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
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?token=fake-token",
          expected
        );
        restHelpersGet
          .getItemData(itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            done();
          }, done.fail);
      });

      it("item doesn't have data", done => {
        const itemId = "itm1234567890";
        const expected: any = null;

        fetchMock.get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?token=fake-token",
          mockItems.get500Failure()
        );
        restHelpersGet
          .getItemData(itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            done();
          }, done.fail);
      });

      it("item has data", done => {
        const itemId = "itm1234567890";
        const expected = { values: { a: 1, b: "c" } };

        fetchMock.get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/itm1234567890/data?token=fake-token",
          expected
        );
        restHelpersGet
          .getItemData(itemId, MOCK_USER_SESSION)
          .then((response: any) => {
            expect(response).toEqual(expected);
            done();
          }, done.fail);
      });
    });
  }

  describe("getItemDataAsFile", () => {
    xit("getItemDataAsFile", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemDataAsJson", () => {
    xit("getItemDataAsJson", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemDataBlob", () => {
    xit("getItemDataBlob", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemDataBlobUrl", () => {
    xit("getItemDataBlobUrl", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemMetadataAsFile", () => {
    xit("getItemMetadataAsFile", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemMetadataBlob", () => {
    xit("getItemMetadataBlob", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemMetadataBlobUrl", () => {
    xit("getItemMetadataBlobUrl", done => {
      console.warn("========== TODO ==========");
      done.fail();
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
    xit("getItemResourcesFiles", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemThumbnail", () => {
    xit("getItemThumbnail", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getItemThumbnailUrl", () => {
    xit("getItemThumbnailUrl", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getPortalSharingUrlFromAuth", () => {
    xit("getPortalSharingUrlFromAuth", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("getPortalUrlFromAuth", () => {
    xit("getPortalUrlFromAuth", done => {
      console.warn("========== TODO ==========");
      done.fail();
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
          failed => done.fail(),
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

    xit("handles a group where contents can be retrieved via a single fetch", done => {
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
    xit("_getItemResourcesTranche", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //
