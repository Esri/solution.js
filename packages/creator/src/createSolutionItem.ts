/** @license
 * Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Manages deployment of items via the REST API.
 *
 * @module createSolutionItem
 */

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import * as portal from "@esri/arcgis-rest-portal";
import * as solutionFeatureLayer from "@esri/solution-feature-layer";
import * as solutionSimpleTypes from "@esri/solution-simple-types";
import * as solutionStoryMap from "@esri/solution-storymap";

/**
 * Mapping from item type to module with type-specific template-handling code
 */
const moduleMap: common.IItemTypeModuleMap = {
  "dashboard": solutionSimpleTypes,
  "feature service": solutionFeatureLayer,
  "form": solutionSimpleTypes,
  "group": solutionSimpleTypes,
  "storymap": solutionStoryMap,
  "web map": solutionSimpleTypes,
  "web mapping application": solutionSimpleTypes
};

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Creates a solution template item.
 *
 * @param title The title to use for the item
 * @param version The version to include in the item's metadata
 * @param ids AGO id string or list of AGO id strings
 * @param sourceRequestOptions Options for requesting information from AGO about items to be included in solution item
 * @param destinationRequestOptions Options for creating solution item in AGO
 * @return A promise that will resolve with a solution item
 */
export function createSolutionItem(
  title: string,
  version: string,
  ids: string | string[],
  sourceUserSession: auth.UserSession,
  destinationUserSession: auth.UserSession,
  progressTickCallback: () => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    /*const itemHandler: common.IItemTemplateConversions = moduleMap[itemInfo.type.toLowerCase()];
    if (!itemHandler) {
      console.warn("Unimplemented item type (module level) " + itemInfo.type + " for " + itemInfo.itemId);
      resolve(undefined);
    } else {
      console.log("jsonize item type " + itemInfo.type + " for " + itemInfo.itemId);
      resolve(itemInfo);
    }*/
    resolve(undefined);
  });
}

// ------------------------------------------------------------------------------------------------------------------ //
