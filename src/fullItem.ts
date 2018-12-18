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

import * as groups from "@esri/arcgis-rest-groups";
import * as items from "@esri/arcgis-rest-items";
import { ArcGISRequestError } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate } from "./interfaces";
import * as mDashboard from "./itemTypes/dashboard";
import * as mGroup from "./itemTypes/group";
import * as mWebmap from "./itemTypes/webmap";
import * as mWebMappingApplication from "./itemTypes/webmappingapplication";

// -- Exports -------------------------------------------------------------------------------------------------------//

/**
 * Fetches the item, data, and resources of an AGOL item.
 *
 * @param id AGOL item id
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with an ITemplate
 */
export function getFullItem (
  id: string,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    let fullItem:ITemplate;

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
        const dataPromise = items.getItemData(id, requestOptions);

        // Request item resources
        const resourceRequestOptions = {
          id,
          ...requestOptions
        };
        const resourcePromise = items.getItemResources(resourceRequestOptions);

        // Items without a data section return an error from the REST library, so we'll need to prevent it
        // from killing off both promises
        Promise.all([
          dataPromise.catch(() => null),
          resourcePromise.catch(() => null)
        ])
        .then(
          responses => {
            const [dataResponse, resourceResponse] = responses;
            fullItem.data = dataResponse;
            fullItem.resources = resourceResponse && resourceResponse.total > 0 ? resourceResponse.resources : null;

            // Get ids of item dependencies
            getDependencies(fullItem, requestOptions)
            .then(
              dependencies => {
                fullItem.dependencies = dependencies;
                resolve(fullItem);
              },
              reject
            );
          },
          reject
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

            // Get ids of item dependencies
            getDependencies(fullItem, requestOptions)
            .then(
              dependencies => {
                fullItem.dependencies = dependencies;
                resolve(fullItem);
              },
              () => {
                reject(createUnavailableItemError(id));
              }
            );
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
 * Swizzles the dependencies of an AGOL item.
 *
 * @param fullItem An item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 */
export function swizzleDependencies (
  fullItem: ITemplate,
  swizzles = {} as mCommon.ISwizzleHash
): void {
  const swizzleDependenciesByType:ISwizzleFunctionLookup = {
    "Dashboard": mDashboard.swizzleDependencies,
    "Web Map": mWebmap.swizzleDependencies,
    "Web Mapping Application": mWebMappingApplication.swizzleDependencies
  };

  if (swizzleDependenciesByType[fullItem.type]) {
    swizzleDependenciesByType[fullItem.type](fullItem, swizzles)
  }
  swizzleCommonDependencies(fullItem, swizzles)
}

/**
 * Creates an error object.
 *
 * @param id AGOL item id that caused failure
 * @return Error object with message "Item or group does not exist or is inaccessible: <id>"
 */
export function createUnavailableItemError (
  id: string
): ArcGISRequestError {
  return new ArcGISRequestError(
    "Item or group does not exist or is inaccessible: " + id
  );
}

// -- Internals ------------------------------------------------------------------------------------------------------//

/**
 * A mapping between a keyword and a dependency-gathering function.
 * @protected
 */
interface IDependencyFunctionLookup {
  /**
   * Keyword lookup of a function
   */
  [name:string]: (fullItem:ITemplate, requestOptions:IUserRequestOptions) => Promise<string[]>
}

/**
 * A mapping between a keyword and a swizzling function.
 * @protected
 */
interface ISwizzleFunctionLookup {
  /**
   * Keyword lookup of a function
   */
  [name:string]: (fullItem:ITemplate, swizzles: mCommon.ISwizzleHash) => void
}

/**
 * Gets the ids of the dependencies of an AGOL item.
 *
 * @param fullItem An item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  fullItem: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const getDependenciesByType:IDependencyFunctionLookup = {
      "Dashboard": mDashboard.getDependencies,
      "Group": mGroup.getDependencies,
      "Web Map": mWebmap.getDependencies,
      "Web Mapping Application": mWebMappingApplication.getDependencies
    };

    if (getDependenciesByType[fullItem.type]) {
      getDependenciesByType[fullItem.type](fullItem, requestOptions)
      .then(
        (dependencies:string[]) => resolve(removeDuplicates(dependencies)),
        reject
      );
    } else {
      resolve([]);
    }
  });
}

/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
export function removeDuplicates (
  arrayWithDups:string[]
): string[] {
  const uniqueStrings:{
    [value:string]: boolean;
  } = {};
  arrayWithDups.forEach((arrayElem:string) => uniqueStrings[arrayElem] = true);
  return Object.keys(uniqueStrings);
}

/**
 * Swizzles the ids of the dependencies of an ITemplate.
 *
 * @param fullItem Item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
function swizzleCommonDependencies (
  fullItem: ITemplate,
  swizzles: mCommon.ISwizzleHash
): void {
  if (Array.isArray(fullItem.dependencies) && fullItem.dependencies.length > 0) {
    // Swizzle the id of each of the items in the dependencies array
    const updatedDependencies:string[] = [];
    fullItem.dependencies.forEach(depId => {
      updatedDependencies.push(swizzles[depId].id);
    });
    fullItem.dependencies = updatedDependencies;
  }
}
