import {
  IItemTemplate,
  UserSession,
  getProp,
  shareItemToGroups
} from "@esri/solution-common";
import { maybePush } from "@esri/hub-common";

/**
 * Given the created templates
 * @param templates
 * @param templateDictionary
 * @param authentication
 */
export function simpleTypeShareItemToGroups(
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<any> {
  // Filter to entries with groups to share to
  const templatesWithGroups = templates.filter(e => {
    return e.groups && e.groups.length > 0;
  });
  // fire off all the promises
  return Promise.all(
    templatesWithGroups.map(tmpl => {
      const groupIds = tmpl.groups.reduce((acc, sourceGroupId) => {
        return maybePush(
          acc,
          getProp(templateDictionary, `${sourceGroupId}.itemId`)
        );
      }, []);
      return shareItemToGroups(groupIds, tmpl.itemId, templateDictionary);
    })
  );
}
