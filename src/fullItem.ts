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
import * as groups from "@esri/arcgis-rest-groups";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ArcGISRequestError } from "@esri/arcgis-rest-request";

//-- Exports ---------------------------------------------------------------------------------------------------------//

/**
 * An AGOL item for serializing.
 */
export interface IFullItem {
  /**
   * AGOL item type name
   */
  type: string;
  /**
   * Item base section JSON
   */
  item: any;
  /**
   * Item data section JSON
   */
  data?: any;
  /**
   * Item resources section JSON
   */
  resources?: any[];
  /**
   * List of ids of AGOL items needed by this item
   */
  dependencies?: string[];
}

/**
 * Fetches the item, data, and resources of an AGOL item.
 *
 * @param id AGOL item id
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with an IFullItem; its dependencies section is not filled in
 */
export function getFullItem (
  id: string,
  requestOptions?: IUserRequestOptions
): Promise<IFullItem> {
  return new Promise((resolve, reject) => {
    let fullItem:IFullItem;

    // Request item base section
    items.getItem(id, requestOptions)
    .then(
      itemResponse => {
        fullItem = {
          type: itemResponse.type,
          item: itemResponse,
          dependencies: []
        };

        // Request item data section
        let dataPromise = items.getItemData(id, requestOptions);

        // Request item resources
        let resourceRequestOptions = {
          id: id,
          ...requestOptions
        };
        let resourcePromise = items.getItemResources(resourceRequestOptions);

        // Items without a data section return an error from the REST library, so we'll need to prevent it
        // from killing off both promises
        Promise.all([
          dataPromise.catch(() => { return null }),
          resourcePromise.catch(() => { return null })
        ])
        .then(
          responses => {
            fullItem.data = responses[0];
            fullItem.resources = responses[1] && responses[1].total > 0 ? responses[1].resources : null;
            resolve(fullItem);
          }
        );
      },
      () => {
        // If item query fails, try URL for group base section
        groups.getGroup(id, requestOptions)
        .then(
          itemResponse => {
            fullItem = {
              type: "Group",
              item: itemResponse,
              dependencies: []
            };
            resolve(fullItem);
          },
          () => {
            reject(createUnavailableItemError(id));
          }
        );
      }
    );
  });
}

/**
 * Creates an error object.
 *
 * @param id AGOL item id that caused failure
 * @returns Error object with message "Item or group does not exist or is inaccessible: <id>"
 */
export function createUnavailableItemError (
  id: string
): ArcGISRequestError {
  return new ArcGISRequestError(
    "Item or group does not exist or is inaccessible: " + id
  );
}