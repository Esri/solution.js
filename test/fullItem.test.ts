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

import { getFullItem } from "../src/fullItem";

import { UserSession } from "@esri/arcgis-rest-auth";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import { TOMORROW } from "./lib/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/items";

//--------------------------------------------------------------------------------------------------------------------//

describe("Module `fullItem`: fetches the item, data, and resources of an AGOL item", () => {

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

  describe("fetch different item types", () => {
    [
      {
        id: "dash1234657890", type: "Dashboard", item: mockItems.getAGOLItem("Dashboard"),
        data: mockItems.getAGOLItemData("Dashboard"), resources: mockItems.getAGOLItemResources("none")
      },
      {
        id: "map1234657890", type: "Web Map", item: mockItems.getAGOLItem("Web Map"),
        data: mockItems.getAGOLItemData("Web Map"), resources: mockItems.getAGOLItemResources("none")
      },
      {
        id: "wma1234657890", type: "Web Mapping Application", item: mockItems.getAGOLItem("Web Mapping Application"),
        data: mockItems.getAGOLItemData("Web Mapping Application"), resources: mockItems.getAGOLItemResources("none")
      }
    ].forEach(({id, type, item, data, resources}) => {
      it("should create a " + type + " based on the AGOL response", done => {
        fetchMock
        .mock("path:/sharing/rest/content/items/" + id, item)
        .mock("path:/sharing/rest/content/items/" + id + "/data", data)
        .mock("path:/sharing/rest/content/items/" + id + "/resources", resources);

        getFullItem(id, MOCK_USER_REQOPTS)
        .then(response => {
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id)).toEqual(true);
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/data")).toEqual(true);
          expect(fetchMock.called("path:/sharing/rest/content/items/" + id + "/resources")).toEqual(true);

          expect(response.type).toEqual(type);

          expect(response.item).toEqual(jasmine.anything());
          expect(Object.keys(response.item).length).toEqual(42);

          expect(response.data).toEqual(jasmine.anything());
          done();
        })
        .catch(e => fail(e));
      });
    });

    it("should create a Feature Service based on the AGOL response", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/svc1234567890", mockItems.getAGOLItem("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/data", mockItems.getAGOLItemData("Feature Service"))
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", mockItems.getAGOLItemResources("none"));

      getFullItem("svc1234567890", MOCK_USER_REQOPTS)
      .then(response => {
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890")).toEqual(true);
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/data")).toEqual(true);
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/resources")).toEqual(true);

        expect(response.type).toEqual("Feature Service");

        expect(response.item).toEqual(jasmine.anything());
        expect(Object.keys(response.item).length).toEqual(42);

        expect(response.data).toEqual(jasmine.anything());
        done();
      })
      .catch(e => fail(e));
    });

    it("should return WMA details for a valid AGOL id", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources("one text"));
      getFullItem("wma1234567890")
      .then(
        response => {
          expect(response.type).toEqual("Web Mapping Application");
          expect(response.item.title).toEqual("An AGOL item");
          expect(response.data.source).toEqual("tpl1234567890");
          expect(response.resources).toEqual([{ "value": "abc"}]);
          done();
        },
        done.fail
      );
    });

    it("should handle an item without a data or a resource section", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/wma1234567890", mockItems.getAGOLItem("Web Mapping Application"))
      .mock("path:/sharing/rest/content/items/wma1234567890/data", mockItems.getAGOLItemData())
      .mock("path:/sharing/rest/content/items/wma1234567890/resources", mockItems.getAGOLItemResources());
      getFullItem("wma1234567890")
      .then(
        response => {
          expect(response.type).toEqual("Web Mapping Application");
          expect(response.item.title).toEqual("An AGOL item");
          done();
        },
        done.fail
      );
    });

  });

  describe("catch bad input", () => {

    it("throws an error if the item to be created fails: missing id", done => {
      fetchMock.mock("*", mockItems.getAGOLItem());
      getFullItem(null, MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
          done();
        }
      );
    });

    it("throws an error if the item to be created fails: inaccessible", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/fail1234567890", mockItems.getAGOLItem())
      .mock("path:/sharing/rest/community/groups/fail1234567890", mockItems.getAGOLItem());
      getFullItem("fail1234567890", MOCK_USER_REQOPTS)
      .then(
        fail,
        error => {
          expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
          done();
        }
      );
    });

  });

});
