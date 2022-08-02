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
 * @module deleteSolutionFolder
 */

import { ArcGISIdentityManager } from "../interfaces";
import * as portal from "@esri/arcgis-rest-portal";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deletes a deployed Solution's folder if the folder is empty.
 *
 * @param solutionFolderId Id of the folder of a deployed Solution
 * @param deletedItemIds Ids in the Solution, including the Solution item; used to deal with lagging folder deletion
 * @param authentication Credentials for the request
 * @returns Promise that will resolve if deletion was successful and fail if any part of it failed;
 * if the folder has a non-Solution item, it will not be deleted, but the function will return true
 */
export function deleteSolutionFolder(
  solutionIds: string[],
  folderId: string,
  authentication: ArcGISIdentityManager
): Promise<boolean> {
  // See if the deployment folder is empty and can be deleted; first, we need info about user
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  return authentication
    .getUser({ authentication })
    .then(user => {
      // And then we need to be sure that the folder is empty
      const query = new portal.SearchQueryBuilder()
        .match(authentication.username)
        .in("owner")
        .and()
        .match(user.orgId)
        .in("orgid")
        .and()
        .match(folderId)
        .in("ownerfolder");

      return portal.searchItems({
        q: query,
        authentication
      });
    })
    .then((searchResult: portal.ISearchResult<portal.IItem>) => {
      // If the search results are all in the deletedItemIds list, then we're dealing with AGO lagging:
      // successfully reporting a deletion and yet still returning the item in search results.
      // Filter the Solution items out of the search results.
      const nonSolutionItems = searchResult.results
        .map(foundItem => foundItem.id)
        .filter(foundItemId => !solutionIds.includes(foundItemId)); // only save non-solution items

      // If the list is empty, then there are no non-solution items
      if (nonSolutionItems.length === 0) {
        // OK to delete the folder
        return portal.removeFolder({
          folderId: folderId,
          owner: authentication.username,
          authentication
        });
      } else {
        // A non-deployment item is in the folder, so leave it alone
        return Promise.resolve({ success: true });
      }
    })
    .then(deleteFolderResponse => {
      // Extract the success property
      return deleteFolderResponse.success;
    });
}
