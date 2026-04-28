/** @license
 * Copyright 2024 Esri
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
 * Provides tests for functions involving the arcgis-rest-js library.
 */

import * as arcgisRestJS from "../src/arcgisRestJS";
import * as utils from "./mocks/utils";
const fetchMock = require("fetch-mock");

let MOCK_USER_SESSION: arcgisRestJS.UserSession;

describe("Module arcgisRestJS", () => {
  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  // The wrapper functions in arcgisRestJS exist so that consumers can stub the
  // local module instead of stubbing upstream package bindings, which are
  // non-configurable under strict ESM. To verify each wrapper actually calls
  // through to the upstream function we drive fetch-mock at the underlying
  // REST endpoint and assert the network call was made.

  it("tests binding function getSelf", async () => {
    const url = utils.PORTAL_SUBSET.restUrl + "/portals/self";
    fetchMock.get(`begin:${url}`, { id: "abc" });
    await arcgisRestJS.getSelf({ authentication: MOCK_USER_SESSION });
    expect(fetchMock.called(`begin:${url}`)).toBe(true);
  });

  it("tests binding function queryRelated", async () => {
    const requestOptions: arcgisRestJS.IQueryRelatedOptions = {
      relationshipId: 0,
      url: "https://www.arcgis.com",
      authentication: MOCK_USER_SESSION,
    };
    const expectedUrl = "https://www.arcgis.com/queryRelatedRecords";
    fetchMock.get(`begin:${expectedUrl}`, { relatedRecords: [] });
    await arcgisRestJS.queryRelated(requestOptions);
    expect(fetchMock.called(`begin:${expectedUrl}`)).toBe(true);
  });

  it("tests binding function removeItemResource", async () => {
    const requestOptions: arcgisRestJS.IRemoveItemResourceOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const url = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/removeResources";
    fetchMock.post(`begin:${url}`, { success: true });
    await arcgisRestJS.removeItemResource(requestOptions);
    expect(fetchMock.called(`begin:${url}`)).toBe(true);
  });

  it("tests binding function restGetUser", async () => {
    const url = utils.PORTAL_SUBSET.restUrl + "/community/users/casey";
    fetchMock.get(`begin:${url}`, { username: "casey" });
    await arcgisRestJS.restGetUser({ authentication: MOCK_USER_SESSION });
    expect(fetchMock.called(`begin:${url}`)).toBe(true);
  });

  it("tests binding function updateItemResource", async () => {
    const requestOptions: arcgisRestJS.IItemResourceOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const url = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/updateResources";
    fetchMock.post(`begin:${url}`, { success: true });
    await arcgisRestJS.updateItemResource(requestOptions);
    expect(fetchMock.called(`begin:${url}`)).toBe(true);
  });

  it("tests binding function unprotectGroup", async () => {
    const requestOptions: arcgisRestJS.IUserGroupOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const url = utils.PORTAL_SUBSET.restUrl + "/community/groups/0/unprotect";
    fetchMock.post(`begin:${url}`, { success: true });
    await arcgisRestJS.unprotectGroup(requestOptions);
    expect(fetchMock.called(`begin:${url}`)).toBe(true);
  });

  it("tests binding function unprotectItem", async () => {
    const requestOptions: arcgisRestJS.IUserItemOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const url = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/0/unprotect";
    fetchMock.post(`begin:${url}`, { success: true });
    await arcgisRestJS.unprotectItem(requestOptions);
    expect(fetchMock.called(`begin:${url}`)).toBe(true);
  });

  it("tests getDomainCredentials with no trusted domains property", () => {
    MOCK_USER_SESSION["trustedDomains"] = undefined;
    const url: string = "https://www.arcgis.com";
    const originValue: string = MOCK_USER_SESSION.getDomainCredentials(url);
    expect(originValue).toBe("same-origin");
  });

  it("tests getDomainCredentials with trusted domains that doesn't include supplied url", () => {
    MOCK_USER_SESSION["trustedDomains"] = ["https://www.example.com"];
    const url: string = "https://www.arcgis.com";
    const originValue: string = MOCK_USER_SESSION.getDomainCredentials(url);
    expect(originValue).toBe("same-origin");
  });

  it("tests getDomainCredentials with trusted domains that includes supplied url", () => {
    MOCK_USER_SESSION["trustedDomains"] = ["https://www.example.com", "https://www.arcgis.com"];
    const url: string = "https://www.arcgis.com";
    const originValue: string = MOCK_USER_SESSION.getDomainCredentials(url);
    expect(originValue).toBe("include");
  });

  it("tests getDomainCredentials with trusted domains that includes supplied url but with different casing in authorized domains", () => {
    MOCK_USER_SESSION["trustedDomains"] = ["https://www.example.com", "https://www.ARCGIS.com"];
    const url: string = "https://www.arcgis.com";
    const originValue: string = MOCK_USER_SESSION.getDomainCredentials(url);
    expect(originValue).toBe("same-origin");
  });

  it("tests getDomainCredentials with trusted domains that includes supplied url but with different casing in supplied url", () => {
    MOCK_USER_SESSION["trustedDomains"] = ["https://www.example.com", "https://www.arcgis.com"];
    const url: string = "https://www.ARCGIS.com";
    const originValue: string = MOCK_USER_SESSION.getDomainCredentials(url);
    expect(originValue).toBe("same-origin");
  });
});
