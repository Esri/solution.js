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

import { _isModel, isSolutionTemplateItem, getSolutionTemplateItem, updateDeployOptions } from "../src/deployerUtils";
import * as sinon from "sinon";
import * as common from "@esri/solution-common";
import * as testUtils from "../../common/test/mocks/utils";

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
});

describe("Module: `_deployerUtils`", () => {
  describe("_isModel", () => {
    it("returns true if the object is Modelish", () => {
      expect(_isModel({})).toBe(false);
      expect(_isModel("3ef")).toBe(false);
      expect(_isModel([])).toBe(false);
      expect(_isModel({ item: [], data: {} })).toBe(false);
      expect(_isModel({ item: {}, data: [] })).toBe(false);
      expect(_isModel({ item: {} })).toBe(false);
      expect(_isModel({ item: {}, data: {} })).toBe(true);
    });
  });
  describe("isSolutionTemplateItem", () => {
    it("returns true if correct item type and keywords", () => {
      const i = {
        type: "Solution",
        typeKeywords: ["Solution", "Template", "solutionid-guid", "solutionversion-1.0"],
      } as common.IItem;
      expect(isSolutionTemplateItem(i)).toBe(true);
    });
    it("returns true for hub solution keywords", () => {
      const i = {
        type: "Solution",
        typeKeywords: ["Solution", "solutionTemplate", "solutionid-guid", "solutionversion-1.0"],
      } as common.IItem;
      expect(isSolutionTemplateItem(i)).toBe(true);
    });
    it("returns true for hub solution stored in web mapping applications", () => {
      const i = {
        type: "Web Mapping Application",
        typeKeywords: ["hubSolutionTemplate", "hubSolutionType|something"],
      } as common.IItem;
      expect(isSolutionTemplateItem(i)).toBe(true);
    });
    it("returns false for web mapping applications w/o hub keywords", () => {
      const i = {
        type: "Web Mapping Application",
        typeKeywords: ["bargle", "garble"],
      } as common.IItem;
      expect(isSolutionTemplateItem(i)).toBe(false);
    });
    it("returns false for other types", () => {
      const i = {
        type: "Web Map",
        typeKeywords: ["bargle", "garble"],
      } as common.IItem;
      expect(isSolutionTemplateItem(i)).toBe(false);
    });
    it("returns false if missing item type or keywords", () => {
      const i = {
        type: "Solution",
        typeKeywords: ["Solution"],
      } as common.IItem;
      expect(isSolutionTemplateItem(i)).toBe(false);
    });
  });
  describe("getSolutionTemplateItem", () => {
    afterEach(() => {
      sinon.restore();
    });
    it("fetches item and data if passed an id", async () => {
      const getItemSpy = sinon.stub(common, "getItemBase").callsFake((): Promise<common.IItem> => {
        return Promise.resolve({
          id: "bc3",
        } as common.IItem);
      });
      const getItemDataSpy = sinon.stub(common, "getItemDataAsJson").callsFake((): Promise<any> => {
        return Promise.resolve({
          templates: [],
        });
      });

      const result = await getSolutionTemplateItem("bc3", MOCK_USER_SESSION);
      expect(result.item.id).toBe("bc3");
      expect(result.data.templates).toBeDefined();
      expect(getItemSpy.calledOnceWith("bc3", MOCK_USER_SESSION)).toBe(true);
      expect(getItemDataSpy.calledOnceWith("bc3", MOCK_USER_SESSION)).toBe(true);
    });
    it("resolves with a model if passed on", async () => {
      const result = await getSolutionTemplateItem({ item: { id: "bc3" }, data: {} }, MOCK_USER_SESSION);
      expect(result.item.id).toBe("bc3");
    });
    it("rejects if object is not modelish", async () => {
      return getSolutionTemplateItem({ item: { id: "bc3" }, foo: "bar" }, MOCK_USER_SESSION)
        .then(() => {
          fail("getSolutionTemplateItem should reject with model passed in");
        })
        .catch((ex) => {
          expect(ex.error).toContain("getSolutionTemplateItem");
          return Promise.resolve();
        });
    });
  });
  describe("updateDeployOptions", () => {
    // Test case without thumbnail available
    const item: any = {
      // we don't need to be too strict here regarding all of the item's properties
      id: "abc",
      title: "item title",
      snippet: "item snippet",
      description: "item description",
      tags: ["tag1", "tag2"],
    };

    it("prefers supplied deploy options", () => {
      const deployOptions = {
        jobId: "123",
        title: "deploy title",
        snippet: "deploy snippet",
        description: "deploy description",
        tags: ["tag3"],
      };

      // Test case with thumbnail available
      const itemWithThumbnail = {
        ...item,
        thumbnail: "item thumbnail",
      };
      sinon.stub(common, "getItemThumbnailUrl").returns("updated thumbnail url");

      const result = updateDeployOptions(deployOptions, itemWithThumbnail, MOCK_USER_SESSION);
      expect(result.jobId).toBe("123");
      expect(result.title).toBe("deploy title");
      expect(result.snippet).toBe("deploy snippet");
      expect(result.description).toBe("deploy description");
      expect(result.tags).toEqual(["tag3"]);
      expect(result.thumbnailurl).toBe("updated thumbnail url");
    });

    it("falls back to item information when deploy options are missing", () => {
      const deployOptions = {};
      const result = updateDeployOptions(deployOptions, item, MOCK_USER_SESSION);
      expect(result.jobId).toBe("abc");
      expect(result.title).toBe("item title");
      expect(result.snippet).toBe("item snippet");
      expect(result.description).toBe("item description");
      expect(result.tags).toEqual(["tag1", "tag2"]);
      expect(result.thumbnailurl).toBeNull();
    });
  });
});
