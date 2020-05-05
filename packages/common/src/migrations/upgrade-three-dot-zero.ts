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

import { ISolutionItem } from "../interfaces";
import { getProp, cloneObject } from "../generalHelpers";

/**
 * Apply the initial schema
 * If the item was created by Solution.js, this will stamp it
 * with the initial Solution.js schama version number (3)
 * If it is a legacy hub solution, it will apply the transforms
 * @param model ISolutionItem
 */
export function _upgradeThreeDotZero(model: ISolutionItem): ISolutionItem {
  if (getProp(model, "item.properties.schemaVersion") >= 3) {
    return model;
  } else {
    // TODO: Implement the logic to upgrade 2.3+ to 3.0
    // At this point we know that the resources array on the templates will need to
    // be modified, but we expect other things as well. Once Hub team starts integrating
    // more deeply we can write this set of transforms
    return cloneObject(model);
  }
}
