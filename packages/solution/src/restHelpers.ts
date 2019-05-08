/* @license
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

/**
 * Provides common functions involving the REST API.
 *
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as portal from "@esri/arcgis-rest-portal";
import * as generalHelpers from "./generalHelpers";

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

    // Create item and add its optional data section
    const createOptions: portal.ICreateItemOptions = {
      item: {
        ...itemInfo,
        data: dataInfo
      },
      folderId,
      ...requestOptions
    };

    portal.createItemInFolder(createOptions).then(
      createResults => {

        if (access !== "private") {
          // Set access if it is not AGOL default
          // Set the access manually since the access value in createItem appears to be ignored
          const accessOptions: portal.ISetAccessOptions = {
            id: createResults.id,
            access: (access === "public" ? "public" : "org"),  // need to use constants rather than string
            ...requestOptions
          };
          portal.setItemAccess(accessOptions).then(
            () => {
              resolve({
                folder: createResults.folder,
                id: createResults.id,
                success: true
              });
            },
            e => reject(generalHelpers.fail(e))
          );
        } else {
          resolve({
            folder: createResults.folder,
            id: createResults.id,
            success: true
          });
        }
      },
      e => reject(generalHelpers.fail(e))
    );
  });
}
