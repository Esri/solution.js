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
 * Provides a function for deleting a deployed Solution item.
 *
 * @module deleteSolutionItem
 */

import { IStatusResponse, ArcGISIdentityManager } from "../interfaces";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../restHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deletes a deployed Solution item and and all of the items that were created
 * as part of that deployment.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @returns Promise that will resolve with the status of deleting the item
 */
export function deleteSolutionItem(
  solutionItemId: string,
  authentication: ArcGISIdentityManager
): Promise<IStatusResponse> {
  const protectOptions: portal.IUserItemOptions = {
    id: solutionItemId,
    authentication
  };
  return portal
    .unprotectItem(protectOptions)
    .then(result => {
      if (result.success) {
        return restHelpers.removeItem(solutionItemId, authentication);
      } else {
        return Promise.resolve(result);
      }
    })
    .then(result => {
      return Promise.resolve({
        success: result.success,
        itemId: solutionItemId
      });
    });
}
