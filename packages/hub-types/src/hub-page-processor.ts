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
 * Manages the creation and deployment of Hub Page item types.
 *
 * @module hub-page-processor
 */

import {
  IItemTemplate,
  IItemProgressCallback,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  UserSession,
  createHubRequestOptions,
  generateEmptyCreationResponse
} from "@esri/solution-common";
import { IUpdateItemOptions, updateItem } from "@esri/arcgis-rest-portal";
import {
  IModel,
  IModelTemplate,
  failSafe,
  getModel,
  IHubUserRequestOptions,
  getProp,
  without
} from "@esri/hub-common";
import {
  createPageModelFromTemplate,
  createPage,
  removePage,
  convertPageToTemplate
} from "@esri/hub-sites";

import { _postProcessPage } from "./helpers/_post-process-page";
import { replaceItemIds } from "./helpers/replace-item-ids";
import { moveModelToFolder } from "./helpers/move-model-to-folder";

/**
 * Converts a Hub Page item into a template.
 *
 * @param solutionItemId The solution to contain the template
 * @param itemInfo Info about the item
 * @param destAuthentication Credentials for requests to the destination organization
 * @param srcAuthentication Credentials for requests to source items
 * @return A promise that will resolve when the template has been created
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  destAuthentication: UserSession,
  srcAuthentication: UserSession
): Promise<IItemTemplate> {
  // get the page model and hubRequestOptions
  return Promise.all([
    getModel(itemInfo.id, { authentication: destAuthentication }),
    createHubRequestOptions(destAuthentication)
  ])
    .then(([pageModel, ro]) => {
      return convertPageToTemplate(pageModel, ro);
    })
    .then(tmpl => {
      // add in some stuff Hub.js does not yet add
      tmpl.item.typeKeywords = without(tmpl.item.typeKeywords, "doNotDelete");
      tmpl.groups = [];
      tmpl.estimatedDeploymentCostFactor = 2;
      tmpl.resources = [];
      if (!getProp(tmpl, "properties")) {
        tmpl.properties = {};
      }
      // swap out dependency id's to {{<depid>.itemId}}
      // so it will be re-interpolated
      tmpl = replaceItemIds(tmpl);
      // and return it
      return tmpl as IItemTemplate;
    });
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

  // TODO: Reassess with resource unification
  if (template.assets && template.resources) {
    delete template.assets;
  }

  // solutionItemExtent is in geographic, but it's a string, and we want/need a bbox
  // and Hub templates expect it in organization.defaultExtentBBox
  if (templateDictionary.solutionItemExtent) {
    const parts = templateDictionary.solutionItemExtent.split(",");
    templateDictionary.organization.defaultExtentBBox = [
      [parts[0], parts[1]],
      [parts[2], parts[3]]
    ];
  }

  // TODO: Determine if we need any transforms in this new env
  const transforms = {};

  // create an object to hold the created site through
  // subsequent promise calls
  let pageModel: IModel;

  let hubRo: IHubUserRequestOptions;
  const thumbnail: File = template.item.thumbnail; // createPageModelFromTemplate trashes thumbnail
  return createHubRequestOptions(destinationAuthentication, templateDictionary)
    .then(ro => {
      hubRo = ro;
      return createPageModelFromTemplate(
        template,
        templateDictionary,
        transforms,
        hubRo
      );
    })
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
    .then(() => {
      // Fix the thumbnail
      const updateOptions: IUpdateItemOptions = {
        item: {
          id: pageModel.item.id
        },
        params: {
          // Pass thumbnail in via params because item property is serialized, which discards a blob
          thumbnail
        },
        authentication: destinationAuthentication
      };
      return updateItem(updateOptions);
    })
    .then(() => {
      // Update the template dictionary
      // TODO: This should be done in whatever recieves
      // the outcome of this promise chain
      templateDictionary[template.itemId] = {
        itemId: pageModel.item.id
      };
      // call the progress callback, which also mutates templateDictionary
      const finalStatus = itemProgressCallback(
        template.itemId,
        EItemProgressStatus.Finished,
        template.estimatedDeploymentCostFactor || 2,
        pageModel.item.id
      );
      if (!finalStatus) {
        // clean up the site we just created
        const failSafeRemove = failSafe(removePage, { success: true });
        return failSafeRemove(pageModel, hubRo).then(() => {
          return Promise.resolve(generateEmptyCreationResponse(template.type));
        });
      } else {
        // finally, return ICreateItemFromTemplateResponse
        const response: ICreateItemFromTemplateResponse = {
          item: {
            ...template,
            ...pageModel
          },
          id: pageModel.item.id,
          type: template.type,
          postProcess: true
        };
        response.item.itemId = pageModel.item.id;
        return response;
      }
    })
    .catch(ex => {
      itemProgressCallback(template.itemId, EItemProgressStatus.Failed, 0);
      throw ex;
    });
}

/**
 * Post-Process a Page
 * Re-interpolate the page item + data w/ the full template dictionary hash
 *
 * @param id
 * @param type
 * @param itemInfos
 * @param template
 * @param templates
 * @param templateDictionary
 * @param authentication
 */
export function postProcess(
  id: string,
  type: string,
  itemInfos: any[],
  template: any,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<boolean> {
  // create the requestOptions
  let hubRo: IHubUserRequestOptions;
  // get hubRequestOptions
  return createHubRequestOptions(authentication)
    .then(ro => {
      hubRo = ro;
      // get the site model
      return getModel(id, { authentication });
    })
    .then(pageModel => {
      // post process the page
      return _postProcessPage(pageModel, itemInfos, templateDictionary, hubRo);
    });
}

/**
 * Check of an item type is a Page
 * Hub Page is for ArcGIS Online
 * Site Page is for ArcGIS Enterprise
 *
 * @param itemType
 */
export function isAPage(itemType: string): boolean {
  let result = false;

  if (itemType === "Hub Page" || itemType === "Site Page") {
    result = true;
  }
  return result;
}
