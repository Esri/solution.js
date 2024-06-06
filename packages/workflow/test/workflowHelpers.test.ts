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
      const orgId = "abcdefghij";
      const itemId = "wfw1234567890";

      const agolItem = templates.getItemTemplate("Workflow");
      agolItem.thumbnail = null;

      spyOn(restRequest, "request").and.resolveTo({
        success: true,
        itemId
      });

      spyOn(common, "getItemBase").and.callFake(
        () => {
          return Promise.resolve(mockItems.getAGOLItem("Workflow", "", itemId) as common.IItem);
        }
      );

      const createdItemId = await workflowHelpers.addWorkflowItem(
        agolItem, "https://arcgis.com/orgId", MOCK_USER_SESSION);

      expect(createdItemId).toEqual(itemId);
    });
  });

  describe("fetchAuxiliaryItems", () => {
    it("handles failure to add workflow item", async () => {
      const itemId = "wfw1234567890";

      const searchItemsSpy = spyOn(common, "searchItems").and.resolveTo({
        results: [{ id: "item1" }, { id: "item2" }, { id: "item3" }]
      } as common.ISearchResult<common.IItem>);

      const auxiliaryItemsIds = await workflowHelpers.fetchAuxiliaryItems(itemId, MOCK_USER_SESSION);

      expect(searchItemsSpy.calls.count()).toBe(1);
      expect((searchItemsSpy.calls.argsFor(0)[0] as any).q)
        .toBe("title:workflow_wfw1234567890 OR title:WorkflowLocations_wfw1234567890 OR title:workflow_views_wfw1234567890");

      expect(auxiliaryItemsIds).toEqual(["item1", "item2", "item3"]);
    });
  });

});
