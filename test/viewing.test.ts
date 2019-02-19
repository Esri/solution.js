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

import { UserSession, IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItem } from '@esri/arcgis-rest-common-types';

import * as mInterfaces from "../src/interfaces";
import * as mSolution from "../src/solution";
import * as mViewing from "../src/viewing";

import { TOMORROW, createMockSettings } from "./lib/utils";
import * as fetchMock from "fetch-mock";
import * as mockItems from "./mocks/agolItems";
import * as mockSolutions from "./mocks/templates";
import * as mockUtils from "./lib/utils";

// -------------------------------------------------------------------------------------------------------------------//

describe("Module `viewing`: supporting solution item display in AGOL", () => {

  const MOCK_ITEM_PROTOTYPE:mInterfaces.ITemplate = {
    itemId: "",
    type: "",
    key: "",
    item: null
  };

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;  // default is 5000 ms

  // Set up a UserSession to use in all these tests
  const MOCK_USER_SESSION = new UserSession({
    clientId: "clientId",
    redirectUri: "https://example-app.com/redirect-uri",
    token: "fake-token",
    tokenExpires: TOMORROW,
    refreshToken: "refreshToken",
    refreshTokenExpires: TOMORROW,
    refreshTokenTTL: 1440,
    username: "casey",
    password: "123456",
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  });

  const MOCK_USER_REQOPTS:IUserRequestOptions = {
    authentication: MOCK_USER_SESSION
  };

  afterEach(() => {
    fetchMock.restore();
  });

  describe("get item hierarchies", () => {

    it("item without dependencies", () => {
      // hierarchy:
      // - abc
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc"});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: []});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["def"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["def", "ghi"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["ghi"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi", dependencies: ["def"]});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc"});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});
      const jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "jkl", dependencies: ["ghi", "def"]});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc", dependencies: ["def", "ghi"]});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});
      const jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "jkl", dependencies: ["ghi", "def"]});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc"});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def", dependencies: ["mno"]});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});
      const jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "jkl"});
      const mno = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "mno", dependencies: ["abc"]});
      const pqr = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "pqr", dependencies: ["ghi"]});
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
      const abc = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "abc"});
      const def = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "def"});
      const ghi = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "ghi"});
      const jkl = Object.assign({}, MOCK_ITEM_PROTOTYPE, {itemId: "jkl"});
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
