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
// @esri/solution-common sanitizeGroupItems example

import * as common from "@esri/solution-common";

/**
 * Fetches the items in a group sanitizes their base portions.
 *
 * @param groupId Group to search
 * @param authentication Credentials for the request
 * @return Promise resolving to a list of screened group items
 */
export function sanitizeGroupItems(
  groupId: string,
  searchString: string,
  additionalSearchOptions: common.IAdditionalSearchOptions,
  authentication: common.UserSession
): Promise<common.IItem[]> {
  return new Promise<common.IItem[]>((resolve, reject) => {
    if (!groupId) {
      reject("The group ID is not defined");
      return;
    }

    // Get the items in the group matching the supplied search criteria
    // and run them through a sanitizer
    common
      .searchGroupContents(
        groupId,
        searchString,
        authentication,
        additionalSearchOptions
      )
      .then(
        (response: common.ISearchResult<common.IItem>) => {
          const screenedGroupItems = common.sanitizeJSONAndReportChanges(
            response.results
          );
          resolve(screenedGroupItems);
        },
        err => {
          console.error(
            "group " + groupId + " error:",
            JSON.stringify(err, null, 2)
          );
          reject(err);
        }
      );
  });
}
