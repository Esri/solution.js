import { UserSession } from "../";
import { shareItemWithGroup } from "@esri/arcgis-rest-portal";

/**
 * Share an item to one or more groups
 * Returns a promise for all the sharing calls
 * @param groups Array of Group Ids
 * @param itemId Item Id
 * @param authentication UserSession
 */
export function shareItemToGroups(
  groupIds: string[] = [],
  itemId: string,
  authentication: UserSession
): Promise<any> {
  return Promise.all(
    groupIds.map(groupId => {
      return shareItemWithGroup({
        id: itemId,
        groupId,
        authentication
      });
    })
  );
}
