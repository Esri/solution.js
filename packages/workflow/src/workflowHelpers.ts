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
import { IRequestOptions, request } from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

export async function addWorkflowItem(
  item: common.IItemTemplate,
  destinationFolderId: string,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  const user = await authentication.getUser({ authentication });

  // Add the workflow item
  const workflowUrl = `https://workflow.arcgis.com/${user.orgId}/admin/createWorkflowItem?name=${item.item.title}`;
  const requestOptions: IRequestOptions = {
    authentication: authentication,
    params: {
      //async: true,
      f: "json",
      token: authentication.token
    }
  };

  const createdWorkflowResponse = await request(workflowUrl, requestOptions);
  console.log("Created workflow item: ", JSON.stringify(createdWorkflowResponse, null, 2));//???

  // Fetch the auxiliary items
  const workflowItemId = createdWorkflowResponse.itemId;
  const workflowLocationsItemName = `WorkflowLocations_${workflowItemId}`;
  const workflowViewsItemName = `workflow_views_${workflowItemId}`;
  const workflowItemName = `workflow_${workflowItemId}`;
  console.log("workflow auxiliary items: ", workflowLocationsItemName, workflowViewsItemName, workflowItemName);//???

  const fetchResults = await Promise.all([
    common.getItemBase(workflowLocationsItemName, authentication),
    common.getItemBase(workflowViewsItemName, authentication),
    common.getItemBase(workflowItemName, authentication)
  ]);
  console.log("Fetched auxiliary items: ", JSON.stringify(fetchResults.map(item => item.id), null, 2));//???

  // Move the workflow and auxiliary items to the destination
  const moveResults = await Promise.all([
    common.moveItemToFolder(workflowItemId, destinationFolderId, authentication),
    common.moveItemToFolder(fetchResults[0].id, destinationFolderId, authentication),
    common.moveItemToFolder(fetchResults[1].id, destinationFolderId, authentication),
    common.moveItemToFolder(fetchResults[2].id, destinationFolderId, authentication)
  ]);
  console.log("Moved workflow & its auxiliary items: ", JSON.stringify(moveResults.map(item => item.itemId), null, 2));//???

  return Promise.resolve(item);
}
