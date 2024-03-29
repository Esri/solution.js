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

import * as generalHelpers from "./generalHelpers";
import * as interfaces from "./interfaces";
import * as zipUtils from "./zip-utils";
import { updateItem } from "./restHelpers";
import { IItemUpdate, UserSession } from "./interfaces";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Gets the webhooks from a Form zip object's *.info file.
 *
 * @param zipObject Zip file object from which to get the webhooks
 * @returns Promise that resolves to an array of webhooks
 */
export async function getWebHooksFromZipObject(
  zipObject: JSZip
): Promise<string[]> {
  const zipObjectContents: interfaces.IZipObjectContentItem[] = await zipUtils.getZipObjectContents(zipObject);
  let webhooks: string[] = [];
  zipObjectContents.forEach(
    (zipFile: interfaces.IZipObjectContentItem) => {
      if (zipFile.file.endsWith(".info")) {
        const infoFileJson = JSON.parse(zipFile.content as string);
        webhooks = generalHelpers.getProp(infoFileJson, "notificationsInfo.webhooks") || [];
      }
    }
  );
  return Promise.resolve(webhooks);
}

/**
 * Sets the webhooks in a Form zip object's *.info file.
 *
 * @param zipObject Zip file object in which to set the webhooks
 * @param webHooks Array of webhooks to set
 * @returns Promise that resolves to the updated zip object
 */
export async function setWebHooksInZipObject(
  zipObject: JSZip,
  webHooks: any[]
): Promise<JSZip> {
  const zipObjectContents: interfaces.IZipObjectContentItem[] = await zipUtils.getZipObjectContents(zipObject);
  zipObjectContents.forEach(
    (zipFile: interfaces.IZipObjectContentItem) => {
      if (zipFile.file.endsWith(".info")) {
        const infoFileJson = JSON.parse(zipFile.content as string);
        generalHelpers.setProp(infoFileJson, "notificationsInfo.webhooks", webHooks);
        zipObject.file(zipFile.file, JSON.stringify(infoFileJson));
      }
    }
  );
  return Promise.resolve(zipObject);
}

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
