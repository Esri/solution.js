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

import { ISolutionItem, UserSession } from "../interfaces";
import { getProp } from "../generalHelpers";
import { cloneObject } from "@esri/hub-common";

/**
 * Migrate Hub assets structure to resource paths
 * @param model
 * @param authentication
 * @private
 */
export function _upgradeTwoDotThree(
  model: ISolutionItem,
  authentication: UserSession
) {
  if (getProp(model, "item.properties.schemaVersion") >= 2.3) {
    return model;
  }

  const clone = cloneObject(model);

  // rename template.resources => template.assets
  // this has landed in Hub, so we have actual items like this :(
  // we will have another schema upgrade that will re-create the
  // resources array
  clone.data.templates = clone.data.templates.map(tmpl => {
    if (tmpl.resources) {
      tmpl.assets = tmpl.resources.map(r => {
        return {
          name: r,
          type: "resource"
        };
      });
      delete tmpl.resources;
    } else {
      tmpl.assets = [];
    }
    return tmpl;
  });
  clone.item.properties.schemaVersion = 2.3;
  return clone;
}
