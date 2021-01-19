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
import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { ISolutionItem } from "../../src/interfaces";
import { _upgradeTwoDotSeven } from "../../src/migrations/upgrade-two-dot-seven";
describe("Upgrade 2.7 ::", () => {
  it("returns same model if on or above 2.7", () => {
    const m = cloneObject(defaultModel);
    m.item.properties.schemaVersion = 2.7;
    const chk = _upgradeTwoDotSeven(m);
    expect(chk).toBe(m, "should return the exact same object");
  });
  it("adds missing ids, dependencies", () => {
    const m = cloneObject(defaultModel);
    const chk = _upgradeTwoDotSeven(m);
    const tmpls = chk.data.templates;
    expect(tmpls[0].itemId).toBeDefined("add itemId to first template");
    expect(tmpls[0].dependencies).toBeDefined(
      "add dependencies to first template"
    );
    expect(Array.isArray(tmpls[0].dependencies)).toBe(
      true,
      "add dependencies array to first template"
    );
    expect(tmpls[0].dependencies.length).toBe(
      0,
      "should not add entries to dependencies on first template"
    );
    expect(tmpls[1].dependencies).toBeDefined(
      "add dependencies to second template"
    );
    expect(Array.isArray(tmpls[1].dependencies)).toBe(
      true,
      "add dependencies array to second template"
    );
    expect(tmpls[1].dependencies.length).toBe(
      1,
      "should add entries to dependencies on second template"
    );
    expect(tmpls[2].dependencies.length).toBe(
      1,
      "should add entries to dependencies on third template"
    );
  });
});

const defaultModel = {
  item: {
    type: "Solution",
    typeKeywords: ["Solution", "Template"],
    properties: {
      schemaVersion: 2.6
    }
  },
  data: {
    metadata: {},
    templates: [
      {
        item: {}
      },
      {
        item: {},
        itemId: "two"
      },
      {
        item: {},
        itemId: "three",
        dependencies: []
      }
    ] as IItemTemplate[]
  }
} as ISolutionItem;
