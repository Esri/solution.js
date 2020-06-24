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
  UserSession,
  IItemTemplate,
  updateItem,
  replaceInTemplate,
  getItemBase,
  createInitializedItemTemplate
} from "@esri/solution-common";

/**
 * Provides utility method to post process Hub surveys
 *
 * @module post-process-survey
 */

/**
 * Performs Survey post processing actions
 * @param {string} itemId The item ID
 * @param {string} type The template/item type
 * @param {any[]} itemInfos An Array of item details
 * @param {IItemTemplate} template The template
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} authentication The destination session info
 * @returns {Promise<any>}
 */
export function postProcessHubSurvey(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: IItemTemplate,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<any> {
  const featureServiceSourceId = template.properties.info.serviceInfo.itemId;
  const { itemId: featureServiceResultId } = templateDictionary[
    featureServiceSourceId
  ];
  const interpolated = replaceInTemplate(template, templateDictionary);
  const itemIds = [featureServiceSourceId, featureServiceResultId];
  const itemBasePromises = itemIds.map(id => getItemBase(id, authentication));
  return Promise.all(itemBasePromises).then(results => {
    const [featureServiceSourceBase, featureServiceResultBase] = results;
    const updatePromises = [
      // fix/update form properties we couldn't control via the API
      updateItem(
        {
          id: itemId,
          title: interpolated.item.title,
          snippet: interpolated.item.snippet,
          extent: interpolated.item.extent,
          culture: interpolated.item.culture
        },
        authentication
      ),
      // fix/update feature service properties we couldn't control via the API
      updateItem(
        {
          id: featureServiceResultId,
          title: featureServiceSourceBase.title,
          extent: interpolated.item.extent,
          typeKeywords: [
            ...featureServiceSourceBase.typeKeywords,
            `source-${featureServiceSourceId}`
          ]
        },
        authentication
      )
    ];
    return Promise.all(updatePromises).then(() => {
      // Create a template item for the Feature Service that was created by the API
      const featureServiceTemplate = createInitializedItemTemplate(
        featureServiceResultBase
      );
      templates.push(featureServiceTemplate);
      template.dependencies.push(featureServiceResultBase.id);
      return true;
    });
  });
}
