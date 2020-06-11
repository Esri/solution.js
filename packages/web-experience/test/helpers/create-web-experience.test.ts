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
      success: true
    });
    interpolateIdSpy = spyOn(
      hubCommonModule,
      "interpolateItemId"
    ).and.callThrough();
    updateItemSpy = spyOn(portalModule, "updateItem").and.resolveTo({
      id: "bc3",
      success: true
    });
    addResSpy = spyOn(portalModule, "addItemResource").and.resolveTo({
      itemId: "bc3",
      owner: "casey",
      folder: "",
      success: true
    });
    moveItemSpy = spyOn(portalModule, "moveItem").and.resolveTo({
      success: true,
      folder: "3ef",
      owner: "casey",
      itemId: "bc3"
    });
  });

  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    it("happy-path", () => {
      const model = {
        item: {} as portalModule.IItem,
        data: {
          some: "properties" // we don't care much what's in here
        },
        properties: {
          imageResourcesList: {
            another: "property" // again, can be whatever
          }
        }
      } as hubCommonModule.IModel;

      return createWebExperience(
        model,
        "fakefolderid",
        {},
        MOCK_USER_SESSION
      ).then(result => {
        expect(createItemSpy.calls.count()).toBe(1, "should create the item");
        expect(interpolateIdSpy.calls.count()).toBe(
          1,
          "should call interpolateId"
        );
        expect(updateItemSpy.calls.count()).toBe(1, "should call updateItem");
        expect(addResSpy.calls.count()).toBe(2, "should add three resources");
        expect(moveItemSpy.calls.count()).toBe(1, "should move the item");
        const moveOpts = moveItemSpy.calls.argsFor(0)[0];
        expect(moveOpts.folderId).toBe(
          "fakefolderid",
          "should pass the folderid into create item"
        );
      });
    });

    it("no image resources", () => {
      const model = {
        item: {} as portalModule.IItem,
        data: {
          some: "properties" // we don't care much what's in here
        },
        properties: {}
      } as hubCommonModule.IModel;

      return createWebExperience(
        model,
        "fakefolderid",
        {},
        MOCK_USER_SESSION
      ).then(result => {
        expect(createItemSpy.calls.count()).toBe(1, "should create the item");
        expect(interpolateIdSpy.calls.count()).toBe(
          1,
          "should call interpolateId"
        );
        expect(updateItemSpy.calls.count()).toBe(1, "should call updateItem");
        expect(addResSpy.calls.count()).toBe(1, "should add one resources");
        expect(moveItemSpy.calls.count()).toBe(1, "should move the item");
      });
    });
  }
});
