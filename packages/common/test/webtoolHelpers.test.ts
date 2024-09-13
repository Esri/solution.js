/** @license
 * Copyright 2024 Esri
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
 * Provides tests for functions involving deployment of workflow items via the REST API.
 */

import * as templates from "../../common/test/mocks/templates";
import * as webtoolHelpers from "../src/webtoolHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webtoolHelpers`", () => {
  describe("postProcessWebToolReferences", () => {
    it("will globally templatize GPServer references", () => {
      const url = "http://local/GPServer";
      const url2 = "http://local2/GPServer";
      const templateDictionary = {
        "http://local/GPServer": "{{xxx1f09e3867449d94bc21033032da7f}}.url",
        "http://local2/GPServer": "{{xxx2f09e3867449d94bc21033032da7f}}.url"
      };

      const notebookTemplate = templates.getItemTemplate("Notebook");
      notebookTemplate.data.cells.push({
        url
      });
      notebookTemplate.item.snippet = url2;

      webtoolHelpers.postProcessWebToolReferences([notebookTemplate], templateDictionary);

      expect(notebookTemplate.data.cells[1].url).toBe("{{xxx1f09e3867449d94bc21033032da7f}}.url");
      expect(notebookTemplate.item.snippet).toBe("{{xxx2f09e3867449d94bc21033032da7f}}.url");
      expect(notebookTemplate.dependencies.length).toBe(2);
    });
  });
});
