/*
 | Copyright 2020 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import * as common from "@esri/solution-common";

//#region Publish Process ---------------------------------------------------------------------------------------//

/**
 * Converts a Python Notebook item to a template.
 *
 * @param itemTemplate template for the Python Notebook
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // The templates data to process
  const data: any = itemTemplate.data;
  let dataString: string = JSON.stringify(data);

  const idTest: RegExp = /[0-9A-F]{32}/gim;

  if (data && idTest.test(dataString)) {
    const ids: any = dataString.match(idTest);
    if (Array.isArray(ids) && ids.length > 0) {
      const verifiedIds: string[] = [];
      ids.forEach(id => {
        if (verifiedIds.indexOf(id) === -1) {
          verifiedIds.push(id);
          // update the dependencies
          if (itemTemplate.dependencies.indexOf(id) === -1) {
            itemTemplate.dependencies.push(id);
          }
          // templatize the itemId
          const regEx = new RegExp(id, "gm");
          dataString = dataString.replace(regEx, "{{" + id + ".itemId}}");
        }
      });
    }
    itemTemplate.data = JSON.parse(dataString);
  }

  return itemTemplate;
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

//#endregion
