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

import { listDependencies } from "adlib";

import { ArcGISRequestError } from "@esri/arcgis-rest-request";
import * as sharing from "@esri/arcgis-rest-sharing";
import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

// -------------------------------------------------------------------------------------------------------------------//

/**
 * A parameterized server name to replace the organization URL in a Web Mapping Application's URL to
 * itself; name has to be acceptable to AGOL, otherwise it discards the URL, so substitution must be
 * made before attempting to create the item.
 * @protected
 */
export const PLACEHOLDER_SERVER_NAME:string = "{{organization.portalBaseUrl}}";

/**
 * Convert a string to camelCase
 *
 * @export
 * @param {string} value
 * @returns {string} camelCased string
 */
export function camelize(value: string): string {
  // lower case the whole thing to start...
  value = value.toLowerCase();
  // strip out any/all special chars...
  value = value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, " ");
  // Hoisted from EmberJS (MIT License)
  // https://github.com/emberjs/ember.js/blob/v2.0.1/packages/ember-runtime/lib/system/string.js#L23-L27
  const STRING_CAMELIZE_REGEXP_1 = /(\-|\_|\.|\s)+(.)?/g;
  const STRING_CAMELIZE_REGEXP_2 = /(^|\/)([A-Z])/g;

  return value
    .replace(STRING_CAMELIZE_REGEXP_1, function(match, separator, chr) {
      return chr ? chr.toUpperCase() : "";
    })
    .replace(STRING_CAMELIZE_REGEXP_2, function(match, separator, chr) {
      return match.toLowerCase();
    });
}

export function doCommonTemplatizations (
  itemTemplate: any
): void {
  // Use the initiative's extent
  if (itemTemplate.item.extent !== undefined && itemTemplate.item.extent !== null) {
    itemTemplate.item.extent = "{{initiative.extent:optional}}";
  }

  // Templatize the item's id
  itemTemplate.itemId = templatize(itemTemplate.itemId);
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
 * Creates an error object.
 *
 * @param itemId AGOL item id that caused failure
 * @return Error object with message "Item or group does not exist or is inaccessible: <id>"
 */
export function createUnavailableItemError (
  itemId: string
): ArcGISRequestError {
  return new ArcGISRequestError(
    "Item or group does not exist or is inaccessible: " + itemId
  );
}

/**
 * Get a property out of a deeply nested object
 * Does not handle anything but nested object graph
 *
 * @param obj Object to retrieve value from
 * @param path Path into an object, e.g., "data.values.webmap", where "data" is a top-level property
 *             in obj
 * @return Value at end of path
 */
export function getProp (
  obj: { [index: string]: any },
  path: string
): any {
  return path.split(".").reduce(function(prev, curr) {
    /* istanbul ignore next no need to test undefined scenario */
    return prev ? prev[curr] : undefined;
  }, obj);
}

export function deTemplatize (
  id: string
): string {
  if (id.startsWith("{{")) {
    return id.substring(2, id.indexOf("."));
  } else {
    return id;
  }
}

/**
 * Creates a timestamp string using the current date and time.
 *
 * @return Timestamp
 * @protected
 */
export function getTimestamp (
): string {
  return (new Date()).getTime().toString();
}

export function templatize (
  id: string,
  param = "id"
): string {
  if (id.startsWith("{{")) {
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
      return templatize(id, param);
    }
  );
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

