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
 * Provides tests for functions involving access to the solution's contents.
 */

import * as common from "@esri/solution-common";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as utils from "../../common/test/mocks/utils";
import * as viewer from "../src/viewer";

let MOCK_USER_SESSION: common.UserSession;

let sampleItemTemplate: any;
beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

  sampleItemTemplate = {
    item: {
      name: null,
      title: "z2g9f4nv",
      type: "Solution",
      typeKeywords: ["Solution", "Deployed"],
      description: null,
      tags: [],
      snippet: null,
      thumbnail: null,
      documentation: null,
      extent: "{{solutionItemExtent}}",
      categories: [],
      spatialReference: null,
      accessInformation: null,
      licenseInfo: null,
      culture: "english (united states)",
      properties: null,
      url: null,
      proxyFilter: null,
      access: "private",
      appCategories: [],
      industries: [],
      languages: [],
      largeThumbnail: null,
      banner: null,
      screenshots: [],
      listed: false,
      groupDesignations: null,
      id: "itm1234567890",
    },
    data: {
      metadata: {},
      templates: [
        {
          itemId: "geo1234567890",
          type: "GeoJson",
          dependencies: [],
        },
      ],
    },
  };
});

afterEach(() => {
  fetchMock.restore();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `viewer`", () => {
  describe("checkSolution", () => {
    it("should handle inability to get complete item", async () => {
      const compItem = mockItems.getCompleteMockItem("Web Mapping Application");
      spyOn(common, "getCompleteItem").and.resolveTo(undefined);

      const results: string[] = await viewer.checkSolution(compItem.base.id);
      expect(results.length).toEqual(2);
      expect(results[0]).toEqual("Item wma1234567890");
      expect(results[1]).toEqual("&#x2716; error: item is not found");
    });

    it("should reject items that are not Solutions", async () => {
      const compItem = mockItems.getCompleteMockItem("Web Mapping Application");
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toEqual(2);
      expect(results[0]).toEqual("Item wma1234567890");
      expect(results[1]).toEqual("&#x2716; error: item is not a Solution");
    });

    it("should reject Solution items that are neither Templates nor Deployed", async () => {
      const compItem = mockItems.getCompleteMockItem("Solution");
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toEqual(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2716; error: item is neither a Template Solution nor a Deployed Solution");
    });

    it("should reject reject Solution items that are missing their data sections", async () => {
      const compItem = mockItems.getCompleteMockItem("Solution");
      (compItem.base.typeKeywords as any).push("Template");
      compItem.data = null as any;
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Template Solution");
      expect(results[2]).toEqual(
        "&#x2716; error: Solution's data are not valid JSON or the Solution contains no items",
      );
    });

    it("should reject reject Solution items that have defective JSON", async () => {
      const compItem = mockItems.getCompleteMockItem("Solution");
      (compItem.base.typeKeywords as any).push("Template");
      compItem.data = common.jsonToFile(
        {
          metadata: {},
        },
        "",
      );
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Template Solution");
      expect(results[2]).toEqual(
        "&#x2716; error: Solution's data are not valid JSON or the Solution contains no items",
      );
    });

    it("should reject reject Solution items that have no templates", async () => {
      const compItem = mockItems.getCompleteMockItem("Solution");
      (compItem.base.typeKeywords as any).push("Template");
      compItem.data = common.jsonToFile(
        {
          metadata: {},
          templates: [],
        },
        "",
      );
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Template Solution");
      expect(results[2]).toEqual(
        "&#x2716; error: Solution's data are not valid JSON or the Solution contains no items",
      );
    });

    it("should recognize a Template Solution item", async () => {
      const compItem = mockItems.getCompleteTemplateSolutionItem();
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Template Solution");
      expect(results[2]).toEqual("&#x2714; all dependencies are in Solution");
    });

    it("should recognize a Deployed Solution item", async () => {
      const compItem = mockItems.getCompleteDeployedSolutionItem();
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Deployed Solution");
      expect(results[2]).toEqual("&#x2714; matching forward Solution2Item relationship(s)");
    });

    it("should catch forward relationships to unknown items in Deployed Solution", async () => {
      const compItem = mockItems.getCompleteDeployedSolutionItem();
      compItem.fwdRelatedItems[0].relatedItemIds.push("xxx1234567890");
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Deployed Solution");
      expect(results[2]).toEqual("&#x2716; there are forward Solution2Item relationship(s) to unknown item(s)");
    });

    it("should catch missing forward relationships to items in Deployed Solution", async () => {
      const compItem = mockItems.getCompleteDeployedSolutionItem();
      compItem.fwdRelatedItems[0].relatedItemIds.pop();
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Deployed Solution");
      expect(results[2]).toEqual("&#x2716; missing forward Solution2Item relationship(s)");
    });

    it("should catch mismatching forward relationships in Deployed Solution", async () => {
      const compItem = mockItems.getCompleteDeployedSolutionItem();
      compItem.fwdRelatedItems[0].relatedItemIds.pop();
      compItem.fwdRelatedItems[0].relatedItemIds.push("xxx1234567890");
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Deployed Solution");
      expect(results[2]).toEqual("&#x2716; mismatching forward Solution2Item relationship(s)");
    });

    it("should catch missing dependencies in a Template Solution item", async () => {
      const compItem = mockItems.getCompleteTemplateSolutionItem();
      const data: common.ISolutionItemData = await common.blobToJson(compItem.data);
      data.templates[0].dependencies.push("xxx1234567890");
      compItem.data = common.jsonToFile(data, "");
      spyOn(common, "getCompleteItem").and.resolveTo(compItem);

      const results: string[] = await viewer.checkSolution(compItem.base.id, MOCK_USER_SESSION);
      expect(results.length).toBeGreaterThan(2);
      expect(results[0]).toEqual("Item sol1234567890");
      expect(results[1]).toEqual("&#x2714; item is a Template Solution");
      expect(results[2]).toEqual('&#x2716; dependencies that aren\'t in Solution: ["xxx1234567890"]');
    });
  });

  describe("compareItems", () => {
    it("handles identity with supplied Solution items", async () => {
      return viewer.compareItems(sampleItemTemplate.item, sampleItemTemplate.item).then(
        (match) => {
          return match ? Promise.resolve() : fail();
        },
        () => fail(),
      );
    });

    it("handles non-Solution items", async () => {
      const item1 = {
        ...sampleItemTemplate.item,
        type: "Web Map",
      };
      const item2 = {
        ...item1,
        id: "map1234567890",
      };
      return viewer.compareItems(item1, item2).then(
        (match) => {
          return match ? Promise.resolve() : fail();
        },
        () => fail(),
      );
    });

    it("handles different items", async () => {
      const item1 = {
        ...sampleItemTemplate.item,
        type: "Web Map",
      };
      const item2 = {
        ...item1,
        type: "Web Mapping Application",
      };
      return viewer.compareItems(item1, item2).then(
        (match) => {
          return match ? fail() : Promise.resolve();
        },
        () => fail(),
      );
    });

    it("handles identity with supplied item ids", async () => {
      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token",
        sampleItemTemplate.item,
      );
      return viewer.compareItems(sampleItemTemplate.item.id, sampleItemTemplate.item.id, MOCK_USER_SESSION).then(
        (match) => {
          return match ? Promise.resolve() : fail();
        },
        () => fail(),
      );
    });

    it("handles identity with supplied item ids, but failed GET", async () => {
      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl + "/content/items/itm1234567890?f=json&token=fake-token",
        mockItems.get500Failure(),
      );
      return viewer.compareItems(sampleItemTemplate.item.id, sampleItemTemplate.item.id, MOCK_USER_SESSION).then(
        () => fail(),
        () => Promise.resolve(),
      );
    });
  });

  describe("getItemHierarchy", () => {
    it("handles case where templates are top-level", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: [],
        },
        {
          itemId: "def",
          dependencies: [],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        { id: "abc", dependencies: [] },
        { id: "def", dependencies: [] },
        { id: "ghi", dependencies: [] },
      ]);
    });

    it("handles a single top-level template", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        { id: "abc", dependencies: [{ id: "def", dependencies: [{ id: "ghi", dependencies: [] }] }] },
      ] as common.IHierarchyElement[]);
    });

    it("handles a circular dependency at the top level", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["abc", "ghi"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "def",
          dependencies: [
            { id: "abc", dependencies: [{ id: "def", dependencies: [] }] },
            { id: "ghi", dependencies: [] },
          ],
        },
      ] as common.IHierarchyElement[]);
    });

    it("handles a deeper circular dependency", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "ghi",
          dependencies: ["def"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "abc",
          dependencies: [{ id: "def", dependencies: [{ id: "ghi", dependencies: [{ id: "def", dependencies: [] }] }] }],
        },
      ] as common.IHierarchyElement[]);
    });

    it("is missing a template", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        { id: "abc", dependencies: [{ id: "def", dependencies: [] }] },
      ] as common.IHierarchyElement[]);
    });

    it("handles a pair of circular dependencies", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "ghi",
          dependencies: ["abc"],
        },
        {
          itemId: "jkl",
          dependencies: ["mno"],
        },
        {
          itemId: "mno",
          dependencies: ["pqr"],
        },
        {
          itemId: "pqr",
          dependencies: ["jkl"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "abc",
          dependencies: [{ id: "def", dependencies: [{ id: "ghi", dependencies: [{ id: "abc", dependencies: [] }] }] }],
        },
        {
          id: "jkl",
          dependencies: [{ id: "mno", dependencies: [{ id: "pqr", dependencies: [{ id: "jkl", dependencies: [] }] }] }],
        },
      ] as common.IHierarchyElement[]);
    });

    it("handles a circular dependency in the midst of other items", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: [],
        },
        {
          itemId: "def",
          dependencies: [],
        },
        {
          itemId: "jkl",
          dependencies: ["mno"],
        },
        {
          itemId: "mno",
          dependencies: ["pqr"],
        },
        {
          itemId: "pqr",
          dependencies: ["jkl"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        { id: "abc", dependencies: [] },
        { id: "def", dependencies: [] },
        { id: "ghi", dependencies: [] },
        {
          id: "jkl",
          dependencies: [{ id: "mno", dependencies: [{ id: "pqr", dependencies: [{ id: "jkl", dependencies: [] }] }] }],
        },
      ] as common.IHierarchyElement[]);
    });

    it("handles a multi-branch hierarchy", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def", "jkl"],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
        {
          itemId: "jkl",
          dependencies: [],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "abc",
          dependencies: [
            { id: "def", dependencies: [{ id: "ghi", dependencies: [] }] },
            { id: "jkl", dependencies: [] },
          ],
        },
      ] as common.IHierarchyElement[]);
    });
  });

  describe("getItemHierarchy, changing order of items in template", () => {
    it("handles a single top-level template 2", () => {
      const templates: any = [
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
        {
          itemId: "abc",
          dependencies: ["def"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        { id: "abc", dependencies: [{ id: "def", dependencies: [{ id: "ghi", dependencies: [] }] }] },
      ] as common.IHierarchyElement[]);
    });

    it("handles a circular dependency at the top level 2", () => {
      const templates: any = [
        {
          itemId: "def",
          dependencies: ["ghi", "abc"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
        {
          itemId: "abc",
          dependencies: ["def"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "def",
          dependencies: [
            { id: "ghi", dependencies: [] },
            { id: "abc", dependencies: [{ id: "def", dependencies: [] }] },
          ],
        },
      ] as common.IHierarchyElement[]);
    });

    it("handles a circular dependency at the top level 3", () => {
      const templates: any = [
        {
          itemId: "ghi",
          dependencies: [],
        },
        {
          itemId: "def",
          dependencies: ["abc", "ghi"],
        },
        {
          itemId: "abc",
          dependencies: ["def"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "def",
          dependencies: [
            { id: "abc", dependencies: [{ id: "def", dependencies: [] }] },
            { id: "ghi", dependencies: [] },
          ],
        },
      ] as common.IHierarchyElement[]);
    });

    it("handles a multi-branch hierarchy 2", () => {
      const templates: any = [
        {
          itemId: "ghi",
          dependencies: [],
        },
        {
          itemId: "abc",
          dependencies: ["def", "jkl"],
        },
        {
          itemId: "jkl",
          dependencies: [],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "abc",
          dependencies: [
            { id: "def", dependencies: [{ id: "ghi", dependencies: [] }] },
            { id: "jkl", dependencies: [] },
          ],
        },
      ] as common.IHierarchyElement[]);
    });

    it("handles a pair of circular dependencies 2", () => {
      const templates: any = [
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "jkl",
          dependencies: ["mno"],
        },
        {
          itemId: "pqr",
          dependencies: ["jkl"],
        },
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "ghi",
          dependencies: ["abc"],
        },
        {
          itemId: "mno",
          dependencies: ["pqr"],
        },
      ];
      const hierarchy = viewer.getItemHierarchy(templates);
      expect(hierarchy).toEqual([
        {
          id: "def",
          dependencies: [{ id: "ghi", dependencies: [{ id: "abc", dependencies: [{ id: "def", dependencies: [] }] }] }],
        },
        {
          id: "jkl",
          dependencies: [{ id: "mno", dependencies: [{ id: "pqr", dependencies: [{ id: "jkl", dependencies: [] }] }] }],
        },
      ] as common.IHierarchyElement[]);
    });
  });

  describe("_getTopLevelItemIds", () => {
    it("handles case where templates are top-level", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: [],
        },
        {
          itemId: "def",
          dependencies: [],
        },
        {
          itemId: "ghi",
        },
      ];
      const ids = viewer._getTopLevelItemIds(templates);
      expect(ids.length).toBe(3);
      expect(ids).toEqual(["abc", "def", "ghi"]);
    });

    it("handles a single top-level template", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
      ];
      const ids = viewer._getTopLevelItemIds(templates);
      expect(ids.length).toBe(1);
      expect(ids).toEqual(["abc"]);
    });

    it("handles a circular dependency at the top level", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["abc", "ghi"],
        },
        {
          itemId: "ghi",
          dependencies: [],
        },
      ];
      const ids = viewer._getTopLevelItemIds(templates);
      expect(ids.length).toBe(0);
      expect(ids).toEqual([]);
    });

    it("handles a deeper circular dependency", () => {
      const templates: any = [
        {
          itemId: "abc",
          dependencies: ["def"],
        },
        {
          itemId: "def",
          dependencies: ["ghi"],
        },
        {
          itemId: "ghi",
          dependencies: ["def"],
        },
      ];
      const ids = viewer._getTopLevelItemIds(templates);
      expect(ids.length).toBe(1);
      expect(ids).toEqual(["abc"]);
    });
  });
});
