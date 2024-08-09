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

describe("Upgrade 2.3 ::", () => {
  const defaultModel = {
    item: {
      type: "Solution",
      typeKeywords: ["Solution", "Template"],
      properties: {
        schemaVersion: 2.1,
      },
    },
    data: {
      metadata: {},
      templates: [
        {
          item: {},
          resources: ["foo.jpg"],
        },
        {
          item: {},
        },
      ] as IItemTemplate[],
    },
  } as ISolutionItem;

  it("returns same model if on or above 2.3", () => {
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 2.3;
    const chk = _upgradeTwoDotThree(m);
    expect(chk).withContext("should return the exact same object").toBe(m);
  });

  it("swaps resources to assets", () => {
    const m = cloneObject(defaultModel);
    const chk = _upgradeTwoDotThree(m);
    expect(chk).withContext("should not return the exact same object").not.toBe(m);
    const tmpl = chk.data.templates[0];
    expect(tmpl.assets.length).withContext("should add assets array").toBe(1);
    expect(tmpl.resources).withContext("should remove resources array").not.toBeDefined();
  });
});
