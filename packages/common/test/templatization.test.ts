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
 * Provides tests for functions involving the adlib library.
 */

import * as interfaces from "../src/interfaces";
import * as templatization from "../src/templatization";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `templatization`: common functions involving the adlib library", () => {
  describe("createInitializedGroupTemplate", () => {
    xit("createInitializedGroupTemplate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("createInitializedItemTemplate", () => {
    xit("createInitializedItemTemplate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("createPlaceholderTemplate", () => {
    xit("createPlaceholderTemplate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("findTemplateIndexInList", () => {
    it("should handle an empty list", () => {
      const templates: interfaces.IItemTemplate[] = [];
      const id: string = "";
      const expected: number = -1;

      const actual = templatization.findTemplateIndexInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list without the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "xyz";
      const expected: number = -1;

      const actual = templatization.findTemplateIndexInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list with the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "def";
      const expected: number = 1;

      const actual = templatization.findTemplateIndexInList(templates, id);
      expect(actual).toEqual(expected);
    });
  });

  describe("findTemplateInList", () => {
    it("should handle an empty list", () => {
      const templates: interfaces.IItemTemplate[] = [];
      const id: string = "";
      const expected: interfaces.IItemTemplate = null;

      const actual = templatization.findTemplateInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list without the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "xyz";
      const expected: interfaces.IItemTemplate = null;

      const actual = templatization.findTemplateInList(templates, id);
      expect(actual).toEqual(expected);
    });

    it("should handle list with the sought item", () => {
      const templates = createItemTemplateList(["abc", "def", "ghi", "jkl"]);
      const id: string = "def";
      const expected: interfaces.IItemTemplate = createItemTemplateList([
        "def"
      ])[0];

      const actual = templatization.findTemplateInList(templates, id);
      expect(actual).toEqual(expected);
    });
  });

  describe("replaceInTemplate", () => {
    xit("replaceInTemplate", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("templatizeTerm", () => {
    it("should handle undefined context", () => {
      const context: string = undefined;
      const term: string = "aTerm";
      const suffix: string = undefined;
      const expected: string = context;

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });

    it("should handle default suffix", () => {
      const context: string = "a sentence with aTerm in it";
      const term: string = "aTerm";
      const suffix: string = undefined;
      const expected: string = "a sentence with {{aTerm}} in it";

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });

    it("should handle supplied suffix", () => {
      const context: string = "a sentence with aTerm in it";
      const term: string = "aTerm";
      const suffix: string = ".id";
      const expected: string = "a sentence with {{aTerm.id}} in it";

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });

    it("should handle multiple occurrences of term", () => {
      const context: string =
        "a sentence with multiple aTerms in it: aTerm, aTerm";
      const term: string = "aTerm";
      const suffix: string = ".id";
      const expected: string =
        "a sentence with multiple {{aTerm.id}}s in it: {{aTerm.id}}, {{aTerm.id}}";

      const actual = templatization.templatizeTerm(context, term, suffix);
      expect(actual).toEqual(expected);
    });
  });

  describe("_createId", () => {
    xit("_createId", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });

  describe("_getRandomNumberInRange", () => {
    xit("_getRandomNumberInRange", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------ //

function createItemTemplateList(itemIds: string[]): interfaces.IItemTemplate[] {
  return itemIds.map(itemId => {
    return {
      itemId: itemId,
      type: "",
      key: "",
      item: "",
      data: "",
      resources: [] as any[],
      dependencies: [] as string[],
      properties: "",
      estimatedDeploymentCostFactor: 0
    };
  });
}
