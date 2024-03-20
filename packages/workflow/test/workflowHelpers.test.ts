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
 * Provides tests for functions involving deployment of workflow items.
 */

import * as common from "@esri/solution-common";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";
import * as workflowHelpers from "../src/workflowHelpers";
import * as restRequest from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `workflowHelpers`", () => {

  describe("addWorkflowItem", () => {
    it("basically works", async () => {
      const itemId = "wfw123456789";
      let itemIdOffset = 0;

      const agolItem = mockItems.getAGOLItem("Workflow");
      agolItem.thumbnail = null;
      const destinationFolderId = "fld1234567890";

      spyOn(restRequest, "request").and.resolveTo({
        success: true,
        itemId: itemId + (itemIdOffset++).toString()
      });

      spyOn(common, "getItemBase").and.callFake(
        (itemName: string, authentication: common.UserSession) => {
          return Promise.resolve(mockItems.getAGOLItem("Workflow", "", itemId + (itemIdOffset++).toString()));
        }
      );

      spyOn(common, "moveItemToFolder").and.callFake(
        (itemId: string, folderId: string, authentication: common.UserSession) => {
          return Promise.resolve({
            success: true,
            itemId,
            owner: authentication.username,
            folder: folderId
          });
        }
      );

      const itemTemplate = await workflowHelpers.addWorkflowItem(agolItem, destinationFolderId, MOCK_USER_SESSION);

      expect(itemTemplate).toEqual(agolItem);
    });

    it("handles failure to add workflow item", async () => {
      const agolItem = mockItems.getAGOLItem("Workflow");
      const destinationFolderId = "fld1234567890";

      spyOn(restRequest, "request").and.callFake(
        (url: string) => {
          if (url.includes("createWorkflowItem")) {
            throw new Error("Error");
          } else {
            return Promise.resolve({});
          }
        }
      );
      const itemTemplate = await workflowHelpers.addWorkflowItem(agolItem, destinationFolderId, MOCK_USER_SESSION);

      expect(itemTemplate).toBeNull();
    });
  });
});
