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

import { _upgradeThreeDotZero } from "../../src/migrations/upgrade-three-dot-zero";
import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { ISolutionItem } from "../../src/interfaces";
import * as utils from "../../../common/test/mocks/utils";

describe("Upgrade 3.0 ::", () => {
  const defaultModel = {
    item: {
      type: "Solution",
      typeKeywords: ["Solution", "Template"],
      properties: {
        schemaVersion: 3.0
      }
    },
    data: {
      metadata: {},
      templates: [
        {
          item: {},
          data: {},
          resources: [
            "84095a0a06a04d1e9f9b40edb84e277f_jobs/ViewJob_1590513214593.json"
          ]
        }
      ] as IItemTemplate[]
    }
  } as ISolutionItem;

  const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

  it("returns same model if above 3", () => {
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 3.1;
    const chk = _upgradeThreeDotZero(m);
    expect(chk).toEqual(m, "should return the exact same object");
  });

  it("adds schema version if missing", () => {
    const m = cloneObject(defaultModel);
    delete m.item.properties.schemaVersion;
    const chk = _upgradeThreeDotZero(m);
    expect(chk).not.toBe(m, "should not return the exact same object");
    expect(chk.item.properties.schemaVersion).toBe(
      3,
      "should add schema version"
    );
  });
});
