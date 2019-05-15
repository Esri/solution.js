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
 * Provides common functions involving the arcgis-rest-js library.
 *
 * @module restHelpers
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as generalHelpers from "./generalHelpers";
import * as portal from "@esri/arcgis-rest-portal";
import * as serviceAdmin from "@esri/arcgis-rest-service-admin";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Publishes a feature service as an AGOL item; it does not include its layers and tables
 *
 * @param itemInfo Item's `item` section
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function createFeatureService(
  itemInfo: any,
  dataInfo: any,
  requestOptions: auth.IUserRequestOptions,
  folderId: string | undefined,
  access = "private"
): Promise<serviceAdmin.ICreateServiceResult> {
  return new Promise((resolve, reject) => {

    // Create item
    const createOptions: serviceAdmin.ICreateServiceOptions = {
      item: {
        ...itemInfo,
        data: dataInfo
      },
      folderId,
      ...requestOptions
    };

    // Make the item name unique
    createOptions.item.name = itemInfo.name + "_" + generalHelpers.getUTCTimestamp();

    serviceAdmin.createFeatureService(createOptions).then(
      createResponse => {
        // Update item because createFeatureService doesn't provide a way to specify
        // snippet, description, etc.
        const updateOptions: portal.IUpdateItemOptions = {
          item: {
            id: createResponse.serviceItemId,
            title: itemInfo.title,
            snippet: itemInfo.snippet,
            description: itemInfo.description,
            accessInfo: itemInfo.accessInfo,
            licenseInfo: itemInfo.licenseInfo,
            text: itemInfo.data
          },
          ...requestOptions
        };

        portal.updateItem(updateOptions).then(
          () => {
            if (access !== "private") {
              // Set access if it is not AGOL default
              // Set the access manually since the access value in createItem appears to be ignored
              const accessOptions: portal.ISetAccessOptions = {
                id: createResponse.serviceItemId,
                access: (access === "public" ? "public" : "org"),  // need to use constants rather than string
                ...requestOptions
              };
              portal.setItemAccess(accessOptions).then(
                () => {
                  resolve(createResponse);
                },
                e => reject(generalHelpers.fail(e))
              );
            } else {
              resolve(createResponse);
            }
          },
          e => reject(generalHelpers.fail(e))
        );
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}

/**
 * Publishes an item and its data as an AGOL item.
 *
 * @param itemInfo Item's `item` section
 * @param dataInfo Item's `data` section
 * @param requestOptions Options for the request
 * @param folderId Id of folder to receive item; null indicates that the item goes into the root
 *                 folder; ignored for Group item type
 * @param access Access to set for item: "public", "org", "private"
 * @return A promise that will resolve with an object reporting success and the Solution id
 */
export function createItemWithData(
  itemInfo: any,
  dataInfo: any,
  requestOptions: auth.IUserRequestOptions,
  folderId: string | undefined,
  access = "private"
): Promise<portal.ICreateItemResponse> {
  return new Promise((resolve, reject) => {

    // Create item
    const createOptions: portal.ICreateItemOptions = {
      item: {
        ...itemInfo,
        data: dataInfo
      },
      folderId,
      ...requestOptions
    };

    portal.createItemInFolder(createOptions).then(
      createResponse => {
        if (access !== "private") {
          // Set access if it is not AGOL default
          // Set the access manually since the access value in createItem appears to be ignored
          const accessOptions: portal.ISetAccessOptions = {
            id: createResponse.id,
            access: (access === "public" ? "public" : "org"),  // need to use constants rather than string
            ...requestOptions
          };
          portal.setItemAccess(accessOptions).then(
            () => {
              resolve({
                folder: createResponse.folder,
                id: createResponse.id,
                success: true
              });
            },
            e => reject(generalHelpers.fail(e))
          );
        } else {
          resolve({
            folder: createResponse.folder,
            id: createResponse.id,
            success: true
          });
        }
      },
      e => reject(generalHelpers.fail(e))
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
export function updateItemURL(
  id: string,
  url: string,
  requestOptions: auth.IUserRequestOptions
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

    portal.updateItem(options).then(
      () => {
        resolve(id);
      },
      e => reject(fail(e))
    );
  });
}
