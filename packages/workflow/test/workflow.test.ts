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
import * as utils from "../../common/test/mocks/utils";
import * as templates from "../../common/test/mocks/templates";
import * as workflow from "../src/workflow";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `workflow`", () => {

  describe("convertItemToTemplate", () => {
    it("initial test", async () => {
      await workflow.convertItemToTemplate();
    });
  });

  describe("createItemFromTemplate", () => {
    it("initial test", async () => {
      const itemId: string = "wfw1234567890";
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Workflow");

      await workflow.createItemFromTemplate(itemTemplate);
    });
  });

});
