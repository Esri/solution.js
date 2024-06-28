/** @license
 * Copyright 2024 Esri
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
// @esri/solution-common reuseDeployedItems example

import * as common from "@esri/solution-common";

/**
 * Gets deployable solutions from the user defined group.
 *
 * @param authentication Credentials for the request
 * @param groupId The id of the group to search for deployable solutions from
 */
export function getDeployableSolutions(
  authentication: common.UserSession,
  groupId: string
): Promise<common.ISearchResult<common.IItem>> {
  console.log(groupId);
  return new Promise<any>((resolve, reject) => {
    common.searchGroupAllContents(groupId, "", authentication).then(r => {
      resolve(r);
    }, e => reject(e));
  });
}

/**
 * Find deployed items and solutions that leverage one or more of the items in the user selected solution
 *
 * @param authentication Credentials for the request
 * @param solutionId The id of the solution we would like to find relevant items for potential reuse
 */
export function findReusableSolutionsAndItems(
  authentication: common.UserSession,
  solutionId: string
): Promise<common.IReuseItems>  {
  return common.findReusableSolutionsAndItems(solutionId, authentication);
}