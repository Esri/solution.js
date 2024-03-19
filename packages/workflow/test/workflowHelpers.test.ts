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
      const agolItem = mockItems.getAGOLItem("Workflow");
      agolItem.thumbnail = null;
      const destinationFolderId = "fld1234567890";

      spyOn(restRequest, "request").and.resolveTo({
        success: true,
        itemId: "wfw1234567890"
      });

      spyOn(common, "getItemBase").and.resolveTo({} as any);  //???

      spyOn(common, "moveItemToFolder").and.resolveTo({} as any);  //???

      const itemTemplate = await workflowHelpers.addWorkflowItem(agolItem, destinationFolderId, MOCK_USER_SESSION);

      //???expect(itemTemplate?.properties?.configuration?.jobTemplates).toEqual("abc");
    });
  });
});
