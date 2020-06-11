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

import {
  IModelTemplate,
  cloneObject,
  deepStringReplace
} from "@esri/hub-common";

export function replaceItemIds(template: IModelTemplate): IModelTemplate {
  const clone = cloneObject(template);
  const deps = template.dependencies || [];
  // iterate the dependencies
  deps.forEach(depId => {
    const re = new RegExp(depId, "g");
    const replacement = `{{${depId}.itemId}}`;
    // we have to do this property-by-property or we would replace the `itemId` prop itself
    clone.item = deepStringReplace(clone.item, re, replacement);
    clone.data = deepStringReplace(clone.data, re, replacement);
    if (template.properties) {
      clone.properties = deepStringReplace(clone.properties, re, replacement);
    }
  });
  return clone;
}
