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

import {
  ICreateItemFromTemplateResponse,
  IItemProgressCallback,
  IItemTemplate,
  IDatasourceInfo
} from "@esri/solution-common";
import * as createHelper from "../helpers/create-item-from-template";
import { convertGenericItemToTemplate } from "../helpers/convert-generic-item-to-template";
import { UserSession } from "@esri/solution-common";
import { postProcessDashboardFieldReferences } from "./post-process-dashboard-field-references";
import { refineDashboardTemplate } from "./refine-dashboard-template";

/**
 * Converts a dashboard item to a template.
 *
 * @param itemTemplate Template for the dashboard item
 * @param authentication Credentials for any requests
 * @return templatized itemTemplate
 */
export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: UserSession
): Promise<IItemTemplate> {
  // delegate to generic item templating
  return convertGenericItemToTemplate(
    solutionItemId,
    itemInfo,
    authentication
  ).then(itemTemplate => {
    // do additional type-specific work
    return refineDashboardTemplate(itemTemplate);
  });
}

/**
 * Templatizes field references within specific template types.
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
  return postProcessDashboardFieldReferences(solutionTemplate, datasourceInfos);
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
  return createHelper.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}
