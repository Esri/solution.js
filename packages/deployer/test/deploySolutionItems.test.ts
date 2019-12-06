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

/**
 * Provides tests for functions involving deployment of items via the REST API.
 */

import {
  deploySolutionItems,
  _createItemFromTemplateWhenReady
} from "../src/deploySolutionItems";

import {
  createRuntimeMockUserSession,
  PROGRESS_CALLBACK
} from "../../common/test/mocks/utils";

import { getItemTemplate } from "../../common/test/mocks/templates";

// ------------------------------------------------------------------------------------------------------------------ //

const now = new Date();
const MOCK_USER_SESSION = createRuntimeMockUserSession(now.getDate());

describe("Module `deploySolutionItems`", () => {
  describe("deploySolutionItems", () => {
    it("can handle unimplemented item type gracefully", done => {
      deploySolutionItems(
        "",
        "",
        [getItemTemplate()],
        MOCK_USER_SESSION,
        {},
        MOCK_USER_SESSION,
        PROGRESS_CALLBACK
      ).then(
        () => {
          done();
        },
        () => {
          done.fail();
        }
      );
    });
  });

  describe("_createItemFromTemplateWhenReady", () => {
    xit("_createItemFromTemplateWhenReady", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_topologicallySortItems", () => {
    xit("_topologicallySortItems", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});
