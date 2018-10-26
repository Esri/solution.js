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
import { IFullItem, getFullItem } from "./fullItem";
import { getDependencies } from "./dependencies";

//--------------------------------------------------------------------------------------------------------------------//

export interface IItemHash {
  [id:string]: IFullItem | Promise<IFullItem>;
}

export interface IHierarchyEntry {
  type: string,
  id: string,
  dependencies: IHierarchyEntry[]
}

/**
 * Converts one or more AGOL items and their dependencies into a hash by id of generic JSON item descriptions.
 *
 * ```typescript
 * import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
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
 * @param requestOptions Options for the request
 * @param collection A hash of items already converted useful for avoiding duplicate conversions and
 * hierarchy tracing
 * @returns A promise that will resolve with a hash by id of subclasses of AgolItem;
 * if either id is inaccessible, a single error response will be produced for the set
 * of ids
 */
export function getFullItemHierarchy (
  rootIds: string | string[],
  requestOptions?: IUserRequestOptions,
  collection?: IItemHash
): Promise<IItemHash> {
  if (!collection) {
    collection = {};
  }

  return new Promise((resolve, reject) => {
    if (typeof rootIds === "string") {
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
                    }
                  );
                }
              }
            );
          }
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
        }
      );
    }
  });
}

/**
 * Extract item hierarchy structure from a Solution's items list.
 *
 * @param items Hash of JSON descriptions of items
 * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are repeated;
 * each element of structure contains 1) AGOL type of item, 2) AGOL id of item (groups have a type of 'Group'),
 * 3) list of dependencies, and, for Feature Services only, 4) the feature layer id in the feature service
 */
export function getItemHierarchy (
  items:IItemHash
): IHierarchyEntry[] {
  let hierarchy:IHierarchyEntry[] = [];

  // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
  let topLevelNodes:string[] = Object.keys(items);
  Object.keys(items).forEach(function (id) {
    ((items[id] as IFullItem).dependencies || []).forEach(function (dependencyId) {
      let iNode = topLevelNodes.indexOf(dependencyId.substr(0, 32));
      if (iNode >= 0) {
        // Node is somebody's dependency, so remove the node from the list of top-level nodes
        topLevelNodes.splice(iNode, 1);
      }
    });
  });

  // Hierarchically list the children of specified nodes
  function itemChildren(children:string[], hierarchy:IHierarchyEntry[]): void {

    children.forEach(function (id) {
      let child:IHierarchyEntry = {
        id: id,
        type: (items[id] as IFullItem).type,
        dependencies: []
      };

      // Fill in the dependencies array with any children
      let dependencyIds = (items[id] as IFullItem).dependencies;
      if (Array.isArray(dependencyIds) && dependencyIds.length > 0) {
        itemChildren(dependencyIds, child.dependencies);
      }

      hierarchy.push(child);
    });
  }

  itemChildren(topLevelNodes, hierarchy);
  return hierarchy;
}

//--------------------------------------------------------------------------------------------------------------------//