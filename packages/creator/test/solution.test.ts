/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import * as request from "@esri/arcgis-rest-request";
import { UserSession, IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";

import * as mClassifier from "../src/itemTypes/classifier";
import * as mCommon from "../src/itemTypes/common";
import * as mFeatureService from "../src/itemTypes/featureservice";
import * as mGroup from "../src/itemTypes/group";
import * as mInterfaces from "../src/interfaces";
import * as mItemHelpers from "../src/utils/item-helpers";
import * as mSolution from "../src/solution";
import * as mWebMap from "../src/itemTypes/webmap";

import {
  TOMORROW,
  setMockDateTime,
  createRuntimeMockUserSession,
  createMockSettings,
  removeItemFcns,
  checkForArcgisRestSuccessRequestError,
  ArcgisRestSuccessFailSimple,
  ArcgisRestSuccessFailStruct
} from "./lib/utils";
import { ICustomArrayLikeMatchers, CustomMatchers } from "./customMatchers";
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/agolItems";
import * as mockSolutions from "./mocks/templates";

// -------------------------------------------------------------------------------------------------------------------//

describe("Module `solution`: generation, publication, and cloning of a solution item", () => {
  const MOCK_ITEM_PROTOTYPE: mInterfaces.ITemplate = {
    itemId: "",
    type: "",
    key: "",
    item: null
  };

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
    authentication: MOCK_USER_SESSION,
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  };

  const orgUrl = "https://myOrg.maps.arcgis.com";
  const portalUrl = "https://www.arcgis.com";

  beforeEach(() => {
    jasmine.addMatchers(CustomMatchers);
  });

  afterEach(() => {
    fetchMock.restore();
    jasmine.clock().uninstall();
  });

  /**
   * Short-circuits request.request call if a png is being requested so that faked result format matches
   * real query format.
   *
   * @param fakeResponse Response to be used for the faked request for the png
   */
  function setUpImageRequestSpy(fakeResponse?: any) {
    // Intercept request.request calls
    const realRequest = request.request;
    spyOn(request, "request").and.callFake(
      (url: string, requestOptions: any) => {
        if (url.endsWith(".png")) {
          // Go ahead with faking the call to request
          return new Promise((resolve, reject) => {
            if (!fakeResponse) {
              // If a response wasn't supplied, return an object with a blob-fetching function
              resolve({
                blob: () => {
                  // Return the blob in response to the call
                  return new Promise(resolve2 => {
                    resolve2(mockItems.getAnImageResponse());
                  });
                }
              });
            } else {
              reject(fakeResponse);
            }
          });
        } else {
          // Skip fake; use real request instead
          return realRequest(url, requestOptions);
        }
      }
    );
  }

  /**
   * Short-circuits request.request call if a png is being requested so that faked result format matches
   * real query format.
   *
   * @param fakeResponse Response to be used for extracting the blob from the png
   */
  function setUpImageRequestSpyBadBlob(fakeResponse: any) {
    // Intercept request.request calls
    const realRequest = request.request;
    spyOn(request, "request").and.callFake(
      (url: string, requestOptions: any) => {
        if (url.endsWith(".png")) {
          // Go ahead with faking the call to request
          return new Promise((resolve, reject) => {
            // Return an object with a blob-fetching function
            resolve({
              blob: () => {
                // Return a failure to extract the blob
                return new Promise((resolve2, reject2) => {
                  reject2(fakeResponse);
                });
              }
            });
          });
        } else {
          // Skip fake; use real request instead
          return realRequest(url, requestOptions);
        }
      }
    );
  }

  describe("create solution", () => {
    it("for single item containing webmap WMA & feature service", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("one png")
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/resources/anImage.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem("title", "x", "wma1234567890", MOCK_USER_REQOPTS)
        .then(
          (response: mInterfaces.ISolutionItem) => {
            removeItemFcns(response); // don't want to compare item-specific fcns
            const template = mockSolutions.getWebMappingApplicationTemplate();
            template[0].resources = [
              "https://myorg.maps.arcgis.com/sharing/rest/content/items/wma1234567890/resources/anImage.png"
            ];
            expect(response).toEqual(
              mockSolutions.getSolutionTemplateItem(template)
            );
            done();
          },
          error => done.fail(error)
        );
    });

    it("for single item containing group WMA & feature service", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemDataWMAGroup()
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("one png")
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/resources/anImage.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem("title", "x", "wma1234567890", MOCK_USER_REQOPTS)
        .then(
          (response: mInterfaces.ISolutionItem) => {
            removeItemFcns(response); // don't want to compare item-specific fcns
            const template = mockSolutions.getWebMappingApplicationTemplateGroup();
            expect(response).toEqual(
              mockSolutions.getSolutionTemplateItem(template)
            );
            done();
          },
          error => done.fail(error)
        );
    });

    it("for single item containing WMA without URL, folderId, webmap, or group", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      const wma = mockItems.getAGOLItem("Web Mapping Application");
      wma.url = null;

      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock("path:/sharing/rest/content/items/wma1234567890", wma)
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemDataWMANoWebmapOrGroup()
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources()
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem("title", "x", "wma1234567890", MOCK_USER_REQOPTS)
        .then(
          (response: mInterfaces.ISolutionItem) => {
            removeItemFcns(response); // don't want to compare item-specific fcns
            const template = mockSolutions.getWebMappingApplicationTemplateNoWebmapOrGroup();
            const solution = mockSolutions.getSolutionTemplateItem(template);
            solution.data.templates[0].item.url = null; // WMA doesn't have a URL in this case
            expect(response).toEqual(solution);
            done();
          },
          error => done.fail(error)
        );
    });

    it("for a group", done => {
      spyOn(mItemHelpers, "createId").and.callFake(() => {
        return "i1a2b3c4";
      });
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/grp1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/community/groups/grp1234567890",
          mockItems.getAGOLGroup()
        )
        .post(
          "path:/sharing/rest/community/groups/grp1234567890/info/ROWPermitManager.png",
          200
        )
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=1&num=100&token=fake-token",
          '{"total":0,"start":1,"num":0,"nextStart":-1,"items":[]}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem("title", "x", "grp1234567890", MOCK_USER_REQOPTS)
        .then(
          (response: mInterfaces.ISolutionItem) => {
            removeItemFcns(response); // don't want to compare item-specific fcns
            expect(response).toEqual(
              mockSolutions.getSolutionTemplateItem([
                mockSolutions.getGroupTemplatePart()
              ])
            );
            done();
          },
          error => done.fail(error)
        );
    });
  });

  describe("publish solution", () => {
    it("for single item containing WMA & feature service", done => {
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        );
      mSolution
        .publishSolutionTemplate(
          "My Solution",
          mockSolutions.getWebMappingApplicationTemplate(),
          MOCK_USER_REQOPTS
        )
        .then(
          response => {
            expect(response).toEqual({
              success: true,
              id: "sln1234567890"
            });
            done();
          },
          error => done.fail(error)
        );
    });

    it("for single item containing WMA & feature service, but item add fails", done => {
      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get400Failure()
      );
      mSolution
        .publishSolutionTemplate(
          "My Solution",
          mockSolutions.getWebMappingApplicationTemplate(),
          MOCK_USER_REQOPTS
        )
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("for single item containing WMA & feature service, but share as public fails", done => {
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          mockItems.get400Failure()
        );
      mSolution
        .publishSolutionTemplate(
          "My Solution",
          mockSolutions.getWebMappingApplicationTemplate(),
          MOCK_USER_REQOPTS,
          null,
          "public"
        )
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });
  });

  describe("deploy solution", () => {
    it("should handle a missing solution", done => {
      mSolution
        .deploySolutionItem(null, MOCK_USER_REQOPTS)
        .then(done, done.fail);
    });

    it("should handle an empty, nameless solution", done => {
      const settings = createMockSettings();
      mSolution
        .deploySolutionItem(
          mockSolutions.getSolutionTemplateItem(),
          MOCK_USER_REQOPTS,
          settings
        )
        .then(done, done.fail);
    });

    it("should handle failure to create solution's folder", done => {
      const solutionItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem(
        mockSolutions.getWebMappingApplicationTemplate()
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/createFolder",
        mockItems.get400Failure()
      );
      mSolution
        .deploySolutionItem(solutionItem, sessionWithMockedTime, settings)
        .then(() => done.fail(), () => done());
    });

    it("should clone a solution using a generated folder", done => {
      const solutionItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem(
        mockSolutions.getWebMappingApplicationTemplate()
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      // Provide different results for same route upon subsequent call
      const addItemUpdater = (() => {
        let stepNum = 0;
        return () =>
          [
            '{"success":true,"id":"map1234567890","folder":"fld1234567890"}',
            '{"success":true,"id":"wma1234567890","folder":"fld1234567890"}',
            '{"success":true,"id":"sto1234567890","folder":"fld1234567890"}'
          ][stepNum++];
      })();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createFolder",
          '{"success":true,"folder":{"username":"casey","id":"fld1234567890","title":"Solution (' +
            expected +
            ')"}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/fld1234567890/addItem",
          addItemUpdater
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/update",
          '{"success":true,"id":"wma1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sto1234567890/update",
          '{"success":true,"id":"sto1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/share",
          '{"notSharedWith":[],"itemId":"wma1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/share",
          '{"notSharedWith":[],"itemId":"map1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sto1234567890/share",
          '{"notSharedWith":[],"itemId":"sto1234567890"}'
        );
      mSolution
        .deploySolutionItem(solutionItem, sessionWithMockedTime, settings)
        .then(
          response => {
            expect(response.length).toEqual(3);
            done();
          },
          error => done.fail(error)
        );
    });

    it("for single item containing WMA without a data section", done => {
      const solutionItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem(
        mockSolutions.getWebMappingApplicationTemplateNoWebmapOrGroup()
      );
      delete solutionItem.data.templates[0].data;
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createFolder",
          '{"success":true,"folder":{"username":"casey","id":"fld1234567890","title":"Solution (' +
            expected +
            ')"}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/fld1234567890/addItem",
          '{"success":true,"id":"wma1234567890","folder":"fld1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/update",
          '{"success":true,"id":"wma1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/share",
          '{"notSharedWith":[],"itemId":"wma1234567890"}'
        );
      mSolution
        .deploySolutionItem(solutionItem, sessionWithMockedTime, settings)
        .then(
          response => {
            expect(response.length).toEqual(1);
            expect(response[0].data).toBeUndefined();
            done();
          },
          error => done.fail(error)
        );
    });

    it("handle failure to create a single item containing WMA without a data section", done => {
      const solutionItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem(
        mockSolutions.getWebMappingApplicationTemplateNoWebmapOrGroup()
      );
      delete solutionItem.data.templates[0].data;
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createFolder",
          '{"success":true,"folder":{"username":"casey","id":"fld1234567890","title":"Solution (' +
            expected +
            ')"}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/fld1234567890/addItem",
          mockItems.get400Failure()
        );
      mSolution
        .deploySolutionItem(solutionItem, sessionWithMockedTime, settings)
        .then(() => done.fail(), () => done());
    });

    it("should clone a solution using a supplied folder and supplied solution name and progress callback", done => {
      const solutionItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem(
        mockSolutions.getWebMappingApplicationTemplate()
      );
      const folderId = "FLD1234567890";
      const settings = createMockSettings("My Solution", folderId);
      function progressCallback(update: any): void {
        expect(update.processId).toBeDefined();
      }

      // Test a code path
      solutionItem.data.templates[2].dependencies = null;

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      // Provide different results for same route upon subsequent call
      const addItemUpdater = (() => {
        let stepNum = 0;
        return () =>
          [
            '{"success":true,"id":"map1234567890","folder":"FLD1234567890"}',
            '{"success":true,"id":"wma1234567890","folder":"FLD1234567890"}',
            '{"success":true,"id":"sto1234567890","folder":"FLD1234567890"}'
          ][stepNum++];
      })();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createFolder",
          '{"success":true,"folder":{"username":"casey","id":"' +
            folderId +
            '","title":"' +
            folderId +
            '"}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/createService",
          '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
            folderId +
            '/FeatureServer","itemId":"svc1234567890",' +
            '"name":"' +
            folderId +
            '","serviceItemId":"svc1234567890",' +
            '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
            folderId +
            '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"' +
            folderId +
            '"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/" +
            folderId +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/" +
            folderId +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/" +
            folderId +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/" + folderId + "/addItem",
          addItemUpdater
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/update",
          '{"success":true,"id":"wma1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/update",
          '{"success":true,"id":"map1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sto1234567890/update",
          '{"success":true,"id":"sto1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/share",
          '{"notSharedWith":[],"itemId":"wma1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/share",
          '{"notSharedWith":[],"itemId":"map1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sto1234567890/share",
          '{"notSharedWith":[],"itemId":"sto1234567890"}'
        );
      mSolution
        .deploySolutionItem(
          solutionItem,
          MOCK_USER_REQOPTS,
          settings,
          progressCallback
        )
        .then(
          response => {
            expect(response.length).toEqual(3);
            done();
          },
          error => done.fail(error)
        );
    });

    it("should clone a solution using a supplied folder, but handle failed storymap", done => {
      const solutionItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem(
        mockSolutions.getWebMappingApplicationTemplate()
      );
      const folderId = "FLD1234567890";
      const settings = createMockSettings(undefined, folderId, "org");

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      // Provide different results for same route upon subsequent call
      const addItemUpdater = (() => {
        let stepNum = 0;
        return () =>
          [
            '{"success":true,"id":"map1234567890","folder":"FLD1234567890"}',
            '{"success":true,"id":"wma1234567890","folder":"FLD1234567890"}',
            mockItems.get400Failure()
          ][stepNum++];
      })();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createFolder",
          '{"success":true,"folder":{"username":"casey","id":"' +
            folderId +
            '","title":"' +
            folderId +
            '"}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/createService",
          '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
            folderId +
            '/FeatureServer","itemId":"svc1234567890",' +
            '"name":"' +
            folderId +
            '","serviceItemId":"svc1234567890",' +
            '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
            folderId +
            '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"' +
            folderId +
            '"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/" +
            folderId +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/" +
            folderId +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/" +
            folderId +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/" + folderId + "/addItem",
          addItemUpdater
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/update",
          '{"success":true,"id":"map1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/update",
          '{"success":true,"id":"wma1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/share",
          '{"notSharedWith":[],"itemId":"map1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/share",
          '{"notSharedWith":[],"itemId":"wma1234567890"}'
        );
      mSolution
        .deploySolutionItem(solutionItem, MOCK_USER_REQOPTS, settings)
        .then(() => done.fail(), () => done());
    });

    it("should handle failure to create a contained item", done => {
      const solutionItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem(
        mockSolutions.getWebMappingApplicationTemplate()
      );
      const folderId = "FLD1234567890";
      const settings = createMockSettings(undefined, folderId);

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createFolder",
          '{"success":true,"folder":{"username":"casey","id":"' +
            folderId +
            '","title":"' +
            folderId +
            '"}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/FLD1234567890/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/createService",
          mockItems.get400Failure()
        );
      mSolution
        .deploySolutionItem(solutionItem, MOCK_USER_REQOPTS, settings)
        .then(() => done.fail(), () => done());
    });
  });

  describe("supporting routine: create item", () => {
    it("should create a Generic in the root folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Unsupported")
      );
      const settings = createMockSettings();
      function progressCallback(update: any): void {
        expect(update.processId).toEqual(itemTemplate.key);
      }

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"GEN1234567890","folder":null}'
      );
      itemTemplate.fcns
        .createItemFromTemplate(
          itemTemplate,
          settings,
          MOCK_USER_REQOPTS,
          progressCallback
        )
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("GEN1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a Dashboard in the root folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Dashboard")
      );
      const settings = createMockSettings();
      function progressCallback(update: any): void {
        expect(update.processId).toEqual(itemTemplate.key);
      }

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"DSH1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
          '{"success":true,"id":"DSH1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(
          itemTemplate,
          settings,
          MOCK_USER_REQOPTS,
          progressCallback
        )
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("DSH1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a Dashboard in a specified folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Dashboard")
      );
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/fld1234567890/addItem",
          '{"success":true,"id":"DSH1234567890","folder":"fld1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
          '{"success":true,"id":"DSH1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("DSH1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a mapless Dashboard", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getDashboardTemplatePartNoWidgets()
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"DSH1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
          '{"success":true,"id":"DSH1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("DSH1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a dataless Dashboard", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getTemplatePartNoData("Dashboard")
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"DSH1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
          '{"success":true,"id":"DSH1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("DSH1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a dataless Web Map", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getTemplatePartNoData("Web Map")
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"MAP1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/MAP1234567890/update",
          '{"success":true,"id":"MAP1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("MAP1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a dataless Web Mapping Application", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getTemplatePartNoData("Web Mapping Application")
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"WMA1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/WMA1234567890/update",
          '{"success":true,"id":"WMA1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("WMA1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should handle failure to create a Dashboard 200", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getDashboardTemplatePartNoWidgets()
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get200Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(error).toEqual(ArcgisRestSuccessFailSimple);
            done();
          }
        );
    });

    it("should handle failure to create a Dashboard 400", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getDashboardTemplatePartNoWidgets()
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get400Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should handle failure to update Dashboard URL", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getDashboardTemplatePartNoWidgets()
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"DSH1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/DSH1234567890/update",
          mockItems.get400Failure()
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should create an unsupported item in the root folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Unsupported")
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"unk1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/unk1234567890/update",
          '{"success":true,"id":"unk1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("unk1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should handle failure to create an unsupported item 200", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Unsupported")
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get200Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(error).toEqual(ArcgisRestSuccessFailSimple);
            done();
          }
        );
    });

    it("should handle failure to create an unsupported item 400", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Unsupported")
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get400Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should create Web Map in the root folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Map")
      );
      const settings = createMockSettings();
      function progressCallback(update: any): void {
        expect(update.processId).toEqual(itemTemplate.key);
      }

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"map1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/update",
          '{"success":true,"id":"map1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(
          itemTemplate,
          settings,
          MOCK_USER_REQOPTS,
          progressCallback
        )
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("map1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should handle failure to update Web Map URL", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Map")
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"map1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/update",
          mockItems.get400Failure()
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should handle failure to create Web Map 200", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Map")
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get200Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(error).toEqual(ArcgisRestSuccessFailSimple);
            done();
          }
        );
    });

    it("should handle failure to create Web Map 400", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Map")
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get400Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should handle failure to create Web Mapping Application 200", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Mapping Application")
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get200Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(error).toEqual(ArcgisRestSuccessFailSimple);
            done();
          }
        );
    });

    it("should handle failure to create Web Mapping Application 400", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Mapping Application")
      );
      const settings = createMockSettings();

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get400Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should create a Feature Service", done => {
      const templatePart = mockSolutions.getItemTemplatePart("Feature Service");
      const itemTemplate = mClassifier.initItemTemplateFromJSON(templatePart);
      const settings = createMockSettings();
      function progressCallback(update: any): void {
        expect(update.processId).toEqual(itemTemplate.key);
      }
      settings.folderId = "fld1234567890";

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      const templateItemId = templatePart.itemId as string;
      const expectedCreatedItemId = templateItemId.toUpperCase();
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
          '{"encodedServiceURL":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/' +
            "ROWPermits_publiccomment_" +
            now +
            '/FeatureServer","itemId":"SVC1234567890",' +
            '"name":"ROWPermits_publiccomment_' +
            now +
            '","serviceItemId":"SVC1234567890",' +
            '"serviceurl":"https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment_' +
            now +
            '/FeatureServer","size":-1,"success":true,"type":"Feature Service","isView":false}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/SVC1234567890/move",
          '{"success":true,"itemId":"SVC1234567890","owner":"casey","folder":"fld1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/SVC1234567890/update",
          '{"success":true,"id":"SVC1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(
          itemTemplate,
          settings,
          sessionWithMockedTime,
          progressCallback
        )
        .then(
          createdItem => {
            // Check that we're appending a timestamp to the service name
            const createServiceCall = fetchMock.calls(
              "path:/sharing/rest/content/users/casey/createService"
            );
            const createServiceCallBody = createServiceCall[0][1]
              .body as string;
            expect(
              createServiceCallBody.indexOf(
                "name%22%3A%22Name%20of%20an%20AGOL%20item_" +
                  expected +
                  "%22%2C"
              )
            ).toBeGreaterThan(0);

            expect(settings[templateItemId].id as string).toEqual(
              expectedCreatedItemId
            );
            expect(createdItem.item.id as string).toEqual(
              expectedCreatedItemId
            );
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a Feature Service without a data section", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getTemplatePartNoData("Feature Service")
      );
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"SVC1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(
          createdItem => {
            // Check that we're appending a timestamp to the service name
            const createServiceCall = fetchMock.calls(
              "path:/sharing/rest/content/users/casey/createService"
            );
            const createServiceCallBody = createServiceCall[0][1]
              .body as string;
            expect(
              createServiceCallBody.indexOf(
                "name%22%3A%22Name%20of%20an%20AGOL%20item_" +
                  expected +
                  "%22%2C"
              )
            ).toBeGreaterThan(0);
            expect(createdItem.itemId).toEqual("svc1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a Feature Service without relationships", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getFeatureServiceTemplatePartNoRelationships()
      );
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/move",
          '{"success":true,"itemId":"svc1234567890","owner":"casey","folder":"fld1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"SVC1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(
          createdItem => {
            // Check that we're appending a timestamp to the service name
            const createServiceCall = fetchMock.calls(
              "path:/sharing/rest/content/users/casey/createService"
            );
            const createServiceCallBody = createServiceCall[0][1]
              .body as string;
            expect(
              createServiceCallBody.indexOf(
                "name%22%3A%22Name%20of%20an%20AGOL%20item_" +
                  expected +
                  "%22%2C"
              )
            ).toBeGreaterThan(0);
            expect(createdItem.itemId).toEqual("svc1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should handle an error while trying to create a Feature Service 200", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Feature Service")
      );
      itemTemplate.item.url = null;
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/createService",
        mockItems.get200Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(() => done.fail(), () => done());
    });

    it("should handle an error while trying to create a Feature Service 400", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Feature Service")
      );
      itemTemplate.item.url = null;
      const settings = createMockSettings();
      settings.folderId = "fld1234567890";

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/createService",
        mockItems.get400Failure()
      );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(() => done.fail(), () => done());
    });

    it("should create a Feature Service and handle failure to add layers|tables", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Feature Service")
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          mockItems.get400Failure()
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(() => done.fail(), () => done());
    });

    it("should handle Feature Service failure to update service", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Feature Service")
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      // Feature layer indices are assigned incrementally as they are added to the feature service
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          mockItems.get400Failure()
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(() => done.fail(), () => done());
    });

    it("should handle Feature Service failure to update first layers|tables relationship in chain", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Feature Service")
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      // Feature layer indices are assigned incrementally as they are added to the feature service
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/0/addToDefinition",
          mockItems.get400Failure()
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(() => done.fail(), () => done());
    });

    it("should handle Feature Service failure to update second layers|tables relationship in chain", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Feature Service")
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      // Feature layer indices are assigned incrementally as they are added to the feature service
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/1/addToDefinition",
          mockItems.get400Failure()
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(() => done.fail(), () => done());
    });

    it("should handle Feature Service with four layers|tables relationship", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getFourItemFeatureServiceTemplatePart()
      );
      const settings = createMockSettings();

      // Verify template layers|tables ordering
      expect(itemTemplate.data.layers.length).toEqual(3);
      expect(
        itemTemplate.data.layers.map((item: any) => item.popupInfo.title)
      ).toEqual(["layer 0", "layer 2", "layer 3"]);

      expect(itemTemplate.data.tables.length).toEqual(1);
      expect(
        itemTemplate.data.tables.map((item: any) => item.popupInfo.title)
      ).toEqual(["table 1"]);

      expect(itemTemplate.properties.service.layers.length).toEqual(3);
      expect(
        itemTemplate.properties.service.layers.map((item: any) => item.name)
      ).toEqual(["ROW Permits", "ROW Permits layer 2", "ROW Permits layer 3"]);

      expect(itemTemplate.properties.service.tables.length).toEqual(1);
      expect(
        itemTemplate.properties.service.tables.map((item: any) => item.name)
      ).toEqual(["ROW Permit Comment"]);

      expect(itemTemplate.properties.layers.length).toEqual(3);
      expect(
        itemTemplate.properties.layers.map((item: any) => item.name)
      ).toEqual(["ROW Permits", "ROW Permits layer 2", "ROW Permits layer 3"]);

      expect(itemTemplate.properties.tables.length).toEqual(1);
      expect(
        itemTemplate.properties.tables.map((item: any) => item.name)
      ).toEqual(["ROW Permit Comment"]);

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          '{"success":true,"layers":[{"name":"ROW Permits","id":' +
          layerNum++ +
          "}]}";
      })();

      // Feature layer indices are assigned incrementally as they are added to the feature service
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/0/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/1/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/2/addToDefinition",
          '{"success":true}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/3/addToDefinition",
          '{"success":true}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(
          response => {
            // Verify order of layers|tables adding
            const addToDefinitionCalls = fetchMock.calls(
              "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
                now +
                "/FeatureServer/addToDefinition"
            );
            expect(
              addToDefinitionCalls.map((call: any) => {
                // Each call record is [url, options], where options has method, credentials, body, headers properties
                const body = call[1].body as string;

                const iIdStart =
                  body.indexOf("%2C%22id%22%3A") + "%2C%22id%22%3A".length;
                const iIdEnd = body.indexOf("%2C", iIdStart);

                const iNameStart =
                  body.indexOf("%2C%22name%22%3A%22") +
                  "%2C%22name%22%3A%22".length;
                const iNameEnd = body.indexOf("%22%2C", iNameStart);

                return (
                  body.substring(iIdStart, iIdEnd) +
                  ":" +
                  body.substring(iNameStart, iNameEnd)
                );
              })
            ).toEqual([
              "0:ROW%20Permits",
              "1:ROW%20Permit%20Comment",
              "2:ROW%20Permits%20layer%202",
              "3:ROW%20Permits%20layer%203"
            ]);

            done();
          },
          () => done.fail()
        );
    });

    it("should handle Feature Service failure to update third layers|tables relationship in chain", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getFourItemFeatureServiceTemplatePart()
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      // Feature layer indices are assigned incrementally as they are added to the feature service
      const layerNumUpdater = (() => {
        let layerNum = 0;
        return () =>
          layerNum++ === 2
            ? mockItems.get400Failure()
            : '{"success":true,"layers":[{"name":"ROW Permits","id":' +
              layerNum +
              "}]}";
      })();

      // Feature layer indices are assigned incrementally as they are added to the feature service
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/createService",
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
          "path:/sharing/rest/content/users/casey/items/svc1234567890/update",
          '{"success":true,"id":"svc1234567890"}'
        )
        .post(
          "path:/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment_" +
            now +
            "/FeatureServer/addToDefinition",
          layerNumUpdater
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, sessionWithMockedTime)
        .then(() => done.fail(), () => done());
    });

    it("should handle service without any layers or tables", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Feature Service")
      );
      itemTemplate.properties.service.layers = null;
      itemTemplate.properties.service.tables = null;
      itemTemplate.properties.layers = null;
      itemTemplate.properties.tables = null;

      mFeatureService
        .addFeatureServiceLayersAndTables(
          itemTemplate,
          {},
          MOCK_USER_REQOPTS,
          {}
        )
        .then(() => done(), error => done.fail(error));
    });

    it("should create a non-empty Group", done => {
      const templatePart = mockSolutions.getGroupTemplatePart([
        "wma1234567890",
        "map1234567890",
        "map1234567890"
      ]);
      const groupTemplate = mClassifier.initItemTemplateFromJSON(templatePart);
      function progressCallback(update: any): void {
        expect(update.processId).toEqual(groupTemplate.key);
      }
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      const templateItemId = templatePart.itemId as string;
      const expectedCreatedItemId = templateItemId.toUpperCase();
      fetchMock
        .post(
          "path:/sharing/rest/community/createGroup",
          '{"success":true,"group":{"id":"' +
            expectedCreatedItemId +
            '","title":"Group_' +
            expected +
            '","owner":"casey"}}'
        )
        .mock(
          "path:/sharing/rest/community/users/casey",
          '{"username":"casey","id":"' + expectedCreatedItemId + '"}'
        )
        .post(
          "path:/sharing/rest/search",
          '{"query":"id: map1234567890 AND group: ' +
            expectedCreatedItemId +
            '",' +
            '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}'
        )
        .mock(
          "path:/sharing/rest/community/groups/" + expectedCreatedItemId + "",
          '{"id":"' +
            expectedCreatedItemId +
            '","title":"My group","owner":"casey",' +
            '"userMembership":{"username":"casey","memberType":"owner","applications":0}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/share",
          '{"notSharedWith":[],"itemId":"map1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/wma1234567890/share",
          '{"notSharedWith":[],"itemId":"wma1234567890"}'
        );
      groupTemplate.fcns
        .createItemFromTemplate(
          groupTemplate,
          settings,
          sessionWithMockedTime,
          progressCallback
        )
        .then(
          (createdItem: any) => {
            expect(settings[templateItemId].id as string).toEqual(
              expectedCreatedItemId
            );
            expect(createdItem.itemId as string).toEqual(expectedCreatedItemId);
            expect(createdItem.item.id as string).toEqual(
              expectedCreatedItemId
            );
            expect(createdItem.dependencies.length).toEqual(3);
            expect(createdItem.estimatedDeploymentCostFactor).toEqual(6);
            done();
          },
          (error: any) => done.fail(error)
        );
    });

    it("should create an empty Group", done => {
      const templatePart = mockSolutions.getGroupTemplatePart();
      const groupTemplate = mClassifier.initItemTemplateFromJSON(templatePart);
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      const templateItemId = templatePart.itemId as string;
      const expectedCreatedItemId = templateItemId.toUpperCase();
      fetchMock.post(
        "path:/sharing/rest/community/createGroup",
        '{"success":true,"group":{"id":"' +
          expectedCreatedItemId +
          '","title":"Group_' +
          expected +
          '","owner":"casey"}}'
      );
      groupTemplate.fcns
        .createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
        .then(
          (createdItem: any) => {
            expect(settings[templateItemId].id as string).toEqual(
              expectedCreatedItemId
            );
            expect(createdItem.itemId as string).toEqual(expectedCreatedItemId);
            expect(createdItem.item.id as string).toEqual(
              expectedCreatedItemId
            );
            done();
          },
          (error: any) => done.fail(error)
        );
    });

    it("should handle the failure to create an empty Group 200", done => {
      const groupTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getGroupTemplatePart()
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock.post(
        "path:/sharing/rest/community/createGroup",
        mockItems.get200Failure()
      );
      groupTemplate.fcns
        .createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
        .then(
          () => done.fail(),
          error => {
            expect(error).toEqual(ArcgisRestSuccessFailSimple);
            done();
          }
        );
    });

    it("should handle the failure to create an empty Group 400", done => {
      const groupTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getGroupTemplatePart()
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock.post(
        "path:/sharing/rest/community/createGroup",
        mockItems.get400Failure()
      );
      groupTemplate.fcns
        .createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should handle failure to add to Group", done => {
      const groupTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getGroupTemplatePart(["map1234567890"])
      );
      const settings = createMockSettings();

      // Because we make the service name unique by appending a timestamp, set up a clock & user session
      // with known results
      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const expected = "20190304_0506_07000"; // 1-based month
      const now = date.getTime();
      const sessionWithMockedTime: IUserRequestOptions = {
        authentication: createRuntimeMockUserSession(setMockDateTime(now))
      };

      fetchMock
        .post(
          "path:/sharing/rest/community/createGroup",
          '{"success":true,"group":{"id":"grp1234567890","title":"Group_' +
            expected +
            '","owner":"casey"}}'
        )
        .mock(
          "path:/sharing/rest/community/users/casey",
          '{"username":"casey","id":"grp1234567890"}'
        )
        .post(
          "path:/sharing/rest/search",
          '{"query":"id: map1234567890 AND group: grp1234567890",' +
            '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}'
        )
        .mock(
          "path:/sharing/rest/community/groups/grp1234567890",
          '{"id":"grp1234567890","title":"My group","owner":"casey",' +
            '"userMembership":{"username":"casey","memberType":"owner","applications":0}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/share",
          mockItems.get400Failure()
        );
      groupTemplate.fcns
        .createItemFromTemplate(groupTemplate, settings, sessionWithMockedTime)
        .then(
          () => done.fail(),
          error => {
            expect(error).toEqual(ArcgisRestSuccessFailStruct);
            done();
          }
        );
    });

    it("should create a Web Mapping Application in the root folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Mapping Application")
      );
      const settings = createMockSettings();
      function progressCallback(update: any): void {
        expect(update.processId).toEqual(itemTemplate.key);
      }

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"WMA1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/WMA1234567890/update",
          '{"success":true,"id":"WMA1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(
          itemTemplate,
          settings,
          MOCK_USER_REQOPTS,
          progressCallback
        )
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("WMA1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should handle the failure to update the URL of a Web Mapping Application being created", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Web Mapping Application")
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"WMA1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/WMA1234567890/update",
          mockItems.get400Failure()
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          () => done.fail(),
          error => {
            expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
            done();
          }
        );
    });

    it("should create a public Dashboard in the root folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Dashboard")
      );

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"dsh1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
          '{"notSharedWith":[],"itemId":"dsh1234567890"}'
        );
      mCommon
        .createItemWithData(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_REQOPTS,
          null,
          "public"
        )
        .then(
          createdItemUpdateResponse => {
            expect(createdItemUpdateResponse).toEqual({
              success: true,
              id: "dsh1234567890"
            });
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a dataless public Dashboard in the root folder", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getTemplatePartNoData("Dashboard")
      );

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"dsh1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
          '{"notSharedWith":[],"itemId":"dsh1234567890"}'
        );
      mCommon
        .createItemWithData(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_REQOPTS,
          null,
          "public"
        )
        .then(
          createdItemUpdateResponse => {
            expect(createdItemUpdateResponse).toEqual({
              success: true,
              id: "dsh1234567890"
            });
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create a dataless public Dashboard with both folder and access undefined", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getTemplatePartNoData("Dashboard")
      );

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"dsh1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dsh1234567890/share",
          '{"notSharedWith":[],"itemId":"dsh1234567890"}'
        );
      mCommon
        .createItemWithData(
          itemTemplate.item,
          itemTemplate.data,
          MOCK_USER_REQOPTS,
          undefined,
          undefined
        )
        .then(
          createdItemUpdateResponse => {
            expect(createdItemUpdateResponse).toEqual({
              success: true,
              id: "dsh1234567890"
            });
            done();
          },
          error => done.fail(error)
        );
    });

    it("should create an item that's not a Dashboard, Feature Service, Group, Web Map, or Web Mapping Application", done => {
      const itemTemplate = mClassifier.initItemTemplateFromJSON(
        mockSolutions.getItemTemplatePart("Map Template")
      );
      const settings = createMockSettings();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"MTP1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/MTP1234567890/update",
          '{"success":true,"id":"MTP1234567890"}'
        );
      itemTemplate.fcns
        .createItemFromTemplate(itemTemplate, settings, MOCK_USER_REQOPTS)
        .then(
          createdItem => {
            expect(createdItem.itemId).toEqual("MTP1234567890");
            done();
          },
          error => done.fail(error)
        );
    });
  });

  describe("supporting routine: get cloning order", () => {
    it("sorts an item and its dependencies 1", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "abc",
        dependencies: ["ghi", "def"]
      });
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });

      const results: string[] = mSolution.topologicallySortItems([
        abc,
        def,
        ghi
      ]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "ghi",
        successor: "abc"
      });
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "def",
        successor: "abc"
      });
    });

    it("sorts an item and its dependencies 2", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "abc",
        dependencies: ["ghi", "def"]
      });
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "def",
        dependencies: ["ghi"]
      });
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });

      const results: string[] = mSolution.topologicallySortItems([
        abc,
        def,
        ghi
      ]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "ghi",
        successor: "abc"
      });
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "def",
        successor: "abc"
      });
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "ghi",
        successor: "def"
      });
    });

    it("sorts an item and its dependencies 3", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "abc",
        dependencies: ["ghi"]
      });
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "def" });
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "ghi",
        dependencies: ["def"]
      });

      const results: string[] = mSolution.topologicallySortItems([
        abc,
        def,
        ghi
      ]);
      expect(results.length).toEqual(3);
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "ghi",
        successor: "abc"
      });
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "def",
        successor: "abc"
      });
      (expect(results) as ICustomArrayLikeMatchers).toHaveOrder({
        predecessor: "def",
        successor: "ghi"
      });
    });

    it("reports a multi-item cyclic dependency graph", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "abc",
        dependencies: ["ghi"]
      });
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "def",
        dependencies: ["ghi"]
      });
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "ghi",
        dependencies: ["abc"]
      });

      expect(function() {
        mSolution.topologicallySortItems([abc, def, ghi]);
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });

    it("reports a single-item cyclic dependency graph", () => {
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "abc" });
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "def",
        dependencies: ["def"]
      });
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, { itemId: "ghi" });

      expect(function() {
        mSolution.topologicallySortItems([abc, def, ghi]);
      }).toThrowError(Error, "Cyclical dependency graph detected");
    });
  });

  describe("supporting routine: remove undesirable properties", () => {
    it("remove properties", () => {
      const abc = mockItems.getAGOLItem(
        "Web Mapping Application",
        "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21"
      );

      const abcCopy = mClassifier.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(
        mockItems.getAGOLItem(
          "Web Mapping Application",
          "http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc599252a7835eea21"
        )
      );
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());
    });

    it("shallow copy if properties already removed", () => {
      const abc = mockItems.getTrimmedAGOLItem();

      const abcCopy = mClassifier.removeUndesirableItemProperties(abc);
      expect(abc).toEqual(mockItems.getTrimmedAGOLItem());
      expect(abcCopy).toEqual(mockItems.getTrimmedAGOLItem());

      abcCopy.name = "Renamed item";
      expect(abc.name).toEqual("Name of an AGOL item");
    });

    it("checks for item before attempting to access its properties", () => {
      const result = mClassifier.removeUndesirableItemProperties(null);
      expect(result).toBeNull();
    });
  });

  describe("supporting routine: count relationships", () => {
    it("should handle a layer with no relationships", () => {
      const layers: any[] = [
        {
          relationships: undefined
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(0);
    });

    it("should handle layers with no relationships", () => {
      const layers: any[] = [
        {
          relationships: []
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(0);
    });

    it("should handle layers with no relationships", () => {
      const layers: any[] = [
        {
          relationships: undefined
        },
        {
          relationships: undefined
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(0);
    });

    it("should handle layers with no relationships", () => {
      const layers: any[] = [
        {
          relationships: []
        },
        {
          relationships: []
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(0);
    });

    it("should handle layers with no relationships", () => {
      const layers: any[] = [
        {
          relationships: undefined
        },
        {
          relationships: []
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(0);
    });

    it("should handle a layer with relationships 1", () => {
      const layers: any[] = [
        {
          relationships: [1]
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(1);
    });

    it("should handle a layer with relationships 2", () => {
      const layers: any[] = [
        {
          relationships: [1, 2]
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(2);
    });

    it("should handle a layer with relationships 1", () => {
      const layers: any[] = [
        {
          relationships: [1, 2, 3, 4, 5]
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(5);
    });

    it("should handle layers with relationships", () => {
      const layers: any[] = [
        {
          relationships: [1, 2]
        },
        {
          relationships: [1]
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(3);
    });

    it("should handle layers with and without relationships", () => {
      const layers: any[] = [
        {
          relationships: undefined
        },
        {
          relationships: [1, 2, 3]
        }
      ];
      expect(mFeatureService.countRelationships(layers)).toEqual(3);
    });
  });

  describe("supporting routine: initializing an item template from an id", () => {
    it("should handle an unknown item type", done => {
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/unk1234567890",
          mockItems.getAGOLItem("Unknown")
        )
        .mock(
          "path:/sharing/rest/community/groups/unk1234567890",
          mockItems.getAGOLItem("Unknown")
        );
      mClassifier
        .convertItemToTemplate("unk1234567890", MOCK_USER_REQOPTS)
        .then(() => done.fail(), () => done());
    });

    it("should handle an unsupported item type", done => {
      // Note: this test adds "Unimplemented item type Unsupported for uns1234567890" to the console log
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/uns1234567890",
          mockItems.getAGOLItem("Unsupported")
        )
        .mock(
          "path:/sharing/rest/content/items/uns1234567890/data",
          mockItems.getAGOLItemData()
        )
        .mock(
          "path:/sharing/rest/content/items/uns1234567890/resources",
          mockItems.getAGOLItemResources()
        );
      mClassifier
        .convertItemToTemplate("uns1234567890", MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response.item.type).toEqual("Unsupported");
            expect(response.data).toBeNull();
            expect(response.resources).toEqual([]);
            done();
          },
          error => done.fail(error)
        );
    });

    it("should handle an item without item.item property, data section, or resources sections", done => {
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getItemWithoutItemProp()
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData()
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources()
        );
      mClassifier
        .convertItemToTemplate("map1234567890", MOCK_USER_REQOPTS)
        .then(
          response => {
            expect(response.item.type).toEqual("Web Map");
            expect(response.data).toBeNull();
            expect(response.resources).toEqual([]);
            done();
          },
          error => done.fail(error)
        );
    });

    it("should handle an item with a problem fetching dependencies", done => {
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/grp1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/community/groups/grp1234567890",
          mockItems.getAGOLGroup()
        )
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=1&num=100&token=fake-token",
          mockItems.get400FailureResponse()
        );
      mClassifier
        .convertItemToTemplate("grp1234567890", MOCK_USER_REQOPTS)
        .then(() => done.fail(), () => done());
    });

    it("should handle an item with a problem completing an item description 1", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      fetchMock
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.get400FailureResponse()
        );
      mClassifier
        .convertItemToTemplate("svc1234567890", MOCK_USER_REQOPTS)
        .then(() => done.fail(), () => done());
    });

    it("should handle an item with a problem completing an item description 2", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";

      fetchMock
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.get400FailureResponse()
        );
      mClassifier
        .convertItemToTemplate("svc1234567890", MOCK_USER_REQOPTS)
        .then(() => done.fail(), () => done());
    });

    it("should handle a dashboard item", done => {
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/dsh1234567890",
          mockItems.getAGOLItem("Dashboard")
        )
        .mock(
          "path:/sharing/rest/content/items/dsh1234567890/data",
          mockItems.getAGOLItemData("Dashboard")
        )
        .mock(
          "path:/sharing/rest/content/items/dsh1234567890/resources",
          mockItems.getAGOLItemResources("none")
        );
      mClassifier
        .convertItemToTemplate("dsh1234567890", MOCK_USER_REQOPTS)
        .then(() => done(), () => done.fail());
    });

    it("should handle a widgetless dashboard item", done => {
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/dsh1234567890",
          mockItems.getAGOLItem("Dashboard")
        )
        .mock(
          "path:/sharing/rest/content/items/dsh1234567890/data",
          mockItems.getItemDataWidgetlessDashboard()
        )
        .mock(
          "path:/sharing/rest/content/items/dsh1234567890/resources",
          mockItems.getAGOLItemResources("none")
        );
      mClassifier
        .convertItemToTemplate("dsh1234567890", MOCK_USER_REQOPTS)
        .then(() => done(), () => done.fail());
    });
  });

  describe("supporting routine: createItemFromTemplateWhenReady ", () => {
    it("should reject a missing AGOL", done => {
      const settings = {} as any;
      mSolution
        .createItemFromTemplateWhenReady(null, [], MOCK_USER_REQOPTS, settings)
        .then(() => done.fail(), () => done());
    });

    it("should reject an AGOL id that isn't in the current solution", done => {
      const settings = {} as any;
      mSolution
        .createItemFromTemplateWhenReady(
          "wma1234567890",
          [],
          MOCK_USER_REQOPTS,
          settings
        )
        .then(() => done.fail(), () => done());
    });
  });

  describe("supporting routine: finalCallback", () => {
    it("should handle successful progress update", () => {
      function progressCallback(update: any): void {
        expect(update.processId).toEqual("key");
        expect(update.status).toEqual("done");
      }
      mCommon.finalCallback("key", true, progressCallback);
    });

    it("should handle failed progress update", () => {
      function progressCallback(update: any): void {
        expect(update.processId).toEqual("key");
        expect(update.status).toEqual("failed");
      }
      mCommon.finalCallback("key", false, progressCallback);
    });
  });

  describe("supporting routine: timestamp", () => {
    it("should return time 19951217_0324_00000", () => {
      const date = new Date(Date.UTC(1995, 11, 17, 3, 24)); // 0-based month
      const expected = "19951217_0324_00000"; // 1-based month
      jasmine.clock().install();
      jasmine.clock().mockDate(date);
      expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

    it("should return time 20050601_1559_23000", () => {
      const date = new Date(Date.UTC(2005, 5, 1, 15, 59, 23)); // 0-based month
      const expected = "20050601_1559_23000"; // 1-based month
      jasmine.clock().install();
      jasmine.clock().mockDate(date);
      expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

    it("should return time 20050601_0204_06000", () => {
      const date = new Date(Date.UTC(2005, 5, 1, 2, 4, 6)); // 0-based month
      const expected = "20050601_0204_06000"; // 1-based month
      jasmine.clock().install();
      jasmine.clock().mockDate(date);
      expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

    it("should return time 20190430_2003_04005", () => {
      const date = new Date(Date.UTC(2019, 3, 30, 20, 3, 4)); // 0-based month
      const expected = "20190430_2003_04000"; // 1-based month
      jasmine.clock().install();
      jasmine.clock().mockDate(date);
      expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

    it("should return time 20191231_2359_59000", () => {
      const date = new Date(Date.UTC(2019, 11, 31, 23, 59, 59)); // 0-based month
      const expected = "20191231_2359_59000"; // 1-based month
      jasmine.clock().install();
      jasmine.clock().mockDate(date);
      expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });

    it("should return time 20200101_0000_00000", () => {
      const date = new Date(Date.UTC(2020, 0, 1, 0, 0, 0)); // 0-based month
      const expected = "20200101_0000_00000"; // 1-based month
      jasmine.clock().install();
      jasmine.clock().mockDate(date);
      expect(mCommon.getUTCTimestamp()).toEqual(expected.toString());
      jasmine.clock().uninstall();
    });
  });

  describe("supporting routine: copyResource", () => {
    it("should handle a resource not in a folder", done => {
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/src1234567890/resources/splash.png";
      const filename = "splash.png";
      const destinationItemId = "dst1234567890";
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/items/src1234567890/resources/splash.png",
          200
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dst1234567890/addResources",
          '{"success":true,"itemId":"dst1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .copyResource(
          url,
          undefined,
          filename,
          destinationItemId,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(response => {
          expect(response).toEqual("splash.png");
          done();
        }, done.fail);
    });

    it("should handle a resource not in a folder; null variant", done => {
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/src1234567890/resources/splash.png";
      const folder = null as string;
      const filename = "splash.png";
      const destinationItemId = "dst1234567890";
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/items/src1234567890/resources/splash.png",
          200
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dst1234567890/addResources",
          '{"success":true,"itemId":"dst1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .copyResource(
          url,
          folder,
          filename,
          destinationItemId,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(response => {
          expect(response).toEqual("splash.png");
          done();
        }, done.fail);
    });

    it("should handle a resource from a folder", done => {
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/src1234567890/resources/splash.png";
      const folder = "src1234567890";
      const filename = "splash.png";
      const destinationItemId = "dst1234567890";
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/items/src1234567890/resources/splash.png",
          200
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dst1234567890/addResources",
          '{"success":true,"itemId":"dst1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .copyResource(
          url,
          folder,
          filename,
          destinationItemId,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(response => {
          expect(response).toEqual("src1234567890/splash.png");
          done();
        }, done.fail);
    });

    it("should handle a resource from a subfolder", done => {
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/src1234567890/resources/icons/success.png";
      const folder = "src1234567890_icons";
      const filename = "success.png";
      const destinationItemId = "dst1234567890";
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/items/src1234567890/resources/icons/success.png",
          200
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dst1234567890/addResources",
          '{"success":true,"itemId":"dst1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .copyResource(
          url,
          folder,
          filename,
          destinationItemId,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(response => {
          expect(response).toEqual("src1234567890_icons/success.png");
          done();
        }, done.fail);
    });

    it("should handle inability to get a resource to copy", done => {
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/src1234567890/resources/splash.png";
      const filename = "splash.png";
      const destinationItemId = "dst1234567890";
      setUpImageRequestSpy(mockItems.get400Failure());

      fetchMock.post(
        "path:/sharing/rest/content/items/src1234567890/resources/splash.png",
        400
      );
      mSolution
        .copyResource(
          url,
          undefined,
          filename,
          destinationItemId,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(done.fail, response => {
          expect(response.success).toBeFalsy();
          expect(response.error.code).toEqual(400);
          done();
        });
    });

    it("should handle inability to get a blob out of a resource to copy", done => {
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/src1234567890/resources/splash.png";
      const folder = "src1234567890";
      const filename = "splash.png";
      const destinationItemId = "dst1234567890";
      setUpImageRequestSpyBadBlob(mockItems.get400Failure());

      fetchMock
        .post(
          "path:/sharing/rest/content/items/src1234567890/resources/splash.png",
          200
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dst1234567890/addResources",
          '{"success":true,"itemId":"dst1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .copyResource(
          url,
          folder,
          filename,
          destinationItemId,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(done.fail, response => {
          expect(response.success).toBeFalsy();
          expect(response.error.code).toEqual(400);
          done();
        });
    });

    it("should handle inability to store copy of resource", done => {
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/src1234567890/resources/splash.png";
      const folder = "src1234567890";
      const filename = "splash.png";
      const destinationItemId = "dst1234567890";
      setUpImageRequestSpy();

      fetchMock
        .post(
          "path:/sharing/rest/content/items/src1234567890/resources/splash.png",
          200
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/dst1234567890/addResources",
          mockItems.get400Failure()
        );
      mSolution
        .copyResource(
          url,
          folder,
          filename,
          destinationItemId,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(done.fail, done);
    });
  });

  describe("supporting routine: createSolutionTemplateItem", () => {
    it("should handle default (private) access and supplied settings with an org url", done => {
      const settings = {
        organization: {
          orgUrl
        }
      } as any;

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        );
      mSolution
        .createSolutionAgoItem("title", "x", MOCK_USER_REQOPTS, settings)
        .then((response: mInterfaces.ISolutionItem) => {
          const expected: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem();
          expected.item.url =
            "https://myOrg.maps.arcgis.com/home/item.html?id=sln1234567890";
          delete expected.data.metadata.resourceStorageItemId; // not yet assigned
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });
  });

  describe("supporting routine: createDeployedSolutionItem", () => {
    it("should handle default access and default (empty) settings", done => {
      const solutionTemplateItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem();

      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"SLN1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/SLN1234567890/share",
          '{"notSharedWith":[],"itemId":"SLN1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/SLN1234567890/update",
          '{"success":true,"id":"SLN1234567890"}'
        );
      mSolution
        .createDeployedSolutionAgoItem(
          "title",
          solutionTemplateItem,
          MOCK_USER_REQOPTS
        )
        .then((response: mInterfaces.IAGOItemAccess) => {
          expect(solutionTemplateItem.item.id).toEqual("sln1234567890");
          expect(response.id).toEqual("SLN1234567890");
          expect(response.url).toEqual(
            "https://www.arcgis.com/home/item.html?id=SLN1234567890"
          );
          done();
        }, done.fail);
    });
  });

  describe("supporting routine: createSolutionItemTemplates", () => {
    it("should not create a template if one has already been created for an item", done => {
      const solutionTemplateItem: mInterfaces.ISolutionItem = mockSolutions.getSolutionTemplateItem();
      const templates: mInterfaces.ITemplate[] = [
        {
          itemId: "itm1234567890",
          type: "item",
          key: "iabcdef",
          item: {}
        }
      ];

      mSolution
        .createItemTemplates("itm1234567890", MOCK_USER_REQOPTS, templates)
        .then((updatedTemplates: mInterfaces.ITemplate[]) => {
          expect(updatedTemplates).toEqual(templates);
          expect(updatedTemplates.length).toEqual(1);
          done();
        }, done.fail);
    });
  });

  describe("supporting routine: createSolutionStorageAgoItem", () => {
    it("should handle supplied settings and default access", done => {
      const settings = {
        organization: {
          orgUrl: "https://myorg.maps.arcgis.com"
        }
      };

      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        '{"success":true,"id":"sln1234567890","folder":null}'
      );
      mSolution
        .createSolutionStorageAgoItem("title", MOCK_USER_REQOPTS, settings)
        .then(response => {
          const expected = {
            item: {
              itemType: "text",
              name: null as string,
              title: "title",
              type: "Code Attachment",
              typeKeywords: ["Solution", "Template"],
              commentsEnabled: false,
              id: "sln1234567890",
              url:
                "https://myorg.maps.arcgis.com/home/item.html?id=sln1234567890"
            }
          };
          expect(response).toEqual(expected);
          done();
        }, done.fail);
    });

    it("should handle failure to create item", done => {
      fetchMock.post(
        "path:/sharing/rest/content/users/casey/addItem",
        mockItems.get400Failure()
      );
      mSolution.createSolutionStorageAgoItem("title", MOCK_USER_REQOPTS).then(
        () => done.fail,
        error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        }
      );
    });
  });

  describe("supporting routine: saveResourcesInSolutionItem", () => {
    it("should handle missing templates list", done => {
      mSolution
        .saveResourcesInSolutionItem(
          null,
          null,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(response => {
          expect(Array.isArray(response)).toBeTruthy();
          expect(response.length).toEqual(0);
          done();
        }, done.fail);
    });

    it("should handle empty templates list", done => {
      mSolution
        .saveResourcesInSolutionItem(
          [],
          null,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(response => {
          expect(Array.isArray(response)).toBeTruthy();
          expect(response.length).toEqual(0);
          done();
        }, done.fail);
    });

    it("should handle template item without a thumbnail", done => {
      const template = mockSolutions.getItemTemplatePart("Dashboard");
      template.item.thumbnail = null;
      mSolution
        .saveResourcesInSolutionItem(
          [template],
          null,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(response => {
          expect(Array.isArray(response)).toBeTruthy();
          expect(response.length).toEqual(0);
          done();
        }, done.fail);
    });

    it("should handle failure to save a resource", done => {
      const template = mockSolutions.getItemTemplatePart("Dashboard");
      setUpImageRequestSpy(mockItems.get400Failure());

      fetchMock.post(
        "path:/sharing/rest/content/items/dsh1234567890/info/thumbnail/ago_downloaded.png",
        400
      );
      mSolution
        .saveResourcesInSolutionItem(
          [template],
          null,
          MOCK_USER_REQOPTS,
          MOCK_USER_REQOPTS
        )
        .then(
          () => done.fail(),
          response => {
            expect(response.success).toBeFalsy();
            expect(response.error.code).toEqual(400);
            done();
          }
        );
    });
  });

  describe("supporting routine: doCommonTemplatizations", () => {
    it("should handle provided extent", () => {
      const templatePart = mockSolutions.getTemplatePartNoData("Dashboard");
      templatePart.item.extent = [
        [-8589300.590117617, 40.36926825227528],
        [-73.96624645399964, 4722244.554455302]
      ];
      mCommon.doCommonTemplatizations(templatePart);
      expect(templatePart.item.extent).not.toBeNull();
      expect(templatePart.item.extent).toEqual(
        "{{initiative.extent:optional}}"
      );
    });

    it("should handle missing extent", () => {
      const template = mockSolutions.getTemplatePartNoExtent("Dashboard");
      mCommon.doCommonTemplatizations(template);
      expect(template.item.extent).toBeNull();
    });
  });

  describe("supporting routine: flatten", () => {
    it("should handle default", () => {
      expect(mClassifier.flatten()).toEqual([] as string[]);
    });

    it("should handle a simple list", () => {
      const suppliedList = ["abc", "def", "ghi"];
      const expectedList = ["abc", "def", "ghi"];
      expect(mClassifier.flatten(suppliedList)).toEqual(expectedList);
    });

    it("should handle a nested list", () => {
      const suppliedList = ["abc", ["def", "ghi"], "jkl"];
      const expectedList = ["abc", "def", "ghi", "jkl"];
      expect(mClassifier.flatten(suppliedList as string[])).toEqual(
        expectedList
      );
    });

    it("should handle a strictly nested list", () => {
      const suppliedList = [["abc"], ["def", "ghi"], ["jkl", "mno"]];
      const expectedList = ["abc", "def", "ghi", "jkl", "mno"];
      expect(mClassifier.flatten(suppliedList as any)).toEqual(expectedList);
    });
  });

  describe("supporting routine: removeDuplicates", () => {
    it("should handle default", () => {
      expect(mClassifier.removeDuplicates()).toEqual([] as string[]);
    });
  });

  describe("supporting routine: getLayers", () => {
    it("should handle an empty layer list", done => {
      mFeatureService
        .getLayers(orgUrl, [], MOCK_USER_REQOPTS)
        .then(() => done(), () => done.fail());
    });
  });

  describe("supporting routine: deTemplatize", () => {
    it("should handle a list of templatized ids", () => {
      const templatizedIds = [
        "{{wma1234567890.id}}",
        "{{wma1234567890.url}}",
        "{{map1234567890.id}}"
      ];
      const expectedIds = ["wma1234567890", "wma1234567890", "map1234567890"];
      expect(mCommon.deTemplatize(templatizedIds)).toEqual(expectedIds);
    });

    it("should handle a list of normal ids", () => {
      const normalIds = ["wma1234567890", "wma1234567890", "map1234567890"];
      const expectedIds = ["wma1234567890", "wma1234567890", "map1234567890"];
      expect(mCommon.deTemplatize(normalIds)).toEqual(expectedIds);
    });
  });

  describe("supporting routine: getFolderAndFilenameForResource", () => {
    it("should handle resource without a folder in its path", () => {
      const itemId = "itm1234567890";
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/wma1234567890/resources/splash.png";
      const expected = {
        folder: "itm1234567890",
        filename: "splash.png"
      };
      expect(mSolution.getFolderAndFilenameForResource(itemId, url)).toEqual(
        expected
      );
    });

    it("should handle resource with a folder in its path", () => {
      const itemId = "itm1234567890";
      const url =
        "https://myorg.maps.arcgis.com/sharing/rest/content/items/wma1234567890/resources/icons/success.png";
      const expected = {
        folder: "itm1234567890_icons",
        filename: "success.png"
      };
      expect(mSolution.getFolderAndFilenameForResource(itemId, url)).toEqual(
        expected
      );
    });
  });

  describe("supporting routine: getSupportedItemTypes", () => {
    it("should handle missing itemId in layer in layer list", () => {
      const types = mSolution.getSupportedItemTypes();
      const typesInternal = mClassifier.getSupportedItemTypes();
      expect(types.length).toBeGreaterThan(0);
      expect(types).toEqual(typesInternal);
    });
  });

  describe("supporting routine: getWebmapLayerIds", () => {
    it("should handle missing layer list", () => {
      const ids = mWebMap.getWebmapLayerIds();
      expect(Array.isArray(ids)).toBeTruthy();
      expect(ids.length).toEqual(0);
    });

    it("should handle missing itemId in layer in layer list", () => {
      const ids = mWebMap.getWebmapLayerIds([
        {
          itemId: "a"
        },
        {
          itemId: "b"
        },
        {
          somethingElse: "c"
        },
        {
          itemId: "d"
        }
      ]);
      expect(ids).toEqual(["a", "b", "d"]);
    });
  });

  describe("supporting routine: templatizeWebmapLayerIdsAndUrls", () => {
    it("should handle missing layer list", () => {
      expect(mWebMap.templatizeWebmapLayerIdsAndUrls).not.toThrowError();
    });
  });

  describe("supporting routine: templatizeList", () => {
    it("should handle default parameter", () => {
      const ids = ["abc", "def", "ghi"];
      const expectedTemplatized = ["{{abc.id}}", "{{def.id}}", "{{ghi.id}}"];
      const templatized = mCommon.templatizeList(ids);
      expect(templatized).toEqual(expectedTemplatized);
    });

    it("should handle custom parameter", () => {
      const ids = ["abc", "def", "ghi"];
      const expectedTemplatized = ["{{abc.url}}", "{{def.url}}", "{{ghi.url}}"];
      const templatized = mCommon.templatizeList(ids, "url");
      expect(templatized).toEqual(expectedTemplatized);
    });

    it("should handle empty list", () => {
      const ids = [] as string[];
      const expectedTemplatized = [] as string[];
      const templatized1 = mCommon.templatizeList(ids);
      expect(templatized1).toEqual(expectedTemplatized);
      const templatized2 = mCommon.templatizeList(ids, "url");
      expect(templatized2).toEqual(expectedTemplatized);
    });
  });

  describe("supporting routine: getGroupContentsTranche", () => {
    it("should handle single tranche", done => {
      const pagingRequest: IPagingParamsRequestOptions = {
        paging: {
          start: 1,
          num: 5
        },
        ...MOCK_USER_REQOPTS
      };

      fetchMock.mock(
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
          "?f=json&start=1&num=" +
          pagingRequest.paging.num +
          "&token=fake-token",
        '{"total":0,"start":1,"num":5,"nextStart":-1,"items":[' +
          '{"id":"dsh1234567980", "owner":"fayard"},' +
          '{"id":"map1234567980", "owner":"fred"},' +
          '{"id":"svc1234567980", "owner":"cyd"},' +
          '{"id":"wma1234567980", "owner":"ginger"},' +
          '{"id":"wrk1234567980", "owner":"harold"}' +
          "]}"
      );
      mGroup.getGroupContentsTranche("grp1234567890", pagingRequest).then(
        contents => {
          expect(contents).toEqual([
            "dsh1234567980",
            "map1234567980",
            "svc1234567980",
            "wma1234567980",
            "wrk1234567980"
          ]);
          done();
        },
        error => done.fail(error)
      );
    });

    it("should handle two tranches", done => {
      const pagingRequest: IPagingParamsRequestOptions = {
        paging: {
          start: 1,
          num: 3
        },
        ...MOCK_USER_REQOPTS
      };

      fetchMock
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=1&num=" +
            pagingRequest.paging.num +
            "&token=fake-token",
          '{"total":0,"start":1,"num":3,"nextStart":4,"items":[' +
            '{"id":"dsh1234567980", "owner":"fayard"},' +
            '{"id":"map1234567980", "owner":"fred"},' +
            '{"id":"svc1234567980", "owner":"cyd"}' +
            "]}"
        )
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=4&num=" +
            pagingRequest.paging.num +
            "&token=fake-token",
          '{"total":0,"start":4,"num":2,"nextStart":-1,"items":[' +
            '{"id":"wma1234567980", "owner":"ginger"},' +
            '{"id":"wrk1234567980", "owner":"harold"}' +
            "]}"
        );
      mGroup.getGroupContentsTranche("grp1234567890", pagingRequest).then(
        contents => {
          expect(contents).toEqual([
            "dsh1234567980",
            "map1234567980",
            "svc1234567980",
            "wma1234567980",
            "wrk1234567980"
          ]);
          done();
        },
        error => done.fail(error)
      );
    });

    it("should handle three tranches", done => {
      const pagingRequest: IPagingParamsRequestOptions = {
        paging: {
          start: 1,
          num: 2
        },
        ...MOCK_USER_REQOPTS
      };

      fetchMock
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=1&num=" +
            pagingRequest.paging.num +
            "&token=fake-token",
          '{"total":0,"start":1,"num":2,"nextStart":3,"items":[' +
            '{"id":"dsh1234567980", "owner":"fayard"},' +
            '{"id":"map1234567980", "owner":"fred"}' +
            "]}"
        )
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=3&num=" +
            pagingRequest.paging.num +
            "&token=fake-token",
          '{"total":0,"start":3,"num":2,"nextStart":5,"items":[' +
            '{"id":"svc1234567980", "owner":"cyd"},' +
            '{"id":"wma1234567980", "owner":"ginger"}' +
            "]}"
        )
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=5&num=" +
            pagingRequest.paging.num +
            "&token=fake-token",
          '{"total":0,"start":5,"num":1,"nextStart":-1,"items":[' +
            '{"id":"wrk1234567980", "owner":"harold"}' +
            "]}"
        );
      mGroup.getGroupContentsTranche("grp1234567890", pagingRequest).then(
        contents => {
          expect(contents).toEqual([
            "dsh1234567980",
            "map1234567980",
            "svc1234567980",
            "wma1234567980",
            "wrk1234567980"
          ]);
          done();
        },
        error => done.fail(error)
      );
    });

    it("should handle a failure to get a tranche", done => {
      const pagingRequest: IPagingParamsRequestOptions = {
        paging: {
          start: 1,
          num: 2
        },
        ...MOCK_USER_REQOPTS
      };

      fetchMock
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=1&num=" +
            pagingRequest.paging.num +
            "&token=fake-token",
          '{"total":0,"start":1,"num":2,"nextStart":3,"items":[' +
            '{"id":"dsh1234567980", "owner":"fayard"},' +
            '{"id":"map1234567980", "owner":"fred"}' +
            "]}"
        )
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=3&num=" +
            pagingRequest.paging.num +
            "&token=fake-token",
          mockItems.get400Failure()
        );
      mGroup
        .getGroupContentsTranche("grp1234567890", pagingRequest)
        .then(() => done.fail(), () => done());
    });
  });

  describe("supporting routine: get estimated deployment cost", () => {
    it("should handle empty solution", () => {
      const cost = mSolution.getEstimatedDeploymentCost([]);
      expect(cost).toEqual(0);
    });

    it("should handle solution with items 1", () => {
      const cost = mSolution.getEstimatedDeploymentCost(
        mockSolutions.getWebMappingApplicationTemplate()
      );
      expect(cost).toEqual(
        4 + // Web Mapping Application
        4 + // Web Map
          7 // Feature Service
      );
    });

    it("should handle solution with items 2", () => {
      const solution = mockSolutions.getWebMappingApplicationTemplate();
      solution[1].estimatedDeploymentCostFactor = undefined;
      const cost = mSolution.getEstimatedDeploymentCost(solution);
      expect(cost).toEqual(
        4 + // Web Mapping Application
        3 + // Web Map
          7 // Feature Service
      );
    });
  });

  describe("supporting routine: add members to cloned group", () => {
    it("should handle empty group", done => {
      const group = mockSolutions.getGroupTemplatePart();
      mGroup
        .addGroupMembers(group, MOCK_USER_REQOPTS)
        .then(() => done(), error => done.fail(error));
    });

    it("should handle failure to add to Group", done => {
      const group = mockSolutions.getGroupTemplatePart(["map1234567890"]);
      fetchMock
        .mock(
          "path:/sharing/rest/community/users/casey",
          '{"username":"casey","id":"grp1234567890"}'
        )
        .post(
          "path:/sharing/rest/search",
          '{"query":"id: map1234567890 AND group: grp1234567890",' +
            '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}'
        )
        .mock(
          "path:/sharing/rest/community/groups/grp1234567890",
          '{"id":"grp1234567890","title":"My group","owner":"casey",' +
            '"userMembership":{"username":"casey","memberType":"owner","applications":0}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/share",
          mockItems.get400Failure()
        );
      mGroup
        .addGroupMembers(group, MOCK_USER_REQOPTS)
        .then(() => done.fail(), () => done());
    });

    it("should add an item to a group", done => {
      const group = mockSolutions.getGroupTemplatePart(["map1234567890"]);
      function progressCallback(update: any): void {
        expect(update.processId).toEqual(group.key);
      }

      fetchMock
        .mock(
          "path:/sharing/rest/community/users/casey",
          '{"username":"casey","id":"grp1234567890"}'
        )
        .post(
          "path:/sharing/rest/search",
          '{"query":"id: map1234567890 AND group: grp1234567890",' +
            '"total":0,"start":1,"num":10,"nextStart":-1,"results":[]}'
        )
        .mock(
          "path:/sharing/rest/community/groups/grp1234567890",
          '{"id":"grp1234567890","title":"My group","owner":"casey",' +
            '"userMembership":{"username":"casey","memberType":"owner","applications":0}}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/map1234567890/share",
          '{"notSharedWith":[],"itemId":"map1234567890"}'
        );
      mGroup
        .addGroupMembers(group, MOCK_USER_REQOPTS, progressCallback)
        .then(() => done(), error => done.fail(error));
    });
  });

  describe("successful fetches", () => {
    it("should return a list of WMA details for a valid AGOL id", done => {
      setUpImageRequestSpy();

      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem("title", "x", "wma1234567890", MOCK_USER_REQOPTS)
        .then(
          (response: mInterfaces.ISolutionItem) => {
            expect(response.data.templates.length).toEqual(3);
            const itemTemplate = response.data.templates[0];
            expect(itemTemplate.type).toEqual("Web Mapping Application");
            expect(itemTemplate.item.title).toEqual("An AGOL item");
            expect(itemTemplate.data.source).toEqual("tpl1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should be able to use different credentials for reading and writing", done => {
      // Set up a UserSession to use in all these tests
      const DEST_MOCK_USER_SESSION = new UserSession({
        clientId: "clientId",
        redirectUri: "https://example-app.com/redirect-uri",
        token: "dest-fake-token",
        tokenExpires: TOMORROW,
        refreshToken: "refreshToken",
        refreshTokenExpires: TOMORROW,
        refreshTokenTTL: 1440,
        username: "casey",
        password: "123456",
        portal: "https://myorg.maps.arcgis.com/sharing/rest"
      });

      const DEST_MOCK_USER_REQOPTS: IUserRequestOptions = {
        authentication: DEST_MOCK_USER_SESSION
      };

      setUpImageRequestSpy();

      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem(
          "title",
          "x",
          "wma1234567890",
          MOCK_USER_REQOPTS,
          DEST_MOCK_USER_REQOPTS
        )
        .then(
          (response: mInterfaces.ISolutionItem) => {
            const getSourceWMACall = fetchMock.calls(
              "path:/sharing/rest/content/items/wma1234567890"
            );
            expect(
              getSourceWMACall[0][0].indexOf("token=fake-token")
            ).toBeGreaterThan(0);
            const addTemplateItemCall = fetchMock.calls(
              "path:/sharing/rest/content/users/casey/addItem"
            );
            expect(
              addTemplateItemCall[0][1].body
                .toString()
                .indexOf("token=dest-fake-token")
            ).toBeGreaterThan(0);

            expect(response.data.templates.length).toEqual(3);
            const itemTemplate = response.data.templates[0];
            expect(itemTemplate.type).toEqual("Web Mapping Application");
            expect(itemTemplate.item.title).toEqual("An AGOL item");
            expect(itemTemplate.data.source).toEqual("tpl1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should return a list of WMA details for a valid AGOL id in a list", done => {
      setUpImageRequestSpy();

      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem("title", "x", ["wma1234567890"], MOCK_USER_REQOPTS)
        .then(
          (response: mInterfaces.ISolutionItem) => {
            expect(response.data.templates.length).toEqual(3);
            const itemTemplate = response.data.templates[0];
            expect(itemTemplate.type).toEqual("Web Mapping Application");
            expect(itemTemplate.item.title).toEqual("An AGOL item");
            expect(itemTemplate.data.source).toEqual("tpl1234567890");
            done();
          },
          error => done.fail(error)
        );
    });

    it("should return a list of WMA details for a valid AGOL id in a list with more than one id", done => {
      setUpImageRequestSpy();

      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem(
          "title",
          "x",
          ["wma1234567890", "svc1234567890"],
          MOCK_USER_REQOPTS
        )
        .then(
          (response: mInterfaces.ISolutionItem) => {
            expect(response.data.templates.length).toEqual(3);
            const itemTemplate = response.data.templates[0];
            expect(itemTemplate.type).toEqual("Web Mapping Application");
            expect(itemTemplate.item.title).toEqual("An AGOL item");
            expect(itemTemplate.data.source).toEqual("tpl1234567890");
            done();
          },
          error => done.fail(error)
        );
    });
  });

  describe("catch bad input", () => {
    it("returns an error if the hierarchy to be created fails: missing id", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
      mSolution
        .createSolutionItem("title", "x", null, MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });

    it("returns an error if the hierarchy to be created fails: missing id", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
      mSolution
        .createSolutionItem("title", "x", null, MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });

    it("returns an error if the hierarchy to be created fails: empty id list", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
      mSolution
        .createSolutionItem("title", "x", [], MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });

    it("returns an error if the hierarchy to be created fails: missing id in list", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
      mSolution
        .createSolutionItem("title", "x", [null], MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });
  });

  describe("failed fetches", () => {
    it("returns an error if the hierarchy to be created fails: inaccessible", done => {
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/fail1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/community/groups/fail1234567890",
          mockItems.getAGOLItem()
        );
      mSolution
        .createSolutionItem("title", "x", "fail1234567890", MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });

    it("returns an error if the hierarchy to be created fails: inaccessible in a list", done => {
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/fail1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/community/groups/fail1234567890",
          mockItems.getAGOLItem()
        );
      mSolution
        .createSolutionItem("title", "x", ["fail1234567890"], MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });

    // Displays
    // Unmatched GET to https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890?f=json&token=fake-token
    // because fetch order is root items wma1234567890, fail1234567890 followed by the first's dependencies.
    // Promise.all catches failure of fail1234567890 and returns from function before any dependency is resolved.
    it("returns an error if the hierarchy to be created fails: list of [valid, inaccessible]", done => {
      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .mock(
          "path:/sharing/rest/content/items/fail1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/community/groups/fail1234567890",
          mockItems.getAGOLItem()
        );
      mSolution
        .createSolutionItem(
          "title",
          "x",
          ["wma1234567890", "fail1234567890"],
          MOCK_USER_REQOPTS
        )
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });

    it("returns an error if the hierarchy to be created fails: list of [valid, missing id]", done => {
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        );
      mSolution
        .createSolutionItem(
          "title",
          "x",
          ["wma1234567890", null],
          MOCK_USER_REQOPTS
        )
        .then(fail, error => {
          expect(error).toEqual(ArcgisRestSuccessFailStruct);
          done();
        });
    });

    it("should handle failure to update the solution item", done => {
      setUpImageRequestSpy();

      const baseSvcURL =
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/wma1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/data",
          mockItems.getAGOLItemData("Feature Service")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .post(
          "path:/sharing/rest/content/items/svc1234567890/info/thumbnail/ago_downloaded.png",
          200
        )
        .post(
          baseSvcURL + "FeatureServer?f=json",
          mockItems.getAGOLService(
            [mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer")],
            [mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table")]
          )
        )
        .post(
          baseSvcURL + "FeatureServer/0?f=json",
          mockItems.getAGOLLayerOrTable(0, "ROW Permits", "Feature Layer", [
            mockItems.createAGOLRelationship(0, 1, "esriRelRoleOrigin")
          ])
        )
        .post(
          baseSvcURL + "FeatureServer/1?f=json",
          mockItems.getAGOLLayerOrTable(1, "ROW Permit Comment", "Table", [
            mockItems.createAGOLRelationship(0, 0, "esriRelRoleDestination")
          ])
        )
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          mockItems.get400Failure()
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/addResources",
          '{"success":true,"itemId":"sln1234567890","owner":"casey","folder":null}'
        );
      mSolution
        .createSolutionItem("title", "x", "wma1234567890", MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });
  });

  describe("catch inability to get dependents", () => {
    it("returns an error if getting group dependencies fails", done => {
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/grp1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/community/groups/grp1234567890",
          mockItems.getAGOLGroup()
        )
        .mock(
          "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
            "?f=json&start=1&num=100&token=fake-token",
          mockItems.get400Failure()
        );
      mSolution
        .createSolutionItem("title", "x", ["grp1234567890"], MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });

    it("returns an error if a non-group dependency fails", done => {
      fetchMock
        .post(
          "path:/sharing/rest/content/users/casey/addItem",
          '{"success":true,"id":"sln1234567890","folder":null}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/share",
          '{"notSharedWith":[],"itemId":"sln1234567890"}'
        )
        .post(
          "path:/sharing/rest/content/users/casey/items/sln1234567890/update",
          '{"success":true,"id":"sln1234567890"}'
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890",
          mockItems.getAGOLItem("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/data",
          mockItems.getAGOLItemData("Web Mapping Application")
        )
        .mock(
          "path:/sharing/rest/content/items/wma1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890",
          mockItems.getAGOLItem("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .mock(
          "path:/sharing/rest/content/items/map1234567890/resources",
          mockItems.getAGOLItemResources("none")
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/community/groups/svc1234567890",
          mockItems.getAGOLItem()
        )
        .mock(
          "path:/sharing/rest/content/items/svc1234567890/resources",
          mockItems.getAGOLItemResources("none")
        );
      mSolution
        .createSolutionItem("title", "x", ["wma1234567890"], MOCK_USER_REQOPTS)
        .then(fail, error => {
          expect(checkForArcgisRestSuccessRequestError(error)).toBeTruthy();
          done();
        });
    });
  });

  describe("supporting routine: get template from template bundle", () => {
    it("empty bundle", () => {
      const bundle: mInterfaces.ITemplate[] = [];
      const idToFind = "abc123";
      const replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "ghi456"
      });

      expect(
        mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)
      ).toBeFalsy();
      expect(bundle.length).toEqual(0);
    });

    it("item not in bundle", () => {
      const placeholderTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "xyz098"
      });
      const bundle: mInterfaces.ITemplate[] = [placeholderTemplate];
      const idToFind = "abc123";
      const replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "ghi456"
      });

      expect(
        mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)
      ).toBeFalsy();
      expect(bundle.length).toEqual(1);
      expect(bundle[0].itemId).toEqual(placeholderTemplate.itemId);
    });

    it("item in bundle", () => {
      const placeholderTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "xyz098"
      });
      const bundle: mInterfaces.ITemplate[] = [placeholderTemplate];
      const idToFind = "xyz098";
      const replacementTemplate = Object.assign({}, MOCK_ITEM_PROTOTYPE, {
        itemId: "ghi456"
      });

      expect(
        mSolution.replaceTemplate(bundle, idToFind, replacementTemplate)
      ).toBeTruthy();
      expect(bundle.length).toEqual(1);
      expect(bundle[0].itemId).toEqual(replacementTemplate.itemId);
    });
  });
});
