/** @license
 * Copyright 2020 Esri
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

import * as copyResourceModule from "../../src/resources/copy-resource";
import * as fetchMock from "fetch-mock";
import * as utils from "../mocks/utils";
import * as interfaces from "../../src/interfaces";
import * as mockItems from "../mocks/agolItems";
import { getBlob } from "../../src/resources/get-blob";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://myorg.maps.arcgis.com",
  authInfo: {}
};

describe("getBlob", () => {
  it("can get a blob from a URL", done => {
    const url: string = "https://myserver/images/thumbnail.png";

    const getUrl = "https://myserver/images/thumbnail.png";
    const expectedServerInfo = SERVER_INFO;
    const expected = utils.getSampleImageAsBlob();
    fetchMock
      .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
      .post(getUrl + "/rest/info", expectedServerInfo)
      .post(getUrl, expected, { sendAsJson: false });

    getBlob(url, MOCK_USER_SESSION).then(response => {
      expect(response).toEqual(expected);
      done();
    }, done.fail);
  });

  it("can handle an error from the REST endpoint request.request", done => {
    const url: string = "https://myserver/images/thumbnail.png";

    const getUrl = "https://myserver/images/thumbnail.png";
    const expectedServerInfo = SERVER_INFO;
    fetchMock
      .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
      .post(getUrl + "/rest/info", expectedServerInfo)
      .post(getUrl, 503);
    getBlob(url, MOCK_USER_SESSION).then(
      () => done.fail(),
      () => done()
    );
  });
  it("handles undefined url", done => {
    return getBlob(undefined, MOCK_USER_SESSION).then(
      () => done.fail(),
      () => done()
    );
  });
});
