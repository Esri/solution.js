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
import * as simpleTypes from "@esri/solution-simple-types";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>(resolve => {
    if (itemInfo.type === "StoryMap") {
      console.log("convertItemToTemplate for a next-gen storymap");
    } else {
      console.log("convertItemToTemplate for a first-gen storymap");
    }
    console.warn("========== TODO ==========");
    resolve(undefined);
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  resourceFilePaths: common.IDeployFileCopyPath[],
  storageAuthentication: common.UserSession,
  templateDictionary: any,
  destinationAuthentication: common.UserSession,
  progressTickCallback: () => void
): Promise<common.ICreateItemFromTemplateResponse> {
  return new Promise<common.ICreateItemFromTemplateResponse>(
    (resolve, reject) => {
      if (template.type === "StoryMap") {
        /* console.log(
        "createItemFromTemplate for a " +
          template.type +
          " (" +
          template.itemId +
          ")"
      ); */
        resolve({
          id: "",
          type: template.type,
          data: undefined
        });
      } else {
        /* console.log(
        "createItemFromTemplate for a " +
          template.type +
          " (StoryMap " +
          template.itemId +
          ")"
      ); */
        simpleTypes
          .createItemFromTemplate(
            template,
            resourceFilePaths,
            storageAuthentication,
            templateDictionary,
            destinationAuthentication,
            progressTickCallback
          )
          .then(() => resolve, reject);
      }
    }
  );
}

export function isAStoryMap(template: common.IItemTemplate): boolean {
  const url = common.getProp(template, "item.url");
  if (template.type === "StoryMap") {
    return true;
  } else if (url) {
    return [
      /\/apps\/Cascade\//i,
      /\/apps\/MapJournal\//i,
      /\/apps\/MapSeries\//i,
      /\/apps\/MapTour\//i,
      /\/apps\/Shortlist\//i,
      /\/apps\/StoryMap\//i,
      /\/apps\/StoryMapBasic\//i,
      /\/apps\/StorytellingSwipe\//i
    ].some(pattern => pattern.test(url));
  }
  return false;
}
