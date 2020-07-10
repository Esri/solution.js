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

import { ISolutionItem, ISolutionItemData, UserSession } from "../interfaces";
import { getProp } from "../generalHelpers";
import { deepStringReplace, cloneObject } from "@esri/hub-common";

/**
 * Swap tokens from Hub Solutions
 * @param model
 * @param authentication
 * @private
 */
export function _upgradeTwoDotTwo(
  model: ISolutionItem,
  authentication: UserSession
): ISolutionItem {
  if (getProp(model, "item.properties.schemaVersion") >= 2.2) {
    return model;
  }

  const clone = cloneObject(model);
  // NOTE: Not all of these have closing `}}` and that is intentional
  const swaps = [
    { src: "{{solution.name}}", val: "{{solution.title}}" },
    { src: "{{initiative.name}}", val: "{{solution.title}}" },
    { src: "{{initiative.title}}", val: "{{solution.title}}" },
    { src: "{{initiative.extent}}", val: "{{organization.defaultExtentBBox}}" },
    {
      src: "{{initiative.collaborationGroupId",
      val: "{{teams.collaborationGroupId"
    },
    { src: "{{initiative.openDataGroupId", val: "{{teams.contentGroupId" },
    { src: "{{initiative.contentGroupId", val: "{{teams.contentGroupId" },
    { src: "{{initiative.followersGroupId", val: "{{teams.followersGroupId" },
    { src: "{{collaborationGroupId", val: "{{teams.collaborationGroupId" },
    { src: "{{contentGroupId", val: "{{teams.contentGroupId" },
    { src: "{{followersGroupId", val: "{{teams.followersGroupId" },
    { src: "{{initiative.id", val: "{{initiative.item.id" },
    { src: "{{organization.portalBaseUrl", val: "{{portalBaseUrl" }
  ];
  swaps.forEach(swap => {
    clone.data = deepStringReplace(
      clone.data,
      swap.src,
      swap.val
    ) as ISolutionItemData;
  });
  clone.item.properties.schemaVersion = 2.2;
  return clone;
}
