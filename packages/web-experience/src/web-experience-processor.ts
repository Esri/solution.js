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
 * Manages the creation and deployment of web-experience item types.
 *
 * @module solution-web-experience
 */

import {
  UserSession,
  EItemProgressStatus,
  IItemProgressCallback,
  IItemTemplate,
  ICreateItemFromTemplateResponse
} from "@esri/solution-common";
import { cloneObject, IModel, failSafe } from "@esri/hub-common";
import { getItemData, removeItem } from "@esri/arcgis-rest-portal";
import { createWebExperienceModelFromTemplate } from "./helpers/create-web-experience-model-from-template";
import { createWebExperience } from "./helpers/create-web-experience";
import { convertWebExperienceToTemplate } from "./helpers/convert-web-experience-to-template";

/**
 * Convert a Web Experience item into a Template
 * @param solutionItemId
 * @param itemInfo
 * @param authentication
 * @param isGroup
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // use the itemInfo to setup a model
  const model = {
    item: itemInfo,
    data: {}
  } as IModel;
  // fetch the data.json
  return getItemData(itemInfo.id, { authentication }).then(data => {
    // append into the model
    model.data = data;
    // and use that to create a template
    return convertWebExperienceToTemplate(model, authentication);
  });
}

/**
 * Create a Web Experience from a Template
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
    return Promise.resolve({ id: "", type: template.type, postProcess: false });
  }

  // convert the templateDictionary to a settings hash
  const settings = cloneObject(templateDictionary);

  let exbModel: IModel;
  return createWebExperienceModelFromTemplate(
    template,
    settings,
    {},
    destinationAuthentication
  )
    .then(model => {
      exbModel = model;
      return createWebExperience(
        model,
        templateDictionary.folderId,
        {},
        destinationAuthentication
      );
    })
    .then(createdModel => {
      exbModel.item.id = createdModel.item.id;
      // Update the template dictionary
      // TODO: This should be done in whatever recieves
      // the outcome of this promise chain
      templateDictionary[template.itemId] = {
        itemId: createdModel.item.id
      };
      const finalStatus = itemProgressCallback(
        template.itemId,
        EItemProgressStatus.Finished,
        template.estimatedDeploymentCostFactor || 2,
        createdModel.item.id
      );

      if (!finalStatus) {
        // clean up the site we just created
        const failSafeRemove = failSafe(removeItem, { success: true });
        return failSafeRemove({
          id: exbModel.item.id,
          authentication: destinationAuthentication
        }).then(() => {
          return Promise.resolve({
            id: "",
            type: template.type,
            postProcess: false
          });
        });
      } else {
        // finally, return ICreateItemFromTemplateResponse
        return {
          id: exbModel.item.id,
          type: template.type,
          postProcess: false
        };
      }
    });
}
