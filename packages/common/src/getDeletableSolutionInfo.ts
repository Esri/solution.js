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

import {
  ISolutionItemPrecis,
  ISolutionPrecis,
  ArcGISIdentityManager
} from "./interfaces";
import * as getSolutionSummary from "./getSolutionSummary";
import * as restHelpersGet from "./restHelpersGet";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Returns a list of items in a deployed Solution that would be deleted by the `deleteSolution` function; list
 * does not include the Solution folder, Solution items that are shared with any item other than the deployed
 * Solution, or the Solution item itself.
 *
 * @param solutionItemId Id of a deployed Solution
 * @param authentication Credentials for the request
 * @returns Promise resolving to the list of items in the solution that would be deleted.
 */
export function getDeletableSolutionInfo(
  solutionItemId: string,
  authentication: ArcGISIdentityManager
): Promise<ISolutionPrecis> {
  let solutionSummary: ISolutionPrecis;

  return new Promise<ISolutionPrecis>((resolve, reject) => {
    getSolutionSummary
      .getSolutionSummary(solutionItemId, authentication)
      .then((response: ISolutionPrecis) => {
        // Fetch each item's relationships back to Solution items
        solutionSummary = response;
        const awaitAllItems: Array<Promise<
          string[]
        >> = solutionSummary.items.map((item: ISolutionItemPrecis) =>
          restHelpersGet.getSolutionsRelatedToAnItem(item.id, authentication)
        );

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        return Promise.all(awaitAllItems);
      })
      .then((responses: string[][]) => {
        // Filter out items that are shared with another Solution
        solutionSummary.items = solutionSummary.items.filter(
          (item: ISolutionItemPrecis, index: number) =>
            responses[index].length === 1
        );
        resolve(solutionSummary);
      })
      .catch(reject);
  });
}
