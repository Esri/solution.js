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

//#region Publish Process ---------------------------------------------------------------------------------------//

/**
 * Converts an workforce item to a template.
 *
 * @param itemTemplate template for the workforce project item
 * @param authentication credentials for any requests
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return common.convertWorkforceItemToTemplate(itemTemplate, authentication);
}

//#endregion

//#region Deploy Process ---------------------------------------------------------------------------------------//

/**
 * Gets the current user and updates the dispatchers service
 *
 * @param newlyCreatedItem Item to be created; n.b.: this item is modified
 * @param destinationAuthentication The session used to create the new item(s)
 * @return A promise that will resolve with { "success" === true || false }
 */
export function fineTuneCreatedItem(
  newlyCreatedItem: common.IItemTemplate,
  destinationAuthentication: common.UserSession
): Promise<any> {
  return common.fineTuneCreatedWorkforceItem(
    newlyCreatedItem,
    destinationAuthentication,
    1
  );
}

//#endregion
