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

const fetchMock = require("fetch-mock");
import * as utils from "../mocks/utils";
import * as interfaces from "../../src/interfaces";
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
  authInfo: {},
};

describe("getBlob", () => {
  it("can get a blob from a URL", async() => {
    const url: string = "https://myserver/images/thumbnail.png";

    const getUrl = "https://myserver/images/thumbnail.png";
    const expectedServerInfo = SERVER_INFO;
    const expected = utils.getSampleImageAsBlob();
    fetchMock
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
        utils.getPortalsSelfResponse(),
      )
      .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
      .post(getUrl + "/rest/info", expectedServerInfo)
      .post(getUrl, expected, { sendAsJson: false });

    const response = await getBlob(url, MOCK_USER_SESSION);
    expect(response).toEqual(expected);
  });

  it("can handle an error from the REST endpoint request.request", async() => {
    const url: string = "https://myserver/images/thumbnail.png";

    const getUrl = "https://myserver/images/thumbnail.png";
    const expectedServerInfo = SERVER_INFO;
    fetchMock
      .get(
        "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
        utils.getPortalsSelfResponse(),
      )
      .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
      .post(getUrl + "/rest/info", expectedServerInfo)
      .post(getUrl, 503);

    return getBlob(url, MOCK_USER_SESSION).then(
      () => fail(),
      () => Promise.resolve(),
    );
  });
  it("handles undefined url", async() => {
    return getBlob(undefined as any, MOCK_USER_SESSION).then(
      () => fail(),
      () => Promise.resolve(),
    );
  });
});
