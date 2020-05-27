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
 * @module hub-site-processor
 */

import {
  IItemTemplate,
  IItemProgressCallback,
  ICreateItemFromTemplateResponse,
  EItemProgressStatus,
  UserSession
} from "@esri/solution-common";
import { createSiteModelFromTemplate, createSite } from "@esri/hub-sites";
import { IModel, cloneObject } from "@esri/hub-common";
import { moveSiteToFolder } from "./helpers/move-site-to-folder";
import { createHubRequestOptions } from "./helpers/create-hub-request-options";

/**
 * Handle deployment of Site item templates
 *
 * @export
 * @param {IItemTemplate} template
 * @param {*} templateDictionary
 * @param {UserSession} destinationAuthentication
 * @param {IItemProgressCallback} itemProgressCallback
 * @returns {Promise<ICreateItemFromTemplateResponse>}
 */
/* istanbul ignore next */
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

  // TODO: Understand how/where the Solution title is passed in and fall back to fetching the Solution Template
  if (!settings.solution) {
    settings.solution = {
      title: "TODO GET SOLN TITLE"
    };
  }
  // TODO: Determine if we need any transforms in this new env
  const transforms = {};

  // create an object to hold the created site through
  // subsequent promise calls
  let siteModel: IModel;

  // Create the "siteModel" from the template. Does not save the site item yet
  // Note: depending on licensing and user privs, will also create the team groups
  // and initiative item.
  return createSiteModelFromTemplate(template, settings, transforms, hubRo)
    .then(interpolated => {
      const options = {
        assets: interpolated.assets || []
      };
      // Now create the item, register for oAuth, register domain etc
      return createSite(interpolated, options, hubRo);
    })
    .then(site => {
      // hold onto the site
      siteModel = site;
      // Move the site and initiative to the solution folder
      // this is essentially fire and forget. We fail-safe the actual moveItem
      // call since it's not critical to the outcome
      return moveSiteToFolder(
        site,
        templateDictionary.folderId,
        destinationAuthentication
      );
    })
    .then(_ => {
      // Update the template dictionary
      // TODO: This should be done in whatever recieves
      // the outcome of this promise chain
      templateDictionary[template.itemId] = {
        itemId: siteModel.item.id
      };
      // call the progress callback, which also mutates templateDictionary
      itemProgressCallback(
        template.itemId,
        EItemProgressStatus.Finished,
        template.estimatedDeploymentCostFactor,
        siteModel.item.id
      );
      // finally, return something
      // TODO: Figure out how/where this is used, if at all
      return {
        id: siteModel.item.id,
        type: template.type,
        postProcess: true
      };
    })
    .catch(ex => {
      itemProgressCallback(template.itemId, EItemProgressStatus.Failed, 0);
      throw ex;
    });
}

/***
 *    ##    ##  #######  ########    #### ##     ## ########
 *    ###   ## ##     ##    ##        ##  ###   ### ##     ##
 *    ####  ## ##     ##    ##        ##  #### #### ##     ##
 *    ## ## ## ##     ##    ##        ##  ## ### ## ########
 *    ##  #### ##     ##    ##        ##  ##     ## ##
 *    ##   ### ##     ##    ##        ##  ##     ## ##        ###
 *    ##    ##  #######     ##       #### ##     ## ##        ###
 */
/* istanbul ignore next */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // TODO: add implementation
  return Promise.resolve({
    item: {},
    data: {},
    itemId: itemInfo.id,
    resources: [],
    type: "Hub Page",
    key: "page-bz3",
    dependencies: [],
    properties: {},
    groups: [],
    estimatedDeploymentCostFactor: 1
  } as IItemTemplate);
}

/* istanbul ignore next */
export function postProcess(model: any, items: any[]): Promise<boolean> {
  console.info(`Hub Site is not supported yet`);
  return Promise.resolve(true);
}

/**
 * Check of an item type is a Site
 * Hub Site Application is for ArcGIS Online
 * Site Application is for ArcGIS Enterprise
 * @param itemType
 */
/* istanbul ignore next */
export function isASite(itemType: string, itemUrl?: string): boolean {
  let result = false;
  if (itemType === "Hub Site Application" || itemType === "Site Application") {
    result = true;
  }
  return result;
}
