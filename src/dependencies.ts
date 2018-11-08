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

import { ILayer } from "@esri/arcgis-rest-common-types";
import * as groups from "@esri/arcgis-rest-groups";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { IFullItem } from "./fullItem";

//-- Exports ---------------------------------------------------------------------------------------------------------//

export interface ISwizzle {
  id: string;
  name?: string;
  url?: string;
}

export interface ISwizzleHash {
  [id:string]: ISwizzle;
}

/**
 * Gets the ids of the dependencies of an AGOL item.
 *
 * @param fullItem An item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 */
export function getDependencies (
  fullItem: IFullItem,
  requestOptions?: IUserRequestOptions
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
 * Swizzles the dependencies of an AGOL item.
 *
 * @param fullItem An item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 */
export function swizzleDependencies (
  fullItem: IFullItem,
  swizzles: ISwizzleHash
): void {
  let swizzleDependenciesByType:IFunctionLookup = {
    "Dashboard": swizzleDashboardDependencies,
    "Group": swizzleGroupDependencies,
    "Web Map": swizzleWebmapDependencies,
    "Web Mapping Application": swizzleWebMappingApplicationDependencies
  };

  if (swizzleDependenciesByType[fullItem.type]) {
    swizzleDependenciesByType[fullItem.type](fullItem, swizzles)
  }
}

//-- Internals -------------------------------------------------------------------------------------------------------//

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
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    if (fullItem.data && fullItem.data.widgets) {
      let widgets:IDashboardWidget[] = fullItem.data.widgets;
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
  requestOptions?: IUserRequestOptions
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
  requestOptions?: IUserRequestOptions
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
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    if (fullItem.data && fullItem.data.values) {
      let values = fullItem.data.values;
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
  swizzles: ISwizzleHash
): void {
  // Swizzle its webmap(s)
  let widgets:IDashboardWidget[] = fullItem.data && fullItem.data.widgets;
  if (widgets) {
    widgets.forEach(widget => {
      if (widget.type === "mapWidget") {
        widget.itemId = swizzles[widget.itemId].id;
      }
    });
  }
}

/**
 * Swizzles the ids of the dependencies of an AGOL group.
 *
 * @param fullItem A group whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
function swizzleGroupDependencies (
  fullItem: IFullItem,
  swizzles: ISwizzleHash
): void {
  if (fullItem.dependencies.length > 0) {
    // Swizzle the id of each of the group's items to it
    let updatedDependencies:string[] = [];
    fullItem.dependencies.forEach(depId => {
      updatedDependencies.push(swizzles[depId].id);
    });
    fullItem.dependencies = updatedDependencies;
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
  swizzles: ISwizzleHash
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
  swizzles: ISwizzleHash
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
            function (allSubsequentTrancheIds:string[]) {
              // Append all of the following tranches to this tranche and return it
              Array.prototype.push.apply(trancheIds, allSubsequentTrancheIds);
              resolve(trancheIds);
            },
            () => {
              resolve(trancheIds);
            }
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
function getWebmapLayerIds (
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