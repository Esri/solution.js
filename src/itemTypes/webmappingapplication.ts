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
import {getProp, getProps} from '../utils/object-helpers';
import {hasTypeKeyword, hasAnyKeyword} from '../utils/item-helpers';
import * as items from "@esri/arcgis-rest-items";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate, IProgressUpdate } from "../interfaces";
import {extractDependencies as getStoryMapDependencies} from './storymap';
import {extractDependencies as getWABDependencies} from './webappbuilder';

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function convertItemToTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise(resolve => {
    // Update the estimated cost factor to deploy this item
    itemTemplate.estimatedDeploymentCostFactor = 4;

    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    // Remove org base URL and app id, e.g.,
    //   http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21
    // to
    //   <PLACEHOLDER_SERVER_NAME>/apps/CrowdsourcePolling/index.html?appid={{<itemId>.id}}
    // Need to add placeholder server name because otherwise AGOL makes URL null
    const templatizedUrl = itemTemplate.item.url;
    const iSep = templatizedUrl.indexOf("//");
    itemTemplate.item.url = mCommon.PLACEHOLDER_SERVER_NAME +  // add placeholder server name
      templatizedUrl.substring(templatizedUrl.indexOf("/", iSep + 2), templatizedUrl.lastIndexOf("=") + 1) +
      mCommon.templatize(itemTemplate.itemId);

    // Set the folder
    if (getProp(itemTemplate, "data.folderId")) {
      itemTemplate.data.folderId = "{{folderId}}";
    }

    // Extract dependencies
    itemTemplate.dependencies = extractDependencies(itemTemplate);

    // Set the map or group after we've extracted them as dependencies
    if (getProp(itemTemplate, "data.values.webmap")) {
      itemTemplate.data.values.webmap = mCommon.templatize(itemTemplate.data.values.webmap);
    } else if (getProp(itemTemplate, "data.values.group")) {
      itemTemplate.data.values.group = mCommon.templatize(itemTemplate.data.values.group);
    }

    resolve(itemTemplate);
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

export function createItemFromTemplate (
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update:IProgressUpdate) => void
): Promise<ITemplate> {
  progressCallback && progressCallback({
    processId: itemTemplate.key,
    type: itemTemplate.type,
    status: "starting"
  });

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
    progressCallback && progressCallback({
      processId: itemTemplate.key,
      status: "creating",
    });
    items.createItemInFolder(options)
    .then(
      createResponse => {
        if (createResponse.success) {
          // Add the new item to the settings
          settings[itemTemplate.itemId] = {
            id: createResponse.id
          };
          itemTemplate.itemId = itemTemplate.item.id = createResponse.id;
          itemTemplate = adlib.adlib(itemTemplate, settings);

          // Update the app URL
          progressCallback && progressCallback({
            processId: itemTemplate.key,
            status: "updating URL"
          });
          mCommon.updateItemURL(itemTemplate.itemId, itemTemplate.item.url, requestOptions)
          .then(
            () => {
              mCommon.finalCallback(itemTemplate.key, true, progressCallback);
              resolve(itemTemplate);
            },
            () => {
              mCommon.finalCallback(itemTemplate.key, false, progressCallback);
              reject({ success: false });
            }
                );
        } else {
          mCommon.finalCallback(itemTemplate.key, false, progressCallback);
          reject({ success: false });
        }
      },
      () => {
        mCommon.finalCallback(itemTemplate.key, false, progressCallback);
        reject({ success: false });
      }
    );
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function extractDependencies (
  model: any
): string[] {
  let processor = getGenericWebAppDependencies;

  if (hasTypeKeyword(model, 'Story Map')) {
    processor = getStoryMapDependencies;
  }

  if (hasAnyKeyword(model, ['WAB2D', 'WAB3D', 'Web AppBuilder'])) {
    processor = getWABDependencies;
  }

  return processor(model);

};

/**
 * Generic Web App Dependencies
 */
export function getGenericWebAppDependencies (
  model:any
  ): string[] {
  const props = ['data.webmap', 'data.itemId', 'data.values.webmap', 'data.values.group'];
  return getProps(model, props);
};
