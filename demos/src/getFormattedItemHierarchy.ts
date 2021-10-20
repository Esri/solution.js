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
// @esri/solution-common getItemHierarchy example

import * as common from "@esri/solution-common";
import * as viewer from "@esri/solution-viewer";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Gets a formatted (nested HTML `ol`s) display of a solution template's items.
 *
 * @param itemId Id of a solution template
 * @param authentication Credentials for the request to AGO
 * @return HTML showing hierarchy
 */
export function getFormattedItemHierarchy(
  itemId: string,
  authentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }
    let solutionTitle = itemId;

    // Get the item information
    common.getItemBase(itemId, authentication)
    .then((item: common.IItem) => {
      // Item must be a Solution template
      if (item.type !== "Solution" || !item.typeKeywords.includes("Template")) {
        return reject("This app is for Solution Templates");
      }
      solutionTitle = '"' + item.title + '"';

      // Get the templates in the solution
      return common.getItemDataAsJson(itemId, authentication);
    })
    .then((data: any) => {
      // Extract the hierarchy from the list of templates
      const hierarchy = viewer.getItemHierarchy(data.templates);

      // Handle an item in the hierarchy
      function displayItem(item: common.IHierarchyElement): string {
        return "<li>" + item.id + displayItems(item.dependencies) + "</li>";
      }

      // Handle a list of hierarchy items at the same level
      function displayItems(itemList: common.IHierarchyElement[]): string {
        return "<ul>" + itemList.reduce((accum, item) => accum + displayItem(item), "") + "</ul>";
      }

      const heading = "<b>Solution Template " + solutionTitle + ":</b><br/>";
      return resolve(heading + displayItems(hierarchy));

    });
  });
}

// ------------------------------------------------------------------------------------------------------------------ //
