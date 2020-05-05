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

import { _upgradeTwoDotTwo } from "../../src/migrations/upgrade-two-dot-two";
import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { ISolutionItem } from "../../src/interfaces";

describe("Upgrade 2.2 ::", () => {
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
      templates: [] as IItemTemplate[]
    }
  } as ISolutionItem;

  it("returns same model if on or above 2.2", () => {
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 2.3;
    const chk = _upgradeTwoDotTwo(m);
    expect(chk).toBe(m, "should return the exact same object");
  });

  it("replaces old tokens with new ones", () => {
    const m = cloneObject(defaultModel);
    // add something with one of the old tags into the .data
    m.data.metadata.chk = {
      solName: "{{solution.name}}"
    };
    const chk = _upgradeTwoDotTwo(m);
    expect(chk).not.toBe(m, "should not return the exact same object");
    expect(chk.data.metadata.chk.solName).toBe(
      "{{solution.title}}",
      "should do a swap"
    );
  });
});
