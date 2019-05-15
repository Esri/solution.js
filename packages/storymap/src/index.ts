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

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemInfo: any,
  userSession: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>(resolve => {
    if (itemInfo.type === "StoryMap") {
      console.log("convertItemToTemplate for a next-gen storymap");
    } else {
      console.log("convertItemToTemplate for a first-gen storymap");
    }
    resolve(undefined);
  });
}

export function createItemFromTemplate(
  template: common.IItemTemplate,
  templateDictionary: any,
  userSession: auth.UserSession,
  progressTickCallback: () => void
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (template.type === "StoryMap") {
      console.log("createItemFromTemplate for a " + template.type + " (" + template.itemId + ")");
    } else {
      console.log("createItemFromTemplate for a " + template.type + " (StoryMap " + template.itemId + ")");
    }
    resolve("");
  });
}

export function isAStoryMap(
  template: common.IItemTemplate,
): boolean {
  const url = common.getProp(template, "item.url");
  if (!url) {
    return false;
  } else if (template.type === "StoryMap") {
    return true;
  }

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

