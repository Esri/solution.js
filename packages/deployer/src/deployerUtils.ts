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

import * as common from "@esri/solution-common";

/**
 * Given an itemId or an object, either fetch the item or
 * resolve using the object, if it is structured as expected
 *
 * @param idOrObject string || object like `{item:{...}, data: {...}}`
 * @param authentication UserSession
 */
export function getSolutionTemplateItem(
  idOrObject: any,
  authentication: common.UserSession
): Promise<any> {
  if (typeof idOrObject === "string") {
    // get the item + data
    return Promise.all([
      common.getItemBase(idOrObject, authentication),
      common.getItemDataAsJson(idOrObject, authentication)
    ]).then(([item, data]) => {
      // format into a model and migrate the schema
      return common.migrateSchema({
        item,
        data
      });
    });
  } else {
    // check if it is a "Model"
    if (_isModel(idOrObject)) {
      // run migrations
      return common.migrateSchema(idOrObject);
    } else {
      return Promise.reject(
        common.fail(
          `getSolutionTemplateItem must be passed an item id or a model object`
        )
      );
    }
  }
}

/**
 * Update the Deploy Options with information from the
 * Solution Template item
 *
 * @param deployOptions
 * @param item
 * @param authentication
 */
export function updateDeployOptions(
  deployOptions: any,
  item: common.IItem,
  authentication: common.UserSession
): any {
  deployOptions.jobId = deployOptions.jobId ?? item.id;
  deployOptions.title = deployOptions.title ?? item.title;
  deployOptions.snippet = deployOptions.snippet ?? item.snippet;
  deployOptions.description = deployOptions.description ?? item.description;
  deployOptions.tags = deployOptions.tags ?? item.tags;
  // add the thumbnail url
  deployOptions.thumbnailurl = item.thumbnail
    ? common.getItemThumbnailUrl(item.id, item.thumbnail, false, authentication)
    : null;

  return deployOptions;
}

/**
 * Check if an object is an Model
 *
 * @param obj any object
 * @private
 */
export function _isModel(obj: any): boolean {
  let result = false as boolean;
  // TODO Hoist into common?
  const isNotStringOrArray = (v: any): boolean =>
    v != null &&
    typeof v !== "string" &&
    !Array.isArray(v) &&
    typeof v === "object";

  if (isNotStringOrArray(obj)) {
    result = ["item", "data"].reduce((acc, prop) => {
      if (acc) {
        acc = isNotStringOrArray(obj[prop]);
      }
      return acc;
    }, true as boolean);
  }
  return result;
}

/**
 * Does the item have the correct type and keywords
 * to be a Solution Template item?
 *
 * @param item IItem
 */
export function isSolutionTemplateItem(item: common.IItem): boolean {
  const kwds = item.typeKeywords;
  // Solution items
  let result = false;
  if (item.type === "Solution") {
    if (
      kwds.indexOf("Solution") > -1 &&
      (kwds.indexOf("Template") > -1 || kwds.indexOf("solutionTemplate") > -1)
    ) {
      result = true;
    }
  }
  // Older Hub Solutions used Web Mapping Application items
  if (item.type === "Web Mapping Application") {
    if (kwds.indexOf("hubSolutionTemplate") > -1) {
      result = true;
    }
  }
  return result;
}
