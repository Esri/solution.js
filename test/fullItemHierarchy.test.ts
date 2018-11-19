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

import { IFullItem } from "../src/fullItem";
import { IItemHash, getFullItemHierarchy } from "../src/fullItemHierarchy";

import { UserSession } from "@esri/arcgis-rest-auth";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/items";
import * as mockServices from "./mocks/featureServices";

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

  describe("successful fetches", () => {

    it("should return a list of WMA details for a valid AGOL id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      getFullItemHierarchy("wma1234567890", MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          let fullItem:IFullItem = response[keys[0]] as IFullItem;
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("An AGOL item");
          expect(fullItem.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      getFullItemHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          let fullItem:IFullItem = response[keys[0]] as IFullItem;
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("An AGOL item");
          expect(fullItem.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should return a list of WMA details for a valid AGOL id in a list with more than one id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      getFullItemHierarchy(["wma1234567890", "svc1234567890"], MOCK_USER_REQOPTS)
      .then(
        (response:IItemHash) => {
          let keys = Object.keys(response);
          expect(keys.length).toEqual(3);
          let fullItem:IFullItem = response[keys[0]] as IFullItem;
          expect(fullItem.type).toEqual("Web Mapping Application");
          expect(fullItem.item.title).toEqual("An AGOL item");
          expect(fullItem.data.source).toEqual("tpl1234567890");
          done();
        },
        done.fail
      );
    });

    it("should handle repeat calls without re-fetching items", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
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

  });

  describe("catch bad input", () => {

    it("throws an error if the hierarchy to be created fails: missing id", done => {
      fetchMock.once("*", mockItems.getAGOLItem());
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
      fetchMock.once("*", mockItems.getAGOLItem());
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
      fetchMock.once("*", mockItems.getAGOLItem());
      getFullItemHierarchy([null], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

  });

  describe("failed fetches", () => {

    it("throws an error if the hierarchy to be created fails: inaccessible", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
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
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
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
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"))
      .post(baseSvcURL + "FeatureServer?f=json", mockServices.getService(
        [mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer")],
        [mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table")]
      ))
      .post(baseSvcURL + "FeatureServer/0?f=json", mockServices.getLayerOrTable(0, "ROW Permits", "Feature Layer",
        [mockServices.getRelationship(0, 1, "esriRelRoleOrigin")]
      ))
      .post(baseSvcURL + "FeatureServer/1?f=json", mockServices.getLayerOrTable(1, "ROW Permit Comment", "Table",
        [mockServices.getRelationship(0, 0, "esriRelRoleDestination")]
      ))
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
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
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      getFullItemHierarchy(["wma1234567890", null], MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if getting dependencies fails", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/grp1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/grp1234567890", mockItems.getAGOLGroup())
      .mock(
        "https://myorg.maps.arcgis.com/sharing/rest/content/groups/grp1234567890" +
        "?f=json&start=0&num=100&token=fake-token",
        '{"error":{"code":400,"messageCode":"CONT_0006",' +
        '"message":"Group does not exist or is inaccessible.","details":[]}}');
      getFullItemHierarchy(["grp1234567890"], MOCK_USER_REQOPTS)
      .then(
        () => {
          done.fail();
        },
        error => {
          expect(error).toEqual("Group does not exist or is inaccessible.");
          done();
        }
      );
    });

    it("throws an error if a dependency fails", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/map1234567890", mockItems.getAGOLItem("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/data", mockItems.getAGOLItemData("Web Map"))
      .mock("path:/sharing/rest/content/items/map1234567890/resources", mockItems.getAGOLItemResources("none"))
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/svc1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));
      getFullItemHierarchy(["wma1234567890"], MOCK_USER_REQOPTS)
      .then(
        () => {
          done.fail();
        },
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: svc1234567890");
          done();
        }
      );
    });

  });

});