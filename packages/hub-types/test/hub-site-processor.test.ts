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
import * as utils from "@esri/solution-common/test/mocks/utils";
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

import { HubSiteProcessor } from "../src/index";

fdescribe("HubSiteProcessor: ", () => {
  describe("convertItemToTemplate: ", () => {
    it("exists", () => {
      expect(HubSiteProcessor.convertItemToTemplate).toBeDefined(
        "Should have convertItemToTemplate method"
      );
    });
    it("returns a promise", () => {
      expect(HubSiteProcessor.convertItemToTemplate).toBeDefined(
        "Should have convertItemToTemplate method"
      );
    });
  });
  describe("createItemFromTemplate: ", () => {
    it("exists", () => {
      expect(HubSiteProcessor.createItemFromTemplate).toBeDefined(
        "Should have createItemFromTemplate method"
      );
    });
  });
});
