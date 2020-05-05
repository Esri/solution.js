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

import { _isLegacySolution } from "../../src/migrations/is-legacy-solution";
import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { ISolutionItem } from "../../src/interfaces";

describe("isLegacySolution", () => {
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

  it("returns false for a Solution", () => {
    const m = cloneObject(defaultModel);
    expect(_isLegacySolution(m)).toBe(
      false,
      "should return false for Solution"
    );
  });
  it("returns false for an item that lacks keywords", () => {
    const m = cloneObject(defaultModel);
    delete m.item.typeKeywords;
    expect(_isLegacySolution(m)).toBe(
      false,
      "should return false for model w/o keywords"
    );
  });
  it("returns true for a hub solution", () => {
    const m = cloneObject(defaultModel);
    m.item.typeKeywords = ["hubSolutionTemplate", "solutionTemplate"];
    expect(_isLegacySolution(m)).toBe(
      true,
      "should return true for hub solution"
    );
  });
});
