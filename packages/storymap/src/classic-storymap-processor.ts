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

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  solutionItemId: string,
  itemInfo: any
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    if (isAStoryMap(itemInfo.type, itemInfo.url)) {
      reject(common.fail("Classic StoryMap is not yet implemented"));
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
    if (isAStoryMap(template.type, template.item.url)) {
      // Not yet implemented
      itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Failed,
        0
      );
      resolve(common.generateEmptyCreationResponse(template.type));
    } else {
      // Not valid
      itemProgressCallback(
        template.itemId,
        common.EItemProgressStatus.Failed,
        0
      );
      resolve(common.generateEmptyCreationResponse(template.type));
    }
  });
}

export function isAStoryMap(itemType: string, itemUrl?: string): boolean {
  if (itemUrl) {
    return [
      /\/apps\/Cascade\//i,
      /\/apps\/MapJournal\//i,
      /\/apps\/MapSeries\//i,
      /\/apps\/MapTour\//i,
      /\/apps\/Shortlist\//i,
      /\/apps\/StoryMap\//i,
      /\/apps\/StoryMapBasic\//i,
      /\/apps\/StorytellingSwipe\//i
    ].some(pattern => pattern.test(itemUrl));
  }
  return false;
}
