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

import * as arcgisRestFeatureLayer from "@esri/arcgis-rest-feature-layer";
import * as arcgisRestJS from "../src/arcgisRestJS";
import * as arcgisRestPortal from "@esri/arcgis-rest-portal";
//import * as arcgisRestRequest from "@esri/arcgis-rest-request";
import * as sinon from "sinon";
import * as utils from "./mocks/utils";

let MOCK_USER_SESSION: arcgisRestJS.UserSession;

describe("Module arcgisRestJS", () => {
  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("tests binding function getSelf", async () => {
    const getSelfSpy = sinon.stub(arcgisRestPortal, "getSelf").resolves();
    await arcgisRestJS.getSelf();
    expect(getSelfSpy.called);
  });

  it("tests binding function queryRelated", async () => {
    const requestOptions: arcgisRestJS.IQueryRelatedOptions = {
      relationshipId: 0,
      url: "https://www.arcgis.com",
    };
    const queryRelatedSpy = sinon.stub(arcgisRestFeatureLayer, "queryRelated").resolves();
    await arcgisRestJS.queryRelated(requestOptions);
    expect(queryRelatedSpy.called);
  });

  it("tests binding function removeItemResource", async () => {
    const requestOptions: arcgisRestJS.IRemoveItemResourceOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const removeItemResourceSpy = sinon.stub(arcgisRestPortal, "removeItemResource").resolves();
    await arcgisRestJS.removeItemResource(requestOptions);
    expect(removeItemResourceSpy.called);
  });

  it("tests binding function restGetUser", async () => {
    const restGetUserSpy = sinon.stub(arcgisRestPortal, "getUser").resolves();
    await arcgisRestJS.restGetUser();
    expect(restGetUserSpy.called);
  });

  it("tests binding function updateItemResource", async () => {
    const requestOptions: arcgisRestJS.IItemResourceOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const updateItemResourceSpy = sinon.stub(arcgisRestPortal, "updateItemResource").resolves();
    await arcgisRestJS.updateItemResource(requestOptions);
    expect(updateItemResourceSpy.called);
  });

  it("tests binding function unprotectGroup", async () => {
    const requestOptions: arcgisRestJS.IUserGroupOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const unprotectGroupSpy = sinon.stub(arcgisRestPortal, "unprotectGroup").resolves();
    await arcgisRestJS.unprotectGroup(requestOptions);
    expect(unprotectGroupSpy.called);
  });

  it("tests binding function unprotectItem", async () => {
    const requestOptions: arcgisRestJS.IUserItemOptions = {
      id: "0",
      authentication: MOCK_USER_SESSION,
    };
    const unprotectItemSpy = sinon.stub(arcgisRestPortal, "unprotectItem").resolves();
    await arcgisRestJS.unprotectItem(requestOptions);
    expect(unprotectItemSpy.called);
  });
});
