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
 * Manages the creation and deployment of Story Map item types.
 *
 * @module storymap
 */

import {
  IItemTemplate,
  IItemProgressCallback,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  UserSession,
  generateEmptyCreationResponse
} from "@esri/solution-common";
import { IModel, failSafe } from "@esri/hub-common";
import { getItemData, removeItem } from "@esri/arcgis-rest-portal";
import { convertStoryMapToTemplate } from "./helpers/convert-storymap-to-template";
import { createStoryMapModelFromTemplate } from "./helpers/create-storymap-model-from-template";
import { createStoryMap } from "./helpers/create-storymap";

/**
 * Convert a StoryMap to a template
 *
 * @param solutionItemId
 * @param itemInfo
 * @param authentication
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  destAuthentication: UserSession,
  srcAuthentication: UserSession
): Promise<IItemTemplate> {
  const model = {
    item: itemInfo,
    data: {}
  } as IModel;
  // fetch the data.json
  return getItemData(itemInfo.id, { authentication: srcAuthentication })
    .then(data => {
      // append into the model
      model.data = data;
      // and use that to create a template
      return convertStoryMapToTemplate(model);
    })
    .then(tmpl => {
      return tmpl;
    });
}

/**
 * Create a StoryMap from the passed in template
 *
 * @param template
 * @param templateDictionary
 * @param destinationAuthentication
 * @param itemProgressCallback
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  // let the progress system know we've started...
  const startStatus = itemProgressCallback(
    template.itemId,
    EItemProgressStatus.Started,
    0
  );

  // and if it returned false, just resolve out
  if (!startStatus) {
    return Promise.resolve(generateEmptyCreationResponse(template.type));
  }

  // ensure we have a solution object in the templateDictionary hash
  if (!templateDictionary.solution) {
    templateDictionary.solution = {};
  }
  // .title should always be set on the templateDictionary
  templateDictionary.solution.title = templateDictionary.title;

  // TODO: Determine if we need any transforms in this new env
  const transforms = {};

  // create an object to hold the created site through
  // subsequent promise calls
  let model: IModel;

  // Create the "siteModel" from the template. Does not save the site item yet
  // Note: depending on licensing and user privs, will also create the team groups
  // and initiative item.
  return createStoryMapModelFromTemplate(
    template,
    templateDictionary,
    transforms,
    destinationAuthentication
  )
    .then(interpolated => {
      const options = {
        assets: interpolated.assets || []
      };
      return createStoryMap(
        interpolated,
        templateDictionary.folderId,
        options,
        destinationAuthentication
      );
    })
    .then(createdModel => {
      model = createdModel;
      // Update the template dictionary
      // TODO: This should be done in whatever receives
      // the outcome of this promise chain
      templateDictionary[template.itemId] = {
        itemId: model.item.id
      };
      // call the progress callback, which also mutates templateDictionary
      const finalStatus = itemProgressCallback(
        template.itemId,
        EItemProgressStatus.Finished,
        template.estimatedDeploymentCostFactor || 2,
        model.item.id
      );
      if (!finalStatus) {
        // clean up the site we just created
        const failSafeRemove = failSafe(removeItem, { success: true });
        return failSafeRemove({
          id: model.item.id,
          authentication: destinationAuthentication
        }).then(() => {
          return Promise.resolve(generateEmptyCreationResponse(template.type));
        });
      } else {
        // finally, return ICreateItemFromTemplateResponse
        const response: ICreateItemFromTemplateResponse = {
          item: {
            ...template,
            ...model
          },
          id: model.item.id,
          type: template.type,
          postProcess: false
        };
        response.item.itemId = model.item.id;
        return response;
      }
    })
    .catch(ex => {
      itemProgressCallback(template.itemId, EItemProgressStatus.Failed, 0);
      throw ex;
    });
}

export function isAStoryMap(itemType: string): boolean {
  let result = false;
  if (itemType === "StoryMap") {
    result = true;
  }
  return result;
}
