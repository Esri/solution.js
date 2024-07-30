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
import * as portalModule from "@esri/arcgis-rest-portal";
import * as hubCommonModule from "@esri/hub-common";
import * as utils from "../../../common/test/mocks/utils";
import { createWebExperience } from "../../src/helpers/create-web-experience";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("createWebExperience :: ", () => {
  let createItemSpy: jasmine.Spy;
  let interpolateIdSpy: jasmine.Spy;
  let updateItemSpy: jasmine.Spy;
  let addResSpy: jasmine.Spy;
  let moveItemSpy: jasmine.Spy;
  beforeEach(() => {
    createItemSpy = spyOn(portalModule, "createItem").and.resolveTo({
      id: "bc3",
      folder: "fakefolderid",
      success: true,
    });
    interpolateIdSpy = spyOn(hubCommonModule, "interpolateItemId").and.callThrough();
    updateItemSpy = spyOn(portalModule, "updateItem").and.resolveTo({
      id: "bc3",
      success: true,
    });
    addResSpy = spyOn(portalModule, "addItemResource").and.resolveTo({
      itemId: "bc3",
      owner: "casey",
      folder: "",
      success: true,
    });
    moveItemSpy = spyOn(portalModule, "moveItem").and.resolveTo({
      success: true,
      folder: "3ef",
      owner: "casey",
      itemId: "bc3",
    });
  });

  it("happy-path", async () => {
    const model = {
      item: {} as portalModule.IItem,
      data: {
        some: "properties", // we don't care much what's in here
      },
      properties: {
        imageResourcesList: {
          another: "property", // again, can be whatever
        },
      },
    } as hubCommonModule.IModel;

    await createWebExperience(model, "fakefolderid", {}, MOCK_USER_SESSION);
    expect(createItemSpy.calls.count()).withContext("should create the item").toBe(1);
    expect(interpolateIdSpy.calls.count()).withContext("should call interpolateId").toBe(1);
    expect(updateItemSpy.calls.count()).withContext("should call updateItem").toBe(1);
    expect(addResSpy.calls.count()).withContext("should add three resources").toBe(2);
    expect(moveItemSpy.calls.count()).withContext("should move the item").toBe(1);
    const moveOpts = moveItemSpy.calls.argsFor(0)[0];
    expect(moveOpts.folderId).withContext("should pass the folderid into create item").toBe("fakefolderid");
  });

  it("happy-path with thumbnail", async () => {
    const model = {
      item: {
        thumbnail: "yoda",
      } as any,
      data: {
        some: "properties", // we don't care much what's in here
      },
      properties: {
        imageResourcesList: {
          another: "property", // again, can be whatever
        },
      },
    } as hubCommonModule.IModel;

    await createWebExperience(model, "fakefolderid", {}, MOCK_USER_SESSION);
    expect(createItemSpy.calls.count()).withContext("should create the item").toBe(1);
    expect(createItemSpy.calls.argsFor(0)[0].item.thumbnail).not.toBeDefined();
    expect(createItemSpy.calls.argsFor(0)[0].params.thumbnail).toEqual("yoda");

    expect(interpolateIdSpy.calls.count()).withContext("should call interpolateId").toBe(1);
    expect(updateItemSpy.calls.count()).withContext("should call updateItem").toBe(1);
    expect(addResSpy.calls.count()).withContext("should add three resources").toBe(2);
    expect(moveItemSpy.calls.count()).withContext("should move the item").toBe(1);
    const moveOpts = moveItemSpy.calls.argsFor(0)[0];
    expect(moveOpts.folderId).withContext("should pass the folderid into create item").toBe("fakefolderid");
  });

  it("no image resources", async () => {
    const model = {
      item: {} as portalModule.IItem,
      data: {
        some: "properties", // we don't care much what's in here
      },
      properties: {},
    } as hubCommonModule.IModel;

    await createWebExperience(model, "fakefolderid", {}, MOCK_USER_SESSION);
    expect(createItemSpy.calls.count()).withContext("should create the item").toBe(1);
    expect(interpolateIdSpy.calls.count()).withContext("should call interpolateId").toBe(1);
    expect(updateItemSpy.calls.count()).withContext("should call updateItem").toBe(1);
    expect(addResSpy.calls.count()).withContext("should add one resources").toBe(1);
    expect(moveItemSpy.calls.count()).withContext("should move the item").toBe(1);
  });
});
