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
import { ITemplate, IProgressUpdate } from "../interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function convertItemToTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise(resolve => {
    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    resolve(itemTemplate);
  });
}

export function extractDependencies (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    resolve([]);
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
    status: "starting",
    estimatedCostFactor: itemTemplate.estimatedDeploymentCostFactor
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
          settings[mCommon.deTemplatize(itemTemplate.itemId) as string] = {
            id: createResponse.id
          };
          itemTemplate.itemId = itemTemplate.item.id = createResponse.id;
          itemTemplate = adlib.adlib(itemTemplate, settings);

          mCommon.finalCallback(itemTemplate.key, true, progressCallback);
          resolve(itemTemplate);
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

