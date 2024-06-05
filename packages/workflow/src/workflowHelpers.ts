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
import * as restRequest from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates a new workflow item.
 *
 * @param item Item to add
 * @param authentication Credentials for requests to the workflow manager
 * @param orgId Id of organization whose license is to be checked; only used if `enterpriseWebAdaptorUrl` is falsy
 * @param workflowURL URL of the workflow manager, e.g., "https://workflow.arcgis.com"
 * @returns Promise resolving with new item's AGO id
 * @throws {WorkflowJsonExceptionDTO} if request to workflow manager fails
 */
export async function addWorkflowItem(
  item: common.IItemTemplate,
  authentication: common.UserSession,
  orgId: string | undefined,
  workflowURL: string
): Promise<string> {
  // Add the workflow item
  const workflowUrlRoot = common.getWorkflowManagerUrlRoot(orgId, workflowURL);
  const url = `${workflowUrlRoot}/admin/createWorkflowItem?name=${item.item.title}`;

  const options: restRequest.IRequestOptions = {
    authentication: authentication,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authentication.token}`,
      "Content-Type": "application/json",
      "X-Esri-Authorization": `Bearer ${authentication.token}`
    },
    params: {
      name: `${item.item.title}`
    }
  };
  const createdWorkflowResponse = await restRequest.request(url, options);

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
  authentication: common.UserSession
): Promise<string[]> {
  const workflowItemName = `workflow_${workflowItemId}`;
  const workflowLocationsItemName = `WorkflowLocations_${workflowItemId}`;
  const workflowViewsItemName = `workflow_views_${workflowItemId}`;

  const auxiliaryItemsResults = await common.searchItems({
    q: `title:${workflowItemName} OR title:${workflowLocationsItemName} OR title:${workflowViewsItemName}`,
    authentication: authentication
  });
  return Promise.resolve(auxiliaryItemsResults.results.map(item => item.id));
}
