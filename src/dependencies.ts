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
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { IFullItem } from "./fullItem";

//--------------------------------------------------------------------------------------------------------------------//

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
  return new Promise<string[]>(resolve => {
    interface IFunctionLookup {
      [name:string]: Function
    }

    let getDependenciesByType:IFunctionLookup = {
      "Dashboard": getDashboardDependencies,
      "Group": getGroupDependencies,
      "Web Map": getWebMapDependencies,
      "Web Mapping Application": getWebMappingApplicationDependencies
    };

    if (getDependenciesByType[fullItem.type]) {
      getDependenciesByType[fullItem.type](fullItem, requestOptions)
      .then(
        (dependencies:string[]) => resolve(removeDuplicates(dependencies))
      );
    } else {
      resolve([]);
    }
  });
}

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Gets the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 */
function getDashboardDependencies (
  fullItem: IFullItem,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    interface IDashboardWidget {
      itemId: string;
      type:string;
    }

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
    getGroupContentsTranche (fullItem.item.id, pagingRequest)
    .then(
      contents => {
        resolve(contents);
      },
      error => {
        reject(error);
      }
    );
  });
}

/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @returns A promise that will resolve with list of dependent ids
 */
function getWebMapDependencies (
  fullItem: IFullItem,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    if (fullItem.data) {
      dependencies = [
        ...getWebMapLayerIds(fullItem.data.operationalLayers),
        ...getWebMapLayerIds(fullItem.data.tables)
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

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Removes duplicates from an array of strings.
 * 
 * @param arrayWithDups An array to be copied
 * @returns Copy of array with duplicates removed
 */
function removeDuplicates (
  arrayWithDups:string[]
): string[] {
  let uniqueStrings:{
    [value:string]: boolean;
  } = {};
  arrayWithDups.forEach((arrayElem:string) => uniqueStrings[arrayElem] = true);
  return Object.keys(uniqueStrings);
}

/**
 * Gets the ids of a group's contents.
 *
 * @param id Group id
 * @param pagingRequest Options for requesting group contents
 * @returns A promise that will resolve with a list of the ids of the group's contents
 */
function getGroupContentsTranche (
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
        reject(error);
      }
    );
  });
}

/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 * 
 * @param layerList List of map layers or tables
 * @returns List of ids and/or URLs
 */
function getWebMapLayerIds (
  layerList: any
): string[] {
  let dependencies:string[] = [];

  if (Array.isArray(layerList)) {
    layerList.forEach((layer:any) => {
      let itemId = layer.itemId as string;
      if (itemId) {
        dependencies.push(itemId);
      } else {
        let urlStr = layer.url as string;
        dependencies.push(urlStr);
      }
    });
  }

  return dependencies;
}