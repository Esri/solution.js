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

import { shareItemToGroups } from "../../src/sharing/index";
import * as portal from "@esri/arcgis-rest-portal";
import * as testUtils from "../mocks/utils";
import { UserSession } from "../../src";

let MOCK_USER_SESSION: UserSession;

describe("shareItemToGroups", () => {
  beforeEach(() => {
    MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
  });
  it("it does not share if no groups sent", () => {
    const shareSpy = spyOn(portal, "shareItemWithGroup").and.resolveTo({
      itemId: "3ef"
    });
    return shareItemToGroups([], "3ef", MOCK_USER_SESSION).then(() => {
      expect(shareSpy.calls.count()).toBe(
        0,
        "should not share if no groups passed"
      );
    });
  });
  it("it shares a item to a single group", () => {
    const shareSpy = spyOn(portal, "shareItemWithGroup").and.resolveTo({
      itemId: "3ef"
    });
    return shareItemToGroups(["bc1"], "3ef", MOCK_USER_SESSION).then(() => {
      expect(shareSpy.calls.count()).toBe(1, "call shareItemToGroups once");
    });
  });
  it("it shares a item to a single group", () => {
    const shareSpy = spyOn(portal, "shareItemWithGroup").and.resolveTo({
      itemId: "3ef"
    });
    return shareItemToGroups(["bc1", "bc2"], "3ef", MOCK_USER_SESSION).then(
      () => {
        expect(shareSpy.calls.count()).toBe(2, "call shareItemToGroups twice");
      }
    );
  });
});
