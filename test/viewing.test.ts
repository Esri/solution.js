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

import * as mInterfaces from "../src/interfaces";
import * as mViewing from "../src/viewing";

// -------------------------------------------------------------------------------------------------------------------//

describe("Module `viewing`: supporting solution item display in AGOL", () => {

  describe("get item hierarchies", () => {

    const MOCK_ITEM_PROTOTYPE:mInterfaces.ITemplate = {
      itemId: "",
      type: "",
      key: "",
      item: null
    };

    it("item without dependencies", () => {
      // hierarchy:
      // - abc
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.itemId = "abc";

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: []
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc]);

      expect(results).toEqual(expected);
    });

    it("item with empty list of dependencies", () => {
      // hierarchy:
      // - abc
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.itemId = "abc";

      abc.dependencies = [];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: []
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc]);

      expect(results).toEqual(expected);
    });

    it("item with single dependency", () => {
      // hierarchy:
      // - abc
      //   - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.itemId = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.itemId = "def";

      abc.dependencies = ["def"];

      const expected:mViewing.IHierarchyEntry[] = [{
        id: "abc",
        dependencies: [{
          id: "def",
          dependencies: []
        }]
      }];

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc, def]);
      expect(results).toEqual(expected);
    });

    it("item with two dependencies", () => {
      // hierarchy:
      // - abc
      //   - def
      //   - ghi
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.itemId = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.itemId = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.itemId = "ghi";

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

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc, def, ghi]);

      expect(results).toEqual(expected);
    });

    it("item with two-level dependencies", () => {
      // hierarchy:
      // - abc
      //   - ghi
      //     - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.itemId = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.itemId = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.itemId = "ghi";

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

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc, def, ghi]);

      expect(results).toEqual(expected);
    });

    it("two top-level items, one with two dependencies", () => {
      // hierarchy:
      // - abc
      // - jkl
      //   - ghi
      //   - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.itemId = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.itemId = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.itemId = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.itemId = "jkl";

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

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc, def, ghi, jkl]);

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
      abc.itemId = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.itemId = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.itemId = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.itemId = "jkl";

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

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc, def, ghi, jkl]);

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
      abc.itemId = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.itemId = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.itemId = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.itemId = "jkl";
      const mno = {...MOCK_ITEM_PROTOTYPE};
      mno.itemId = "mno";
      const pqr = {...MOCK_ITEM_PROTOTYPE};
      pqr.itemId = "pqr";

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

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc, def, ghi, jkl, mno, pqr]);

      expect(results).toEqual(expected);
    });

    it("only top-level items--no dependencies", () => {
      // hierarchy:
      // - abc
      // - jkl
      // - ghi
      // - def
      const abc = {...MOCK_ITEM_PROTOTYPE};
      abc.itemId = "abc";
      const def = {...MOCK_ITEM_PROTOTYPE};
      def.itemId = "def";
      const ghi = {...MOCK_ITEM_PROTOTYPE};
      ghi.itemId = "ghi";
      const jkl = {...MOCK_ITEM_PROTOTYPE};
      jkl.itemId = "jkl";

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

      const results:mViewing.IHierarchyEntry[] = mViewing.getItemHierarchy([abc, def, ghi, jkl]);

      expect(results).toEqual(expected);
    });

  });

});
