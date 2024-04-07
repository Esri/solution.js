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
import * as workflowHelpers from "./workflowHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Converts a workflow item into a template.
 *
 * @param itemInfo Info about the item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @param {any} templateDictionary Hash of facts: folder id, org URL, adlib replacements
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
  itemTemplate.properties.configuration = await common.extractWorkflowFromZipFile(configZip);

  return Promise.resolve(itemTemplate);
}

/**
 * Converts a workflow template into a new item.
 *
 * @param template Workflow template
 * @param templateDictionary Dictionary of terms to replace in the template
 * @param destAuthentication Credentials for requests to the destination organization
 * @param itemProgressCallback Callback function to report the progress of the item creation
 * @returns Promise resolving with the detemplatized item template, the new item's id, and a boolean
 * indicating if post-processing is needed
 */
export async function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  // Interrupt process if progress callback returns `false`
  if (
    !itemProgressCallback(
      template.itemId,
      common.EItemProgressStatus.Started,
      0
    )
  ) {
    itemProgressCallback(
      template.itemId,
      common.EItemProgressStatus.Ignored,
      0
    );
    return Promise.resolve(common.generateEmptyCreationResponse(template.type));
  }

  // Replace the templatized symbols in a copy of the template
  let newItemTemplate: common.IItemTemplate = common.cloneObject(template);
  newItemTemplate = common.replaceInTemplate(
    newItemTemplate,
    templateDictionary
  );
  /* istanbul ignore else */
  if (template.item.thumbnail) {
    newItemTemplate.item.thumbnail = template.item.thumbnail;
  }

  try {
    const createdWorkflowItemId = await workflowHelpers.addWorkflowItem(
      newItemTemplate, destinationAuthentication);
    if (!createdWorkflowItemId) {
      throw new Error("Failed to create workflow item");
    }

    // Interrupt process if progress callback returns `false`
    if (
      !itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Created,
        template.estimatedDeploymentCostFactor / 2,
        createdWorkflowItemId
      )
    ) {
      itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Cancelled,
        0
      );

      void common.removeItem(createdWorkflowItemId, destinationAuthentication);
      return Promise.resolve(common.generateEmptyCreationResponse(template.type));
    }

    // Add the new item to the settings
    newItemTemplate.itemId = newItemTemplate.item.id = createdWorkflowItemId;
    templateDictionary[template.itemId] = {
      itemId: createdWorkflowItemId
    };

    // Detempletize the workflow configuration
    newItemTemplate.properties.configuration = common.replaceInTemplate(
      newItemTemplate.properties.configuration, templateDictionary);

    // Add the item's configuration properties; throw if the configuration update fails
    const configZipFile = await common.compressWorkflowIntoZipFile(newItemTemplate.properties.configuration);
    await common.setWorkflowConfigurationZip(configZipFile, createdWorkflowItemId, destinationAuthentication);

    // Fetch the auxiliary items
    const itemIds = await workflowHelpers.fetchAuxiliaryItems(createdWorkflowItemId, destinationAuthentication);

    // Move the workflow and auxiliary items to the destination
    itemIds.push(createdWorkflowItemId);
    const moveResults = await common.moveItemsToFolder(itemIds, templateDictionary.folderId, destinationAuthentication);
    const hasFailure = moveResults.some(result => {
      return !result.success;
    });
    if (hasFailure) {
      throw new Error("Failed to move all workflow items");
    }

    itemProgressCallback(
      template.itemId,
      common.EItemProgressStatus.Finished,
      template.estimatedDeploymentCostFactor / 2,
      createdWorkflowItemId
    );

    return Promise.resolve({
      item: newItemTemplate,
      id: createdWorkflowItemId,
      type: newItemTemplate.type,
      postProcess: false
    });
  } catch (err) {
    itemProgressCallback(
      template.itemId,
      common.EItemProgressStatus.Failed,
      0
    );
    return Promise.resolve(common.generateEmptyCreationResponse(template.type));
  }
}
