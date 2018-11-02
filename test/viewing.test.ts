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
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import * as viewing from "../src/viewing";
import { IFullItem } from "../src/fullItem";
import { IItemHash } from "../src/fullItemHierarchy";

//--------------------------------------------------------------------------------------------------------------------//

describe("supporting solution item display in AGOL", () => {

  const MOCK_ITEM_PROTOTYPE:IFullItem = {
    type: "",
    item: {}
  };

  it("item without dependencies", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item.id = "abc";

    let expected:viewing.IHierarchyEntry[] = [{
      id: "abc",
      dependencies: []
    }];

    let results:viewing.IHierarchyEntry[] = viewing.getItemHierarchy({
      "abc": abc
    });

    expect(results).toEqual(expected);
  });

  it("item with empty list of dependencies", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item.id = "abc";

    abc.dependencies = [];

    let expected:viewing.IHierarchyEntry[] = [{
      id: "abc",
      dependencies: []
    }];

    let results:viewing.IHierarchyEntry[] = viewing.getItemHierarchy({
      "abc": abc
    });

    expect(results).toEqual(expected);
  });

  it("item with single dependency", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item.id = "abc";
    let def = {...MOCK_ITEM_PROTOTYPE};
    def.item.id = "def";

    abc.dependencies = ["def"];

    let expected:viewing.IHierarchyEntry[] = [{
      id: "abc",
      dependencies: [{
        id: "def",
        dependencies: []
      }]
    }];

    let results:viewing.IHierarchyEntry[] = viewing.getItemHierarchy({
      "abc": abc,
      "def": def
    });

    expect(results).toEqual(expected);
  });

  it("item with two dependencies", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item.id = "abc";
    let def = {...MOCK_ITEM_PROTOTYPE};
    def.item.id = "def";
    let ghi = {...MOCK_ITEM_PROTOTYPE};
    ghi.item.id = "ghi";

    abc.dependencies = ["def", "ghi"];

    let expected:viewing.IHierarchyEntry[] = [{
      id: "abc",
      dependencies: [{
        id: "def",
        dependencies: []
      }, {
        id: "ghi",
        dependencies: []
      }]
    }];

    let results:viewing.IHierarchyEntry[] = viewing.getItemHierarchy({
      "abc": abc,
      "def": def,
      "ghi": ghi
    });

    expect(results).toEqual(expected);
  });

  it("item with two-level dependencies", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item.id = "abc";
    let def = {...MOCK_ITEM_PROTOTYPE};
    def.item.id = "def";
    let ghi = {...MOCK_ITEM_PROTOTYPE};
    ghi.item.id = "ghi";

    abc.dependencies = ["ghi"];
    ghi.dependencies = ["def"];

    let expected:viewing.IHierarchyEntry[] = [{
      id: "abc",
      dependencies: [{
        id: "ghi",
        dependencies: [{
          id: "def",
          dependencies: []
        }]
      }]
    }];

    let results:viewing.IHierarchyEntry[] = viewing.getItemHierarchy({
      "abc": abc,
      "def": def,
      "ghi": ghi
    });

    expect(results).toEqual(expected);
  });

  it("two top-level items, one with two dependencies", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item.id = "abc";
    let def = {...MOCK_ITEM_PROTOTYPE};
    def.item.id = "def";
    let ghi = {...MOCK_ITEM_PROTOTYPE};
    ghi.item.id = "ghi";

    ghi.dependencies = ["def"];

    let expected:viewing.IHierarchyEntry[] = [{
      id: "abc",
      dependencies: []
    }, {
      id: "ghi",
      dependencies: [{
        id: "def",
        dependencies: []
      }]
    }];

    let results:viewing.IHierarchyEntry[] = viewing.getItemHierarchy({
      "abc": abc,
      "def": def,
      "ghi": ghi
    });

    expect(results).toEqual(expected);
  });

  it("three top-level items, one with two dependencies, one with three-level dependencies", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    abc.item.id = "abc";
    let def = {...MOCK_ITEM_PROTOTYPE};
    def.item.id = "def";
    let ghi = {...MOCK_ITEM_PROTOTYPE};
    ghi.item.id = "ghi";
    let jkl = {...MOCK_ITEM_PROTOTYPE};
    jkl.item.id = "jkl";
    let mno = {...MOCK_ITEM_PROTOTYPE};
    mno.item.id = "mno";
    let pqr = {...MOCK_ITEM_PROTOTYPE};
    pqr.item.id = "pqr";

    pqr.dependencies = ["ghi"];
    mno.dependencies = ["abc"];
    def.dependencies = ["mno"];

    let expected:viewing.IHierarchyEntry[] = [{
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

    let results:viewing.IHierarchyEntry[] = viewing.getItemHierarchy({
      "abc": abc,
      "def": def,
      "ghi": ghi,
      "jkl": jkl,
      "mno": mno,
      "pqr": pqr
    });

    expect(results).toEqual(expected);
  });

});
