/** @license
 * Copyright 2021 Esri
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

import { IItemTemplate } from "@esri/solution-common";
import { sortTemplates } from "../../src/helpers/sortTemplates";
import * as mockItems from "@esri/solution-common/test/mocks/agolItems";
import * as templates from "@esri/solution-common/test/mocks/templates";

describe("sortTemplates", () => {
  it("sorts a list of templates", () => {
    const itemTemplates: IItemTemplate[] = [
      templates.getItemTemplate("Web Map"),
      templates.getItemTemplate("Feature Service"),
      templates.getItemTemplate("Dashboard"),
      templates.getItemTemplate("QuickCapture Project")
    ];
    const sortOrderIds = [
      mockItems.getItemTypeAbbrev("Web Map"),
      mockItems.getItemTypeAbbrev("Feature Service"),
      mockItems.getItemTypeAbbrev("Dashboard"),
      mockItems.getItemTypeAbbrev("QuickCapture Project")
    ]
      .sort()
      .map(id => id + "1234567890");

    sortTemplates(itemTemplates, sortOrderIds);

    expect(itemTemplates.map(template => template.itemId)).toEqual(
      sortOrderIds
    );
  });
});
