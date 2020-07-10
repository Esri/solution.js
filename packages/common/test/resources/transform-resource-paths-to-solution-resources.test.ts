/** @license
 * Copyright 2020 Esri
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

import {
  transformResourcePathsToSolutionResources,
  transformResourcePathToSolutionResource,
  _extractFilenameFromResourcePath,
  _extractPathFromResourcePath,
  _getSolutionResourceTypeFromResourcePath
} from "../../src/resources/transform-resource-paths-to-solution-resources";

import { SolutionResourceType } from "../../src/resources/solution-resource";

describe("convert-resource-paths-to-objects", () => {
  describe("convert resource paths to objects", () => {
    it("works", () => {
      const resources = [
        "243258b1ef224cf293448d3426a49453_info_thumbnail/Dashboard.png",
        "8f5de09cc93740af9002a093bcb9b809/notebook_preview.json",
        "05eca652ff234bab831d75956fd1965c_info_dataz/FacilitySource.csv.zip",
        "84095a0a06a04d1e9f9b40edb84e277f_jobs/ViewJob_1590513214593.json",
        "84095a0a06a04d1e9f9b40edb84e277f-how-hub-does-it.json"
      ];

      const chk = transformResourcePathsToSolutionResources(resources);

      const expected = [
        {
          filename: "Dashboard.png",
          type: SolutionResourceType.thumbnail,
          path: "",
          sourceUrl: resources[0]
        },
        {
          filename: "notebook_preview.json",
          type: SolutionResourceType.resource,
          path: "",
          sourceUrl: resources[1]
        },
        {
          filename: "FacilitySource.csv.zip",
          type: SolutionResourceType.fakezip,
          path: "",
          sourceUrl: resources[2]
        },
        {
          filename: "ViewJob_1590513214593.json",
          type: SolutionResourceType.resource,
          path: "jobs",
          sourceUrl: resources[3]
        },
        {
          filename: "how-hub-does-it.json",
          type: SolutionResourceType.resource,
          path: "",
          sourceUrl: resources[4]
        }
      ];

      expect(chk).toEqual(expected, "should convert paths to objects");
    });
    it("works if resources is undefined", () => {
      const chk = transformResourcePathsToSolutionResources();
      expect(chk).toEqual([], "should return empty array");
    });
  });

  describe("convert resource path to object", () => {
    // Since the sub-functions have so much coverage, this can be pretty simple
    it("works", () => {
      const chk = transformResourcePathToSolutionResource(
        "243258b1ef224cf293448d3426a49453_info_thumbnail/Dashboard.png"
      );
      expect(chk.sourceUrl).toBe(
        "243258b1ef224cf293448d3426a49453_info_thumbnail/Dashboard.png"
      );
      expect(chk.filename).toBe("Dashboard.png");
      expect(chk.type).toBe(SolutionResourceType.thumbnail);
      expect(chk.path).toBe("");
    });
  });

  describe("extract-filename-from-path", () => {
    it("extracts the filename", () => {
      const tests = [
        {
          in: "red.png",
          chk: "red.png",
          msg: "should work for a naked string"
        },
        {
          in: "red-hat.png",
          chk: "red-hat.png",
          msg: "should work for a naked string iwth a dash"
        },
        {
          in: "/red.png",
          chk: "red.png",
          msg: "should work for a relative string"
        },
        {
          in: "/some/deep/path/red.png",
          chk: "red.png",
          msg: "should work for a deep path"
        },
        {
          in: "7332c96ad9554b5f937f7f8328cee795_info/forminfo.json",
          chk: "forminfo.json",
          msg: "should work _info folders"
        },
        {
          in: "https://foo.com/bar/baz/red.png",
          chk: "red.png",
          msg: "should work for a url"
        },
        {
          in: "84095a0a06a04d1e9f9b40edb84e277f-how-hub-does-it.json",
          chk: "how-hub-does-it.json",
          msg: "should work for hub structure"
        }
      ];

      tests.forEach(e => {
        expect(_extractFilenameFromResourcePath(e.in)).toBe(e.chk, e.msg);
      });
    });
  });

  describe("extract-path-from-resource-path", () => {
    it("extracts the path part of the resource path", () => {
      const tests = [
        { in: "red.png", chk: "", msg: "should work for a naked string" },
        { in: "/red.png", chk: "", msg: "should work for a relative string" },
        { in: "/red.png", chk: "", msg: "should work for a relative string" },
        {
          in: "NOTGUID58b1ef224cf293448d3426a49/red.png",
          chk: "NOTGUID58b1ef224cf293448d3426a49",
          msg: "non-guid works"
        },
        {
          in: "243258b1ef224cf293448d3426a49453/red.png",
          chk: "",
          msg: "remove itemId paths"
        },
        {
          in: "243258b1ef224cf293448d3426a49453_info/red.png",
          chk: "",
          msg: "remove _info paths"
        },
        {
          in: "243258b1ef224cf293448d3426a49453_info_thumbnail/red.png",
          chk: "",
          msg: "remove _info* paths"
        },
        {
          in: "243258b1ef224cf293448d3426a49453_info_metadata/red.png",
          chk: "",
          msg: "remove _info* paths"
        },
        {
          in: "243258b1ef224cf293448d3426a49453_info_data/red.png",
          chk: "",
          msg: "remove _info* paths"
        },
        {
          in: "243258b1ef224cf293448d3426a49453_info_dataz/red.png",
          chk: "",
          msg: "remove _info* paths"
        },
        {
          in: "243258b1ef224cf293448d3426a49453_jobs/red.png",
          chk: "jobs",
          msg: "keep other paths"
        },
        {
          in: "https://foo.com/bar/baz/red.png",
          chk: "",
          msg: "should work for a url"
        }
      ];

      tests.forEach(e => {
        expect(_extractPathFromResourcePath(e.in)).toBe(e.chk, e.msg);
      });
    });
  });

  describe("get-solution-type-from-resource-path", () => {
    it("extracts the path part of the resource path", () => {
      const tests = [
        {
          in: "red.png",
          chk: SolutionResourceType.resource,
          msg: "should work for a naked string"
        },
        {
          in: "/red.png",
          chk: SolutionResourceType.resource,
          msg: "should work for a relative string"
        },
        {
          in: "/some/deep/path/red.png",
          chk: SolutionResourceType.resource,
          msg: "should work for a deep path"
        },
        {
          in: "/folder_info/red.png",
          chk: SolutionResourceType.info,
          msg: "_info path"
        },
        {
          in: "/folder_info_thumbnail/red.png",
          chk: SolutionResourceType.thumbnail,
          msg: "thumbnail path"
        },
        {
          in: "/folder_info_metadata/thing.xml",
          chk: SolutionResourceType.metadata,
          msg: "metadata path"
        },
        {
          in: "/folder_info_data/red.json",
          chk: SolutionResourceType.data,
          msg: "data path"
        },
        {
          in: "/folder_info_dataz/red.zip",
          chk: SolutionResourceType.fakezip,
          msg: "fake zip path"
        },
        {
          in: "https://foo.com/bar/baz/red.png",
          chk: SolutionResourceType.resource,
          msg: "should work for a url"
        }
      ];

      tests.forEach(e => {
        expect(_getSolutionResourceTypeFromResourcePath(e.in)).toBe(
          e.chk,
          e.msg
        );
      });
    });
  });
});
