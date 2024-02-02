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
 * Manages the creation and deployment of workflow item types.
 *
 * @module workflow
 */

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Converts a workflow item into a template.
 *
 * @param itemInfo Info about the item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @returns A promise that will resolve when the template has been created
 */
export async function convertItemToTemplate(
  itemInfo: any,
  destAuthentication: common.UserSession,
  srcAuthentication: common.UserSession
): Promise<common.IItemTemplate> {
  // Init template
  const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
    itemInfo
  );

  // Templatize item info property values
  itemTemplate.item.id = common.templatizeTerm(
    itemTemplate.item.id,
    itemTemplate.item.id,
    ".itemId"
  );

  // Request related items
  const relatedPromise = common.getItemRelatedItemsInSameDirection(
    itemTemplate.itemId,
    "forward",
    srcAuthentication
  );

  // Request its configuration
  const configPromise = common.getWorkflowConfigurationZip(
    itemInfo.id,
    srcAuthentication
  );

  const [relatedItems, configZip] = await Promise.all([relatedPromise, configPromise]);

  // Save the mappings to related items & add those items to the dependencies, but not WMA Code Attachments
  itemTemplate.dependencies = [] as string[];
  itemTemplate.relatedItems = [] as common.IRelatedItems[];

  relatedItems.forEach(relatedItem => {
    /* istanbul ignore else */
    if (relatedItem.relationshipType !== "WMA2Code") {
      itemTemplate.relatedItems.push(relatedItem);
      relatedItem.relatedItemIds.forEach(relatedItemId => {
        if (itemTemplate.dependencies.indexOf(relatedItemId) < 0) {
          itemTemplate.dependencies.push(relatedItemId);
        }
      });
    }
  });

  // Add the templatized configuration to the template
  itemTemplate.properties = itemTemplate.properties || {};
  itemTemplate.properties.configuration = await common.extractAndTemplatizeWorkflowFromZipFile(configZip);

  return Promise.resolve(itemTemplate);
}

export function createItemFromTemplate(
  template: common.IItemTemplate/*,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback*/
): Promise<common.ICreateItemFromTemplateResponse> {
  return Promise.resolve({
    id: template.itemId,
    type: "Workflow",
    postProcess: false
  });
}
