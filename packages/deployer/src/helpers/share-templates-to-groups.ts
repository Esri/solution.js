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
import {
  IItemTemplate,
  UserSession,
  getProp,
  shareItemToGroups,
  isTrackingViewTemplate,
  replaceInTemplate
} from "@esri/solution-common";
import { maybePush } from "@esri/hub-common";

/**
 * Given the created templates
 *
 * @param templates
 * @param templateDictionary
 * @param authentication
 */
export function shareTemplatesToGroups(
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
          getProp(templateDictionary, `${sourceGroupId}.itemId`),
          acc
        );
      }, []);
      // need to pass the tracking owner when sharing to tracking group
      if (isTrackingViewTemplate(tmpl) && !getProp(templateDictionary, "locationTracking.userIsOwner")) {
        const trackingGroupId = getProp(tmpl, "item.properties.trackViewGroup");
        const owner = getProp(templateDictionary, "locationTracking.owner");
        if (trackingGroupId && owner) {
          const trackerGroupIds = groupIds.filter(id => {
            return id === replaceInTemplate(trackingGroupId, templateDictionary);
          });
          if (trackerGroupIds.length !== groupIds.length) {
            const nonTrackerGroupIds = groupIds.filter(id => id !== trackingGroupId)
            return Promise.all([
              shareItemToGroups(trackerGroupIds, tmpl.itemId, authentication, owner),
              shareItemToGroups(nonTrackerGroupIds, tmpl.itemId, authentication)
            ])
          } else {
            return shareItemToGroups(groupIds, tmpl.itemId, authentication, owner);
          }
        }
      } else {
        return shareItemToGroups(groupIds, tmpl.itemId, authentication);
      }
    })
  );
}
