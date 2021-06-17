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

/**
 * @module deleteEmptyGroups
 */

import { deleteGroupIfEmpty } from "./deleteGroupIfEmpty";
import { UserSession } from "../interfaces";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deletes a set of empty groups if they're empty and belong to the user in the authentication.
 *
 * @param groups Ids of the groups to be deleted
 * @param authentication Credentials for the request
 * @return Promise that will resolve with the list of successfully deleted groups
 */
export function deleteEmptyGroups(
  groups: string[],
  authentication: UserSession
): Promise<string[]> {
  if (groups.length === 0) {
    return Promise.resolve([]);
  }

  // Attempt to delete each group
  return Promise.all(
    groups.map(groupId => deleteGroupIfEmpty(groupId, authentication))
  ).then((responses: boolean[]) => {
    // Return just the group ids that succeeded
    return groups.filter((groupId: string, index: number) => responses[index]);
  });
}
