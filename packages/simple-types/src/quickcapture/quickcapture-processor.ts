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
  IItemTemplate,
  IItemProgressCallback,
  ICreateItemFromTemplateResponse,
  replaceInTemplate,
  updateItemResourceText
} from "@esri/solution-common";
import * as quickcaptureHelpers from "./quickcapture-helpers";

import { UserSession } from "@esri/arcgis-rest-auth";
import { convertGenericItemToTemplate } from "../helpers/convert-generic-item-to-template";
import { refineQuickCaptureTemplate } from "./refine-quick-capture-template";

/**
 * Convert a QuickCapture item to a template
 * @param solutionItemId
 * @param itemInfo
 * @param authentication
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
    // do type-specific work
    return refineQuickCaptureTemplate(itemTemplate);
  });
}

// Delegate back to simple-types
// This is a temporary refactor step
export function createItemFromTemplate(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession,
  itemProgressCallback: IItemProgressCallback
): Promise<ICreateItemFromTemplateResponse> {
  return quickcaptureHelpers.createItemFromTemplate(
    template,
    templateDictionary,
    destinationAuthentication,
    itemProgressCallback
  );
}

/**
 * QuickCapture post-processing actions
 * @param itemId
 * @param type
 * @param itemInfos
 * @param templateDictionary
 * @param authentication
 */
export function postProcess(
  itemId: string,
  type: string,
  itemInfos: any[],
  template: IItemTemplate,
  templates: IItemTemplate[],
  templateDictionary: any,
  authentication: UserSession
): Promise<any> {
  template.data = replaceInTemplate(template.data, templateDictionary);
  return updateItemResourceText(
    itemId,
    template.data.name,
    JSON.stringify(template.data.application),
    authentication
  );
}
