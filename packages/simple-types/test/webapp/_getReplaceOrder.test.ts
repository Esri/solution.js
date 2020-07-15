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

import { _getReplaceOrder } from "../../src/webapp/_getReplaceOrder";
import * as getSortModule from "../../src/webapp/_getSortOrder";
import * as common from "@esri/solution-common";

describe("webapp:: _getReplaceOrder", () => {
  it("returns sorted dataSourceInfos", () => {
    // create a fake implementation that just returns the length of the itemId
    // this allows us to focus the test on the logic in this function vs testing
    // _getSortOrder, which has it's own tests
    const sortSpy = spyOn(getSortModule, "_getSortOrder").and.callFake(a => {
      return a.itemId.length;
    });

    // create an array of itemId's of different lengths
    // so we can observe it filtering out ones with length >= 4
    // and sorting the others by length
    const infos = [
      { itemId: "greg" },
      { itemId: "albert" },
      { itemId: "m" },
      { itemId: "zed" },
      { itemId: "ty" }
    ] as common.IDatasourceInfo[];

    const chk = _getReplaceOrder({ prop: "val" }, infos);

    expect(sortSpy.calls.count()).toBeGreaterThanOrEqual(
      3,
      "should call sort at least 3 times"
    );
    expect(chk.length).toBe(3, "should filter out if getSortOrder >=4 ");
    expect(chk).toEqual(
      [
        { itemId: "m" },
        { itemId: "ty" },
        { itemId: "zed" }
      ] as common.IDatasourceInfo[],
      "should sort the returned array"
    );
  });
});
