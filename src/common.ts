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

import { UserSession, IUserRequestOptions } from "@esri/arcgis-rest-auth";
import * as items from "@esri/arcgis-rest-items";
import * as groups from "@esri/arcgis-rest-groups";
import * as featureServiceAdmin from "@esri/arcgis-rest-feature-service-admin";
import * as sharing from "@esri/arcgis-rest-sharing";
import { request } from "@esri/arcgis-rest-request";
import { IFullItem } from "./fullItem";
import { IItemHash, getFullItemHierarchy } from "./fullItemHierarchy";
import { ISwizzle, ISwizzleHash, swizzleDependencies } from "./dependencies";
import { rejects } from 'assert';

//-- Exports ---------------------------------------------------------------------------------------------------------//

/**
 * Publishes an item and its data as an AGOL item.
 *
 * @param item Item's `item` section
 * @param data Item's `data` section
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: 'public', 'org', 'private'
 * @returns A promise that will resolve with an object reporting success and the Solution id
 */
export function createItemWithData (
  item: any,
  data: any,
  requestOptions?: IUserRequestOptions,
  folderId = "",
  access = "private"
): Promise<items.IItemUpdateResponse> {
  return new Promise((resolve, reject) => {
    let options:items.IItemAddRequestOptions = {
      item: item,
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
          let options = {
            id: results.id,
            access: access,
            ...requestOptions as sharing.ISetAccessRequestOptions
          };
          sharing.setItemAccess(options)
          .then(
            results => {
              resolve({
                success: true,
                id: results.itemId
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
 * @param fullItem A web mapping application
 * @param orgSession Options for requesting information from AGOL, including org and portal URLs
 * @returns A promise that will resolve when fullItem has been updated
 * @protected
 */
export function updateItemURL (
  id: string,
  url: string,
  requestOptions?: IUserRequestOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Update its URL
    var options = {
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

