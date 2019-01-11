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
import { ITemplate } from "../interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//
//
// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function completeItemTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise(resolve => {
    // Common templatizations: item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    resolve(itemTemplate);
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
export function getDependencies (
  itemTemplate: ITemplate,
  requestOptions: IUserRequestOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const pagingRequest:IPagingParamsRequestOptions = {
      paging: {
        start: 0,
        num: 100
      },
      ...requestOptions
    };

    // Fetch group items
    getGroupContentsTranche(itemTemplate.itemId, pagingRequest)
    .then(
      contents => resolve(contents),
      reject
    );
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

export function deployItem (
  itemTemplate: ITemplate,
  settings: any,
  requestOptions: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    const options = {
      group: itemTemplate.item,
      ...requestOptions
    };

    // Make the item title unique
    options.group.title += "_" + mCommon.getTimestamp();

    // Create the item
    groups.createGroup(options)
    .then(
      createResponse => {
        // Add the new item to the swizzle list
        settings[mCommon.deTemplatize(itemTemplate.itemId)] = {
          id: createResponse.group.id
        };
        itemTemplate.itemId = createResponse.group.id;
        itemTemplate = adlib.adlib(itemTemplate, settings);

        // Add the group's items to it
        addGroupMembers(itemTemplate, requestOptions)
        .then(
          () => resolve(itemTemplate),
          reject
        );
      },
      error => reject(error.response.error.message)
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
  requestOptions: IUserRequestOptions
):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Add each of the group's items to it
    if (itemTemplate.dependencies.length > 0) {
      const awaitGroupAdds:Array<Promise<null>> = [];
      itemTemplate.dependencies.forEach(depId => {
        awaitGroupAdds.push(new Promise((resolve2, reject2) => {
          sharing.shareItemWithGroup({
            id: mCommon.deTemplatize(depId),
            groupId: mCommon.deTemplatize(itemTemplate.itemId),
            ...requestOptions
          })
          .then(
            () => {
              resolve2();
            },
            error => {
              reject2(error.response.error.message);
            }
          );
        }));
      });
      // After all items have been added to the group
      Promise.all(awaitGroupAdds)
      .then(
        () => resolve(),
        reject
      );
    } else {
      // No items in this group
      resolve();
    }
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
    groups.getGroupContent(mCommon.deTemplatize(id), pagingRequest)
    .then(
      contents => {
        // Extract the list of content ids from the JSON returned
        const trancheIds:string[] = contents.items.map((item:any) => mCommon.templatize(item.id));

        // Are there more contents to fetch?
        if (contents.nextStart > 0) {
          pagingRequest.paging.start = contents.nextStart;
          getGroupContentsTranche(id, pagingRequest)
          .then(
            (allSubsequentTrancheIds:string[]) => {
              // Append all of the following tranches to this tranche and return it
              resolve(trancheIds.concat(allSubsequentTrancheIds));
            },
            reject
          );
        } else {
          resolve(trancheIds);
        }
      },
      error => {
        reject(error.originalMessage);
      }
    );
  });
}
