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

import * as adlib from "adlib";
import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate } from "../interfaces";

// -------------------------------------------------------------------------------------------------------------------//

/**
 * The portion of a Webmap URL between the server and the map id.
 * @protected
 */
const WEBMAP_APP_URL_PART:string = "/home/webmap/viewer.html?webmap=";

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function completeItemTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise(resolve => {
    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    // Templatize the app URL
    itemTemplate.item.url =
      mCommon.PLACEHOLDER_SERVER_NAME + WEBMAP_APP_URL_PART + mCommon.templatize(itemTemplate.itemId);

    // Templatize the map layer ids
    if (itemTemplate.data) {
      templatizeWebmapLayerIdsAndUrls(itemTemplate.data.operationalLayers);
      templatizeWebmapLayerIdsAndUrls(itemTemplate.data.tables);
    }

    resolve(itemTemplate);
  });
}

/**
 * Gets the ids of the dependencies of an AGOL webmap item.
 *
 * @param fullItem A webmap item whose dependencies are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    let dependencies:string[] = [];

    if (itemTemplate.data) {
      dependencies = [
        ...getWebmapLayerIds(itemTemplate.data.operationalLayers),
        ...getWebmapLayerIds(itemTemplate.data.tables)
      ];
    }

    resolve(dependencies);
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

export function deployItem (
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    const options:items.IItemAddRequestOptions = {
      item: itemTemplate.item,
      folder: settings.folderId,
      ...requestOptions
    };
    if (itemTemplate.data) {
      options.item.text = itemTemplate.data;
    }

    // Create the item
    items.createItemInFolder(options)
    .then(
      createResponse => {
        if (createResponse.success) {
          // Add the new item to the settings
          settings[mCommon.deTemplatize(itemTemplate.itemId)] = {
            id: createResponse.id
          };
          itemTemplate.itemId = itemTemplate.item.id = createResponse.id;
          itemTemplate = adlib.adlib(itemTemplate, settings);

          // Update the app URL
          mCommon.updateItemURL(itemTemplate.itemId, itemTemplate.item.url, requestOptions)
          .then(
            () => resolve(itemTemplate),
            () => reject({ success: false })
          );
        } else {
          reject({ success: false });
        }
      },
      () => reject({ success: false })
    );
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Extracts the AGOL id or URL for each layer or table object in a list.
 *
 * @param layerList List of map layers or tables
 * @return List containing id of each layer or table that has an itemId
 * @protected
 */
export function getWebmapLayerIds (
  layerList = [] as any[]
): string[] {
  return layerList.reduce(
    (ids:string[], layer:any) => {
      const itemId = layer.itemId as string;
      if (itemId) {
        ids.push(itemId);
      }
      return ids;
    },
    [] as string[]
    );
}

export function templatizeWebmapLayerIdsAndUrls (
  layerList = [] as any[]
): void {
  layerList.forEach(
    (layer:any) => {
      const layerId = layer.url.substr((layer.url as string).lastIndexOf("/"));
      layer.itemId = mCommon.templatize(layer.itemId);
      layer.url = mCommon.templatize(mCommon.deTemplatize(layer.itemId), "url") + layerId;
    }
  );
}
