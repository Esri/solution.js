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
  UserSession,
  generateEmptyCreationResponse,
  getProp,
  updateItemExtended
} from "@esri/solution-common";
import {
  createSiteModelFromTemplate,
  createSite,
  getSiteById,
  removeSite,
  convertSiteToTemplate
} from "@esri/hub-sites";

import {
  IModel,
  cloneObject,
  failSafe,
  IHubRequestOptions,
  without
} from "@esri/hub-common";

import { moveModelToFolder } from "./helpers/move-model-to-folder";
import { createHubRequestOptions } from "./helpers/create-hub-request-options";
import { _postProcessSite } from "./helpers/_post-process-site";
import { replaceItemIds } from "./helpers/replace-item-ids";
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
  // let the progress system know we've started...
  const startStatus = itemProgressCallback(
    template.itemId,
    EItemProgressStatus.Started,
    0
  );
  // if it returned false, just resolve out
  if (!startStatus) {
    return Promise.resolve(generateEmptyCreationResponse(template.type));
  }

  // TODO: Reassess with resource unification
  if (template.assets && template.resources) {
    delete template.assets;
  }

  // convert the templateDictionary to a settings hash
  const settings = cloneObject(templateDictionary);

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
  let hubRo: IHubRequestOptions;
  return createHubRequestOptions(destinationAuthentication, templateDictionary)
    .then(ro => {
      hubRo = ro;
      return createSiteModelFromTemplate(template, settings, transforms, hubRo);
    })
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
    .then(moves => {
      // Update the item with its thumbnail
      if (template.item.thumbnail) {
        // First move is item itself
        const itemId = moves[0].itemId;

        return new Promise<any>(resolve => {
          updateItemExtended(
            { id: itemId },
            null,
            destinationAuthentication,
            template.item.thumbnail
          ).then(
            () => resolve(),
            () => resolve()
          );
        });
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      // Update the template dictionary
      // TODO: This should be done in whatever recieves
      // the outcome of this promise chain
      templateDictionary[template.itemId] = {
        itemId: siteModel.item.id
      };
      // call the progress callback, which also mutates templateDictionary
      const finalStatus = itemProgressCallback(
        template.itemId,
        EItemProgressStatus.Finished,
        template.estimatedDeploymentCostFactor || 2,
        siteModel.item.id
      );
      if (!finalStatus) {
        // clean up the site we just created
        const failSafeRemove = failSafe(removeSite, { success: true });
        return failSafeRemove(siteModel, hubRo).then(() => {
          return Promise.resolve(generateEmptyCreationResponse(template.type));
        });
      } else {
        // finally, return ICreateItemFromTemplateResponse
        return {
          item: {
            ...template,
            ...siteModel
          },
          id: siteModel.item.id,
          type: template.type,
          postProcess: true
        };
      }
    })
    .catch(ex => {
      itemProgressCallback(template.itemId, EItemProgressStatus.Failed, 0);
      throw ex;
    });
}

/**
 * Convert a Site to a Template
 *
 * @param solutionItemId
 * @param itemInfo Hub Site Application item
 * @param userSession The session used to interact with the service the template is based on
 * @return A promise that will resolve when fullItem has been updated
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  let hubRo: IHubRequestOptions;
  // get hubRequestOptions
  return createHubRequestOptions(authentication)
    .then(ro => {
      hubRo = ro;
      return getSiteById(itemInfo.id, hubRo);
    })
    .then(siteModel => {
      return convertSiteToTemplate(siteModel, hubRo);
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
      tmpl.dependencies = [...new Set(tmpl.dependencies || [])]; // dedupe
      tmpl = replaceItemIds(tmpl);

      // and return it
      return tmpl as IItemTemplate;
    });
}

/**
 * Deployer life-cycle hook allowing the Site Processor
 * a chance to apply final processes to all the items that
 * were created as part of the solution.
 * Specifically this will:
 * - share all items to the content team, and (if created)
 *   the core team (depends on user privs)
 * - link all Page items that were created, to the Site
 *
 * @param model
 * @param items
 * @param authentication
 * @param templateDictionary
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
  let hubRo: IHubRequestOptions;
  return createHubRequestOptions(authentication, templateDictionary)
    .then(ro => {
      hubRo = ro;
      // get the site model
      return getSiteById(id, hubRo);
    })
    .then(siteModel => {
      // Hub.js does not expect the same structures, so we delegat to a local fn
      return _postProcessSite(siteModel, itemInfos, templateDictionary, hubRo);
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
 *
 * @param itemType
 */
export function isASite(itemType: string): boolean {
  let result = false;
  if (itemType === "Hub Site Application" || itemType === "Site Application") {
    result = true;
  }
  return result;
}
