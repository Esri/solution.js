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
      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
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

      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
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

      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
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

      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder).toEqual(["wma1234567890", "dsh1234567890"]);
    });

    it("handles a cycle 1", () => {
      const templatesList: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Mapping Application"), // wma1234567890
        templates.getItemTemplate("Web Map"), // map1234567890
        templates.getItemTemplate("Dashboard") // dsh1234567890
      ];
      templatesList[0].dependencies = ["map1234567890"]; // wma1234567890
      templatesList[1].dependencies = ["dsh1234567890"]; // map1234567890
      templatesList[2].dependencies = ["wma1234567890"]; // dsh1234567890

      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder)
        .withContext("buildOrder")
        .toEqual(["dsh1234567890", "map1234567890", "wma1234567890"]);
      expect(missingDependencies)
        .withContext("missingDependencies")
        .toEqual([]);
      expect(itemsToBePatched)
        .withContext("itemsToBePatched")
        .toEqual({
          dsh1234567890: ["wma1234567890"]
        });
    });

    it("handles a cycle 2", () => {
      const templatesList: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Web Mapping Application"), // wma1234567890
        templates.getItemTemplate("Web Map"), // map1234567890
        templates.getItemTemplate("Dashboard"), // dsh1234567890
        templates.getItemTemplate("Feature Service") // svc1234567890
      ];
      templatesList[0].dependencies = [
        "map1234567890",
        "dsh1234567890",
        "svc1234567890"
      ]; // wma1234567890
      templatesList[1].dependencies = [
        "wma1234567890",
        "dsh1234567890",
        "svc1234567890"
      ]; // map1234567890
      templatesList[2].dependencies = [
        "wma1234567890",
        "map1234567890",
        "svc1234567890"
      ]; // dsh1234567890
      templatesList[3].dependencies = [
        "wma1234567890",
        "map1234567890",
        "dsh1234567890"
      ]; // svc1234567890

      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder)
        .withContext("buildOrder")
        .toEqual([
          "svc1234567890",
          "dsh1234567890",
          "map1234567890",
          "wma1234567890"
        ]);
      expect(missingDependencies)
        .withContext("missingDependencies")
        .toEqual([]);
      expect(itemsToBePatched)
        .withContext("itemsToBePatched")
        .toEqual({
          svc1234567890: ["wma1234567890", "map1234567890", "dsh1234567890"],
          dsh1234567890: ["wma1234567890", "map1234567890"],
          map1234567890: ["wma1234567890"]
        });
    });

    it("sorts feature and view services", () => {
      //
      // * site (deps: stakeholder, form)
      // * form (deps: stakeholder, fieldworker)
      // * stakeholder view feature service (deps: featureService, form)
      // * fieldworker view feature service (deps: featureService, form)
      // * feature service (deps: form)
      const templatesList: interfaces.IItemTemplate[] = [
        templates.getItemTemplate("Hub Site Application"), // hsa1234567890
        templates.getItemTemplate("Form"), // frm1234567890
        templates.getItemTemplate("Feature Service"), // stakeholder
        templates.getItemTemplate("Feature Service"), // fieldworker
        templates.getItemTemplate("Feature Service") // svc1234567890
      ];
      templatesList[0].dependencies = ["stakeholder", "frm1234567890"]; // hsa1234567890
      templatesList[1].dependencies = ["stakeholder", "fieldworker"]; // frm1234567890
      templatesList[2].itemId = templatesList[2].item.id = "stakeholder";
      templatesList[2].item.typeKeywords.push("View Service");
      templatesList[2].dependencies = ["svc1234567890", "frm1234567890"]; // stakeholder
      templatesList[3].itemId = templatesList[3].item.id = "fieldworker";
      templatesList[3].item.typeKeywords.push("View Service");
      templatesList[3].dependencies = ["svc1234567890", "frm1234567890"]; // fieldworker
      templatesList[4].dependencies = ["frm1234567890"]; // svc1234567890

      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder)
        .withContext("buildOrder")
        .toEqual([
          "svc1234567890",
          "fieldworker",
          "stakeholder",
          "frm1234567890",
          "hsa1234567890"
        ]);
    });

    it("handles deployed template list", () => {
      const templatesList = [
        templates.getDeployedItemTemplate("map1234567890", "Web Map"),
        templates.getDeployedItemTemplate(
          "wma1234567890",
          "Web Mapping Application",
          ["map1234567890"]
        )
      ];
      const {
        buildOrder,
        missingDependencies,
        itemsToBePatched
      } = dependencies.topologicallySortItems(templatesList);
      expect(buildOrder)
        .withContext("buildOrder")
        .toEqual(["map1234567890", "wma1234567890"]);
    });
  });
});
