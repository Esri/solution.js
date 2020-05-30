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

import { ISolutionItem, ISolutionItemData } from "../interfaces";
import {
  deepStringReplace,
  getProp,
  cloneObject,
  IItemTemplate
} from "@esri/hub-common";

/**
 * Hub Solutions use the `key` property for follow on replacements
 * but the Solution.js ones use the
 * @param model ISolutionItem
 */
export function _upgradeTwoDotFour(model: ISolutionItem): ISolutionItem {
  if (getProp(model, "item.properties.schemaVersion") >= 2.4) {
    return model;
  } else {
    // iterate the templates looking for `{{string_<key>.item.id}}`
    // and convert that to `{{id.itemId}}`
    const clone = cloneObject(model);

    // create the swaps for all the templates
    const swaps = clone.data.templates.map(tmpl => {
      return {
        src: `{{${tmpl.key}.item.id}}`,
        val: `{{${tmpl.itemId}.itemId}}`
      };
    });
    // apply them all
    swaps.forEach(swap => {
      clone.data = deepStringReplace(
        clone.data,
        swap.src,
        swap.val
      ) as ISolutionItemData;
    });
    // TODO: Unify Hub Solution Editor and Solution.js handling of resources
    // convert assets back to resources that include the templateId
    clone.data.templates = clone.data.templates.map(tmpl => {
      if (tmpl.assets) {
        tmpl.resources = tmpl.assets.map((a: any) => {
          return `${tmpl.itemId}-${a.name}`;
        });
      }
      // ensure this property is present
      if (!tmpl.estimatedDeploymentCostFactor) {
        tmpl.estimatedDeploymentCostFactor = 1;
      }
      return tmpl;
    });
    // update the schema version
    clone.item.properties.schemaVersion = 2.4;
    return clone;
  }
}
