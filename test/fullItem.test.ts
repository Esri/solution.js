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

import { ItemFailResponse } from "./mocks/generalItem";

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

});