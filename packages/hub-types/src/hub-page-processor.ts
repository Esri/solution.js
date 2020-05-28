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
 * @module hub-page-processor
 */

import {
  IItemTemplate,
  IItemProgressCallback,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  UserSession
} from "@esri/solution-common";
import { createHubRequestOptions } from "./helpers/create-hub-request-options";
import {
  IModel,
  cloneObject,
  maybePush,
  getProp,
  IModelTemplate,
  interpolate,
  ITemplateAsset,
  IItemResource
} from "@esri/hub-common";
import { createPageModelFromTemplate, createPage } from "@esri/hub-sites";
import { moveModelToFolder } from "./helpers/move-model-to-folder";
/* istanbul ignore next */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // TODO: add implementation
  console.info(`Hub Page is not supported yet`);
  return Promise.resolve({
    item: {},
    data: {},
    itemId: itemInfo.id,
    resources: [],
    type: "Hub Site Application",
    key: "site-bz3",
    dependencies: [],
    properties: {},
    groups: [],
    estimatedDeploymentCostFactor: 1
  } as IItemTemplate);
}
/**
 * Handle deployment of Page item templates
 *
 * @export
 * @param {IItemTemplate} template
 * @param {*} templateDictionary
 * @param {UserSession} destinationAuthentication
 * @param {IItemProgressCallback} itemProgressCallback
 * @returns {Promise<ICreateItemFromTemplateResponse>}
 */
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  const hubRo = createHubRequestOptions(
    destinationAuthentication,
    templateDictionary
  );

  // convert the templateDictionary to a settings hash
  const settings = cloneObject(templateDictionary);

  // solutionItemExtent is in geographic, but it's a string, and we want/need a bbox
  // and Hub templates expect it in organization.defaultExtentBBox
  if (settings.solutionItemExtent) {
    const parts = settings.solutionItemExtent.split(",");
    settings.organization.defaultExtentBBox = [
      [parts[0], parts[1]],
      [parts[2], parts[3]]
    ];
  }

  // TODO: Determine if we need any transforms in this new env
  const transforms = {};

  // create an object to hold the created site through
  // subsequent promise calls
  let pageModel: IModel;
  return createPageModelFromTemplate(template, settings, transforms, hubRo)
    .then((interpolated: unknown) => {
      // --------------------------------------------
      // TODO: Update hub.js to take an IModel in createPage
      // then remove this silliness
      const modelTmpl = interpolated as IModelTemplate;
      const options = {
        assets: modelTmpl.assets || []
      } as unknown;
      // --------------------------------------------
      return createPage(modelTmpl, options, hubRo);
    })
    .then(page => {
      pageModel = page;
      // Move the site and initiative to the solution folder
      // this is essentially fire and forget. We fail-safe the actual moveItem
      // call since it's not critical to the outcome
      return moveModelToFolder(
        page,
        templateDictionary.folderId,
        destinationAuthentication
      );
    })
    .then(_ => {
      // Update the template dictionary
      // TODO: This should be done in whatever recieves
      // the outcome of this promise chain
      templateDictionary[template.itemId] = {
        itemId: pageModel.item.id
      };
      // call the progress callback, which also mutates templateDictionary
      itemProgressCallback(
        template.itemId,
        EItemProgressStatus.Finished,
        template.estimatedDeploymentCostFactor,
        pageModel.item.id
      );
      // finally, return ICreateItemFromTemplateResponse
      return {
        id: pageModel.item.id,
        type: template.type,
        postProcess: false
      };
    })
    .catch(ex => {
      itemProgressCallback(template.itemId, EItemProgressStatus.Failed, 0);
      throw ex;
    });
}

/* istanbul ignore next */
export function postProcess(model: any, items: any[]): Promise<boolean> {
  // Hub Page does not need to do anything in the post-processing
  return Promise.resolve(true);
}

/**
 * Check of an item type is a Page
 * Hub Page is for ArcGIS Online
 * Site Page is for ArcGIS Enterprise
 * @param itemType
 */
/* istanbul ignore next */
export function isAPage(itemType: string): boolean {
  let result = false;

  if (itemType === "Hub Page" || itemType === "Site Page") {
    result = true;
  }
  return result;
}
