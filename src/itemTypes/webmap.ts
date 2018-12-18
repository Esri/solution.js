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
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "../common";
import { ITemplate } from "../interfaces";

// -- Exports -------------------------------------------------------------------------------------------------------//

/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  fullItem: ITemplate,
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
 * Swizzles the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are to be swizzled
 * @param swizzles Hash mapping original ids to replacement ids
 * @protected
 */
export function swizzleDependencies (
  fullItem: ITemplate,
  swizzles: mCommon.ISwizzleHash
): void {
  if (fullItem.data) {
    // Swizzle its map layers
    if (Array.isArray(fullItem.data.operationalLayers)) {
      fullItem.data.operationalLayers.forEach((layer:ILayer) => {
        const itsSwizzle = swizzles[layer.itemId];
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
        const itsSwizzle = swizzles[layer.itemId];
        if (itsSwizzle) {
          layer.title = itsSwizzle.name;
          layer.itemId = itsSwizzle.id;
          layer.url = itsSwizzle.url + layer.url.substr(layer.url.lastIndexOf("/"));
        }
      });
    }
  }
}

// -- Internals ------------------------------------------------------------------------------------------------------//

/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @return List of ids and/or URLs
 * @protected
 */
export function getWebmapLayerIds (
  layerList: any
): string[] {
  const dependencies:string[] = [];

  if (Array.isArray(layerList)) {
    layerList.forEach((layer:any) => {
      const itemId = layer.itemId as string;
      if (itemId) {
        dependencies.push(itemId);
      }
    });
  }

  return dependencies;
}
