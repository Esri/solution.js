import {
  UserSession,
  IItemTemplate,
  shareItem
} from '@esri/solution-common';
import {
  getProp
} from '@esri/hub-common';

/**
 * Share the newly created item to the newly created groups
 *
 * @export
 * @param {IItemTemplate} template
 * @param {UserSession} authentication
 * @param {*} templateDictionary
 * @returns {Promise<any>}
 */
export function shareItemsToGroups(
  template: IItemTemplate,
  authentication: UserSession,
  templateDictionary: any
): Promise<any> {
  
  const groups = template.groups || [];
  // Unclear why typescript complains if we return Promise.all(groups.reduce(...));
  const sharePromises = groups.reduce((acc, groupId) => {
    // ensure we have an entry in the templateDictionary
    const targetGroupId = getProp(templateDictionary, `${groupId}.itemId`);
    if (targetGroupId) {
      // share it up
      acc.push(shareItem(targetGroupId,template.itemId,authentication));
    }
    return acc;
  }, []);

  return Promise.all(sharePromises);
}

// export function _getGroupUpdates(
//   template: common.IItemTemplate,
//   authentication: common.UserSession,
//   templateDictionary: any
// ): Array<Promise<any>> {
//   const updates = [] as Array<Promise<any>>;
//   // share the template with any groups it references
//   if (template.groups?.length > 0) {
//     template.groups.forEach(sourceGroupId => {
//       updates.push(
//         common.shareItem(
//           templateDictionary[sourceGroupId].itemId,
//           template.itemId,
//           authentication
//         )
//       );
//     });
//   }
//   return updates;
// }