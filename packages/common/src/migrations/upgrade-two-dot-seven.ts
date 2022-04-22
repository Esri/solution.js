/** @license
 * Copyright 2020 Esri
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

import { getProp, createId } from "@esri/hub-common";

/**
 * Updates schema to 2.7.
 *
 * @param model Model to be updated
 * @returns Updated model
 * @private
 */
export function _upgradeTwoDotSeven(model: any): any {
  if (getProp(model, "item.properties.schemaVersion") >= 2.7) {
    return model;
  }
  // These templates predate the use of the dependency array to create
  // the deployment order. Thus the templates are listed in the order
  // they should be created. We need to construct the dependency graph
  // based on the order
  model.data.templates = model.data.templates.map(
    (t: any, idx: number, arr: any[]) => {
      // Not all templates will even have `.itemId` as a real value
      // so if it's empty, we should set it to a random string
      // Downside is that if there are tokens in the rest of the
      // json, there is no way to ever interpolate them
      if (!t.itemId) {
        t.itemId = createId();
      }
      // if the dependencies array does not exist, add an empty one
      if (!t.dependencies) {
        t.dependencies = [];
      }
      // We want the dependency to be the pervious entry in
      // the array's itemId
      if (idx > 0 && t.dependencies.length === 0) {
        t.dependencies = [arr[idx - 1].itemId];
      }
      return t;
    }
  );

  model.item.properties.schemaVersion = 2.7;
  return model;
}
