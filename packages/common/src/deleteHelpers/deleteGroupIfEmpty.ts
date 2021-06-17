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
 * @module deleteGroupIfEmpty
 */

import { UserSession } from "../interfaces";
import * as portal from "@esri/arcgis-rest-portal";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Deletes a group if it's empty and belongs to the specified user.
 *
 * @param groupId Id of the group to be deleted
 * @param authentication Credentials for the request
 * @return Promise indicating if group was deleted
 */
export function deleteGroupIfEmpty(
  groupId: string,
  username: string,
  authentication: UserSession
): Promise<boolean> {
  let isGroupProtected: boolean;

  // We need to know the owner and protected status of the group
  return portal
    .getGroup(groupId, { authentication })
    .then((group: portal.IGroup) => {
      // eslint-disable-next-line no-empty
      if (group.owner !== username) {
        return Promise.resolve(null);
      }
      isGroupProtected = group.protected; // do we need to unprotect before deleting?

      // Get the number of items in the group
      const groupContentOptions: portal.IGetGroupContentOptions = {
        paging: {
          num: 1 // only need 1 item to show that group is not empty
        },
        authentication,
        portal: authentication.portal || "https://www.arcgis.com/sharing/rest"
      };
      return portal.getGroupContent(groupId, groupContentOptions);
    })
    .then((groupContent: any) => {
      // should be IGroupContentResult; see https://github.com/Esri/arcgis-rest-js/pull/858/files
      // If groupContent is null, then we don't own the group; if the group is not empty, then we can't delete it
      if (!groupContent || groupContent.total > 0) {
        return Promise.resolve({ success: false });
      }

      // We're going ahead with deletion; first unprotect it if necessary
      if (isGroupProtected) {
        const groupOptions: portal.IUserGroupOptions = {
          id: groupId,
          authentication
        };
        return portal.unprotectGroup(groupOptions);
      } else {
        return Promise.resolve({ success: true });
      }
    })
    .then(response => {
      if (response.success) {
        // All is good so far: we own the group, it's empty, and it's unprotected; proceed with deletion
        const groupOptions: portal.IUserGroupOptions = {
          id: groupId,
          authentication
        };
        return portal.removeGroup(groupOptions);
      } else {
        // We should not delete the group
        return Promise.resolve({ success: false });
      }
    })
    .then((response: { success: boolean }) => {
      // Return a simple response
      return Promise.resolve(response.success);
    });
}
