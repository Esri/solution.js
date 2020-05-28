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
// import * as deployer from "@esri/solution-deployer";
import {
  isAStoryMap,
  isNextGenStoryMap,
  isClassicStoryMap
} from "./storymap-helpers";
import * as simpleTypes from "@esri/solution-simple-types";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    if (isNextGenStoryMap(itemInfo.itemType)) {
      reject(common.fail("Next-gen StoryMap is not yet implemented"));
    } else if (isClassicStoryMap(itemInfo.url)) {
      reject(common.fail("First-gen StoryMap is not yet implemented"));
    } else {
      reject(common.fail(itemInfo.id + " is not a StoryMap"));
    }
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  itemProgressCallback: common.IItemProgressCallback
): Promise<common.ICreateItemFromTemplateResponse> {
  return new Promise<common.ICreateItemFromTemplateResponse>(resolve => {
    const tD = templateDictionary;
    debugger;
    if (!isAStoryMap(template.item.type, template.item.url)) {
      // Not valid
      itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Failed,
        0
      );
      resolve({
        id: "",
        type: template.type,
        postProcess: false
      });
    } else if (isNextGenStoryMap(template.item.type)) {
      // Not yet implemented
      itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Failed,
        0
      );
      resolve({
        id: "Next-gen StoryMap is not yet implemented", // temporary
        type: template.type,
        postProcess: false
      });
    } else {
      // Not yet implemented
      itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Failed,
        0
      );
      resolve({
        id: "First-gen StoryMap is not yet implemented", // temporary
        type: template.type,
        postProcess: false
      });
    }
  });
}
