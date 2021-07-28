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
 * @module solution-velocity
 */

import {
  UserSession,
  IItemProgressCallback,
  IItemTemplate,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  generateEmptyCreationResponse,
  createPlaceholderTemplate,
  fail
} from "@esri/solution-common";
import { templatizeVelocity } from "./helpers/velocity-templatize";
import { getVelocityDependencies } from "./helpers/get-velocity-dependencies";
import { getVelocityUrl, postVelocityData } from "./helpers/velocity-helpers";

/**
 * Convert a Velocity item into a Template
 *
 * @param solutionItemId The solution to contain the item
 * @param itemInfo The basic item info
 * @param authentication The credentials for requests
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  const template = createPlaceholderTemplate(itemInfo.id, itemInfo.type);
  return getVelocityUrl(authentication, {}, itemInfo.type, itemInfo.id).then(
    (url: string) => {
      return fetch(url)
        .then(data => data.json())
        .then(data_json => {
          template.item.title = data_json.label;
          template.data = data_json;
          template.dependencies = getVelocityDependencies(template);
          templatizeVelocity(template);
          return Promise.resolve(template);
        });
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
      return Promise.resolve(generateEmptyCreationResponse(template.type));
    } else {
      const response: ICreateItemFromTemplateResponse = {
        item: {
          ...template,
          ...result
        },
        id: result.item.id,
        type: template.type,
        postProcess: false
      };
      response.item.itemId = result.item.id;
      return response;
    }
  });
}
