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
import { ILayer } from "@esri/arcgis-rest-common-types";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";

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
 * An AGOL item for serializing, expanded to handle the extra information needed by feature services.
 */
export interface IFullItemFeatureService extends IFullItem {
  /**
   * Service description
   */
  service: any;
  /**
   * Description for each layer
   */
  layers: any[];
  /**
   * Description for each table
   */
  tables: any[];
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

            // Get ids of item dependencies
            getDependencies(fullItem, requestOptions)
            .then(
              dependencies => {
                fullItem.dependencies = dependencies;
                resolve(fullItem);
              }
            );
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
 * @protected
 */
export function swizzleDependencies (
  fullItem: IFullItem,
  swizzles = {} as mCommon.ISwizzleHash
): void {
  let swizzleDependenciesByType:IFunctionLookup = {
    "Dashboard": swizzleDashboardDependencies,
    "Web Map": swizzleWebmapDependencies,
    "Web Mapping Application": swizzleWebMappingApplicationDependencies
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
 * @returns Error object with message "Item or group does not exist or is inaccessible: <id>"
 */
export function createUnavailableItemError (
  id: string
): ArcGISRequestError {
  return new ArcGISRequestError(
    "Item or group does not exist or is inaccessible: " + id
  );
}

//-- Internals -------------------------------------------------------------------------------------------------------//

/**
 * Gets the ids of the dependencies of an AGOL item.
 *
 * @param fullItem An item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  fullItem: IFullItem,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    let getDependenciesByType:IFunctionLookup = {
      "Dashboard": getDashboardDependencies,
      "Group": getGroupDependencies,
      "Web Map": getWebmapDependencies,
      "Web Mapping Application": getWebMappingApplicationDependencies
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
 * The relevant elements of a Dashboard widget.
 * @protected
 */
interface IDashboardWidget {
  /**
   * AGOL item id for some widget types
   */
  itemId: string;
  /**
   * Dashboard widget type
   */
  type: string;
}

/**
 * A mapping between a keyword and a function.
 * @protected
 */
interface IFunctionLookup {
  /**
   * Keyword lookup of a function
   */
  [name:string]: Function
}

/**
 * Gets the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 * @protected
 */
function getDashboardDependencies (
  fullItem: IFullItem,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    let widgets:IDashboardWidget[] = fullItem.data && fullItem.data.widgets;
    if (widgets) {
      widgets.forEach((widget:any) => {
        if (widget.type === "mapWidget") {
          dependencies.push(widget.itemId);
        }
      })
    }

    resolve(dependencies);
  });
}

/**
 * Gets the ids of the dependencies (contents) of an AGOL group.
 *
 * @param fullItem A group whose contents are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 * @protected
 */
function getGroupDependencies (
  fullItem: IFullItem,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let pagingRequest:IPagingParamsRequestOptions = {
      paging: {
        start: 0,
        num: 100
      },
      ...requestOptions
    };

    // Fetch group items
    getGroupContentsTranche(fullItem.item.id, pagingRequest)
    .then(
      contents => resolve(contents),
      reject
    );
  });
}

/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 * @protected
 */
function getWebmapDependencies (
  fullItem: IFullItem,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    if (fullItem.data) {
      dependencies = [
        ...getWebmapLayerIds(fullItem.data.operationalLayers),
        ...getWebmapLayerIds(fullItem.data.tables)
      ];
    }

    resolve(dependencies);
  });
}

/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 * @protected
 */
function getWebMappingApplicationDependencies (
  fullItem: IFullItem,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    let values = fullItem.data && fullItem.data.values;
    if (values) {
      if (values.webmap) {
        dependencies.push(values.webmap);
      }
      if (values.group) {
        dependencies.push(values.group);
      }
    }

    resolve(dependencies);
  });
}

