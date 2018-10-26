/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IFullItem } from "./fullItem";
import { IItemHash, getFullItemHierarchy} from "./fullItemHierarchy";

//--------------------------------------------------------------------------------------------------------------------//

export function createSolution (
  solutionRootIds: string | string[],
  requestOptions?: IUserRequestOptions
): Promise<IItemHash> {
  return new Promise<IItemHash>(resolve => {

    // Get the items forming the solution
    getFullItemHierarchy(solutionRootIds, requestOptions)
    .then(
      solution => {
        // Prepare the Solution by adjusting its items
        Object.keys(solution).forEach(
          key => {
            let fullItem = (solution[key] as IFullItem);

            // 1. remove unwanted properties
            fullItem.item = removeUncloneableItemProperties(fullItem.item);

            // 2. for web mapping apps,
            //    a. generalize app URLs
            if (fullItem.type === "Web Mapping Application") {
              generalizeWebMappingApplicationURLs(fullItem);


            // 3. for feature services,
            //    a. fill in missing data
            //    b. get layer & table details
            //    c. generalize layer & table URLs
            } else if (fullItem.type === "Feature Service") {
              fleshOutFeatureService(fullItem);
            }
          }
        );

        resolve(solution);
      }
    );
  });
}

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Removes item properties irrelevant to cloning.
 */
function removeUncloneableItemProperties (
  itemSection: any
): void {
  if (itemSection) {
    let itemSectionClone = {...itemSection};
    delete itemSectionClone.avgRating;
    delete itemSectionClone.created;
    delete itemSectionClone.guid;
    delete itemSectionClone.modified;
    delete itemSectionClone.numComments;
    delete itemSectionClone.numRatings;
    delete itemSectionClone.numViews;
    delete itemSectionClone.orgId;
    delete itemSectionClone.owner;
    delete itemSectionClone.scoreCompleteness;
    delete itemSectionClone.size;
    delete itemSectionClone.uploaded;
    return itemSectionClone;
  }
  return itemSection;
}

function generalizeWebMappingApplicationURLs (
  fullItem: IFullItem
): void {
  // Simplify app URL for cloning: remove org base URL and app id
  // Need to add fake server because otherwise AGOL makes URL null
  let orgUrl = fullItem.item.url.replace(fullItem.item.id, "");
  let iSep = orgUrl.indexOf("//");
  fullItem.item.url = aPlaceholderServerName + orgUrl.substr(orgUrl.indexOf("/", iSep + 2));
}

/**
 * Fills in missing data, including full layer and table definitions.
 * 
 * @param fullItem Feature service item, data, dependencies
 */
function fleshOutFeatureService (
  fullItem: IFullItem
): void {
}

//--------------------------------------------------------------------------------------------------------------------//

const aPlaceholderServerName:string = "https://arcgis.com";
