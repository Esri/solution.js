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
 * Manages the deployment items from Form templates.
 *
 * @module create-item-from-template
 */

import {
  UserSession,
  IItemTemplate,
  IItemProgressCallback,
  ICreateItemFromTemplateResponse
} from "@esri/solution-common";

/**
 * Creates a Web tool item from a template
 *
 * @param {IItemTemplate} template The template
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} destinationAuthentication The destination user session info
 * @param itemProgressCallback An item progress callback
 * @returns {Promise<ICreateItemFromTemplateResponse>}
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  return new Promise<ICreateItemFromTemplateResponse>((resolve, reject) => {
    resolve(null);
  });
}
