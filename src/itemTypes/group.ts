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
import * as groups from "@esri/arcgis-rest-groups";
import * as sharing from "@esri/arcgis-rest-sharing";
import { IPagingParamsRequestOptions } from "@esri/arcgis-rest-groups";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate, IProgressUpdate } from "../interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//
//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function convertItemToTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    // Update the estimated cost factor to deploy this item
    itemTemplate.estimatedDeploymentCostFactor = 3;

    // Common templatizations: item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    // Get dependencies (contents)
    getGroupContents(itemTemplate, requestOptions)
    .then(
      dependencies => {
        itemTemplate.dependencies = dependencies;
        resolve(itemTemplate);
      },
      () => reject({ success: false })
    )
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
    const options = {
      group: itemTemplate.item,
      ...requestOptions
    };

    // Make the item title unique
    options.group.title += "_" + mCommon.getUTCTimestamp();

    // Create the item
    progressCallback && progressCallback({
      processId: itemTemplate.key,
      status: "creating",
    });
    groups.createGroup(options)
    .then(
      createResponse => {
        if (createResponse.success) {
          // Add the new item to the settings
          settings[mCommon.deTemplatize(itemTemplate.itemId) as string] = {
            id: createResponse.group.id
          };
          itemTemplate.itemId = createResponse.group.id;
          itemTemplate = adlib.adlib(itemTemplate, settings);

          // Add the group's items to it
          addGroupMembers(itemTemplate, requestOptions, progressCallback)
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
 * Adds the members of a group to it.
 *
 * @param itemTemplate Group
 * @param swizzles Hash mapping Solution source id to id of its clone
 * @param requestOptions Options for the request
 * @return A promise that will resolve when fullItem has been updated
 * @protected
 */
export function addGroupMembers (
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions,
  progressCallback?: (update:IProgressUpdate) => void
):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Add each of the group's items to it
    if (itemTemplate.dependencies.length > 0) {
      const awaitGroupAdds:Array<Promise<null>> = [];
      itemTemplate.dependencies.forEach(depId => {
        awaitGroupAdds.push(new Promise((resolve2, reject2) => {
          sharing.shareItemWithGroup({
            id: depId,
            groupId: itemTemplate.itemId,
            ...requestOptions
          })
          .then(
            () => {
              progressCallback && progressCallback({
                processId: itemTemplate.key,
                status: "added group member"
              });
              resolve2();
            },
            () => {
              mCommon.finalCallback(itemTemplate.key, false, progressCallback);
              reject2({ success: false });
            }
          );
        }));
      });
      // After all items have been added to the group
      Promise.all(awaitGroupAdds)
      .then(
        () => resolve(),
        () => reject({ success: false })
      );
    } else {
      // No items in this group
      resolve();
    }
  });
}

/**
 * Gets the ids of the dependencies (contents) of an AGOL group.
 *
 * @param fullItem A group whose contents are sought
 * @param requestOptions Options for requesting information from AGOL
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function getGroupContents (
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const pagingRequest:IPagingParamsRequestOptions = {
      paging: {
        start: 1,
        num: 100
      },
      ...requestOptions
    };

    // Fetch group items
    getGroupContentsTranche(itemTemplate.itemId, pagingRequest)
    .then(
      contents => {
        // Update the estimated cost factor to deploy this item
        itemTemplate.estimatedDeploymentCostFactor = 3 + contents.length;

        resolve(contents);
      },
      () => reject({ success: false })
    );
  });
}

/**
 * Gets the ids of a group's contents.
 *
 * @param id Group id
 * @param pagingRequest Options for requesting group contents; note: its paging.start parameter may
 *                      be modified by this routine
 * @return A promise that will resolve with a list of the ids of the group's contents
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
        if (contents.num > 0) {
          // Extract the list of content ids from the JSON returned
          const trancheIds:string[] = contents.items.map((item:any) => item.id);

          // Are there more contents to fetch?
          if (contents.nextStart > 0) {
            pagingRequest.paging.start = contents.nextStart;
            getGroupContentsTranche(id, pagingRequest)
            .then(
              (allSubsequentTrancheIds:string[]) => {
                // Append all of the following tranches to this tranche and return it
                resolve(trancheIds.concat(allSubsequentTrancheIds));
              },
              () => reject({ success: false })
            );
          } else {
            resolve(trancheIds);
          }
        } else {
          resolve([]);
        }
      },
      () => reject({ success: false })
    );
  });
}
