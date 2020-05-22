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
import { _updateDependencies } from "./quickcapture";
import { simpleTypeShareTemplatesToGroups } from "./simpleTypeHelpers/simple-type-share-templates-to-groups";
import { simpleTypeCreateItemFromTemplate } from "./simpleTypeHelpers/simple-type-create-item-from-template";
import { simpleTypeConvertItemToTemplate } from "./simpleTypeHelpers/simple-type-convert-item-to-template";

// Delegate back to simple-types, which will in-turn delegate
// to convertNotebookToTemplate at the correct point in the process
// This is a temporary refactor step
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return simpleTypeConvertItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  );
}

// Delegate back to simple-types
// This is a temporary refactor step
export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  return simpleTypeCreateItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}

/**
 * Converts a Python Notebook item to a template.
 *
 * @param itemTemplate template for the Python Notebook
 * @return templatized itemTemplate
 */
export function convertNotebookToTemplate(
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

/**
 * Update the notebooks data
 *
 * @param originalTemplate The original template item
 * @param newlyCreatedItem The current item that may have unswapped variables
 * @param templateDictionary Hash of facts: org URL, adlib replacements, deferreds for dependencies
 * @param authentication Credentials for the requests to the destination
 *
 * @return A promise that will resolve once any updates have been made
 */
export function fineTuneCreatedItem(
  originalTemplate: common.IItemTemplate,
  newlyCreatedItem: common.IItemTemplate,
  templateDictionary: any,
  authentication: common.UserSession
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const data: any = common.replaceInTemplate(
      originalTemplate.data,
      templateDictionary
    );

    const updateOptions: common.IItemUpdate = {
      id: newlyCreatedItem.itemId,
      url: newlyCreatedItem.item.url,
      data: common.jsonToBlob(data)
    };
    common
      .updateItem(updateOptions, authentication)
      .then(() => resolve(), reject);
  });
}

/**
 * Notebook specific post-processing actions
 * @param itemId
 * @param type
 * @param templates
 * @param templateDictionary
 * @param authentication
 */
export function postProcess(
  itemId: string,
  type: string,
  templates: common.IItemTemplate[],
  templateDictionary: any,
  authentication: common.UserSession
): Promise<any> {
  return common
    .getItemDataAsJson(itemId, authentication)
    .then(data => {
      if (common.hasUnresolvedVariables(data)) {
        const updatedData = common.replaceInTemplate(data, templateDictionary);
        return _updateNotebookData(itemId, updatedData, authentication);
      } else {
        return Promise.resolve({ success: true });
      }
    })
    .then(_ => {
      return simpleTypeShareTemplatesToGroups(
        templates,
        authentication,
        templateDictionary
      );
    });
}

export function _updateNotebookData(
  itemId: string,
  data: any,
  authentication: common.UserSession
): Promise<any> {
  const updateOptions: common.IItemUpdate = {
    id: itemId,
    data: common.jsonToBlob(data)
  };
  return common.updateItem(updateOptions, authentication);
}
