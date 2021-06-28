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

import {
  getVelocityUrl,
  ICreateItemFromTemplateResponse,
  IItemProgressCallback,
  IItemTemplate,
  UserSession
} from "@esri/solution-common";

export function convertItemToTemplate(
  itemTemplate: any,
  authentication: UserSession
): IItemTemplate {
  console.log(authentication);
  return itemTemplate;
}

// Delegate back to simple-types
// This is a temporary refactor step
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  console.log(templateDictionary);
  console.log(destinationAuthentication);
  console.log(itemProgressCallback);
  return Promise.resolve({
    item: template,
    id: template.itemId,
    type: template.type,
    postProcess: false
  });
}

export function getFeedData(
  itemId: string,
  authentication: UserSession
): Promise<any> {
  return getVelocityUrl(authentication, "Feed", itemId).then((url: string) => {
    return fetch(url).then(data => data.json());
  });
}
