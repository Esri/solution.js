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
import {
  createSiteModelFromTemplate,
  createSite,
  getSiteById,
  _getSecondPassSharingOptions,
  _shareItemsToSiteGroups,
  _updatePages
} from "@esri/hub-sites";

import { IModel, cloneObject, maybePush, getProp } from "@esri/hub-common";

import { moveModelToFolder } from "./helpers/move-model-to-folder";
import { createHubRequestOptions } from "./helpers/create-hub-request-options";
import { _postProcessSite } from "./helpers/_post-process-site";
import { _updateSitePages } from "./helpers/_update-site-pages";
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
  // ensure we have a solution object in the settings hash
  if (!settings.solution) {
    settings.solution = {};
  }
  // .title should always be set on the templateDictionary
  settings.solution.title = templateDictionary.title;

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
      return moveModelToFolder(
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
      // finally, return ICreateItemFromTemplateResponse
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

/**
 * Deployer life-cycle hook allowing the Site Processor
 * a chance to apply final processes to all the items that
 * were created as part of the solution.
 * Specifically this will:
 * - share all items to the content team, and (if created)
 *   the core team (depends on user privs)
 * - link all Page items that were created, to the Site
 * @param model
 * @param items
 * @param authentication
 * @param templateDictionary
 */
export function postProcess(
  id: string,
  type: string,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<boolean> {
  // Get the Id's out of the templates array
  const templateIds = templates.map(t => t.itemId);
  // use them to look up the itemInfo on the template dictionary
  const itemInfos = templateIds.reduce((acc, tmplId) => {
    return maybePush(getProp(templateDictionary, `${tmplId}.id`), acc);
  }, []);

  // create the requestOptions
  const hubRo = createHubRequestOptions(authentication, templateDictionary);

  // get the site model
  return getSiteById(id, hubRo)
    .then(siteModel => {
      // Hub.js does not expect the same structures, so we delegat to a local fn
      return _postProcessSite(siteModel, itemInfos, hubRo);
    })
    .then(() => {
      // resolve w/ a boolean
      return Promise.resolve(true);
    });
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
