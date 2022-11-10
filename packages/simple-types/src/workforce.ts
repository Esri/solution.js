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

import * as common from "@esri/solution-common";

/**
 * Converts an workforce item to a template.
 *
 * @param itemTemplate template for the workforce project item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @param templateDictionary Hash of key details used for variable replacement
 * @returns templatized itemTemplate
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  destAuthentication: common.UserSession,
  srcAuthentication: common.UserSession,
  templateDictionary: any
): Promise<common.IItemTemplate> {
  return common.convertWorkforceItemToTemplate(itemTemplate, srcAuthentication, templateDictionary);
}

/**
 * Gets the current user and updates the dispatchers service
 *
 * @param newlyCreatedItem Item to be created; n.b.: this item is modified
 * @param destinationAuthentication The session used to create the new item(s)
 * @returns A promise that will resolve with { "success" === true || false }
 */
export function fineTuneCreatedItem(
  newlyCreatedItem: common.IItemTemplate,
  destinationAuthentication: common.UserSession,
  templateDictionary: any
): Promise<any> {
  return common.fineTuneCreatedWorkforceItem(
    newlyCreatedItem,
    destinationAuthentication,
    "",
    templateDictionary
  );
}
