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
import { ITemplate } from "../interfaces";
import {getDependencies as getStoryMapDependencies} from './storymap';
import {getDependencies as getWABDependencies} from './webappbuilder';

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function completeItemTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise(resolve => {
    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    // Remove org base URL and app id, e.g.,
    //   http://statelocaltryit.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34f26b2210d17835eea21
    // to
    //   <PLACEHOLDER_SERVER_NAME>/apps/CrowdsourcePolling/index.html?appid={{<itemId>.id}}
    // Need to add placeholder server name because otherwise AGOL makes URL null
    const orgUrl = itemTemplate.item.url.replace(itemTemplate.itemId, mCommon.templatize(itemTemplate.itemId));
    const iSep = orgUrl.indexOf("//");
    itemTemplate.item.url = mCommon.PLACEHOLDER_SERVER_NAME +  // add placeholder server name
      orgUrl.substring(orgUrl.indexOf("/", iSep + 2), orgUrl.lastIndexOf("=") + 1) +
      mCommon.templatize(itemTemplate.itemId);

    // Set the folder
    if (getProp(itemTemplate, "data.folderId")) {
      itemTemplate.data.folderId = "{{folderId}}";
    }

    // Set the map or group
    if (getProp(itemTemplate, "data.values.webmap")) {
      itemTemplate.data.values.webmap = mCommon.templatize(itemTemplate.data.values.webmap);
    } else if (getProp(itemTemplate, "data.values.group")) {
      itemTemplate.data.values.group = mCommon.templatize(itemTemplate.data.values.group);
    }

    resolve(itemTemplate);
  });
}


/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getDependencies (
  model: any
): Promise<string[]> {

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
  ):Promise<string[]> {
  const props = ['data.webmap', 'data.itemId', 'data.values.webmap', 'data.values.group'];
  return Promise.resolve(getProps(model, props));
};

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
          error => reject(error.response.error.message)
        );
      },
      error => reject(error.response.error.message)
    );
  });
}

