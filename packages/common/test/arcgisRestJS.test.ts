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
//import * as arcgisRestRequest from "@esri/arcgis-rest-request";
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

  it("tests binding function getSelf", async () => {
    const expected = utils.getPortalsSelfResponse();
    const selfUrl = `${utils.PORTAL_SUBSET.restUrl}/portals/self?f=json&token=fake-token`;

    fetchMock.get(selfUrl, expected);

    const response = await arcgisRestJS.getSelf({ authentication: MOCK_USER_SESSION });
    expect(response).toEqual(expected);
  });

  it("tests binding function queryRelated", async () => {
    const requestOptions: arcgisRestJS.IQueryRelatedOptions = {
      relationshipId: 0,
      url: "https://www.arcgis.com",
    };
    const expected: any = { relatedRecordGroups: [] };

    fetchMock.get(/queryRelatedRecords/, expected);

    const response = await arcgisRestJS.queryRelated(requestOptions);
    expect(response as any).toEqual(expected);
  });

  it("tests binding function removeItemResource", async () => {
    const requestOptions: arcgisRestJS.IRemoveItemResourceOptions = {
      id: "0",
      resource: "resource.json",
      authentication: MOCK_USER_SESSION,
    };
    const expected = { success: true };

    fetchMock.post(/removeResources/, expected);

    const response = await arcgisRestJS.removeItemResource(requestOptions);
    expect(response).toEqual(expected);
  });

  it("tests binding function restGetUser", async () => {
    const expected = { username: "casey" };

    fetchMock.get(/community\/(users|self)\//, expected);

    const response = await arcgisRestJS.restGetUser({ authentication: MOCK_USER_SESSION });
    expect(response).toEqual(expected);
  });

  it("tests binding function updateItemResource", async () => {
    const requestOptions: arcgisRestJS.IItemResourceOptions = {
      id: "0",
      name: "resource.json",
      content: "{}",
      authentication: MOCK_USER_SESSION,
    };
    const expected = { success: true, itemId: "0", owner: "casey", folder: null };

    fetchMock.post(/updateResources/, expected);

    const response = await arcgisRestJS.updateItemResource(requestOptions);
    expect(response).toEqual(expected);
  });

  it("tests binding function unprotectGroup", async () => {
    const requestOptions: arcgisRestJS.IUserGroupOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const expected = { success: true };

    fetchMock.post(/community\/groups\/0\/unprotect/, expected);

    const response = await arcgisRestJS.unprotectGroup(requestOptions);
    expect(response).toEqual(expected);
  });

  it("tests binding function unprotectItem", async () => {
    const requestOptions: arcgisRestJS.IUserItemOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const expected = { success: true };

    fetchMock.post(/content\/users\/casey\/items\/0\/unprotect/, expected);

    const response = await arcgisRestJS.unprotectItem(requestOptions);
    expect(response).toEqual(expected);
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
