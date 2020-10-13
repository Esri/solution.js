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
 * Manages the creation and deployment of simple item types.
 *
 * @module simple-types
 */

import * as dashboard from "./dashboard";
import * as webmap from "./webmap";
import * as webmappingapplication from "./webmappingapplication";

import {
  ICreateItemFromTemplateResponse,
  IDatasourceInfo,
  IItemProgressCallback,
  IItemTemplate,
  IUpdateItemResponse,
  updateItemTemplateFromDictionary,
  UserSession
} from "@esri/solution-common";

// Need to import collectively to enable spying
import * as simpleTypeHelpers from "./helpers/simple-type-helpers";

/**
 * Delegate to the simpleType converter
 * @param solutionItemId
 * @param itemInfo
 * @param authentication
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  return simpleTypeHelpers.convertItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  );
}

/**
 * Delegate to simpleType creator
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
  return simpleTypeHelpers.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}

/**
 * Templatizes field references within specific template types.
 * Currently only handles web mapping applications
 *
 * @param template A solution template
 * @param datasourceInfos A list of objects that store key datasource info used to templatizing field references
 * @param type The item type
 * @return The updated solution template
 */
export function postProcessFieldReferences(
  solutionTemplate: IItemTemplate,
  datasourceInfos: IDatasourceInfo[],
  type: string
): IItemTemplate {
  switch (type) {
    case "Web Mapping Application":
      webmappingapplication.postProcessFieldReferences(
        solutionTemplate,
        datasourceInfos
      );
      break;
    case "Dashboard":
      dashboard.postProcessFieldReferences(solutionTemplate, datasourceInfos);
      break;
    case "Web Map":
      webmap.postProcessFieldReferences(solutionTemplate, datasourceInfos);
      break;
  }
  return solutionTemplate;
}

/**
 * Simple Type post-processing actions
 * @param {string} itemId The item ID
 * @param {string} type The template type
 * @param {any[]} itemInfos Array of {id: 'ef3', type: 'Web Map'} objects
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} authentication The destination session info
 * @returns Promise resolving to successfulness of update
 */
export function postProcess(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: IItemTemplate,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<IUpdateItemResponse> {
  return updateItemTemplateFromDictionary(
    itemId,
    templateDictionary,
    authentication
  );
}
