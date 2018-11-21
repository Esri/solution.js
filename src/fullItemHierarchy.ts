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

import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { ArcGISRequestError } from "@esri/arcgis-rest-request";
import { IFullItem, getFullItem, createUnavailableItemError } from "./fullItem";
import { getDependencies } from "./dependencies";

//-- Exports ---------------------------------------------------------------------------------------------------------//

/**
 * A collection of AGOL items for serializing.
 */
export interface IItemHash {
  /**
   * An AGOL item description
   */
  [id:string]: IFullItem | Promise<IFullItem>;
}

/**
 * Fetches the item, data, and resources of one or more AGOL items and their dependencies.
 *
 * ```typescript
 * import { IItemHash, getFullItemHierarchy } from "../src/fullItemHierarchy";
 *
 * getFullItemHierarchy(["6fc5992522d34f26b2210d17835eea21", "9bccd0fac5f3422c948e15c101c26934"])
 * .then(
 *   (response:IItemHash) => {
 *     let keys = Object.keys(response);
 *     console.log(keys.length);  // => "6"
 *     console.log((response[keys[0]] as IFullItem).type);  // => "Web Mapping Application"
 *     console.log((response[keys[0]] as IFullItem).item.title);  // => "ROW Permit Public Comment"
 *     console.log((response[keys[0]] as IFullItem).text.source);  // => "bb3fcf7c3d804271bfd7ac6f48290fcf"
 *   },
 *   error => {
 *     // (should not see this as long as both of the above ids--real ones--stay available)
 *     console.log(error); // => "Item or group does not exist or is inaccessible: " + the problem id number
 *   }
 * );
 * ```
 *
 * @param rootIds AGOL id string or list of AGOL id strings
 * @param requestOptions Options for requesting information from AGOL
 * @param collection A hash of items already converted useful for avoiding duplicate conversions and
 * hierarchy tracing
 * @returns A promise that will resolve with a hash by id of IFullItems;
 * if any id is inaccessible, a single error response will be produced for the set
 * of ids
 */
export function getFullItemHierarchy (
  rootIds: string | string[],
  requestOptions: IUserRequestOptions,
  collection?: IItemHash
): Promise<IItemHash> {
  if (!collection) {
    collection = {};
  }

  return new Promise((resolve, reject) => {
    if (!rootIds || (Array.isArray(rootIds) && rootIds.length === 0)) {
      reject(createUnavailableItemError(null));

    } else if (typeof rootIds === "string") {
      // Handle a single AGOL id
      let rootId = rootIds;
      if (collection[rootId]) {
        resolve(collection);  // Item and its dependents are already in list or are queued

      } else {
        // Add the id as a placeholder to show that it will be fetched
        let getItemPromise = getFullItem(rootId, requestOptions);
        collection[rootId] = getItemPromise;

        // Get the specified item
        getItemPromise
        .then(
          fullItem => {
            // Set the value keyed by the id
            collection[rootId] = fullItem;

            getDependencies(fullItem, requestOptions)
            .then(
              dependencies => {
                fullItem.dependencies = dependencies;
                if (dependencies.length === 0) {
                  resolve(collection);

                } else {
                  // Get its dependents, asking each to get its dependents via
                  // recursive calls to this function
                  let dependentDfds:Promise<IItemHash>[] = [];
                  dependencies.forEach(
                    dependentId => {
                      if (!collection[dependentId]) {
                        dependentDfds.push(getFullItemHierarchy(dependentId, requestOptions, collection));
                      }
                    }
                  );
                  Promise.all(dependentDfds)
                  .then(
                    () => {
                      resolve(collection);
                    },
                    (error:ArcGISRequestError) => reject(error)
                  );
                }
              },
              (error:ArcGISRequestError) => reject(error)
            );
          },
          (error:ArcGISRequestError) => reject(error)
        );
      }

    } else {
      // Handle a list of one or more AGOL ids by stepping through the list
      // and calling this function recursively
      let getHierarchyPromise:Promise<IItemHash>[] = [];
      rootIds.forEach(rootId => {
        getHierarchyPromise.push(getFullItemHierarchy(rootId, requestOptions, collection));
      });
      Promise.all(getHierarchyPromise)
      .then(
        () => {
          resolve(collection);
        },
        (error:ArcGISRequestError) => reject(error)
      );
    }
  });
}