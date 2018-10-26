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

import { IFullItem, getFullItem } from "../src/fullItem";

import { ItemFailResponse, ItemResourcesSuccessResponseNone,
  ItemSuccessResponseDashboard, ItemDataSuccessResponseDashboard,
  ItemSuccessResponseWebmap, ItemDataSuccessResponseWebmap,
  ItemSuccessResponseWMA, ItemDataSuccessResponseWMA,
  ItemSuccessResponseService, ItemDataSuccessResponseService
} from "./mocks/fullItemQueries";
import { FeatureServiceSuccessResponse,
  FeatureServiceLayer0SuccessResponse, FeatureServiceLayer1SuccessResponse
} from "./mocks/featureService";

import { UserSession } from "@esri/arcgis-rest-auth";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { TOMORROW } from "./lib/utils";

//--------------------------------------------------------------------------------------------------------------------//

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
    fetchMock.mock("*", ItemFailResponse);
    getFullItem(null, MOCK_USER_REQOPTS)
    .then(
      fail,
      error => {
        expect(error.message).toEqual("Item or group does not exist or is inaccessible: null");
        done();
      }
    );
  });

  it("throws an error if the item id is not accessible: inaccessible", done => {
    fetchMock
    .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
    .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
    getFullItem("fail1234567890", MOCK_USER_REQOPTS)
    .then(
      fail,
      error => {
        expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
        done();
      }
    );
  });

  it("should return WMA details for a valid AGOL id", done => {
    fetchMock
    .mock("path:/sharing/rest/content/items/wma1234567890", ItemSuccessResponseWMA, {})
    .mock("path:/sharing/rest/content/items/wma1234567890/data", ItemDataSuccessResponseWMA, {})
    .mock("path:/sharing/rest/content/items/wma1234567890/resources", ItemResourcesSuccessResponseNone, {});
    getFullItem("wma1234567890")
    .then(
      response => {
        expect(response.type).toEqual("Web Mapping Application");
        expect(response.item.title).toEqual("ROW Permit Public Comment");
        expect(response.data.source).toEqual("template1234567890");
        done();
      },
      done.fail
    );
  });

  it("should return an error message for an invalid AGOL id (itemToJSON)", done => {
    fetchMock
    .mock("path:/sharing/rest/content/items/fail1234567890", ItemFailResponse, {})
    .mock("path:/sharing/rest/community/groups/fail1234567890", ItemFailResponse, {});
    getFullItem("fail1234567890", MOCK_USER_REQOPTS)
      .then(
      () => {
        done.fail("Invalid item 'found'");
      },
      error => {
        expect(error.message).toEqual("Item or group does not exist or is inaccessible: fail1234567890");
        done();
      }
    );
  });

  describe("for different item types", () => {

    [
      {
        id: "dash1234657890", type: "Dashboard",
        item: ItemSuccessResponseDashboard, data: ItemDataSuccessResponseDashboard, resources: ItemResourcesSuccessResponseNone
      },
      {
        id: "map1234657890", type: "Web Map",
        item: ItemSuccessResponseWebmap, data: ItemDataSuccessResponseWebmap, resources: ItemResourcesSuccessResponseNone
      },
      {
        id: "wma1234657890", type: "Web Mapping Application",
        item: ItemSuccessResponseWMA, data: ItemDataSuccessResponseWMA, resources: ItemResourcesSuccessResponseNone
      }
    ].forEach(({id, type, item, data, resources}) => {
      it("should create a " + type + " based on the AGOL response", done => {
        fetchMock
        .mock("path:/sharing/rest/content/items/" + id, item, {})
        .mock("path:/sharing/rest/content/items/" + id + "/data", data, {})
        .mock("path:/sharing/rest/content/items/" + id + "/resources", resources, {});

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
        .catch(e => {
          fail(e);
        });
      });
    });

    it("should create a Feature Service based on the AGOL response", done => {
      fetchMock
      .mock("path:/sharing/rest/content/items/svc1234567890", ItemSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/data", ItemDataSuccessResponseService, {})
      .mock("path:/sharing/rest/content/items/svc1234567890/resources", ItemResourcesSuccessResponseNone, {})
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json", FeatureServiceSuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json", FeatureServiceLayer0SuccessResponse)
      .post("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json", FeatureServiceLayer1SuccessResponse);

      getFullItem("svc1234567890", MOCK_USER_REQOPTS)
      .then(response => {
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890")).toEqual(true);
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/data")).toEqual(true);
        expect(fetchMock.called("path:/sharing/rest/content/items/svc1234567890/resources")).toEqual(true);
        //expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer?f=json")).toEqual(true);
        //expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0?f=json")).toEqual(true);
        //expect(fetchMock.called("https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/1?f=json")).toEqual(true);

        expect(response.type).toEqual("Feature Service");

        expect(response.item).toEqual(jasmine.anything());
        expect(Object.keys(response.item).length).toEqual(42);

        expect(response.data).toEqual(jasmine.anything());
        done();
      })
      .catch(e => {
        fail(e);
      });
    });

  });

});
