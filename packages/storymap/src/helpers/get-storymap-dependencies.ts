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

import { IModel, getProp } from "@esri/hub-common";

/**
 * Extract a list of Items this storymap depends on
 * At this point we are just extracting webmaps
 *
 * @param model IModel
 */
export function getStoryMapDependencies(model: IModel): any[] {
  const resources = getProp(model, "data.resources") || {};
  return Object.keys(resources).reduce((acc, key) => {
    if (getProp(resources, `${key}.type`) === "webmap") {
      acc.push(getProp(resources, `${key}.data.itemId`));
    }
    return acc;
  }, []);
}
