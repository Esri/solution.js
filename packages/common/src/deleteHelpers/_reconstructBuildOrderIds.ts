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
 * @module deleteSolution
 */
import { IBuildOrdering, IItemTemplate } from "../interfaces";
import * as dependencies from "../dependencies";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Reconstructs the build order of a set of templates.
 *
 * @param templates A collection of AGO item templates
 * @return The ids of the source templates in build order, which is not necessarily the same
 * as the build order used to create the template Solution
 */
export function _reconstructBuildOrderIds(
  templates: IItemTemplate[]
): string[] {
  const buildOrdering: IBuildOrdering = dependencies.topologicallySortItems(
    templates
  );
  return buildOrdering.buildOrder;
}
