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
    const ids: string[] = dataString.match(idTest) as string[];
    const verifiedIds: string[] = [];
    ids.forEach(id => {
      if (verifiedIds.indexOf(id) === -1) {
        verifiedIds.push(id);

        // templatize the itemId--but only once per unique id
        const regEx = new RegExp(id, "gm");
        dataString = dataString.replace(regEx, "{{" + id + ".itemId}}");

        // update the dependencies
        if (itemTemplate.dependencies.indexOf(id) === -1) {
          itemTemplate.dependencies.push(id);
        }
      }
    });
    itemTemplate.data = JSON.parse(dataString);
  }

  return itemTemplate;
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

export function fineTuneCreatedItem(
  originalTemplate: common.IItemTemplate,
  newlyCreatedItem: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession
): Promise<void> {
  return new Promise((resolve, reject) => {
    const data: any = common.replaceInTemplate(
      originalTemplate.data,
      templateDictionary
    );
    const updateOptions: common.IItemUpdate = {
      id: newlyCreatedItem.itemId,
      data: common.jsonToBlob(data)
    };
    common.updateItem(updateOptions, destinationAuthentication).then(
      () => {
        resolve();
      },
      e => reject(common.fail(e))
    );
  });
}

//#endregion
