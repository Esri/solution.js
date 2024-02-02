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
 * @param solutionItemId The solution to contain the template
 * @param itemInfo Info about the item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @returns A promise that will resolve when the template has been created
 */
export function convertItemToTemplate(
  /*solutionItemId: string,
  itemInfo: any,
  destAuthentication: common.UserSession,
  srcAuthentication: common.UserSession*/
): Promise<common.IItemTemplate> {
  return Promise.resolve(_getItemTemplate());
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


// ------------------------------------------------------------------------------------------------------------------ //
// Temporary implementation until the real one is available

function _getItemTemplate(
): common.IItemTemplate {
  return {
    itemId: "wfw1234567890",
    type: "Workflow",
    key: "i1a2b3c4",
    item: {
      id: "{{wfw1234567890.itemId}}",
      name: "Name of an AGOL item",
      title: "An AGOL item",
      type: "Workflow",
      typeKeywords: ["JavaScript"],
      description: "Description of an AGOL item",
      tags: ["test"],
      snippet: "Snippet of an AGOL item",
      thumbnail: "https://myorg.maps.arcgis.co/sharing/rest/content/items/wfw1234567890/info/thumbnail/ago_downloaded.png",
      extent: "{{solutionItemExtent}}",
      categories: [],
      contentStatus: null,
      spatialReference: undefined,
      accessInformation: "Esri, Inc.",
      licenseInfo: null,
      origUrl: undefined,
      properties: null,
      culture: "en-us",
      url: "",
      created: 1520968147000,
      modified: 1522178539000
    },
    data: undefined,
    resources: [],
    dependencies: [],
    relatedItems: [],
    groups: [],
    properties: {},
    estimatedDeploymentCostFactor: 2
  };
}
