/** @license
 * Copyright 2021 Esri
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
import { IItemTemplate } from "@esri/solution-common";

/**
 * Sorts a list of templates in place to match a provided sort-order list.
 *
 * @param templates List of templates in a Solution
 * @param sortOrderIds List of template ids in the desired sort order
 */
export function sortTemplates(
  templates: IItemTemplate[],
  sortOrderIds: string[]
): void {
  templates.sort(
    (template1: IItemTemplate, template2: IItemTemplate) =>
      sortOrderIds.indexOf(template1.itemId) -
      sortOrderIds.indexOf(template2.itemId)
  );
}
