/** @license
 * Copyright 2022 Esri
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

// ==================== Functions under test ======================================================================== //

function findAndPruneProperties(
  object: any,
  propertiesToPrune: string[]
): any {
  if (object == null || typeof object !== "object") {
    return object;
  }

  const updatedJson: any = {};
  Object.keys(object).forEach(
    (key: string) => {
      if (propertiesToPrune.includes(key)) {
        updatedJson[key] = "...";
      } else {
        updatedJson[key] = findAndPruneProperties(object[key], propertiesToPrune);
      }
    }
  );
  return updatedJson;
}

// ==================== Tests ======================================================================================= //

describe("Tests for `getFormattedItemInfo` functions", () => {

  describe("findAndPruneProperties", () => {
    it("returns a non-object", () => {
      expect(findAndPruneProperties("abcdefghij", [])).toEqual("abcdefghij");
    });

    it("returns a single-level-object", () => {
      expect(findAndPruneProperties({
        "prop1": "abcdefghij"
      }, [])).toEqual({
        "prop1": "abcdefghij"
      });
    });

    it("returns a single-level-object with pruning", () => {
      expect(findAndPruneProperties({
        "prop1": "abcdefghij"
      }, ["prop1"])).toEqual({
        "prop1": "..."
      });
    });

    it("returns a multiple-level-object", () => {
      expect(findAndPruneProperties({
        "prop1": {
          "prop2": "abcdefghij"
        }
      }, [])).toEqual({
        "prop1": {
          "prop2": "abcdefghij"
        }
      });
    });

    it("returns a multiple-level-object containing null and undefined", () => {
      expect(findAndPruneProperties({
        "prop1": {
          "prop2": null,
          "prop3": undefined,
          "prop4": ""
        }
      }, [])).toEqual({
        "prop1": {
          "prop2": null,
          "prop3": undefined,
          "prop4": ""
        }
      });
    });

    it("returns a multiple-level-object with level 1 pruning", () => {
      expect(findAndPruneProperties({
        "prop1": {
          "prop2": "abcdefghij"
        }
      }, ["prop1"])).toEqual({
        "prop1": "..."
      });
    });

    it("returns a multiple-level-object with level 2 pruning A", () => {
      expect(findAndPruneProperties({
        "prop1": {
          "prop2": "abcdefghij"
        }
      }, ["prop2"])).toEqual({
        "prop1": {
          "prop2": "..."
        }
      });
    });

    it("returns a multiple-level-object with level 2 pruning B", () => {
      expect(findAndPruneProperties({
        "prop1": {
          "prop2": {
            "prop3": "abcdefghij",
            "prop4": 123,
            "prop5": {
              "prop6": 456
            }
          }
        }
      }, ["prop2"])).toEqual({
        "prop1": {
          "prop2": "..."
        }
      });
    });

    it("returns a multiple-level-object with level 3 pruning A", () => {
      expect(findAndPruneProperties({
        "prop1": {
          "prop2": {
            "prop3": "abcdefghij"
          }
        }
      }, ["prop3"])).toEqual({
        "prop1": {
          "prop2": {
            "prop3": "..."
          }
        }
      });
    });

    it("returns a multiple-level-object with level 3 pruning B", () => {
      expect(findAndPruneProperties({
        "prop1": {
          "prop2": {
            "prop3": "abcdefghij",
            "prop4": 123,
            "prop5": {
              "prop6": 456
            }
          }
        }
      }, ["prop3"])).toEqual({
        "prop1": {
          "prop2": {
            "prop3": "...",
            "prop4": 123,
            "prop5": {
              "prop6": 456
            }
          }
        }
      });
    });
  });

});
