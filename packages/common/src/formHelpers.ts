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

import * as zipUtils from "./zip-utils";
import { updateItem } from "./restHelpers";
import { IItemUpdate, UserSession } from "./interfaces";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Updates an item with a zip object, including any webhooks.
 *
 * @param zipObject Zip file object with which to update the item
 * @param destinationItemId Destination item id
 * @param destinationAuthentication Destination authentication
 * @returns Promise that resolves to the update item response
 */
export async function updateItemWithZipObject(
  zipObject: JSZip,
  destinationItemId: string,
  destinationAuthentication: UserSession
): Promise<any> {
  // Update the item with the zip object
  const update: IItemUpdate = {
    id: destinationItemId,
    data:  await zipUtils.zipObjectToZipFile(zipObject, `${destinationItemId}.zip`)
  }

  return updateItem(update, destinationAuthentication);
}
