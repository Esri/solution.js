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

/**
 * Provides tests for functions involving the creation and deployment of Notebook item types.
 */

import * as common from "@esri/solution-common";
import * as fetchMock from "fetch-mock";
import * as notebook from "../src/notebook";
import * as utils from "../../common/test/mocks/utils";

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `notebook`: manages the creation and deployment of notebook project item types", () => {
  describe("_updateItemData", () => {
    it("handles update error", done => {
      const data = {};

      notebook._updateItemData("itm1234567890", data, MOCK_USER_SESSION).then(
        () => done.fail(),
        () => done()
      );
    });
  });
});
