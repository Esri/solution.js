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
import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import { createId } from '../utils/item-helpers';
import * as mCommon from "./common";
import { ITemplate, IItemTypeModule, IProgressUpdate } from "../interfaces";
import * as DashboardModule from "./dashboard";
import * as GroupModule from "./group";
import * as FeatureServiceModule from "./featureservice";
import * as WebMapModule from "./webmap";
import * as WebMappingApplicationModule from "./webmappingapplication";
import * as GenericModule from "./generic";

// -------------------------------------------------------------------------------------------------------------------//

/**
 * Structure for mapping from item type to module with type-specific template-handling code
 */
interface IItemTypeModuleMap {
  [itemType: string]: IItemTypeModule;
}

/**
 * Mapping from item type to module with type-specific template-handling code
 */
const moduleMap:IItemTypeModuleMap = {
  "dashboard": DashboardModule,
  "feature service": FeatureServiceModule,
  "group": GroupModule,
  "web map": WebMapModule,
  "web mapping application": WebMappingApplicationModule
};

// -- Externals ------------------------------------------------------------------------------------------------------//

/**
 * Returns a list of the currently-supported AGO item types.
 *
 * @return List of item type names; names are all-lowercase forms of standard names
 */
export function getSupportedItemTypes (
): string[] {
  return Object.keys(moduleMap);
}

/**
 * Fetches the item and data sections, the resource and dependencies lists, and the item-type-specific
 * functions for an item using its AGOL item id, and then calls a type-specific function to convert
 * the item into a template.
 *
 * @param itemId AGO id of solution template item to templatize
 * @param requestOptions Options for the request
 * @return A promise which will resolve with an item template
 */
export function convertItemToTemplate (
  itemId: string,
  requestOptions: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    let itemTemplate:ITemplate;

    // Request item base section
    items.getItem(itemId, requestOptions)
    .then(
      itemResponse => {
        if (!moduleMap[itemResponse.type.toLowerCase()]) {
          console.warn("Unimplemented item type " + itemResponse.type + " for " + itemId);
        }

        itemTemplate = {
          itemId: itemResponse.id,
          type: itemResponse.type,
          key: createId(),
          item: removeUndesirableItemProperties(itemResponse),
          dependencies: [],
          fcns: moduleMap[itemResponse.type.toLowerCase()] || GenericModule,
          estimatedDeploymentCostFactor: 3  // minimal set is starting, creating, done|failed
        };
        itemTemplate.item.id = mCommon.templatize(itemTemplate.item.id);
        if (itemTemplate.item.item) {
          itemTemplate.item.item = mCommon.templatize(itemTemplate.item.item);
        }

        // Convert relative thumbnail URL to an absolute one so that it can be preserved
        // TODO disconnected deployment may not have access to the absolute URL
        itemTemplate.item.thumbnail = "https://www.arcgis.com/sharing/content/items/" +
          itemId + "/info/" + itemTemplate.item.thumbnail;

        // Request item data section
        const dataPromise = items.getItemData(itemId, requestOptions);

        // Request item resources
        const resourceRequestOptions = {
          id: itemId,
          ...requestOptions
        };
        const resourcePromise = items.getItemResources(resourceRequestOptions);

        // Items without a data section return an error from the REST library, so we'll need to prevent it
        // from killing off both promises. This means that there's no `reject` clause to handle, hence:
        // tslint:disable-next-line:no-floating-promises
        Promise.all([
          dataPromise.catch(() => null),
          resourcePromise.catch(() => null)
        ])
        .then(
          responses => {
            const [dataResponse, resourceResponse] = responses;
            itemTemplate.data = dataResponse;
            itemTemplate.resources = resourceResponse && resourceResponse.total > 0 ? resourceResponse.resources : null;

            // Create the item's template
            itemTemplate.fcns.convertItemToTemplate(itemTemplate, requestOptions)
            .then(
              template => {
                itemTemplate.dependencies = // some dependencies come out as nested, so flatten
                  removeDuplicates(flatten(template.dependencies));
                resolve(itemTemplate);
              },
              () => reject({ success: false })
            );
          }
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
              key: createId(),
              item: removeUndesirableItemProperties(itemResponse),
              dependencies: [],
              fcns: moduleMap["group"],
              estimatedDeploymentCostFactor: 3  // minimal set is starting, creating, done|failed
            };

            // Convert relative thumbnail URL to an absolute one so that it can be preserved
            // TODO disconnected deployment may not have access to the absolute URL
            itemTemplate.item.thumbnail = "https://www.arcgis.com/sharing/content/items/" +
              itemId + "/info/" + itemTemplate.item.thumbnail;

            // Create the item's template
            itemTemplate.fcns.convertItemToTemplate(itemTemplate, requestOptions)
            .then(
              template => {
                itemTemplate.dependencies = removeDuplicates(template.dependencies);
                resolve(itemTemplate);
              },
              () => reject({ success: false })
            );
          },
          () => reject({ success: false })
        );
      }
    );
  });
}

/**
 * Loads the item-type-specific functions for an item.
 *
 * @param itemTemplate Item template to update
 * @return Updated item template
 */
export function initItemTemplateFromJSON (
  itemTemplate:ITemplate
): ITemplate {
  itemTemplate.fcns = moduleMap[itemTemplate.type.toLowerCase()] || GenericModule;
  return itemTemplate;
}

// -- Internals ------------------------------------------------------------------------------------------------------//
// (export decoration is for unit testing)

/**
 * Flattens an array of strings and/or string arrays.
 *
 * @param nestedArray An array to be flattened
 * @return Copy of array, but flattened
 * @protected
 */
export function flatten (
  nestedArray = [] as string[]
): string[] {
  return nestedArray.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Removes duplicates from an array of strings.
 *
 * @param arrayWithDups An array to be copied
 * @return Copy of array with duplicates removed
 * @protected
 */
export function removeDuplicates (
  arrayWithDups = [] as string[]
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
