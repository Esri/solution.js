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

import * as fetchMock from "fetch-mock";
import { CustomArrayLikeMatchers, CustomMatchers } from './customMatchers';

import * as solution from "../src/solution";
import { IFullItem } from "../src/fullItem";
import { IItemHash } from "../src/fullItemHierarchy";

import { UserSession } from "@esri/arcgis-rest-auth";
import { TOMORROW } from "./lib/utils";

//--------------------------------------------------------------------------------------------------------------------//

describe("supporting solution item", () => {

  const MOCK_ITEM_PROTOTYPE:IFullItem = {
    type: "",
    item: null
  };

  beforeEach(() => {
    jasmine.addMatchers(CustomMatchers);
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("sorts an item and its dependencies 1", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    let def = {...MOCK_ITEM_PROTOTYPE};
    let ghi = {...MOCK_ITEM_PROTOTYPE};

    abc.dependencies = ["ghi", "def"];

    let results:string[] = solution.topologicallySortItems({
      "abc": abc,
      "def": def,
      "ghi": ghi,
    });
    expect(results.length).toEqual(3);
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
  });

  it("sorts an item and its dependencies 2", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    let def = {...MOCK_ITEM_PROTOTYPE};
    let ghi = {...MOCK_ITEM_PROTOTYPE};

    abc.dependencies = ["ghi", "def"];
    def.dependencies = ["ghi"];

    let results:string[] = solution.topologicallySortItems({
      "abc": abc,
      "def": def,
      "ghi": ghi,
    });
    expect(results.length).toEqual(3);
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "def"});
  });

  it("sorts an item and its dependencies 3", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    let def = {...MOCK_ITEM_PROTOTYPE};
    let ghi = {...MOCK_ITEM_PROTOTYPE};

    abc.dependencies = ["ghi"];
    ghi.dependencies = ["def"];

    let results:string[] = solution.topologicallySortItems({
      "abc": abc,
      "def": def,
      "ghi": ghi,
    });
    expect(results.length).toEqual(3);
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "ghi", successor: "abc"});
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "abc"});
    (expect(results) as CustomArrayLikeMatchers).toHaveOrder({predecessor: "def", successor: "ghi"});
  });

  it("reports a multi-item cyclic dependency graph", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    let def = {...MOCK_ITEM_PROTOTYPE};
    let ghi = {...MOCK_ITEM_PROTOTYPE};

    abc.dependencies = ["ghi"];
    def.dependencies = ["ghi"];
    ghi.dependencies = ["abc"];

    expect(function () {
      let results:string[] = solution.topologicallySortItems({
        "abc": abc,
        "def": def,
        "ghi": ghi,
      });
    }).toThrowError(Error, "Cyclical dependency graph detected");
  });

  it("reports a single-item cyclic dependency graph", () => {
    let abc = {...MOCK_ITEM_PROTOTYPE};
    let def = {...MOCK_ITEM_PROTOTYPE};
    let ghi = {...MOCK_ITEM_PROTOTYPE};

    def.dependencies = ["def"];

    expect(function () {
      let results:string[] = solution.topologicallySortItems({
        "abc": abc,
        "def": def,
        "ghi": ghi,
      });
    }).toThrowError(Error, "Cyclical dependency graph detected");
  });

});
