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

import { createStoryMap } from "../../src/helpers/create-storymap";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("createStoryMap ::", () => {
  it("happy-path", async() => {
    // model
    const model = {
      item: {
        id: "3ef",
        owner: "vader",
      } as portalModule.IItem,
      data: {
        // we don't care about whats in here
      },
      properties: {
        draftFileName: "draft_123124123.json",
        oembed: { key: "val" },
        oembedXML: "<xml>This is xml. Really. it is.</xml>",
      },
    } as hubCommonModule.IModel;

    // setup spies
    const createItemSpy = spyOn(portalModule, "createItem").and.resolveTo({
      id: "bc3",
      folder: "fakefolderid",
      success: true,
    });
    const interpolateIdSpy = spyOn(hubCommonModule, "interpolateItemId").and.callThrough();
    const updateItemSpy = spyOn(portalModule, "updateItem").and.resolveTo({
      id: "bc3",
      success: true,
    });
    const addResSpy = spyOn(portalModule, "addItemResource").and.resolveTo({
      itemId: "bc3",
      owner: "casey",
      folder: "",
      success: true,
    });
    const moveItemSpy = spyOn(portalModule, "moveItem").and.resolveTo({
      success: true,
      folder: "3ef",
      owner: "casey",
      itemId: "bc3",
    });

    await createStoryMap(model, "fakefolderid", {}, MOCK_USER_SESSION);
    expect(createItemSpy.calls.count()).withContext("should create the item").toBe(1);

    expect(interpolateIdSpy.calls.count()).withContext("should call interpolateId").toBe(1);
    expect(updateItemSpy.calls.count()).withContext("should call updateItem").toBe(1);
    expect(addResSpy.calls.count()).withContext("should add four resources").toBe(4);
    if (typeof Blob !== "undefined") {
      const draftArgs = addResSpy.calls.argsFor(0)[0];
      expect(draftArgs.resource instanceof Blob)
        .withContext("should send a blob")
        .toBe(true);
    }
    expect(moveItemSpy.calls.count()).withContext("should move the item").toBe(1);
    const moveOpts = moveItemSpy.calls.argsFor(0)[0];
    expect(moveOpts.folderId).withContext("should pass the folderid into create item").toBe("fakefolderid");
  });

  it("happy-path with thumbnail", async() => {
    // model
    const model = {
      item: {
        id: "3ef",
        owner: "vader",
        thumbnail: "yoda",
      } as any,
      data: {
        // we don't care about whats in here
      },
      properties: {
        draftFileName: "draft_123124123.json",
        oembed: { key: "val" },
        oembedXML: "<xml>This is xml. Really. it is.</xml>",
      },
    } as hubCommonModule.IModel;

    // setup spies
    const createItemSpy = spyOn(portalModule, "createItem").and.resolveTo({
      id: "bc3",
      folder: "fakefolderid",
      success: true,
    });
    const interpolateIdSpy = spyOn(hubCommonModule, "interpolateItemId").and.callThrough();
    const updateItemSpy = spyOn(portalModule, "updateItem").and.resolveTo({
      id: "bc3",
      success: true,
    });
    const addResSpy = spyOn(portalModule, "addItemResource").and.resolveTo({
      itemId: "bc3",
      owner: "casey",
      folder: "",
      success: true,
    });
    const moveItemSpy = spyOn(portalModule, "moveItem").and.resolveTo({
      success: true,
      folder: "3ef",
      owner: "casey",
      itemId: "bc3",
    });

    await createStoryMap(model, "fakefolderid", {}, MOCK_USER_SESSION);
    expect(createItemSpy.calls.count()).withContext("should create the item").toBe(1);
    expect(createItemSpy.calls.argsFor(0)[0].item.thumbnail).not.toBeDefined();
    expect(createItemSpy.calls.argsFor(0)[0].params?.thumbnail).toEqual("yoda");

    expect(interpolateIdSpy.calls.count()).withContext("should call interpolateId").toBe(1);
    expect(updateItemSpy.calls.count()).withContext("should call updateItem").toBe(1);
    expect(addResSpy.calls.count()).withContext("should add four resources").toBe(4);
    if (typeof Blob !== "undefined") {
      const draftArgs = addResSpy.calls.argsFor(0)[0];
      expect(draftArgs.resource instanceof Blob)
        .withContext("should send a blob")
        .toBe(true);
    }
    expect(moveItemSpy.calls.count()).withContext("should move the item").toBe(1);
    const moveOpts = moveItemSpy.calls.argsFor(0)[0];
    expect(moveOpts.folderId).withContext("should pass the folderid into create item").toBe("fakefolderid");
  });
});
