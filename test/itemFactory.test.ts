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

import { ItemFactory, IItemHash } from "../src/itemFactory";
import { ItemWithData } from "../src/itemWithData";
import { AgolItem } from "../src/agolItem";

import { ItemFailResponse,
  ItemSuccessResponseWMA, ItemDataSuccessResponseWMA,
  ItemSuccessResponseWebmap, ItemDataSuccessResponseWebmap,
  ItemSuccessResponseService, ItemDataSuccessResponseService } from "./mocks/itemWithData";
import { DashboardItemSuccessResponse, DashboardItemDataSuccessResponse } from "./mocks/dashboard";
import { FeatureServiceItemSuccessResponse, FeatureServiceItemDataSuccessResponse, FeatureServiceSuccessResponse,
  FeatureServiceLayer0SuccessResponse, FeatureServiceLayer1SuccessResponse } from "./mocks/featureService";
import { WebMapItemSuccessResponse, WebMapItemDataSuccessResponse } from "./mocks/webmap";
import { WebMappingAppItemSuccessResponse, WebMappingAppItemDataSuccessResponse } from "./mocks/webMappingApp";

import { UserSession } from "@esri/arcgis-rest-auth";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { TOMORROW } from "./lib/utils";

describe("converting an item into JSON", () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;  // default is 5000 ms

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

  it("throws an error if the item id is not accessible: missing id", done => {
    fetchMock.once("*", ItemFailResponse);
    ItemFactory.itemToJSON(null, MOCK_USER_REQOPTS)
    .then(
      fail,
      error => {
        expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
        done();
      }
    );
  });

  it("throws an error if the item id is not accessible: inaccessible", done => {
    fetchMock
    .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
    .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
  ItemFactory.itemToJSON("fail1234567890", MOCK_USER_REQOPTS)
    .then(
      fail,
      error => {
        expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
        done();
      }
    );
  });

  describe("with accurate function documentation", () => {

    it("should return WMA details for a valid AGOL id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {});
      ItemFactory.itemToJSON("wma1234567890")
      .then(
        (response:AgolItem) => {
          expect(response.type).toEqual("Web Mapping Application");
          expect(response.itemSection.title).toEqual("ROW Permit Public Comment");
          expect((response as ItemWithData).dataSection.source).toEqual("template1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return an error message for an invalid AGOL id (itemToJSON)", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
      ItemFactory.itemToJSON("fail1234567890", MOCK_USER_REQOPTS)
        .then(
        () => {
          done.fail("Invalid item 'found'");
        },
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
          done();
        }
      );
    });

    it("should return a list of WMA details for a valid AGOL id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", FeatureServiceSuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", FeatureServiceLayer0SuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", FeatureServiceLayer1SuccessResponse);
      ItemFactory.itemHierarchyToJSON("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          expect((response[keys[0]] as AgolItem).type).toEqual("Web Mapping Application");
          expect((response[keys[0]] as AgolItem).itemSection.title).toEqual("ROW Permit Public Comment");
          expect((response[keys[0]] as ItemWithData).dataSection.source).toEqual("template1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", FeatureServiceSuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", FeatureServiceLayer0SuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", FeatureServiceLayer1SuccessResponse);
      ItemFactory.itemHierarchyToJSON(["wma1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          expect((response[keys[0]] as AgolItem).type).toEqual("Web Mapping Application");
          expect((response[keys[0]] as AgolItem).itemSection.title).toEqual("ROW Permit Public Comment");
          expect((response[keys[0]] as ItemWithData).dataSection.source).toEqual("template1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list with more than one id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", FeatureServiceSuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", FeatureServiceLayer0SuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", FeatureServiceLayer1SuccessResponse);
      ItemFactory.itemHierarchyToJSON(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          expect((response[keys[0]] as AgolItem).type).toEqual("Web Mapping Application");
          expect((response[keys[0]] as AgolItem).itemSection.title).toEqual("ROW Permit Public Comment");
          expect((response[keys[0]] as ItemWithData).dataSection.source).toEqual("template1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return an error message for an invalid AGOL id (itemHierarchyToJSON)", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
      ItemFactory.itemHierarchyToJSON("fail1234567890", MOCK_USER_REQOPTS)
      .then(
        () => {
          done.fail("Invalid item 'found'");
        },
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
          done();
        }
      );
    });

    it("should return an error message for an invalid AGOL id in a list", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
      ItemFactory.itemHierarchyToJSON(["fail1234567890"], MOCK_USER_REQOPTS)
      .then(
        () => {
          done.fail("Invalid item 'found'");
        },
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
          done();
        }
      );
    });

    it("should return an error message for an invalid AGOL id in a list with more than one id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
      .mock("path:/sharing/rest/content/items/map1234567890", ItemSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/map1234567890/data", ItemDataSuccessResponseWebmap, {})
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", FeatureServiceSuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", FeatureServiceLayer0SuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", FeatureServiceLayer1SuccessResponse)
      .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
      .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
      ItemFactory.itemHierarchyToJSON(["wma1234567890", "fail1234567890"], MOCK_USER_REQOPTS)
      .then(
        () => {
          done.fail("Invalid item 'found'");
        },
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible.");
          done();
        }
      );
    });

  });

  describe("for different item types", () => {

    [
      {id: "dash1234657890", type: "Dashboard", item: DashboardItemSuccessResponse, data: DashboardItemDataSuccessResponse},
      {id: "map1234657890", type: "Web Map", item: WebMapItemSuccessResponse, data: WebMapItemDataSuccessResponse},
      {id: "wma1234657890", type: "Web Mapping Application", item: WebMappingAppItemSuccessResponse, data: WebMappingAppItemDataSuccessResponse}
    ].forEach(({id, type, item, data}) => {
      it("should create a " + type + " based on the AGOL response", done => {
        fetchMock
        .mock("path:/sharing/rest/content/items/" + id, item, {})
        .mock("path:/sharing/rest/content/items/" + id + "/data", data, {});

        ItemFactory.itemToJSON(id, MOCK_USER_REQOPTS)
        .then((response:AgolItem) => {
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id)).toEqual(true);
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/data")).toEqual(true);

          expect(response.type).toEqual(type);

          expect(response.itemSection).toEqual(jasmine.anything());
          expect(Object.keys(response.itemSection).length).toEqual(16);
          //console.log(Object.keys(response.itemSection)); //???
          expect(response.itemSection.owner).toBeUndefined();
          expect(response.itemSection.created).toBeUndefined();
          expect(response.itemSection.modified).toBeUndefined();

          expect(response.dataSection).toEqual(jasmine.anything());
          done();
        })
        .catch(e => {
          fail(e);
        });
      });
    });

    it("should create a Feature Service based on the AGOL response", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", FeatureServiceSuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", FeatureServiceLayer0SuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", FeatureServiceLayer1SuccessResponse);

      ItemFactory.itemToJSON("svc1234567890", MOCK_USER_REQOPTS)
      .then((response:AgolItem) => {
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890")).toEqual(true);
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/data")).toEqual(true);
        expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json")).toEqual(true);
        expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json")).toEqual(true);
        expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json")).toEqual(true);

        expect(response.type).toEqual("Feature Service");

        expect(response.itemSection).toEqual(jasmine.anything());
        expect(Object.keys(response.itemSection).length).toEqual(33);
        expect(response.itemSection.owner).toBeUndefined();
        expect(response.itemSection.created).toBeUndefined();
        expect(response.itemSection.modified).toBeUndefined();

        expect(response.dataSection).toEqual(jasmine.anything());
        done();
      })
      .catch(e => {
        fail(e);
      });
    });

  });

});