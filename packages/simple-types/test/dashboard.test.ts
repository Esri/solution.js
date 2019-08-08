/** @license
 * Copyright 2019 Esri
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
 * Provides tests for common functions involving the management of a dashboard item.
 */

import { convertItemToTemplate } from "../src/dashboard";

import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import { IItemTemplate } from "../../common/src/interfaces";

const dashboardTemplate: IItemTemplate = mockItems.getItemTemplate();

beforeEach(() => {
  dashboardTemplate.item = mockItems.getAGOLItem("Dashboard");
  dashboardTemplate.data = mockItems.getAGOLItemData("Dashboard");
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `dashboard`: manages the creation and deployment of dashboard item type", () => {
  describe("convertItemToTemplate", () => {
    it("should extract dependencies", () => {
      const updatedTemplate: IItemTemplate = convertItemToTemplate(
        dashboardTemplate
      );
      expect(updatedTemplate.dependencies).toEqual(["map1234567890"]);
    });

    it("should templatize webmap ids in mapWidgets", () => {
      const updatedTemplate: IItemTemplate = convertItemToTemplate(
        dashboardTemplate
      );
      expect(updatedTemplate.data).toEqual(
        templates.getItemTemplateData("Dashboard")
      );
    });
  });
});
