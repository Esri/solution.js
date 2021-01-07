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
  IItemProgressCallback,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  replaceInTemplate,
  updateItemExtended,
  ISurvey123CreateParams,
  ISurvey123CreateResult,
  getItemBase
} from "@esri/solution-common";
import { createSurvey } from "./create-survey";
import { buildCreateParams } from "./build-create-params";

/**
 * Manages the creation of Surveys from Hub Templates
 * via the Survey123 API
 *
 * @module create-item-from-hub-template
 */

/**
 * Orchestrates creation of Surveys from Hub templates
 *
 * @param {IItemTemplate} template The template
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} destinationAuthentication The destination session info
 * @param {Function} itemProgressCallback A progress callback
 * @returns {Promise<ICreateItemFromTemplateResponse>}
 */
export function createItemFromHubTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  const interpolatedTemplate = replaceInTemplate(template, templateDictionary);
  const { survey123Url } = templateDictionary;

  return buildCreateParams(
    interpolatedTemplate,
    templateDictionary,
    destinationAuthentication
  )
    .then((params: ISurvey123CreateParams) => {
      return createSurvey(params, survey123Url);
    })
    .then((createSurveyResponse: ISurvey123CreateResult) => {
      const { formId, featureServiceId } = createSurveyResponse;

      // Update the item with its thumbnail
      let thumbDef: Promise<any> = Promise.resolve();
      /* istanbul ignore else */
      if (template.item.thumbnail) {
        thumbDef = updateItemExtended(
          { id: formId },
          null,
          destinationAuthentication,
          template.item.thumbnail
        );
      }

      return thumbDef
        .then(() => getItemBase(formId, destinationAuthentication))
        .then(item => {
          templateDictionary[interpolatedTemplate.itemId] = {
            itemId: formId
          };
          templateDictionary[
            interpolatedTemplate.properties.info.serviceInfo.itemId
          ] = {
            itemId: featureServiceId
          };
          itemProgressCallback(
            interpolatedTemplate.itemId,
            EItemProgressStatus.Finished,
            interpolatedTemplate.estimatedDeploymentCostFactor,
            formId
          );
          return {
            item: {
              ...template,
              item,
              itemId: formId
            },
            id: formId,
            type: "Form",
            postProcess: true
          };
        });
    })
    .catch(e => {
      itemProgressCallback(
        interpolatedTemplate.itemId,
        EItemProgressStatus.Failed,
        0
      );
      throw e;
    });
}
