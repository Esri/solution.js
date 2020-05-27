/** @license
 * Copyright 2018 Esri
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
 * Manages the creation and deployment of Story Map item types.
 *
 * @module hub-page-processor
 */

import {
  IItemTemplate,
  IItemProgressCallback,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  UserSession
} from "@esri/solution-common";
/* istanbul ignore next */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // TODO: add implementation
  console.info(`Hub Site Application is not supported yet`);
  return Promise.resolve({
    item: {},
    data: {},
    itemId: itemInfo.id,
    resources: [],
    type: "Hub Site Application",
    key: "site-bz3",
    dependencies: [],
    properties: {},
    groups: [],
    estimatedDeploymentCostFactor: 1
  } as IItemTemplate);
}
/* istanbul ignore next */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  itemProgressCallback(template.itemId, EItemProgressStatus.Failed, 0);
  console.info(`Hub Site Application is not supported yet`);
  return Promise.resolve({
    id: "Next-gen Hub Page is not yet implemented", // temporary
    type: template.type,
    postProcess: false
  });
}
/* istanbul ignore next */
export function postProcess(model: any, items: any[]): Promise<boolean> {
  console.info(`Hub Page is not supported yet`);
  return Promise.resolve(true);
}

/**
 * Check of an item type is a Page
 * Hub Page is for ArcGIS Online
 * Site Page is for ArcGIS Enterprise
 * @param itemType
 */
/* istanbul ignore next */
export function isAPage(itemType: string): boolean {
  let result = false;

  if (itemType === "Hub Page" || itemType === "Site Page") {
    result = true;
  }
  return result;
}
