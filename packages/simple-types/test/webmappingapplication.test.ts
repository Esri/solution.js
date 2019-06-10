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
 * Provides tests for common functions involving the management of item and group resources.
 */

import * as webmappingapplication from "../src/webmappingapplication";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webmappingapplication`: manages the creation and deployment of web mapping application item types", () => {
  describe("getWABDependencies", () => {
    it("handles no keywords", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles no WAB keywords", () => {
      const model = {
        typeKeywords: ["Web Map"],
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles WAB2D", () => {
      const model = {
        typeKeywords: ["WAB2D"],
        data: { map: { itemId: "abc" } }
      };
      const expected = ["abc"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles Web AppBuilder", () => {
      const model = {
        typeKeywords: ["Government", "Web AppBuilder"],
        data: { map: { itemId: "abc" } }
      };
      const expected = ["abc"];
      const actual = webmappingapplication.extractDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("getGenericWebAppDependencies", () => {
    it("handles null", () => {
      const model: any = null;
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles empty model", () => {
      const model = {};
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without data", () => {
      const model = { data: {} };
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without values", () => {
      const model = { data: { values: {} } };
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without webmap or group", () => {
      const model = { data: { values: { prop1: "1", prop2: "2" } } };
      const expected = [] as string[];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with webmap", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", webmap: "myMapId" } }
      };
      const expected = ["myMapId"];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with group", () => {
      const model = {
        data: { values: { prop1: "1", prop2: "2", group: "myGroupId" } }
      };
      const expected = ["myGroupId"];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with both webmap and group", () => {
      const model = {
        data: {
          values: {
            group: "myGroupId",
            prop1: "1",
            webmap: "myMapId",
            prop2: "2"
          }
        }
      };
      const expected = ["myMapId", "myGroupId"];
      const actual = webmappingapplication.getGenericWebAppDependencies(model);
      expect(actual).toEqual(expected);
    });
  });

  describe("getWABDependencies", () => {
    it("handles null", () => {
      const model: any = null;
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles empty model", () => {
      const model = {};
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model without data", () => {
      const model = { data: {} };
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with similar but unmatching path", () => {
      const model = { data: { itemId: "abc" } };
      const expected = [] as string[];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });

    it("handles model with matching path", () => {
      const model = { data: { map: { itemId: "abc" } } };
      const expected = ["abc"];
      const actual = webmappingapplication.getWABDependencies(model);
      expect(actual).toEqual(expected);
    });
  });
});
