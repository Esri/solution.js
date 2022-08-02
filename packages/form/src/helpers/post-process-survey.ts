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
  ArcGISIdentityManager,
  IItemTemplate,
  updateItem,
  replaceInTemplate,
  getItemBase,
  createInitializedItemTemplate,
  removeFolder,
  IItemUpdate
} from "@esri/solution-common";
import { moveItem } from "@esri/arcgis-rest-portal";

/**
 * Provides utility method to post process Hub surveys
 *
 * @module post-process-survey
 */

/**
 * Performs Survey post processing actions
 *
 * @param {string} itemId The item ID
 * @param {string} type The template/item type
 * @param {any[]} itemInfos An Array of item details
 * @param {IItemTemplate} template The template
 * @param {any} templateDictionary The template dictionary
 * @param {ArcGISIdentityManager} authentication The destination session info
 * @returns {Promise<any>}
 */
export function postProcessHubSurvey(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: IItemTemplate,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: ArcGISIdentityManager
): Promise<any> {
  const featureServiceSourceId = template.properties.info.serviceInfo.itemId;
  const { itemId: featureServiceResultId } = templateDictionary[
    featureServiceSourceId
  ];
  const interpolated = replaceInTemplate(template, templateDictionary);
  return getItemBase(featureServiceResultId, authentication).then(
    featureServiceResultBase => {
      const itemUpdates = [
        // fix/update form properties we couldn't control via the API
        {
          id: itemId,
          title: interpolated.item.title,
          snippet: interpolated.item.snippet,
          extent: interpolated.item.extent,
          culture: interpolated.item.culture
        },
        // fix/update feature service properties we couldn't control via the API
        {
          id: featureServiceResultId,
          extent: interpolated.item.extent,
          typeKeywords: [`source-${featureServiceSourceId}`].concat(
            featureServiceResultBase.typeKeywords
          )
        }
      ];
      const toUpdatePromise = (updatedItem: IItemUpdate) =>
        updateItem(updatedItem, authentication);
      const updatePromises = itemUpdates.map(toUpdatePromise);
      return Promise.all(updatePromises)
        .then(() => {
          const itemIdsToMove = [itemId, featureServiceResultId];
          const toMovePromise = (id: string) =>
            moveItem({
              itemId: id,
              folderId: templateDictionary.folderId as string,
              authentication: authentication
            });
          const movePromises = itemIdsToMove.map(toMovePromise);
          return Promise.all(movePromises);
        })
        .then(() =>
          removeFolder(featureServiceResultBase.ownerFolder, authentication)
        )
        .then(() => {
          // Create a template item for the Feature Service that was created by the API
          const featureServiceTemplate = createInitializedItemTemplate(
            featureServiceResultBase
          );
          templates.push(featureServiceTemplate);
          template.dependencies.push(featureServiceResultBase.id);
          return true;
        });
    }
  );
}
