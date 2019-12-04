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
 * Provides tests for the creation and deployment of  item types that contain files.
 */

import * as binaryData from "../src/file";
import * as utils from "../../common/test/mocks/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as common from "@esri/solution-common";

// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = new common.UserSession({
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

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

const noResourcesResponse: any = {
  total: 0,
  start: 1,
  num: 0,
  nextStart: -1,
  resources: []
};

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

/* tslint:disable:no-empty */
describe("Module `file`: manages the creation and deployment of  item types that contain files", () => {});
