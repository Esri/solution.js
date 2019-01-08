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

// (export decoration is for unit testing)
/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export const OPS_DASHBOARD_APP_URL_PATH:string = "/apps/opsdashboard/index.html#/";

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
    itemTemplate.item.url = mCommon.PLACEHOLDER_SERVER_NAME + OPS_DASHBOARD_APP_URL_PATH;

    resolve(itemTemplate);
  });
}

export function getDependencyIds (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    const dependencies:string[] = [];

    const widgets:IDashboardWidget[] = mCommon.getProp(itemTemplate, "data.widgets");
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

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

export function deployItem (
  itemTemplate: ITemplate,
  folderId: string,
  settings: any,
  requestOptions: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    const options:items.IItemAddRequestOptions = {
      item: itemTemplate.item,
      folder: folderId,
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
        itemTemplate.itemId = createResponse.id;
        itemTemplate = adlib.adlib(itemTemplate, settings);

        // Update the app URL
          mCommon.updateItemURL(itemTemplate.item.id, itemTemplate.item.url, requestOptions)
          .then(
            () => resolve(itemTemplate),
            error => reject(error.response.error.message)
          );
      },
      error => reject(error.response.error.message)
    );
  });
}


// -- Internals ------------------------------------------------------------------------------------------------------//

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
