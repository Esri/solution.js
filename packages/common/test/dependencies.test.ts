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
 * Provides tests for functions for determining deployment order.
 */

import * as dependencies from "../src/dependencies";
import * as interfaces from "../src/interfaces";
import * as templates from "./mocks/templates";

describe("Module `dependencies`: functions for determining deployment order", () => {
  describe("topologicallySortItems", () => {
    it("handles empty template list", () => {
      const templatesList: interfaces.IItemTemplate[] = [];
      const buildOrder = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder.length).toEqual(0);
    });

    it("handles simple template list", () => {
      const templatesList: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Mapping Application"), // wma1234567890
        templates.getItemTemplate("Web Map"), // map1234567890
        templates.getItemTemplate("Dashboard") // dsh1234567890
      ];
      templatesList[2].dependencies = ["wma1234567890"]; // dsh1234567890
      templatesList[0].dependencies = ["map1234567890"]; // wma1234567890

      const buildOrder = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder).toEqual([
        "map1234567890",
        "wma1234567890",
        "dsh1234567890"
      ]);
    });

    it("handles simple template list with undefined dependency", () => {
      const templatesList: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Mapping Application"), // wma1234567890
        templates.getItemTemplate("Web Map"), // map1234567890
        templates.getItemTemplate("Dashboard") // dsh1234567890
      ];
      templatesList[2].dependencies = ["wma1234567890"]; // dsh1234567890
      templatesList[0].dependencies = ["map1234567890"]; // wma1234567890
      delete templatesList[1].dependencies;

      const buildOrder = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder).toEqual([
        "map1234567890",
        "wma1234567890",
        "dsh1234567890"
      ]);
    });

    it("handles simple template list with missing dependency", () => {
      const templatesList: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Dashboard"), // dsh1234567890
        templates.getItemTemplate("Web Mapping Application") // wma1234567890
      ];
      templatesList[0].dependencies = ["wma1234567890"]; // dsh1234567890
      templatesList[1].dependencies = ["map1234567890"]; // wma1234567890

      const buildOrder = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder).toEqual(["wma1234567890", "dsh1234567890"]);
    });

    it("reports a cycle", () => {
      const templatesList: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Mapping Application"), // wma1234567890
        templates.getItemTemplate("Web Map"), // map1234567890
        templates.getItemTemplate("Dashboard") // dsh1234567890
      ];
      templatesList[2].dependencies = ["wma1234567890"]; // dsh1234567890
      templatesList[0].dependencies = ["map1234567890"]; // wma1234567890
      templatesList[1].dependencies = ["dsh1234567890"]; // map1234567890

      try {
        dependencies.topologicallySortItems(templatesList);
        fail();
      } catch (err) {
        expect(err.message).toEqual("Cyclical dependency graph detected");
      }
    });
  });
});
