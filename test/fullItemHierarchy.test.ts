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

import * as fetchMock from "fetch-mock";

import { IFullItem } from "../src/fullItem";
import { IItemHash, getFullItemHierarchy } from "../src/fullItemHierarchy";

import { ItemFailResponse, ItemResourcesSuccessResponseNone,
  ItemSuccessResponseWMA, ItemDataSuccessResponseWMA,
  ItemSuccessResponseWebmap, ItemDataSuccessResponseWebmap,
  ItemSuccessResponseService, ItemDataSuccessResponseService
} from "./mocks/fullItemQueries";
import { FeatureServiceSuccessResponse,
  FeatureServiceLayer0SuccessResponse, FeatureServiceLayer1SuccessResponse
} from "./mocks/featureService";

import { UserSession } from "@esri/arcgis-rest-auth";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { TOMORROW } from "./lib/utils";

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `fullItemHierarchy`: fetches one or more AGOL items and their dependencies", () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;  // default is 5000 ms

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

  const MOCK_USER_REQOPTS:IUserRequestOptions = {
    authentication: MOCK_USER_SESSION
  };

  afterEach(() => {
    fetchMock.restore();
  });

  describe("catch bad input", () => {

    it("throws an error if the hierarchy to be created fails: missing id", done => {
      fetchMock.once("*", ItemFailResponse);
      getFullItemHierarchy(null, MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: empty id list", done => {
      fetchMock.once("*", ItemFailResponse);
      getFullItemHierarchy([], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: missing id in list", done => {
      fetchMock.once("*", ItemFailResponse);
      getFullItemHierarchy([null], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: inaccessible", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
      getFullItemHierarchy("fail1234567890", MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: inaccessible in a list", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
      getFullItemHierarchy(["fail1234567890"], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: list of [valid, inaccessible]", done => {
      let baseSvcURL = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/";
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .post(baseSvcURL + "FeatureServer?f=json", FeatureServiceSuccessResponse)
      .post(baseSvcURL + "FeatureServer/0?f=json", FeatureServiceLayer0SuccessResponse)
      .post(baseSvcURL + "FeatureServer/1?f=json", FeatureServiceLayer1SuccessResponse)
      .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
      getFullItemHierarchy(["wma1234567890", "fail1234567890"], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

    it("throws an error if the hierarchy to be created fails: list of [valid, missing id]", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {});
      getFullItemHierarchy(["wma1234567890", null], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

  });

  describe("successful fetches", () => {

    it("should return a list of WMA details for a valid AGOL id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {});
      getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          let fullItem:IFullItem = response[keys[0]] as IFullItem;
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("ROW Permit Public Comment");
          expect(fullItem.data.source).toEqual("template1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {});
      getFullItemHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          let fullItem:IFullItem = response[keys[0]] as IFullItem;
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("ROW Permit Public Comment");
          expect(fullItem.data.source).toEqual("template1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list with more than one id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {});
      getFullItemHierarchy(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          let fullItem:IFullItem = response[keys[0]] as IFullItem;
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("ROW Permit Public Comment");
          expect(fullItem.data.source).toEqual("template1234567890");
          done();
        },
        done.fail
      );
    });

    it("should handle repeat calls without re-fetching items", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {});
      getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (collection:IItemHash) => {
          let keys = Object.keys(collection);
          expect(keys.length).toEqual(3);
          expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);

          getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS, collection)
          .then(
            (collection2:IItemHash) => {
              let keys = Object.keys(collection2);
              expect(keys.length).toEqual(3);  // unchanged
              expect(fetchMock.calls("begin:https://myorg.maps.arcgis.com/").length).toEqual(9);
              expect(collection2).toEqual(collection);
              done();
            },
            done.fail
          );
        },
        done.fail
      );
    });

    it("should handle case were a dependency fails", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/svc1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {});
      getFullItemHierarchy(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
      .then(
        () => {
          console.warn('false success');//???
          done.fail();
        },
        () => {
          console.warn('true fail');//???
          done();
        }
      );
    });

  });

});
