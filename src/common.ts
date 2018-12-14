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

import * as items from "@esri/arcgis-rest-items";
import * as sharing from "@esri/arcgis-rest-sharing";
import { UserSession, IUserRequestOptions } from "@esri/arcgis-rest-auth";

// -- Exports -------------------------------------------------------------------------------------------------------//

/**
 * The replacement information for an AGOL item id in a cloned solution.
 */
export interface ISwizzle {
  /**
   * The replacement AGOL id
   */
  id: string;
  /**
   * For a feature layer, the updated layer name
   */
  name?: string;
  /**
   * For a feature layer, the updated layer URL
   */
  url?: string;
}

/**
 * The collection of mappings from original AGOL item ids to cloned values.
 */
export interface ISwizzleHash {
  /**
   * A mapping from an original AGOL item id to its cloned value.
   */
  [id:string]: ISwizzle;
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
            error => reject(error.originalMessage)
          );
        } else {
          resolve({
            success: true,
            id: results.id
          })
        }
      },
      error => reject(error.originalMessage)
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
        'id': id,
        'url': url
      },
      ...requestOptions
    };

    items.updateItem(options)
    .then(
      updateResp => {
        resolve(id);
      },
      reject
    );
  });
}

