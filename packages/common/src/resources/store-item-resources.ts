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

import { getItemResources } from "../restHelpersGet";
import {
  generateSourceFilePaths,
  copyFilesToStorageItem
} from "../resourceHelpers";
import { IItemTemplate, ISourceFileCopyPath, UserSession } from "../interfaces";

/**
 * Updates the solution item with resources from the itemTemplate
 *
 * @param itemTemplate Template for AGOL item
 * @param solutionItemId item id for the solution
 * @param authentication Credentials for the request to the storage
 * @param storageVersion Version of the Solution template
 * @return A promise which resolves with an array of resources that have been added to the item
 */
export function storeItemResources(
  itemTemplate: IItemTemplate,
  solutionItemId: string,
  authentication: UserSession,
  storageVersion = 0
): Promise<string[]> {
  // get the resources for the item
  return getItemResources(itemTemplate.itemId, authentication).then(
    resourceResponse => {
      // map out the resource names and filter for things we
      // don't want transferred at this time
      const itemResources = resourceResponse.resources
        .map((r: any) => r.resource)
        .filter((res: any) => {
          let result = true;
          // StoryMaps has a set of resources that must be interpolated and can not be
          // directly copied, so they must be filtered out. Sub-optimal as it spreads
          // type specific logic around the app, but until we refactor how resources
          // are handled, this is necessary
          if (itemTemplate.type === "StoryMap") {
            if (["oembed.json", "oembed.xml"].indexOf(res) !== -1) {
              result = false;
            }
            if (res.match(/^draft_[\s\S]*.json$/)) {
              result = false;
            }
          }
          // Web-Experiences stores drafts in the config.json file; we don't create Solutions with drafts
          if (itemTemplate.type === "Web Experience") {
            if (res === "config/config.json") {
              result = false;
            }
          }
          return result;
        });
      // create the filePaths
      const resourceItemFilePaths: ISourceFileCopyPath[] = generateSourceFilePaths(
        authentication.portal,
        itemTemplate.itemId,
        itemTemplate.item.thumbnail,
        itemResources,
        itemTemplate.type === "Group",
        storageVersion
      );

      return copyFilesToStorageItem(
        authentication,
        resourceItemFilePaths,
        solutionItemId,
        authentication
      );
    }
  );
}
