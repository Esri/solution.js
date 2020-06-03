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
 * @module storymap
 */

import * as common from "@esri/solution-common";
import { cloneObject, IModel } from "@esri/hub-common";
import { getItemData } from "@esri/arcgis-rest-portal";
import {
  convertStoryMapToTemplate
} from './helpers/convert-storymap-to-template';
// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {

  const model = {
    item: itemInfo,
    data: {}
  } as IModel;
  // fetch the data.json
  return getItemData(itemInfo.id, authentication).then(data => {
    // append into the model
    model.data = data;
    // and use that to create a template
    return convertStoryMapToTemplate(model, authentication);
  })
  .then((tmpl) => {
    debugger;
    return tmpl;
  })

}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  return Promise.reject(common.fail("StoryMap is not yet implemented"));
}

export function isAStoryMap(itemType: string): boolean {
  let result = false;
  if (itemType === "StoryMap") {
    result = true;
  }
  return result;
}