/**
 * Swizzles the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
function swizzleDashboardDependencies (
  fullItem: IFullItem,
  swizzles: mCommon.ISwizzleHash
): void {
  // Swizzle its webmap(s)
  let widgets:IDashboardWidget[] = fullItem.data && fullItem.data.widgets;
  if (Array.isArray(widgets)) {
    widgets.forEach(widget => {
      if (widget.type === "mapWidget") {
        widget.itemId = swizzles[widget.itemId].id;
      }
    });
  }
}

/**
 * Swizzles the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
function swizzleWebmapDependencies (
  fullItem: IFullItem,
  swizzles: mCommon.ISwizzleHash
): void {
  if (fullItem.data) {
    // Swizzle its map layers
    if (Array.isArray(fullItem.data.operationalLayers)) {
      fullItem.data.operationalLayers.forEach((layer:ILayer) => {
        var itsSwizzle = swizzles[layer.itemId];
        if (itsSwizzle) {
          layer.title = itsSwizzle.name;
          layer.itemId = itsSwizzle.id;
          layer.url = itsSwizzle.url + layer.url.substr(layer.url.lastIndexOf("/"));
        }
      });
    }
    // Swizzle its tables
    if (Array.isArray(fullItem.data.tables)) {
      fullItem.data.tables.forEach((layer:ILayer) => {
        var itsSwizzle = swizzles[layer.itemId];
        if (itsSwizzle) {
          layer.title = itsSwizzle.name;
          layer.itemId = itsSwizzle.id;
          layer.url = itsSwizzle.url + layer.url.substr(layer.url.lastIndexOf("/"));
        }
      });
    }
  }
}

/**
 * Swizzles the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
function swizzleWebMappingApplicationDependencies (
  fullItem: IFullItem,
  swizzles: mCommon.ISwizzleHash
): void {
  // Swizzle its webmap or group
  let values = fullItem.data && fullItem.data.values;
  if (values) {
    if (values.webmap) {
      values.webmap = swizzles[values.webmap].id;
    } else if (values.group) {
      values.group = swizzles[values.group].id;
    }
  }
}

/**
 * Swizzles the ids of the dependencies of an IFullItem.
 *
 * @param fullItem Item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
function swizzleCommonDependencies (
  fullItem: IFullItem,
  swizzles: mCommon.ISwizzleHash
): void {
  if (Array.isArray(fullItem.dependencies) && fullItem.dependencies.length > 0) {
    // Swizzle the id of each of the items in the dependencies array
    let updatedDependencies:string[] = [];
    fullItem.dependencies.forEach(depId => {
      updatedDependencies.push(swizzles[depId].id);
    });
    fullItem.dependencies = updatedDependencies;
  }
}

//-- Internals -------------------------------------------------------------------------------------------------------//

/**
 * Gets the ids of a group's contents.
 *
 * @param id Group id
 * @param pagingRequest Options for requesting group contents; note: its paging.start parameter may
 *                      be modified by this routine
 * @returns A promise that will resolve with a list of the ids of the group's contents
 * @protected
 */
export function getGroupContentsTranche (
  id: string,
  pagingRequest: IPagingParamsRequestOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Fetch group items
    groups.getGroupContent(id, pagingRequest)
    .then(
      contents => {
        // Extract the list of content ids from the JSON returned
        let trancheIds:string[] = contents.items.map((item:any) => item.id);

        // Are there more contents to fetch?
        if (contents.nextStart > 0) {
          pagingRequest.paging.start = contents.nextStart;
          getGroupContentsTranche(id, pagingRequest)
          .then(
            (allSubsequentTrancheIds:string[]) => {
              // Append all of the following tranches to this tranche and return it
              Array.prototype.push.apply(trancheIds, allSubsequentTrancheIds);
              resolve(trancheIds);
            },
            reject
          );
        } else {
          resolve(trancheIds);
        }
      },
      error => {
        reject(error.originalMessage);
      }
    );
  });
}

/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @returns List of ids and/or URLs
 * @protected
 */
export function getWebmapLayerIds (
  layerList: any
): string[] {
  let dependencies:string[] = [];

  if (Array.isArray(layerList)) {
    layerList.forEach((layer:any) => {
      let itemId = layer.itemId as string;
      if (itemId) {
        dependencies.push(itemId);
      }
    });
  }

  return dependencies;
}

/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @returns Copy of array with duplicates removed
 * @protected
 */
export function removeDuplicates (
  arrayWithDups:string[]
): string[] {
  let uniqueStrings:{
    [value:string]: boolean;
  } = {};
  arrayWithDups.forEach((arrayElem:string) => uniqueStrings[arrayElem] = true);
  return Object.keys(uniqueStrings);
}
