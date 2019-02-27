/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import { ArcGISRequestError } from "@esri/arcgis-rest-request";
import * as sharing from "@esri/arcgis-rest-sharing";
import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import { IProgressUpdate } from "../interfaces";

// -------------------------------------------------------------------------------------------------------------------//

/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGOL, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export const PLACEHOLDER_SERVER_NAME:string = "{{organization.portalBaseUrl}}";

export function fail (
  e: any
): any {
  return { success: false, error: (e && e.error) || e };
}

export function doCommonTemplatizations (
  itemTemplate: any
): void {
  // Use the initiative's extent
  if (itemTemplate.item.extent) {
    itemTemplate.item.extent = "{{initiative.extent:optional}}";
  }

  // Templatize the item's id
  itemTemplate.item.id = templatize(itemTemplate.item.id);
}

/**
 * Publishes an item and its data as an AGOL item.
 *
 * @param item Item's `item` section
 * @param data Item's `data` section
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function createItemWithData (
  item: any,
  data: any,
  requestOptions: IUserRequestOptions,
  folderId = null as string,
  access = "private"
): Promise<items.IItemUpdateResponse> {
  return new Promise((resolve, reject) => {
    const options:items.IItemAddRequestOptions = {
      item,
      folder: folderId,
      ...requestOptions
    };
    if (data) {
      options.item.text = data;
    }

    // Create item and add its optional data section
    items.createItemInFolder(options)
    .then(
      results => {
        // Clear property used to create item's data
        delete item.text;

        if (access !== "private") {  // set access if it is not AGOL default
          // Set the access manually since the access value in createItem appears to be ignored
          const options1 = {
            id: results.id,
            access,
            ...requestOptions as sharing.ISetAccessRequestOptions
          };
          sharing.setItemAccess(options1)
          .then(
            results2 => {
              resolve({
                success: true,
                id: results2.itemId
              })
            },
            () => reject({ success: false })
          );
        } else {
          resolve({
            success: true,
            id: results.id
          })
        }
      },
      () => reject({ success: false })
    );
  });
}

export function deTemplatize (
  id: string | string[]
): string | string[] {
  if (Array.isArray(id)) {
    return deTemplatizeList(id);
  }

  if (id && id.startsWith("{{")) {
    return id.substring(2, id.indexOf("."));
  } else {
    return id;
  }
}

function deTemplatizeList (
  ids: string[]
): string[] {
  return ids.map(
    (id:string) => {
      return deTemplatize(id) as string;
    }
  );
}

export function finalCallback (
  key: string,
  successful: boolean,
  progressCallback?: (update:IProgressUpdate) => void
): void {
  progressCallback && progressCallback({
    processId: key,
    status: successful ? "done" : "failed"
  });
}

/**
 * Creates a timestamp string using the current date and time.
 *
 * @return Timestamp
 * @protected
 */
export function getUTCTimestamp (
): string {
  const now = new Date();
  return padPositiveNum(now.getUTCFullYear(), 4) + padPositiveNum(now.getUTCMonth() + 1, 2) +
    padPositiveNum(now.getUTCDate(), 2) + "_" + padPositiveNum(now.getUTCHours(), 2) +
    padPositiveNum(now.getUTCMinutes(), 2) + "_" + padPositiveNum(now.getUTCSeconds(), 2) +
    padPositiveNum(now.getUTCMilliseconds(), 3);
}

function padPositiveNum (
  n: number,
  totalSize: number
): string {
  let numStr = n.toString();
  const numPads = totalSize - numStr.length;
  if (numPads > 0) {
    numStr = "0".repeat(numPads) + numStr;  // TODO IE11 does not support repeat()
  }
  return numStr;
}

export function templatize (
  id: string | string[],
  param = "id"
): string | string[] {
  if (Array.isArray(id)) {
    return templatizeList(id, param);
  }

  if (id && id.startsWith("{{")) {
    return id;
  } else {
    return "{{" + id + "." + param + "}}";
  }
}

export function templatizeList (
  ids: string[],
  param = "id"
): string[] {
  return ids.map(
    (id:string) => {
      return templatize(id, param) as string;
    }
  );
}
export function updateItemData (
  id: string,
  data: any,
  requestOptions: IUserRequestOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Update its URL
    const options = {
      item: {
        id,
        text: data
      },
      ...requestOptions
    };

    items.updateItem(options)
    .then(
      updateResp => {
        resolve(id);
      },
      () => reject({ success: false })
    );
  });
}

/**
 * Updates the URL of an item.
 *
 * @param id AGOL id of item to update
 * @param url URL to assign to item's base section
 * @param requestOptions Options for the request
 * @return A promise that will resolve when the item has been updated
 */
export function updateItemURL (
  id: string,
  url: string,
  requestOptions: IUserRequestOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Update its URL
    const options = {
      item: {
        id,
        url
      },
      ...requestOptions
    };

    items.updateItem(options)
    .then(
      updateResp => {
        resolve(id);
      },
      () => reject()
    );
  });
}

