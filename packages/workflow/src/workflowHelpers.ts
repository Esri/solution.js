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
 * @module workflowHelpers
 */

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates a new workflow item.
 *
 * @param item Item to add
 * @param workflowBaseUrl URL of the workflow manager, e.g., "https://workflow.arcgis.com/orgId"
 * @param authentication Credentials for requests to the workflow manager
 * @returns Promise resolving with new item's AGO id
 * @throws {WorkflowJsonExceptionDTO} if request to workflow manager fails
 */
export async function addWorkflowItem(
  item: common.IItemTemplate,
  workflowBaseUrl: string,
  authentication: common.UserSession,
): Promise<string> {
  // Add the workflow item
  const url = `${workflowBaseUrl}/admin/createWorkflowItem?name=${item.item.title}`;

  const options: common.IRequestOptions = {
    authentication: authentication,
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${authentication.token}`,
      "Content-Type": "application/json",
      "X-Esri-Authorization": `Bearer ${authentication.token}`,
    },
    params: {
      name: `${item.item.title}`,
    },
  };
  const createdWorkflowResponse = await common.request(url, options);

  return Promise.resolve(createdWorkflowResponse.itemId);
}

/**
 * Fetches the auxiliary items.
 *
 * @param workflowItemId Workflow whose auxiliary items are to be fetched
 * @param authentication Credentials for requests to the destination organization
 * @returns List of auxiliary item ids
 */
export async function fetchAuxiliaryItems(
  workflowItemId: string,
  authentication: common.UserSession,
): Promise<string[]> {
  const workflowItemName = `workflow_${workflowItemId}`;
  const workflowLocationsItemName = `WorkflowLocations_${workflowItemId}`;
  const workflowViewsItemName = `workflow_views_${workflowItemId}`;

  const auxiliaryItemsResults = await common.searchItems({
    q: `title:${workflowItemName} OR title:${workflowLocationsItemName} OR title:${workflowViewsItemName}`,
    authentication: authentication,
  });
  return Promise.resolve(auxiliaryItemsResults.results.map((item) => item.id));
}

/**
 * Updates the dependencies of the workflow item from its configuration.
 *
 * @param templates A collection of AGO item templates
 * @returns Updated templates list
 */
export function postProcessFormItems(templates: common.IItemTemplate[]): common.IItemTemplate[] {
  for (const template of templates) {
    if (template.type === "Workflow") {
      const ids = common.getTemplatedIds(JSON.stringify(template.properties.configuration));
      template.dependencies = common.dedupe([...template.dependencies, ...ids]);
    }
  }
  return templates;
}

/**
 * Fetch the data from the new Workflow item and update the templateDictionary for variable replacement
 *
 * @param sourceId The id of the source Workflow item that was used to create the solution template
 * @param newId The id of the Workflow item that has been deployed
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param authentication Credentials for requests to the destination organization
 *
 */
export async function updateTemplateDictionaryForWorkflow(
  sourceId: string,
  newId: string,
  templateDictionary: any,
  authentication: common.UserSession,
): Promise<void> {
  const workflowData = await common.getItemDataAsJson(newId, authentication);

  const workflowLookup = common.getProp(templateDictionary, `workflows.${sourceId}`);
  if (workflowLookup) {
    await updateTempDictWorkflowId(templateDictionary, "viewSchema", workflowLookup, workflowData, authentication);
    await updateTempDictWorkflowId(
      templateDictionary,
      "workflowLocations",
      workflowLookup,
      workflowData,
      authentication,
    );
    await updateTempDictWorkflowId(templateDictionary, "workflowSchema", workflowLookup, workflowData, authentication);
  }
}

/**
 * Store ids and key values for variable replacement from the new Workflow item based on
 * previously stored source IDs.
 *
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param key The property from the workflow items data that contains an item id for a supporting service
 * @param workflowLookup The stored source item Ids from the templateDictionary
 * @param workflowData The data object from the new Workflow item
 * @param authentication Credentials for requests to the destination organization
 *
 */
export async function updateTempDictWorkflowId(
  templateDictionary: any,
  key: string,
  workflowLookup: any,
  workflowData: any,
  authentication: common.UserSession,
): Promise<void> {
  const id = workflowLookup[key];
  const itemId = common.getProp(workflowData, `${key}.itemId`);
  templateDictionary[id].itemId = itemId;

  const item = await common.getCompleteItem(itemId, authentication);

  const baseUrl = common.getProp(item, "base.url");
  templateDictionary[id].url = baseUrl;
  templateDictionary[id].name = common.getProp(item, "base.name");

  const layers = common.getProp(item, "featureServiceProperties.layers");
  _cacheLayerDetails(layers, templateDictionary, baseUrl, id, itemId);

  const tables = common.getProp(item, "featureServiceProperties.tables");
  _cacheLayerDetails(tables, templateDictionary, baseUrl, id, itemId);
}

/**
 * Store key values for variable replacement from the new Workflow item
 *
 * @param layers
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param baseUrl The base url of the new item
 * @param srcId The id of the source item that was used to create the solution
 * @param itemId The id of the new item that was created by workflow
 *
 */
export function _cacheLayerDetails(
  layers: any[],
  templateDictionary: any,
  baseUrl: string,
  srcId: string,
  itemId: string,
): void {
  if (layers) {
    layers.forEach((layer) => {
      const fields = layer.fields.reduce((prev, cur) => {
        prev[cur.name.toLowerCase()] = {
          alias: cur.alias,
          name: cur.name,
          type: cur.type,
        };
        return prev;
      }, {});
      const layerId = layer.id;
      const url = `${baseUrl}/${layerId}`;
      templateDictionary[srcId][`layer${layerId}`] = {
        fields,
        itemId,
        layerId,
        url,
      };
    });
  }
}
