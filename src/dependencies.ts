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
      "Feature Service": getFeatureServiceDependencies,
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

    if (fullItem.text && fullItem.text.widgets) {
      let widgets:IDashboardWidget[] = fullItem.text.widgets;
      widgets.forEach((widget:any) => {
        if (widget.type === "mapWidget") {
          dependencies.push(widget.itemId);
        }
      })
    }

    resolve(dependencies);
  });
}

function getFeatureServiceDependencies (
  fullItem: IFullItem,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    resolve(dependencies);
  });
}

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

function getWebMapDependencies (
  fullItem: IFullItem,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    if (fullItem.text) {
      dependencies = [
        ...getWebMapLayerIds(fullItem.text.operationalLayers),
        ...getWebMapLayerIds(fullItem.text.tables)
      ];
    }

    resolve(dependencies);
  });
}

function getWebMappingApplicationDependencies (
  fullItem: IFullItem,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    if (fullItem.text && fullItem.text.values) {
      let values = fullItem.text.values;
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

function removeDuplicates (
  arrayWithDups:string[]
): string[] {
  let uniqueNames:{
    [name:string]: boolean;
  } = {};
  arrayWithDups.forEach((elem:string) => uniqueNames[elem] = true);
  return Object.keys(uniqueNames);
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