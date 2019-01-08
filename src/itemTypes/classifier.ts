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
import * as items from "@esri/arcgis-rest-items";
import { ArcGISRequestError } from "@esri/arcgis-rest-request";
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import {ITemplate, IItemTypeModule} from "../interfaces";
import * as DashboardModule from "./dashboard";
import * as GroupModule from "./group";
import * as FeatureServiceModule from "./featureservice";
import * as WebMapModule from "./webmap";
import * as WebMappingApplicationModule from "./webmappingapplication";
import * as GenericModule from "./generic";

// -------------------------------------------------------------------------------------------------------------------//

interface IItemTypeModuleMap {
  [itemType: string]: IItemTypeModule;
}

const moduleMap:IItemTypeModuleMap = {
  "dashboard": DashboardModule,
  "feature service": FeatureServiceModule,
  "group": GroupModule,
  "web map": WebMapModule,
  "web mapping application": WebMappingApplicationModule
};

// -- Externals ------------------------------------------------------------------------------------------------------//

/**
 * Fetches the item and data sections, the resource and dependencies lists, and the item-type-specific
 * functions for an item using its AGOL item id.
 *
 * @param itemId
 * @param requestOptions
 */
export function initItemTemplateFromId (
  itemId: string,
  requestOptions: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    let itemTemplate:ITemplate;
    itemId = mCommon.deTemplatize(itemId);

    // Request item base section
    items.getItem(itemId, requestOptions)
    .then(
      itemResponse => {
        itemTemplate = {
          itemId: itemResponse.id,
          type: itemResponse.type,
          key: mCommon.camelize(itemResponse.title),
          item: removeUndesirableItemProperties(itemResponse),
          dependencies: [],
          fcns: moduleMap[itemResponse.type.toLowerCase()] || GenericModule
        };

        // Request item data section
        const dataPromise = items.getItemData(itemId, requestOptions);

        // Request item resources
        const resourceRequestOptions = {
          id: itemId,
          ...requestOptions
        };
        const resourcePromise = items.getItemResources(resourceRequestOptions);

        // Items without a data section return an error from the REST library, so we'll need to prevent it
        // from killing off both promises
        Promise.all([
          dataPromise.catch(() => null),
          resourcePromise.catch(() => null)
        ])
        .then(
          responses => {
            const [dataResponse, resourceResponse] = responses;
            itemTemplate.data = dataResponse;
            itemTemplate.resources = resourceResponse && resourceResponse.total > 0 ? resourceResponse.resources : null;

            // Complete item
            const completionPromise = itemTemplate.fcns.completeItemTemplate(itemTemplate, requestOptions);

            // Request item dependencies
            const dependenciesPromise = itemTemplate.fcns.getDependencyIds(itemTemplate, requestOptions);

            Promise.all([
              completionPromise,
              dependenciesPromise
            ])
            .then(
              responses2 => {
                const [completionResponse, dependenciesResponse] = responses2;
                itemTemplate = completionResponse;
                itemTemplate.dependencies = mCommon.templatizeList(removeDuplicates(dependenciesResponse));
                resolve(itemTemplate);
              },
              reject
            );
          },
          reject
        );
      },
      () => {
        // If item query fails, try URL for group base section
        groups.getGroup(itemId, requestOptions)
        .then(
          itemResponse => {
            itemTemplate = {
              itemId: itemResponse.id,
              type: "Group",
              key: mCommon.camelize(itemResponse.title),
              item: itemResponse,
              dependencies: [],
              fcns: moduleMap["group"]
            };

            // Get ids of item dependencies (i.e., the group's contents)
            itemTemplate.fcns.getDependencyIds(itemTemplate, requestOptions)
            .then(
              dependencies => {
                itemTemplate.dependencies = removeDuplicates(dependencies);
                resolve(itemTemplate);
              },
              () => {
                reject(mCommon.createUnavailableItemError(itemId));
              }
            );
          },
          () => {
            reject(mCommon.createUnavailableItemError(itemId));
          }
        );
      }
    );
  });
}

export function initItemTemplateFromJSON (
  itemTemplate:ITemplate
): ITemplate {
  itemTemplate.fcns = moduleMap[itemTemplate.type.toLowerCase()] || GenericModule;
  return itemTemplate;
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
export function removeDuplicates (
  arrayWithDups:string[]
): string[] {
  const uniqueStrings:{
    [value:string]: boolean;
  } = {};
  arrayWithDups.forEach((arrayElem:string) => uniqueStrings[arrayElem] = true);
  return Object.keys(uniqueStrings);
}

/**
 * Creates a copy of item base properties with properties irrelevant to cloning removed.
 *
 * @param item The base section of an item
 * @return Cloned copy of item without certain properties such as `created`, `modified`,
 *        `owner`,...; note that is is a shallow copy
 * @protected
 */
export function removeUndesirableItemProperties (
  item: any
): any {
  if (item) {
    const itemSectionClone = {...item};
    delete itemSectionClone.avgRating;
    delete itemSectionClone.created;
    delete itemSectionClone.guid;
    delete itemSectionClone.lastModified;
    delete itemSectionClone.modified;
    delete itemSectionClone.numComments;
    delete itemSectionClone.numRatings;
    delete itemSectionClone.numViews;
    delete itemSectionClone.orgId;
    delete itemSectionClone.owner;
    delete itemSectionClone.scoreCompleteness;
    delete itemSectionClone.size;
    delete itemSectionClone.uploaded;
    return itemSectionClone;
  }
  return null;
}
