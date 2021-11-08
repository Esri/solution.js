/** @license
 * Copyright 2021 Esri
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
 * Manages the creation and deployment of velocity item types.
 *
 * @module velocity
 */

import {
  UserSession,
  IItemProgressCallback,
  IItemTemplate,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  generateEmptyCreationResponse,
  createInitializedItemTemplate,
  fail,
  removeItem,
  updateVelocityReferences,
  updateItem
} from "@esri/solution-common";
import { templatizeVelocity } from "./helpers/velocity-templatize";
import { getVelocityDependencies } from "./helpers/get-velocity-dependencies";
import {
  cleanDataSourcesAndFeeds,
  getVelocityUrl,
  postVelocityData
} from "./helpers/velocity-helpers";
import {
  moveItem
} from "@esri/arcgis-rest-portal";

/**
 * Convert a Velocity item into a Template
 *
 * @param solutionItemId The solution to contain the item
 * @param itemInfo The basic item info
 * @param authentication The credentials for requests
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 *
 * @return a promise that will resolve the constructed IItemTemplate from the input itemInfo
 *
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  destAuthentication: UserSession,
  srcAuthentication: UserSession,
  templateDictionary: any
): Promise<IItemTemplate> {
  const template = createInitializedItemTemplate(itemInfo);
  return getVelocityUrl(
    destAuthentication,
    templateDictionary,
    itemInfo.type,
    itemInfo.id
  ).then(
    (url: string) => {
      if (url) {
        return fetch(url)
          .then(data => data.json())
          .then(data_json => {
            template.item.title = data_json.label;
            template.data = data_json;
            return getVelocityDependencies(template, srcAuthentication).then(
              deps => {
                template.dependencies = deps;
                cleanDataSourcesAndFeeds(template, templateDictionary.velocityUrl);
                templatizeVelocity(template);
                template.item = updateVelocityReferences(template.item, template.type, templateDictionary);
                return Promise.resolve(template);
              }
            );
          });
      } else {
        // In case the org used to have velocity and they still have items
        return Promise.reject("Velocity NOT Supported by Organization");
      }
    },
    e => Promise.reject(fail(e))
  );
}

/**
 * Create Velocity analytics and feeds from a Template
 *
 * @param template The template for the volocity items
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param destinationAuthentication Credentials for the deployment requests
 * @param itemProgressCallback Function for reporting progress updates from type-specific template handlers
 *
 * @return a promise that will resolve with the new item info, id, type, and postProcess flag
 *
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  // let the progress system know we've started...
  const startStatus = itemProgressCallback(
    template.itemId,
    EItemProgressStatus.Started,
    0
  );

  // and if it returned false, just resolve out
  /* istanbul ignore else */
  if (!startStatus) {
    return Promise.resolve(generateEmptyCreationResponse(template.type));
  }

  const orgId = template.itemId;

  return postVelocityData(
    destinationAuthentication,
    template,
    template.data,
    templateDictionary
  ).then(result => {
    const finalStatus = itemProgressCallback(
      orgId,
      EItemProgressStatus.Finished,
      template.estimatedDeploymentCostFactor || 2,
      result.id
    );

    if (!finalStatus) {
      return removeItem(result.id, destinationAuthentication).then(
        () => Promise.resolve(generateEmptyCreationResponse(template.type)),
        () => Promise.resolve(generateEmptyCreationResponse(template.type))
      );
    } else {
      const response: ICreateItemFromTemplateResponse = {
        item: {
          ...template,
          ...result
        },
        id: result.item.id,
        type: template.type,
        postProcess: true
      };
      response.item.itemId = result.item.id;
      return response;
    }
  });
}


/**
 * Velocity post-processing actions
 * 
 * Move all velocity items to the deployment folder.
 *
 * @param {string} itemId The item ID
 * @param {string} type The template type
 * @param {any[]} itemInfos Array of {id: 'ef3', type: 'Web Map'} objects
 * @param {IItemTemplate} template The item template
 * @param {IItemTemplate[]} templates The full collection of item templates
 * @param {any} templateDictionary Hash of facts such as the folder id for the deployment
 * @param {UserSession} authentication The destination session info
 * @returns Promise resolving to successfulness of update
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
  const itemUpdate = itemInfos.filter(ii => ii.id === itemId);
  const item: any = itemUpdate[0].item.item;
  delete item.url;
  delete item.origUrl;
   return updateItem(item, authentication).then(() => {
     return moveItem({
       owner: authentication.username,
       itemId,
       folderId: templateDictionary.folderId,
       authentication
     });
   });
}
