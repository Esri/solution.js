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
import {getProp} from '../utils/object-helpers';
import { ITemplate, IProgressUpdate } from "../interfaces";

/**
 * The portion of a Dashboard app URL between the server and the app id.
 * @protected
 */
export const OPS_DASHBOARD_APP_URL_PART:string = "/apps/opsdashboard/index.html#/";

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

    // Templatize the app URL
    itemTemplate.item.url = mCommon.PLACEHOLDER_SERVER_NAME + OPS_DASHBOARD_APP_URL_PART;

    // Extract dependencies
    itemTemplate.dependencies = extractDependencies(itemTemplate);

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
            (e) => {
              mCommon.finalCallback(itemTemplate.key, false, progressCallback);
              reject(mCommon.fail(e));
            }
                );
        } else {
          mCommon.finalCallback(itemTemplate.key, false, progressCallback);
          reject(mCommon.fail());
        }
      },
      (e) => {
        mCommon.finalCallback(itemTemplate.key, false, progressCallback);
        reject(mCommon.fail(e));
      }
    );
  });
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Gets the ids of the dependencies of an AGOL dashboard item.
 *
 * @param fullItem A dashboard item whose dependencies are sought
 * @return List of dependencies
 * @protected
 */
export function extractDependencies (
  itemTemplate: ITemplate
): string[] {
  const dependencies:string[] = [];

  const widgets:IDashboardWidget[] = getProp(itemTemplate, "data.widgets");
  if (widgets) {
    widgets.forEach((widget:any) => {
      if (widget.type === "mapWidget") {
        dependencies.push(widget.itemId);
      }
    })
  }

  return dependencies;
}
