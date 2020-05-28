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

import { moveModelToFolder } from "../../src/helpers/move-model-to-folder";
import { IModel } from "@esri/hub-common";
import * as portal from "@esri/arcgis-rest-portal";

import * as utils from "../../../common/test/mocks/utils";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("moveModelToFolder", () => {
  describe("just a site", () => {
    it("moves just the site", () => {
      const m = {
        item: {
          id: "3ef"
        }
      } as IModel;

      const moveItemSpy = spyOn(portal, "moveItem").and.resolveTo({
        success: true
      } as portal.IMoveItemResponse);

      return moveModelToFolder(m, "bc4", MOCK_USER_SESSION).then(result => {
        expect(result[0].success).toBe(true, "should return true");
        expect(moveItemSpy.calls.count()).toEqual(
          1,
          "should make one move call"
        );
        expect(moveItemSpy.calls.argsFor(0)[0].itemId).toBe("3ef");
        expect(moveItemSpy.calls.argsFor(0)[0].folderId).toBe("bc4");
      });
    });
    it("is failsafed because the move is ", () => {
      const m = {
        item: {
          id: "3ef"
        }
      } as IModel;

      const moveItemSpy = spyOn(portal, "moveItem").and.rejectWith({
        success: false
      } as portal.IMoveItemResponse);

      return moveModelToFolder(m, "bc4", MOCK_USER_SESSION).then(result => {
        expect(result[0].success).toBe(true, "should return true");
        expect(moveItemSpy.calls.count()).toEqual(
          1,
          "should make one move call"
        );
        expect(moveItemSpy.calls.argsFor(0)[0].itemId).toBe("3ef");
        expect(moveItemSpy.calls.argsFor(0)[0].folderId).toBe("bc4");
      });
    });
  });
  describe("with initiative", () => {
    it("moves site and initiative", () => {
      const m = {
        item: {
          id: "3ef",
          properties: {
            parentInitiativeId: "4ef"
          }
        }
      } as IModel;

      const moveItemSpy = spyOn(portal, "moveItem").and.resolveTo({
        success: true
      } as portal.IMoveItemResponse);

      return moveModelToFolder(m, "bc4", MOCK_USER_SESSION).then(result => {
        expect(result.length).toBe(2, "should fire two promises");
        expect(result[0].success).toBe(true, "should return true");
        expect(result[1].success).toBe(true, "should return true");
        expect(moveItemSpy.calls.count()).toEqual(
          2,
          "should make two move calls"
        );
        expect(moveItemSpy.calls.argsFor(0)[0].itemId).toBe("3ef");
        expect(moveItemSpy.calls.argsFor(0)[0].folderId).toBe("bc4");
        expect(moveItemSpy.calls.argsFor(1)[0].itemId).toBe("4ef");
        expect(moveItemSpy.calls.argsFor(1)[0].folderId).toBe("bc4");
      });
    });
  });
});
