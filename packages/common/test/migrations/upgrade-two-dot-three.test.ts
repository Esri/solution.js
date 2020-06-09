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

import { _upgradeTwoDotThree } from "../../src/migrations/upgrade-two-dot-three";
import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { ISolutionItem } from "../../src/interfaces";
import * as utils from "../../../common/test/mocks/utils";

describe("Upgrade 2.3 ::", () => {
  const defaultModel = {
    item: {
      type: "Solution",
      typeKeywords: ["Solution", "Template"],
      properties: {
        schemaVersion: 2.1
      }
    },
    data: {
      metadata: {},
      templates: [
        {
          item: {},
          resources: ["foo.jpg"]
        },
        {
          item: {}
        }
      ] as IItemTemplate[]
    }
  } as ISolutionItem;

  const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

  it("returns same model if on or above 2.3", () => {
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 2.3;
    const chk = _upgradeTwoDotThree(m, MOCK_USER_SESSION);
    expect(chk).toBe(m, "should return the exact same object");
  });

  it("swaps resources to assets", () => {
    const m = cloneObject(defaultModel);
    const chk = _upgradeTwoDotThree(m, MOCK_USER_SESSION);
    expect(chk).not.toBe(m, "should not return the exact same object");
    const tmpl = chk.data.templates[0];
    expect(tmpl.assets.length).toBe(1, "should add assets array");
    expect(tmpl.resources).not.toBeDefined("should remove resources array");
  });
});
