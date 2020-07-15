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
  ICreateItemFromTemplateResponse,
  IItemProgressCallback,
  IItemTemplate,
  IItemUpdate,
  _templatizeDefinitionEditor,
  _templatizeDefinitionExpression,
  _templatizeDrawingInfo,
  _templatizeFieldName,
  _templatizePopupInfo,
  getItemDataAsJson,
  hasUnresolvedVariables,
  jsonToBlob,
  replaceInTemplate,
  updateItem
} from "@esri/solution-common";

// Need to import collectively to enable spying
import * as createHelper from "../helpers/create-item-from-template";
import { convertGenericItemToTemplate } from "../helpers/convert-generic-item-to-template";
import { updateNotebookData } from "../helpers/update-notebook-data";
import { UserSession } from "@esri/solution-common";
import { refineNotebookTemplate } from "./refine-notebook-template";

/**
 * Convert a Notebook item to a template
 * @param solutionItemId
 * @param itemInfo
 * @param authentication
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // delegate to generic item templating
  return convertGenericItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  ).then(itemTemplate => {
    return refineNotebookTemplate(itemTemplate);
  });
}

// Delegate back to simple-types
// This is a temporary refactor step
/**
 * Create a Notebook item from a template
 * @param template
 * @param templateDictionary
 * @param destinationAuthentication
 * @param itemProgressCallback
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  return createHelper.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
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
  originalTemplate: IItemTemplate,
  newlyCreatedItem: IItemTemplate,
  templateDictionary: any,
  authentication: UserSession
): Promise<void> {
  const data: any = replaceInTemplate(
    originalTemplate.data,
    templateDictionary
  );

  const updateOptions: IItemUpdate = {
    id: newlyCreatedItem.itemId,
    url: newlyCreatedItem.item.url,
    data: jsonToBlob(data)
  };
  return updateItem(updateOptions, authentication).then(() => {
    // Signature requires returning nothing...
    return;
  });
}

/**
 * Notebook specific post-processing actions
 * @param itemId
 * @param type
 * @param itemInfos Array of {id: 'ef3', type: 'Web Map'} objects
 * @param templateDictionary
 * @param authentication
 */
export function postProcess(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: IItemTemplate,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<any> {
  return getItemDataAsJson(itemId, authentication).then(data => {
    if (hasUnresolvedVariables(data)) {
      const updatedData = replaceInTemplate(data, templateDictionary);
      return updateNotebookData(itemId, updatedData, authentication);
    } else {
      return Promise.resolve({ success: true });
    }
  });
}
