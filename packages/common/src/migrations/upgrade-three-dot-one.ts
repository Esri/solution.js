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
import { getProp, cloneObject } from "../generalHelpers";
import { transformResourcePathsToSolutionResources } from "../resources/transform-resource-paths-to-solution-resources";

/**
 * Apply the initial schema
 * If the item was created by Solution.js, this will stamp it
 * with the initial Solution.js schama version number (3)
 * If it is a legacy hub solution, it will apply the transforms
 * @param model ISolutionItem
 * @param authentication UserSession
 */
export function _upgradeThreeDotOne(
  model: ISolutionItem,
  authentication: UserSession
): ISolutionItem {
  if (getProp(model, "item.properties.schemaVersion") >= 3.1) {
    return model;
  } else {
    const clone = cloneObject(model);
    // transform resource paths to ISolutionResource objects
    clone.data.templates = clone.data.templates.map((tmpl: any) => {
      const resources = tmpl.resources || [];
      tmpl.resources = transformResourcePathsToSolutionResources(resources);
      return tmpl;
    });

    // update the schema version
    clone.item.properties.schemaVersion = 3.1;
    return clone;
  }
}
