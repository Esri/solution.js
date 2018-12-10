/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions andn
 | limitations under the License.
 */

import * as mFullItem from "../src/fullItem";
import * as mViewing from "../src/viewing";

// -------------------------------------------------------------------------------------------------------------------//

describe("Module `viewing`: supporting solution item display in AGOL", () => {

  describe("get item hierarchies", () => {

    const MOCK_ITEM_PROTOTYPE:mFullItem.IFullItem = {
      type: "",
      item: {}
    };

    it("item without dependencies", () => {
      // hierarchy:
      // - abc
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: []
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc
      });

      expect(results).toEqual(expected);
    });

    it("item with empty list of dependencies", () => {
      // hierarchy:
      // - abc
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";

      abc.dependencies = [];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: []
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc
      });

      expect(results).toEqual(expected);
    });

    it("item with single dependency", () => {
      // hierarchy:
      // - abc
      //   - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.item.id = "def";

      abc.dependencies = ["def"];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: [{
          id: "def",
          dependencies: []
        }]
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc,
        "def": def
      });

      expect(results).toEqual(expected);
    });

    it("item with two dependencies", () => {
      // hierarchy:
      // - abc
      //   - def
      //   - ghi
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.item.id = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.item.id = "ghi";

      abc.dependencies = ["def", "ghi"];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: [{
          id: "def",
          dependencies: []
        }, {
          id: "ghi",
          dependencies: []
        }]
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc,
        "def": def,
        "ghi": ghi
      });

      expect(results).toEqual(expected);
    });

    it("item with two-level dependencies", () => {
      // hierarchy:
      // - abc
      //   - ghi
      //     - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.item.id = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.item.id = "ghi";

      abc.dependencies = ["ghi"];
      ghi.dependencies = ["def"];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: [{
          id: "ghi",
          dependencies: [{
            id: "def",
            dependencies: []
          }]
        }]
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc,
        "def": def,
        "ghi": ghi
      });

      expect(results).toEqual(expected);
    });

    it("two top-level items, one with two dependencies", () => {
      // hierarchy:
      // - abc
      // - jkl
      //   - ghi
      //   - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.item.id = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.item.id = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.item.id = "jkl";

      jkl.dependencies = ["ghi", "def"];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: []
      }, {
        id: "jkl",
        dependencies: [{
          id: "ghi",
          dependencies: []
        }, {
          id: "def",
          dependencies: []
        }]
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc,
        "def": def,
        "ghi": ghi,
        "jkl": jkl
      });

      expect(results).toEqual(expected);
    });

    it("two top-level items with the same two dependencies", () => {
      // hierarchy:
      // - abc
      //   - def
      //   - ghi
      // - jkl
      //   - ghi
      //   - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.item.id = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.item.id = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.item.id = "jkl";

      abc.dependencies = ["def", "ghi"];
      jkl.dependencies = ["ghi", "def"];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: [{
          id: "def",
          dependencies: []
        }, {
          id: "ghi",
          dependencies: []
        }]
      }, {
        id: "jkl",
        dependencies: [{
          id: "ghi",
          dependencies: []
        }, {
          id: "def",
          dependencies: []
        }]
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc,
        "def": def,
        "ghi": ghi,
        "jkl": jkl
      });

      expect(results).toEqual(expected);
    });

    it("three top-level items, one with two dependencies, one with three-level dependencies", () => {
      // hierarchy:
      // - def
      //   - mno
      //     - abc
      // - jkl
      // - pqr
      //   - ghi
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.item.id = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.item.id = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.item.id = "jkl";
      const mno = {...MOCK_ITEM_PROTOTYPE};
      mno.item.id = "mno";
      const pqr = {...MOCK_ITEM_PROTOTYPE};
      pqr.item.id = "pqr";

      pqr.dependencies = ["ghi"];
      mno.dependencies = ["abc"];
      def.dependencies = ["mno"];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "def",
        dependencies: [{
          id: "mno",
          dependencies: [{
            id: "abc",
            dependencies: []
          }]
        }]
      }, {
        id: "jkl",
        dependencies: []
      }, {
        id: "pqr",
        dependencies: [{
          id: "ghi",
          dependencies: []
        }]
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc,
        "def": def,
        "ghi": ghi,
        "jkl": jkl,
        "mno": mno,
        "pqr": pqr
      });

      expect(results).toEqual(expected);
    });

    it("only top-level items--no dependencies", () => {
      // hierarchy:
      // - abc
      // - jkl
      // - ghi
      // - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.item.id = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.item.id = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.item.id = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.item.id = "jkl";

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: []
      }, {
        id: "def",
        dependencies: []
      }, {
        id: "ghi",
        dependencies: []
      }, {
        id: "jkl",
        dependencies: []
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy({
        "abc": abc,
        "def": def,
        "ghi": ghi,
        "jkl": jkl
      });

      expect(results).toEqual(expected);
    });

  });

});